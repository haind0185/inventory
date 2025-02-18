import WarehouseExit from '../models/WarehouseExit';
import Exit from '../models/Exit';
import Product from '../models/Product';
import { error, success } from './common/http';
import { t } from '../../src/renderer/i18n'
import { helper } from '../../src/renderer/helper'
import sequelize from '../models/index';
import Inventory from '../models/Inventory';
const xlsx = require('xlsx');
const { Op } = require("sequelize");
const Joi = require('joi');

const ExitController = {

    index: async (req, res) => {
        try {
            console.log(req.query)

            /**
             * set condition
             */
            const where = {}

            if(req.query.ExitCode) {
                where.ExitCode = { [Op.like]: `%${req.query.ExitCode}%` }
            }

            if(req.query.ExitDate) {
                where.ExitDate = { [Op.eq]: `${req.query.ExitDate}` }
            }

            if(req.query.ExitDateFrom) {
                where.ExitDate = { ...where.ExitDate, [Op.gte]: `${req.query.ExitDateFrom}` }
            }

            if(req.query.ExitDateTo) {
                where.ExitDate = { ...where.ExitDate, [Op.lte]: `${req.query.ExitDateTo}` }
            }

            if(req.query.ProductCode) {
                where.ProductCode = { [Op.like]: `%${req.query.ProductCode}%` }
            }

            /**
             * order
             */
            const order_list = ['ExitCode', 'ExpiryDate']
            let order = []
            if(order_list.includes(req.query.sort)) {
                let sort_by = req.query.sort_by == 'desc' ? 'desc' : 'asc'
                order = [[req.query.sort, sort_by]]
            }

            /**
             * page and limit a page
             */
            const limit = 50
            let offset = req.query.page ? ((req.query.page - 1) * limit) : 0
            
            /**
             * call select action
             */
            const total = await WarehouseExit.count({
                where: where,
            })

            let exits = []
            if(total > 0) {
                exits = await WarehouseExit.findAll({
                    where: where,
                    order: [['ExitDate', 'DESC'], ['id', 'DESC']],
                    limit: limit,
                    offset: offset,
                    include: [
                        { association: 'exits', include: [{ association: 'product' }] }
                    ]
                });
            }

            let page = parseInt(req.query.page ?? 0)

            return res.json(success({
                items: exits,
                total: total,
                page: page,
                page_count: Math.ceil(total / limit),
                firstItem: exits.length ? (((page - 1) * limit) + 1) : 0,
                lastItem: exits.length ? ((page * limit) <= total ? (page * limit) : total) : 0,
            }));
        } catch (err) {
            return res.json(error(err.message, 501));
        }
    },

    store: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            const { ExitCode, ExitDate, ExitType, exits } = req.body;

            /**
             * validation
             */
            // WarehouseExit
            const exitSchema = Joi.object({
                ExitCode: Joi.string().required(),
                ExitDate: Joi.string().required(),
                ExitType: Joi.boolean().required(),
            }).unknown()
            let validation = exitSchema.validate({ExitCode: ExitCode, ExitDate: ExitDate, ExitType: ExitType});
            if (validation.error) {
                throw new Error(validation.error.details[0].message);
            }

            // Exit
            const schema = Joi.object({
                ProductCode : Joi.string().required(),
                LargeUnitQty: Joi.number().required().min(0),
                SmallUnitQty: Joi.number().required().min(0),
                Note        : Joi.string().allow(null, '').min(0).max(200),
            }).unknown();
            if(exits.length <= 0) {
                throw new Error(t('ctr.exit.no_exit'));
            }
            exits.forEach((exit, index) => {
                let validation = schema.validate(exit);
                if (validation.error) {
                    throw new Error(`[${index+1}] ${validation.error.details[0].message}`);
                }
            });

            /**
             * check exists code
             */
            const exists_warehouse_exit = await WarehouseExit.findOne({
                where: {
                    ExitCode: ExitCode
                }
            })
            if(exists_warehouse_exit) {
                throw new Error(t('ctr.exit.code_exists'));
            }

            /**
             * call create action
             */
            const products = await Product.findAll({
                where: {
                    ProductCode: {
                        [Op.in]: exits.map(item => {
                            return item.ProductCode
                        })
                    }
                }
            }, {transaction: transaction})

            let inventories = await Inventory.findAll({
                attributes: [
                    'ProductCode',
                    [sequelize.fn('SUM', sequelize.col('LargeUnitQty')), 'LargeUnitQty'],
                    [sequelize.fn('SUM', sequelize.col('SmallUnitQty')), 'SmallUnitQty'],
                ],
                where: {
                    ProductCode: {
                        [Op.in]: exits.map(item => {
                            return item.ProductCode
                        })
                    }
                },
                group: ['Inventory.ProductCode'],
            }, {transaction: transaction});

            const create = async (WarehouseExit, exits) => {
                let ExitModels = []

                // Insert Exit
                for(const i in exits) {
                    let exit = exits[i]

                    // Product check
                    let product = products.find(item => {
                        return item.ProductCode == exit.ProductCode
                    })
                    if(!product) {
                        throw new Error(`Mã sản phẩm [${exit.ProductCode}] không tồn tại.`);
                    }

                    // Inventory check
                    const inventory = inventories.find(item => {
                        return item.ProductCode == exit.ProductCode
                    })

                    if(!inventory) {
                        throw new Error(`Mã sản phẩm [${exit.ProductCode}] không tồn tại trong kho.`);
                    }

                    // Inventory check
                    inventories = inventories.map(inventory => {
                        inventory.qtyNeeded = inventory.qtyNeeded ?? 0
                        let Qty = helper.unitQtyTransfer(inventory.LargeUnitQty, inventory.SmallUnitQty, product)
                        let exitQty = helper.unitQtyTransfer(exit.LargeUnitQty, exit.SmallUnitQty, product)

                        if(inventory.ProductCode == exit.ProductCode) {
                            Qty -= exitQty
                            if(Qty < 0) {
                                throw new Error(`Mã sản phẩm [${exit.ProductCode}] không đủ số lượng.`);
                            }
                            
                            let stockQty = helper.unitQtyLS(Qty, product)
                            inventory.LargeUnitQty = stockQty.LargeUnitQty
                            inventory.SmallUnitQty = stockQty.SmallUnitQty

                            exit.StockLargeUnitQty = inventory.LargeUnitQty
                            exit.StockSmallUnitQty = inventory.SmallUnitQty

                            inventory.qtyNeeded += exitQty
                        }

                        return inventory
                    })

                    let ExitModel = {
                        ExitCode         : WarehouseExit.ExitCode,
                        ExitDate         : WarehouseExit.ExitDate,
                        ExitType         : WarehouseExit.ExitType,

                        ProductCode      : exit.ProductCode,
                        LargeUnitQty     : exit.LargeUnitQty,
                        SmallUnitQty     : exit.SmallUnitQty,
                        Price            : product.Price,
                        Note             : exit.Note,
                        
                        StockLargeUnitQty: exit.StockLargeUnitQty,
                        StockSmallUnitQty: exit.StockSmallUnitQty,
                    }

                    ExitModels.push(ExitModel)
                }

                // update Inventory
                let shipments = []
                for(const i in inventories) {
                    let inv = inventories[i]
                    let qtyNeeded = inv.qtyNeeded

                    // Product check
                    let product = products.find(item => {
                        return item.ProductCode == inv.ProductCode
                    })
                    if(!product) {
                        throw new Error(`Mã sản phẩm [${inv.ProductCode}] không tồn tại.`);
                    }

                    const expiryInventories = await Inventory.findAll({
                        where: {
                            ProductCode: inv.ProductCode
                        },
                        order: [['ExpiryDate', 'ASC']]
                    }, {transaction: transaction})

                    for (let i = 0; i < expiryInventories.length; i++) {

                        if (qtyNeeded <= 0) break;

                        let inventory = expiryInventories[i]

                        let AvailableUnitQty = helper.unitQtyTransfer(inventory.LargeUnitQty, inventory.SmallUnitQty, product)
                        if(AvailableUnitQty <= qtyNeeded) {
                            shipments.push({
                                ProductCode : inventory.ProductCode,
                                ExpiryDate  : inventory.ExpiryDate,
                                LargeUnitQty: 0,
                                SmallUnitQty: 0,
                            })

                            // exit
                            qtyNeeded -= AvailableUnitQty;
                        } else {
                            let newQty = AvailableUnitQty - qtyNeeded;
                            let qtyLS = helper.unitQtyLS(newQty, product)
                            shipments.push({
                                ProductCode : inventory.ProductCode,
                                ExpiryDate  : inventory.ExpiryDate,
                                LargeUnitQty: qtyLS.LargeUnitQty,
                                SmallUnitQty: qtyLS.SmallUnitQty,
                            })
                            qtyNeeded = 0
                        }
                    }
                }

                /**
                 * Insert action
                 */
                console.log(ExitModels)
                await Exit.bulkCreate(ExitModels, {transaction: transaction}).then(async (res) => {
                    console.log(shipments)
                    for(const i in shipments) {
                        let inventory = shipments[i]
                        await Inventory.upsert(
                            {
                                ProductCode : inventory.ProductCode,
                                ExpiryDate  : inventory.ExpiryDate,
                                LargeUnitQty: inventory.LargeUnitQty,
                                SmallUnitQty: inventory.SmallUnitQty,
                            }, {
                                transaction: transaction,
                                conflictFields: ['ProductCode', 'ExpiryDate']
                            }
                        )
                    }
                })
            }

            await WarehouseExit.create({
                ExitCode: ExitCode,
                ExitDate: ExitDate,
                ExitType: ExitType,
            }, {transaction: transaction}).then(async (WarehouseExit) => {
                return await create(WarehouseExit, exits)
            })

            await transaction.commit();
            return res.json(success());
        } catch (err) {
            await transaction.rollback();
            return res.json(error(err.message, 501));
        }
    },

    import: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            if (!req.file) {
                throw new Error("Không tìm thấy file");
            }
    
            const filePath = req.file.path;
            const workbook = xlsx.readFile(filePath);
    
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            let data = xlsx.utils.sheet_to_json(worksheet);

            data = data.map(item => {
                return {
                    ProductCode : item.ProductCode,
                    LargeUnitQty: item.LargeUnitQty,
                    SmallUnitQty: item.SmallUnitQty,
                }
            })

            await transaction.commit();
            return res.json(success(data));
        } catch (err) {
            await transaction.rollback();
            return res.json(error(err.message, 501));
        }
    },

    product: async (req, res) => {
        try {
            console.log(req.query)

            /**
             * set condition
             */
            const where = {}

            if(req.query.ProductCode) {
                where.ProductCode = { [Op.like]: `%${req.query.ProductCode}%` }
            }

            if(req.query.ExitCode) {
                where.ExitCode = { [Op.like]: `%${req.query.ExitCode}%` }
            }

            if(req.query.ExitDateFrom) {
                where.ExitDate = { ...where.ExitDate, [Op.gte]: `${req.query.ExitDateFrom}` }
            }

            if(req.query.ExitDateTo) {
                where.ExitDate = { ...where.ExitDate, [Op.lte]: `${req.query.ExitDateTo}` }
            }

            /**
             * order
             */

            /**
             * page and limit a page
             */
            const limit = 50
            let offset = req.query.page ? ((req.query.page - 1) * limit) : 0
            
            /**
             * call select action
             */
            const groupedRecords = await Exit.count({
                group: ['Exit.ProductCode'],
                where: where,
            });

            let total = groupedRecords.length;

            let exits = []
            if(total > 0) {
                exits = await Exit.findAll({
                    attributes: [
                        'ProductCode',
                        'ProductNameLabel'
                    ],
                    group: ['Exit.ProductCode'],
                    include: [
                        { association: 'products', include: [{ association: 'product' }] },
                        { association: 'product' },
                    ],

                    where: where,

                    // paginate
                    order: [
                        [sequelize.literal('ExitDate'), 'DESC'],
                        [sequelize.literal('id'), 'DESC']
                    ],
                    limit: limit,
                    offset: offset,
                });
            }

            let page = parseInt(req.query.page ?? 1)

            return res.json(success({
                items: exits,
                total: total,
                page: page,
                page_count: Math.ceil(total / limit),
                firstItem: exits.length ? (((page - 1) * limit) + 1) : 0,
                lastItem: exits.length ? ((page * limit) <= total ? (page * limit) : total) : 0,
            }));
        } catch (err) {
            return res.json(error(err.message, 501));
        }
    },

    date: async (req, res) => {
        try {
            console.log(req.query)

            /**
             * set condition
             */
            const where = {}

            if(req.query.ProductCode) {
                where.ProductCode = { [Op.like]: `%${req.query.ProductCode}%` }
            }

            if(req.query.ExitCode) {
                where.ExitCode = { [Op.like]: `%${req.query.ExitCode}%` }
            }

            if(req.query.ExitDateFrom) {
                where.ExitDate = { ...where.ExitDate, [Op.gte]: `${req.query.ExitDateFrom}` }
            }

            if(req.query.ExitDateTo) {
                where.ExitDate = { ...where.ExitDate, [Op.lte]: `${req.query.ExitDateTo}` }
            }

            /**
             * order
             */

            /**
             * page and limit a page
             */
            const limit = 50
            let offset = req.query.page ? ((req.query.page - 1) * limit) : 0
            
            /**
             * call select action
             */
            const groupedRecords = await Exit.count({
                group: ['Exit.ExitDate'],
                where: where,
            });

            let total = groupedRecords.length;

            let exits = []
            if(total > 0) {
                exits = await Exit.findAll({
                    attributes: [
                        'ExitDate',
                    ],
                    group: ['Exit.ExitDate'],
                    where: where,

                    // paginate
                    order: [
                        [sequelize.literal('ExitDate'), 'DESC'],
                        [sequelize.literal('id'), 'DESC']
                    ],
                    limit: limit,
                    offset: offset,
                }).then(async (dates) => {
                    const ExitDates = dates.flatMap(date => date.ExitDate)
                    return await Exit.findAll({
                        attributes: [
                            'ExitDate',
                            'ExitCode',
                        ],
                        group: ['Exit.ExitCode'],
                        where: {
                            ExitDate: {
                                [Op.in]: ExitDates
                            }
                        },
                    }).then(async (codes) => {
                        const ExitCodes = codes.flatMap(code => code.ExitCode)
                        return await Exit.findAll({
                            where: {
                                ExitCode: {
                                    [Op.in]: ExitCodes
                                }
                            },
                            include: [{ association: 'product' }],
                        }).then(async (exits) => {
                            return dates.map(date => {
                                return {
                                    ExitDate: date.ExitDate,
                                    codes: codes.filter(item => item.ExitDate == date.ExitDate).map(code => {
                                        return {
                                            ExitCode: code.ExitCode,
                                            exits: exits.filter(item => item.ExitCode == code.ExitCode),
                                        }
                                    })
                                }
                            })
                        })
                    })
                });
            }

            let page = parseInt(req.query.page ?? 1)

            return res.json(success({
                items: exits,
                total: total,
                page: page,
                page_count: Math.ceil(total / limit),
                firstItem: exits.length ? (((page - 1) * limit) + 1) : 0,
                lastItem: exits.length ? ((page * limit) <= total ? (page * limit) : total) : 0,
            }));
        } catch (err) {
            return res.json(error(err.message, 501));
        }
    },
};

export default ExitController;
