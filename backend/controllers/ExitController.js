import WarehouseExit from '../models/WarehouseExit';
import Exit from '../models/Exit';
import Product from '../models/Product';
import { error, success } from './common/http';
import { t } from '../../src/renderer/i18n'
import { helper } from '../../src/renderer/helper'
import sequelize from '../models/index';
import Inventory from '../models/Inventory';
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
                    order: order,
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
            const create = async (ExitCode, exits) => {

                /**
                 * Format Exit[] model
                 */
                const ExitsModel = exits.map(exit => {
                    return {
                        ExitCode: ExitCode,
                        ProductCode: exit.ProductCode,
                        LargeUnitQty: exit.LargeUnitQty,
                        SmallUnitQty: exit.SmallUnitQty,
                    }
                })

                /**
                 * Merge Exit by ProductCode
                 */
                let exits_merge = {}
                for (const exit of exits) {
                    let key = `${exit.ProductCode}`
                    if(exits_merge[key]) {
                        exits_merge[key].LargeUnitQty += exit.LargeUnitQty
                        exits_merge[key].SmallUnitQty += exit.SmallUnitQty
                    } else {
                        exits_merge[key] = exit
                    }
                }

                exits_merge = Object.values(exits_merge)

                /**
                 * Check product and transfer unit
                 */
                let products = await Product.findAll({
                    where: {
                        ProductCode: {
                            [Op.in]: exits_merge.map(item => {
                                return item.ProductCode
                            })
                        }
                    }
                }, {transaction: transaction})
                .then((products) => {
                    exits_merge = exits_merge.map((exit) => {
    
                        let LargeUnitQty = exit.LargeUnitQty
                        let SmallUnitQty = exit.SmallUnitQty
    
                        let product = products.find(item => {
                            return item.ProductCode == exit.ProductCode
                        });
    
                        if(!product) {
                            throw new Error(`Mã sản phẩm [${exit.ProductCode}] không tồn tại`);
                        }
    
                        if(SmallUnitQty > 0 && (!product.SmallUnit || product.ConversionRate <= 0)) {
                            throw new Error(`Mã sản phẩm [${exit.ProductCode}] không có đơn vị 2`);
                        }
    
                        let TransferUnitQty = SmallUnitQty
                        if(product.ConversionRate > 0) {
                            TransferUnitQty = SmallUnitQty + (LargeUnitQty * product.ConversionRate)
                        } else {
                            TransferUnitQty = LargeUnitQty
                        }
    
                        return {
                            ExitCode: exit.ExitCode,
                            ProductCode: exit.ProductCode,
                            LargeUnitQty: exit.LargeUnitQty,
                            SmallUnitQty: exit.SmallUnitQty,
    
                            TransferUnitQty: TransferUnitQty,
                        }
                    })

                    return products
                });

                /**
                 * Check Qty in Inventory
                 */
                let upsert = []
                for (const i in exits_merge) {
                    let exit = exits_merge[i]
                    let qtyNeeded = exit.TransferUnitQty
                    let product = products.find(item => {
                        return item.ProductCode == exit.ProductCode
                    })
                    
                    let shipments = await Inventory.findAll({
                        where: {
                            ProductCode: exit.ProductCode
                        }
                    }).then(async (inventories) => {
                        inventories = inventories.sort((a, b) => new Date(a.ExpiryDate) - new Date(b.ExpiryDate));
                        let shipment = []
                        for (let i = 0; i < inventories.length; i++) {
                            if (qtyNeeded <= 0) break;
                            let inventory = inventories[i]
            
                            let AvailableUnitQty = inventory.SmallUnitQty
                            if(product.ConversionRate > 0) {
                                AvailableUnitQty = inventory.SmallUnitQty + (inventory.LargeUnitQty * product.ConversionRate)
                            } else {
                                AvailableUnitQty = inventory.LargeUnitQty
                            }

                            console.log('qtyNeeded', qtyNeeded)
                            console.log('AvailableUnitQty', AvailableUnitQty)
                            
                            if(AvailableUnitQty <= qtyNeeded) {
                                shipment.push({
                                    ProductCode: inventory.ProductCode,
                                    ExpiryDate: inventory.ExpiryDate,
                                    LargeUnitQty: 0,
                                    SmallUnitQty: 0,
                                })

                                // exit
                                qtyNeeded -= AvailableUnitQty;
                            } else {
                                let new_invent = {
                                    ProductCode : inventory.ProductCode,
                                    ExpiryDate  : inventory.ExpiryDate,
                                    LargeUnitQty: inventory.LargeUnitQty,
                                    SmallUnitQty: inventory.SmallUnitQty,
                                }
                                
                                if(product.ConversionRate && product.ConversionRate > 0) {
                                    if(new_invent.SmallUnitQty >= qtyNeeded) {
                                        new_invent.SmallUnitQty -= qtyNeeded
                                    } else {
                                        qtyNeeded -= new_invent.SmallUnitQty

                                        new_invent.SmallUnitQty = 0

                                        let large = (new_invent.LargeUnitQty * product.ConversionRate) - qtyNeeded

                                        new_invent.LargeUnitQty = Math.floor(large / product.ConversionRate)
                                        new_invent.SmallUnitQty += large % product.ConversionRate
                                    }
                                } else {
                                    new_invent.LargeUnitQty -= qtyNeeded
                                }

                                shipment.push(new_invent)
                                qtyNeeded = 0
                            }
                        }

                        return shipment
                    })

                    if(qtyNeeded > 0) {
                        throw new Error(`Mã sản phẩm [${product.ProductCode}] không đủ số lượng`);
                    }

                    upsert = upsert.concat(shipments)
                }

                /**
                 * Insert action
                 */
                await Exit.bulkCreate(ExitsModel, {transaction: transaction}).then(async (res) => {
                    for(const i in upsert) {
                        let inventory = upsert[i]
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
                return await create(WarehouseExit.ExitCode, exits)
            })

            await transaction.commit();
            return res.json(success());
        } catch (err) {
            await transaction.rollback();
            return res.json(error(err.message, 501));
        }
    },
};

export default ExitController;
