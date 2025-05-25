import SaleOffOrder from '../models/SaleOffOrder';
import SaleOffOrderItem from '../models/SaleOffOrderItem';
import SaleOffProduct from '../models/SaleOffProduct';
import SaleOffStock from '../models/SaleOffStock';
import SaleStaff from '../models/SaleStaff';
import Customer from '../models/Customer';

import { error, success } from './common/http';
import { t } from '../../src/renderer/i18n'
import { helper } from '../../src/renderer/helper'
import sequelize from '../models/index';
import DeliveryStaff from '../models/DeliveryStaff';
const xlsx = require('xlsx');
const { Op } = require("sequelize");
const Joi = require('joi');

const SaleOffOrderController = {
    store: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            const { OrderCode, OrderDate, OrderNote, DeliveryStaffId1, DeliveryStaffId2, DeliveryStaffId3, SaleOffOrderItems } = req.body;

            /**
             * validation
             */
            // 1. SaleOffOrder
            const orderSchema = Joi.object({
                OrderCode: Joi.string().required(),
                OrderDate: Joi.string().required(),
                OrderNote: Joi.string().allow(null, '').min(0).max(200),
                DeliveryStaffId1: Joi.number().required().min(0),
                DeliveryStaffId2: Joi.number().allow(null).min(1),
                DeliveryStaffId3: Joi.number().allow(null).min(1),
            }).unknown()
            let validation = orderSchema.validate({
                OrderCode       : OrderCode,
                OrderDate       : OrderDate,
                OrderNote       : OrderNote,
                DeliveryStaffId1: DeliveryStaffId1,
                DeliveryStaffId2: DeliveryStaffId2,
                DeliveryStaffId3: DeliveryStaffId3,
            })
            if (validation.error) {
                throw new Error(validation.error.details[0].message);
            }

            // 2. SaleOffOrderItem
            const schema = Joi.object({
                OrderItemNote: Joi.string().allow(null, '').min(0).max(200),
                SaleStaffId  : Joi.number().required().min(0),
                CustomerCode : Joi.string().required(),
                ProductCode  : Joi.string().required(),

                LargeUnitQty: Joi.number().required().min(0),
                SmallUnitQty: Joi.number().required().min(0),
            }).unknown();
            if(SaleOffOrderItems.length <= 0) {
                throw new Error('Cần có ít nhất một item cho đơn hàng.');
            }
            SaleOffOrderItems.forEach((exit, index) => {
                let validation = schema.validate(exit);
                if (validation.error) {
                    throw new Error(`[${index+1}] ${validation.error.details[0].message}`);
                }
            });

            /**
             * check exists code
             */
            const exists_SaleOffOrder = await SaleOffOrder.findOne({
                where: {
                    OrderCode: OrderCode
                }
            })
            if(exists_SaleOffOrder) {
                throw new Error("Mã đơn hàng đã tồn tại.");
            }
            
            const DeliveryStaff1 = await DeliveryStaff.findOne({
                where: {
                    id: DeliveryStaffId1
                }
            })
            if(!DeliveryStaff1) {
                throw new Error(`Không tìm thấy nhân viên giao nhận: ${DeliveryStaffId1}`);
            }

            const DeliveryStaff2 = null
            if(DeliveryStaffId2) {
                DeliveryStaff2 = await DeliveryStaff.findOne({
                    where: {
                        id: DeliveryStaffId2
                    }
                })
                if(!DeliveryStaff2) {
                    throw new Error(`Không tìm thấy nhân viên giao nhận: ${DeliveryStaffId2}`);
                }
            }

            const DeliveryStaff3 = null
            if(DeliveryStaffId3) {
                DeliveryStaff3 = await DeliveryStaff.findOne({
                    where: {
                        id: DeliveryStaffId3
                    }
                })
                if(!DeliveryStaff3) {
                    throw new Error(`Không tìm thấy nhân viên giao nhận: ${DeliveryStaffId3}`);
                }
            }

            /**
             * GET master data from DB
             */
            const SaleOffProduct_Master = await SaleOffProduct.findAll({
                where: {
                    ProductCode: {
                        [Op.in]: SaleOffOrderItems.map(item => {
                            return item.ProductCode
                        })
                    }
                }
            }, {transaction: transaction})

            const SaleStaff_Master = await SaleStaff.findAll({
                where: {
                    id: {
                        [Op.in]: SaleOffOrderItems.map(item => {
                            return item.SaleStaffId
                        })
                    }
                }
            }, {transaction: transaction})

            const Customer_Master = await Customer.findAll({
                where: {
                    CustomerCode: {
                        [Op.in]: SaleOffOrderItems.map(item => {
                            return item.CustomerCode
                        })
                    }
                }
            }, {transaction: transaction})

            let SaleOffStock_Master = await SaleOffStock.findAll({
                attributes: [
                    'ProductCode',
                    [sequelize.fn('SUM', sequelize.col('LargeUnitQty')), 'LargeUnitQty'],
                    [sequelize.fn('SUM', sequelize.col('SmallUnitQty')), 'SmallUnitQty'],
                ],
                where: {
                    ProductCode: {
                        [Op.in]: SaleOffOrderItems.map(item => {
                            return item.ProductCode
                        })
                    }
                },
                group: ['SaleOffStock.ProductCode'],
            }, {transaction: transaction});


            /**
             * call create action
             */
            await SaleOffOrder.create({
                OrderCode       : OrderCode,
                OrderDate       : OrderDate,
                OrderNote       : OrderNote,
                DeliveryStaffId1: DeliveryStaffId1,
                DeliveryStaffId2: DeliveryStaffId2,
                DeliveryStaffId3: DeliveryStaffId3,
            }, {transaction: transaction}).then(async (SaleOffOrder) => {
                return await bulkCreateItem(SaleOffOrder, SaleOffOrderItems)
            })

            /**
             *  Handle create order item and stock
             * @param {SaleOffOrder} SaleOffOrder
             * @param {SaleOffOrderItem[]} SaleOffOrderItems
             */
            const bulkCreateItem = async (SaleOffOrder, SaleOffOrderItems) => {
                let SaleOffOrderItem_Models = []

                /**
                 * Step 1: Format data
                 */
                for(const i in SaleOffOrderItems) {
                    let SaleOffOrderItem = SaleOffOrderItems[i]

                    // SaleOffProduct check
                    let SaleOffProduct = SaleOffProduct_Master.find(item => {
                        return item.ProductCode == SaleOffOrderItem.ProductCode
                    })
                    if(!SaleOffProduct) {
                        throw new Error(`Mã sản phẩm [${SaleOffOrderItem.ProductCode}] không tồn tại.`);
                    }

                    // SaleStaff check
                    let SaleStaff = SaleStaff_Master.find(item => {
                        return item.id == SaleOffOrderItem.SaleStaffId
                    })
                    if(!SaleStaff) {
                        throw new Error(`Mã nhân viên bán hàng [${SaleOffOrderItem.SaleStaffId}] không tồn tại.`);
                    }

                    // Customer check
                    let Customer = Customer_Master.find(item => {
                        return item.CustomerCode == SaleOffOrderItem.CustomerCode
                    })
                    if(!Customer) {
                        throw new Error(`Mã khách hàng [${SaleOffOrderItem.CustomerCode}] không tồn tại.`);
                    }

                    // SaleOffStock check
                    let SaleOffStock = SaleOffStock_Master.find(item => {
                        return item.ProductCode == SaleOffOrderItem.ProductCode
                    })
                    if(!SaleOffStock) {
                        throw new Error(`Mã sản phẩm [${SaleOffOrderItem.ProductCode}] không tồn tại trong kho.`);
                    }

                    // Tính toán để trừ đi số lượng trong stock, lúc nay sẽ update lại SaleOffStock_Master luôn
                    SaleOffStock_Master = SaleOffStock_Master.map(SaleOffStock => {
                        // Cộng dồn nếu một đơn có nhiều sản phẩm giống nhau
                        SaleOffStock.qtyNeeded = SaleOffStock.qtyNeeded ?? 0

                        let CurrentQty = helper.unitQtyTransfer(SaleOffStock.LargeUnitQty, SaleOffStock.SmallUnitQty, SaleOffProduct)
                        let OrderQty = helper.unitQtyTransfer(SaleOffOrderItem.LargeUnitQty, SaleOffOrderItem.SmallUnitQty, SaleOffProduct)

                        if(SaleOffStock.ProductCode == SaleOffOrderItem.ProductCode) {
                            CurrentQty -= OrderQty
                            if(CurrentQty < 0) {
                                throw new Error(`Mã sản phẩm [${SaleOffOrderItem.ProductCode}] không đủ số lượng.`);
                            }
                            
                            // Gáng lại giá trị mới cho record stock
                            let StockQty = helper.unitQtyLS(CurrentQty, SaleOffProduct)
                            SaleOffStock.LargeUnitQty = StockQty.LargeUnitQty
                            SaleOffStock.SmallUnitQty = StockQty.SmallUnitQty

                            // Cộng dồn nếu một đơn có nhiều sản phẩm giống nhau
                            SaleOffStock.qtyNeeded += OrderQty
                        }

                        return SaleOffStock
                    })

                    let SaleOffOrderItem_Model = {
                        OrderCode   : SaleOffOrder.OrderCode,

                        SaleStaffId : SaleOffOrderItem.SaleStaffId,
                        CustomerCode: SaleOffOrderItem.CustomerCode,
                        ProductCode : SaleOffOrderItem.ProductCode,

                        LargeUnitQty: SaleOffOrderItem.LargeUnitQty,
                        SmallUnitQty: SaleOffOrderItem.SmallUnitQty,
                    }

                    SaleOffOrderItem_Models.push(SaleOffOrderItem_Model)
                }

                /**
                 * Step 2: Call action bulkCreate and upsert stock
                 */
                await SaleOffOrderItem.bulkCreate(SaleOffOrderItem_Models, {transaction: transaction}).then(async (res) => {
                    for(const i in SaleOffStock_Master) {
                        let stock = SaleOffStock_Master[i]
                        await SaleOffStock.upsert(
                            {
                                ProductCode : stock.ProductCode,
                                LargeUnitQty: stock.LargeUnitQty,
                                SmallUnitQty: stock.SmallUnitQty,
                            }, {
                                transaction: transaction,
                                conflictFields: ['ProductCode']
                            }
                        )
                    }
                })
            }

            await transaction.commit();
            return res.json(success());
        } catch (err) {
            await transaction.rollback();
            return res.json(error(err.message, 501));
        }
    },
};

export default SaleOffOrderController;
