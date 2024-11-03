import WarehouseEntry from '../models/WarehouseEntry';
import Entry from '../models/Entry';
import Product from '../models/Product';
import Inventory from '../models/Inventory';
import { error, success } from './common/http';
import { t } from '../../src/renderer/i18n'
import { helper } from '../../src/renderer/helper'
import sequelize from '../models/index';
const xlsx = require('xlsx');
const { Op } = require("sequelize");
const Joi = require('joi');

const EntryController = {

    index: async (req, res) => {
        try {
            console.log(req.query)

            /**
             * set condition
             */
            const where = {}

            if(req.query.EntryCode) {
                where.EntryCode = { [Op.like]: `%${req.query.EntryCode}%` }
            }

            if(req.query.EntryDate) {
                where.EntryDate = { [Op.eq]: `${req.query.EntryDate}` }
            }

            if(req.query.EntryDateFrom) {
                where.EntryDate = { ...where.EntryDate, [Op.gte]: `${req.query.EntryDateFrom}` }
            }

            if(req.query.EntryDateTo) {
                where.EntryDate = { ...where.EntryDate, [Op.lte]: `${req.query.EntryDateTo}` }
            }

            if(req.query.ProductCode) {
                where.ProductCode = { [Op.like]: `%${req.query.ProductCode}%` }
            }

            /**
             * order
             */
            const order_list = ['EntryCode', 'ExpiryDate']
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
            const total = await WarehouseEntry.count({
                where: where,
            })

            let entries = []
            if(total > 0) {
                entries = await WarehouseEntry.findAll({
                    where: where,
                    order: [['EntryDate', 'DESC'], ['id', 'DESC']],
                    limit: limit,
                    offset: offset,
                    include: [
                        { association: 'entries', include: [{ association: 'product' }] }
                    ]
                });
            }

            let page = parseInt(req.query.page ?? 0)

            return res.json(success({
                items: entries,
                total: total,
                page: page,
                page_count: Math.ceil(total / limit),
                firstItem: entries.length ? (((page - 1) * limit) + 1) : 0,
                lastItem: entries.length ? ((page * limit) <= total ? (page * limit) : total) : 0,
            }));
        } catch (err) {
            return res.json(error(err.message, 501));
        }
    },

    store: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            const { EntryCode, EntryDate, EntryType, entries } = req.body;

            /**
             * validation
             */
            // WarehouseEntry
            const entrySchema = Joi.object({
                EntryCode: Joi.string().required(),
                EntryDate: Joi.string().required(),
                EntryType: Joi.boolean().required(),
            }).unknown()
            let validation = entrySchema.validate({EntryCode: EntryCode, EntryDate: EntryDate, EntryType: EntryType});
            if (validation.error) {
                throw new Error(validation.error.details[0].message);
            }

            // Entry
            const schema = Joi.object({
                ProductCode : Joi.string().required(),
                ExpiryDate  : Joi.string().required(),
                LargeUnitQty: Joi.number().required().min(0),
                SmallUnitQty: Joi.number().required().min(0),
            }).unknown();
            if(entries.length <= 0) {
                throw new Error(t('ctr.entry.no_entry'));
            }
            entries.forEach((entry, index) => {
                let validation = schema.validate(entry);
                if (validation.error) {
                    throw new Error(`[${index+1}] ${validation.error.details[0].message}`);
                }
            });

            /**
             * check exists code
             */
            const exists_warehouse_entry = await WarehouseEntry.findOne({
                where: {
                    EntryCode: EntryCode
                }
            })
            if(exists_warehouse_entry) {
                throw new Error(t('ctr.entry.code_exists'));
            }

            /**
             * call create action
             */

            const products = await Product.findAll({
                where: {
                    ProductCode: {
                        [Op.in]: entries.map(item => {
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
                        [Op.in]: entries.map(item => {
                            return item.ProductCode
                        })
                    }
                },
                group: ['Inventory.ProductCode'],
            }, {transaction: transaction});

            const create = async (WarehouseEntry, entries) => {
                let EntryModels = []
                for(const i in entries) {
                    let entry = entries[i]

                    // Product check
                    let product = products.find(item => {
                        return item.ProductCode == entry.ProductCode
                    })
                    if(!product) {
                        throw new Error(`Mã sản phẩm [${entry.ProductCode}] không tồn tại.`);
                    }

                    // Inventory check
                    inventories = inventories.map(inventory => {
                        let LargeUnitQty = inventory.LargeUnitQty
                        let SmallUnitQty = inventory.SmallUnitQty

                        LargeUnitQty += entry.LargeUnitQty
                        SmallUnitQty += entry.SmallUnitQty

                        // format
                        let Qty = helper.unitQty(LargeUnitQty, SmallUnitQty, product)

                        // set for Inventory
                        inventory.LargeUnitQty = Qty.LargeUnitQty
                        inventory.SmallUnitQty = Qty.SmallUnitQty

                        // set for Entry
                        entry.StockLargeUnitQty = inventory.LargeUnitQty
                        entry.StockSmallUnitQty = inventory.SmallUnitQty

                        return inventory
                    })

                    let inventory = inventories.find(item => {
                        return item.ProductCode == entry.ProductCode
                    })

                    let StockLargeUnitQty = 0
                    let StockSmallUnitQty = 0
                    if(!inventory) {
                        let Pre_LargeUnitQty = EntryModels.filter(item => item.ProductCode == entry.ProductCode).reduce((sum, item) => sum + item.LargeUnitQty, 0);
                        let Pre_SmallUnitQty = EntryModels.filter(item => item.ProductCode == entry.ProductCode).reduce((sum, item) => sum + item.SmallUnitQty, 0);
                        
                        let Qty = helper.unitQty(Pre_LargeUnitQty + entry.LargeUnitQty, Pre_SmallUnitQty + entry.SmallUnitQty, product)
                        StockLargeUnitQty = Qty.LargeUnitQty
                        StockSmallUnitQty = Qty.SmallUnitQty
                    } else {
                        StockLargeUnitQty = entry.StockLargeUnitQty
                        StockSmallUnitQty = entry.StockSmallUnitQty
                    }

                    let EntryModel = {
                        EntryCode        : WarehouseEntry.EntryCode,
                        EntryDate        : WarehouseEntry.EntryDate,
                        EntryType        : WarehouseEntry.EntryType,

                        ProductCode      : entry.ProductCode,
                        ExpiryDate       : entry.ExpiryDate,
                        LargeUnitQty     : entry.LargeUnitQty,
                        SmallUnitQty     : entry.SmallUnitQty,
                        Price            : product.Price,

                        StockLargeUnitQty: StockLargeUnitQty,
                        StockSmallUnitQty: StockSmallUnitQty,
                    }

                    EntryModels.push(EntryModel)
                }

                await Entry.bulkCreate(EntryModels, {transaction: transaction});
            }

            await WarehouseEntry.create({
                EntryCode: EntryCode,
                EntryDate: EntryDate,
                EntryType: EntryType,
            }, {transaction: transaction}).then(async (WarehouseEntry) => {
                return await create(WarehouseEntry, entries)
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
                    ExpiryDate  : helper.excelDate(item.ExpiryDate),
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

            if(req.query.EntryCode) {
                where.EntryCode = { [Op.like]: `%${req.query.EntryCode}%` }
            }

            if(req.query.EntryDateFrom) {
                where.EntryDate = { ...where.EntryDate, [Op.gte]: `${req.query.EntryDateFrom}` }
            }

            if(req.query.EntryDateTo) {
                where.EntryDate = { ...where.EntryDate, [Op.lte]: `${req.query.EntryDateTo}` }
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
            const groupedRecords = await Entry.count({
                group: ['Entry.ProductCode'],
                where: where,
            });

            let total = groupedRecords.length;

            let entries = []
            if(total > 0) {
                entries = await Entry.findAll({
                    attributes: [
                        'ProductCode',
                        'ProductNameLabel'
                    ],
                    group: ['Entry.ProductCode'],
                    include: [
                        { association: 'products', include: [{ association: 'product' }] },
                        { association: 'product' },
                    ],

                    where: where,

                    // paginate
                    order: [
                        [sequelize.literal('EntryDate'), 'DESC'],
                        [sequelize.literal('id'), 'DESC']
                    ],
                    limit: limit,
                    offset: offset,
                });
            }

            let page = parseInt(req.query.page ?? 1)

            return res.json(success({
                items: entries,
                total: total,
                page: page,
                page_count: Math.ceil(total / limit),
                firstItem: entries.length ? (((page - 1) * limit) + 1) : 0,
                lastItem: entries.length ? ((page * limit) <= total ? (page * limit) : total) : 0,
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

            if(req.query.EntryCode) {
                where.EntryCode = { [Op.like]: `%${req.query.EntryCode}%` }
            }

            if(req.query.EntryDateFrom) {
                where.EntryDate = { ...where.EntryDate, [Op.gte]: `${req.query.EntryDateFrom}` }
            }

            if(req.query.EntryDateTo) {
                where.EntryDate = { ...where.EntryDate, [Op.lte]: `${req.query.EntryDateTo}` }
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
            const groupedRecords = await Entry.count({
                group: ['Entry.EntryDate'],
                where: where,
            });

            let total = groupedRecords.length;

            let entries = []
            if(total > 0) {
                entries = await Entry.findAll({
                    attributes: [
                        'EntryDate',
                    ],
                    group: ['Entry.EntryDate'],
                    where: where,

                    // paginate
                    order: [
                        [sequelize.literal('EntryDate'), 'DESC'],
                        [sequelize.literal('id'), 'DESC']
                    ],
                    limit: limit,
                    offset: offset,
                }).then(async (dates) => {
                    const EntryDates = dates.flatMap(date => date.EntryDate)
                    return await Entry.findAll({
                        attributes: [
                            'EntryDate',
                            'EntryCode',
                        ],
                        group: ['Entry.EntryCode'],
                        where: {
                            EntryDate: {
                                [Op.in]: EntryDates
                            }
                        },
                    }).then(async (codes) => {
                        const EntryCodes = codes.flatMap(code => code.EntryCode)
                        return await Entry.findAll({
                            where: {
                                EntryCode: {
                                    [Op.in]: EntryCodes
                                }
                            },
                            include: [{ association: 'product' }],
                        }).then(async (entries) => {
                            return dates.map(date => {
                                // console.log(date.EntryDate)
                                // console.log(codes.filter(item => {
                                //     console.log(item)
                                //     console.log(item.EntryDate)
                                //     return item.EntryDate = date.EntryDate
                                // }))
                                return {
                                    EntryDate: date.EntryDate,
                                    codes: codes.filter(item => item.EntryDate == date.EntryDate).map(code => {
                                        return {
                                            EntryCode: code.EntryCode,
                                            entries: entries.filter(item => item.EntryCode == code.EntryCode),
                                        }
                                    })
                                }
                            })
                        })
                    })

                    return dates
                });
            }

            let page = parseInt(req.query.page ?? 1)

            return res.json(success({
                items: entries,
                total: total,
                page: page,
                page_count: Math.ceil(total / limit),
                firstItem: entries.length ? (((page - 1) * limit) + 1) : 0,
                lastItem: entries.length ? ((page * limit) <= total ? (page * limit) : total) : 0,
            }));
        } catch (err) {
            return res.json(error(err.message, 501));
        }
    },
};

export default EntryController;
