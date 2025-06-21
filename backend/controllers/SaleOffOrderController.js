import SaleOffOrder from '../models/SaleOffOrder';
import SaleOffRoute from '../models/SaleOffRoute';
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
    index: async (req, res) => {
        try {
            console.log(req.query)

            /**
             * set condition
             */
            const where = {}

            if(req.query.OrderCode) {
                where.OrderCode = { [Op.like]: `%${req.query.OrderCode}%` }
            }

            if(req.query.OrderDateFrom) {
                where.OrderDate = { ...where.OrderDate, [Op.gte]: `${req.query.OrderDateFrom}` }
            }

            if(req.query.OrderDateTo) {
                where.OrderDate = { ...where.OrderDate, [Op.lte]: `${req.query.OrderDateTo}` }
            }

            /**
             * order
             */
            const order_list = ['OrderCode', 'OrderDate']
            let order = []
            if(order_list.includes(req.query.sort)) {
                let sort_by = req.query.sort_by == 'desc' ? 'desc' : 'asc'
                order = [req.query.sort, sort_by]
            }

            /**
             * page and limit a page
             */
            const limit = 50
            let offset = req.query.page ? ((req.query.page - 1) * limit) : 0
            
            /**
             * call select action
             */
            const total = await SaleOffOrder.count({
                where: where,
            })

            let orders = []
            if(total > 0) {
                orders = await SaleOffOrder.findAll({
                    where: where,
                    order: order.length > 0 ? [order, ['OrderDate', 'DESC'], ['id', 'DESC']] : [['OrderDate', 'DESC'], ['id', 'DESC']],
                    limit: limit,
                    offset: offset,
                    include: [
                        { 
                            association: 'saleOffRoutes',
                            include: [
                                { 
                                    association: 'saleOffOrderItems',
                                    include: [
                                        { association: 'saleOffProduct' },
                                        { association: 'customer'},
                                        { association: 'saleStaff' }
                                    ]
                                },
                                { association: 'deliveryStaff1' },
                                { association: 'deliveryStaff2' },
                                { association: 'deliveryStaff3' },
                            ]
                        }
                    ]
                });
            }

            let page = parseInt(req.query.page ?? 0)

            return res.json(success({
                items: orders,
                total: total,
                page: page,
                page_count: Math.ceil(total / limit),
                firstItem: orders.length ? (((page - 1) * limit) + 1) : 0,
                lastItem: orders.length ? ((page * limit) <= total ? (page * limit) : total) : 0,
            }));
        } catch (err) {
            return res.json(error(err.message, 501));
        }
    },

    store: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            const { OrderCode, OrderDate, OrderNote, SaleOffRoutes } = req.body;

            /**
             * validation
             */
            // 1. SaleOffOrder
            const orderSchema = Joi.object({
                OrderCode: Joi.string().required(),
                OrderDate: Joi.string().required(),
                OrderNote: Joi.string().allow(null, '').min(0).max(200),
            }).unknown()
            let validation = orderSchema.validate({
                OrderCode       : OrderCode,
                OrderDate       : OrderDate,
                OrderNote       : OrderNote,
            })
            if (validation.error) {
                throw new Error(validation.error.details[0].message);
            }

            // 2. SaleOffRoutes
            const routeSchema = Joi.object({
                RouteNote       : Joi.string().allow(null, '').min(0).max(200),
                RouteQty        : Joi.number().required().min(0),
                DeliveryStaffId1: Joi.number().required().min(0),
                DeliveryStaffId2: Joi.number().allow(null).min(1),
                DeliveryStaffId3: Joi.number().allow(null).min(1),
            }).unknown()

            // 3. SaleOffOrderItem
            const orderItemSchema = Joi.object({
                OrderItemNote: Joi.string().allow(null, '').min(0).max(200),
                SaleStaffId  : Joi.number().required().min(0),
                CustomerCode : Joi.string().required(),
                ProductCode  : Joi.string().required(),

                LargeUnitQty: Joi.number().required().min(0),
                SmallUnitQty: Joi.number().required().min(0),
            }).unknown();

            for (const route of SaleOffRoutes) {
                const validation = routeSchema.validate(route)
                if (validation.error) {
                    throw new Error(`[${index+1}] ${validation.error.details[0].message}`);
                }

                for (const orderItem of route.SaleOffOrderItems) {
                    const validation = orderItemSchema.validate(orderItem)
                    if (validation.error) {
                        throw new Error(`[${index+1}] ${validation.error.details[0].message}`);
                    }
                }
            }

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
            
            /**
             * GET master data from DB
             */
            let ProductCodeList = []
            let SaleStaffIdList = []
            let CustomerCodeList = []

            for (const route of SaleOffRoutes) {
                for (const orderItem of route.SaleOffOrderItems) {
                    ProductCodeList.push(orderItem.ProductCode)
                    SaleStaffIdList.push(orderItem.SaleStaffId)
                    CustomerCodeList.push(orderItem.CustomerCode)
                }
            }

            const SaleOffProduct_Master = await SaleOffProduct.findAll({
                where: {
                    ProductCode: {
                        [Op.in]: ProductCodeList
                    }
                }
            }, {transaction: transaction})

            const SaleStaff_Master = await SaleStaff.findAll({
                where: {
                    id: {
                        [Op.in]: SaleStaffIdList
                    }
                }
            }, {transaction: transaction})

            const Customer_Master = await Customer.findAll({
                where: {
                    CustomerCode: {
                        [Op.in]: CustomerCodeList
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
                        [Op.in]: ProductCodeList
                    }
                },
                group: ['SaleOffStock.ProductCode'],
            }, {transaction: transaction});

            /**
             *  Handle create order item and stock
             * @param {SaleOffRoute[]} saleOffRoutes
             */
            const bulkCreateItem = async (saleOffRoutes) => {
                let SaleOffOrderItem_Models = []

                /**
                 * Step 1: Format data
                 */
                for (const routeIndex in saleOffRoutes) {
                    for(const orderItem of SaleOffRoutes[routeIndex].SaleOffOrderItems) {
    
                        // SaleOffProduct check
                        let SaleOffProduct = SaleOffProduct_Master.find(item => {
                            return item.ProductCode == orderItem.ProductCode
                        })
                        if(!SaleOffProduct) {
                            throw new Error(`Mã sản phẩm [${orderItem.ProductCode}] không tồn tại.`);
                        }
    
                        // SaleStaff check
                        let saleStaff = SaleStaff_Master.find(item => {
                            return item.id == orderItem.SaleStaffId
                        })
                        if(!saleStaff) {
                            throw new Error(`Mã nhân viên bán hàng [${orderItem.SaleStaffId}] không tồn tại.`);
                        }
    
                        // Customer check
                        let customer = Customer_Master.find(item => {
                            return item.CustomerCode == orderItem.CustomerCode
                        })
                        if(!customer) {
                            throw new Error(`Mã khách hàng [${orderItem.CustomerCode}] không tồn tại.`);
                        }
    
                        // SaleOffStock check
                        let saleOffStock = SaleOffStock_Master.find(item => {
                            return item.ProductCode == orderItem.ProductCode
                        })
                        if(!saleOffStock) {
                            throw new Error(`Mã sản phẩm [${orderItem.ProductCode}] không tồn tại trong kho.`);
                        }
    
                        // Tính toán để trừ đi số lượng trong stock, lúc nay sẽ update lại SaleOffStock_Master luôn
                        SaleOffStock_Master = SaleOffStock_Master.map(SaleOffStock => {
                            // Cộng dồn nếu một đơn có nhiều sản phẩm giống nhau
                            SaleOffStock.qtyNeeded = SaleOffStock.qtyNeeded ?? 0
    
                            let CurrentQty = helper.unitQtyTransfer(SaleOffStock.LargeUnitQty, SaleOffStock.SmallUnitQty, SaleOffProduct)
                            let OrderQty = helper.unitQtyTransfer(orderItem.LargeUnitQty, orderItem.SmallUnitQty, SaleOffProduct)
    
                            if(SaleOffStock.ProductCode == orderItem.ProductCode) {
                                CurrentQty -= OrderQty
                                if(CurrentQty < 0) {
                                    throw new Error(`Mã sản phẩm [${orderItem.ProductCode}] không đủ số lượng.`);
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
                            RouteId     : saleOffRoutes[routeIndex].id,
    
                            SaleStaffId : orderItem.SaleStaffId,
                            CustomerCode: orderItem.CustomerCode,
                            ProductCode : orderItem.ProductCode,
    
                            LargeUnitQty: orderItem.LargeUnitQty,
                            SmallUnitQty: orderItem.SmallUnitQty,
                        }
    
                        SaleOffOrderItem_Models.push(SaleOffOrderItem_Model)
                    }
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

            /**
             *  Handle create route
             * @param {SaleOffOrder} saleOffOrder
             */
            const bulkCreateRoute = async (saleOffOrder) => {
                let SaleOffRoute_Models = []
                for (const route of SaleOffRoutes) {
                    SaleOffRoute_Models.push({
                        OrderCode       : saleOffOrder.OrderCode,
                        RouteNote       : route.RouteNote,
                        RouteQty        : route.RouteQty,
                        DeliveryStaffId1: route.DeliveryStaffId1,
                        DeliveryStaffId2: route.DeliveryStaffId2,
                        DeliveryStaffId3: route.DeliveryStaffId3,
                    })
                }
                
                await SaleOffRoute.bulkCreate(SaleOffRoute_Models, {transaction: transaction}).then(async (saleOffRoutes) => {
                    return await bulkCreateItem(saleOffRoutes)
                })
            }
            
            /**
             * call create action
             */
            await SaleOffOrder.create({
                OrderCode       : OrderCode,
                OrderDate       : OrderDate,
                OrderNote       : OrderNote,
            }, {transaction: transaction}).then(async (saleOffOrder) => {
                return await bulkCreateRoute(saleOffOrder)
            })

            await transaction.commit();
            return res.json(success());
        } catch (err) {
            console.log(err)
            await transaction.rollback();
            return res.json(error(err.message, 501));
        }
    },

    update: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            const { OrderCode, OrderDate, OrderNote, SaleOffRoutes } = req.body;

            /**
             * validation
             */
            // 1. SaleOffOrder
            const orderSchema = Joi.object({
                OrderCode: Joi.string().required(),
                OrderDate: Joi.string().required(),
                OrderNote: Joi.string().allow(null, '').min(0).max(200),
            }).unknown()
            let validation = orderSchema.validate({
                OrderCode       : OrderCode,
                OrderDate       : OrderDate,
                OrderNote       : OrderNote,
            })
            if (validation.error) {
                throw new Error(validation.error.details[0].message);
            }

            // 2. SaleOffRoutes
            const routeSchema = Joi.object({
                RouteNote       : Joi.string().allow(null, '').min(0).max(200),
                RouteQty        : Joi.number().required().min(0),
                DeliveryStaffId1: Joi.number().required().min(0),
                DeliveryStaffId2: Joi.number().allow(null).min(1),
                DeliveryStaffId3: Joi.number().allow(null).min(1),
            }).unknown()

            // 3. SaleOffOrderItem
            const orderItemSchema = Joi.object({
                OrderItemNote: Joi.string().allow(null, '').min(0).max(200),
                SaleStaffId  : Joi.number().required().min(0),
                CustomerCode : Joi.string().required(),
                ProductCode  : Joi.string().required(),

                LargeUnitQty: Joi.number().required().min(0),
                SmallUnitQty: Joi.number().required().min(0),
            }).unknown();

            for (const route of SaleOffRoutes) {
                const validation = routeSchema.validate(route)
                if (validation.error) {
                    throw new Error(`[${index+1}] ${validation.error.details[0].message}`);
                }

                for (const orderItem of route.SaleOffOrderItems) {
                    const validation = orderItemSchema.validate(orderItem)
                    if (validation.error) {
                        throw new Error(`[${index+1}] ${validation.error.details[0].message}`);
                    }
                }
            }

            /**
             * check exists code
             */
            const exists_SaleOffOrder = await SaleOffOrder.findOne({
                where: {
                    OrderCode: OrderCode
                },
                include: { association: 'saleOffRoutes' }
            })
            if(!exists_SaleOffOrder) {
                throw new Error(`Mã đơn hàng không tồn tại: ${OrderCode}`);
            }
            const RouteIdList = exists_SaleOffOrder.saleOffRoutes.map((route) => route.id)
            const exists_SaleOffOrderItems = await SaleOffOrderItem.findAll({
                where: {
                    RouteId: {
                        [Op.in]: RouteIdList
                    }
                }
            }, {transaction: transaction});
            
            /**
             * GET master data from DB
             */
            let ProductCodeList = []
            let SaleStaffIdList = []
            let CustomerCodeList = []

            for (const route of SaleOffRoutes) {
                for (const orderItem of route.SaleOffOrderItems) {
                    ProductCodeList.push(orderItem.ProductCode)
                    SaleStaffIdList.push(orderItem.SaleStaffId)
                    CustomerCodeList.push(orderItem.CustomerCode)
                }
            }
            for (const orderItem of exists_SaleOffOrderItems) {
                if (!ProductCodeList.includes(orderItem.ProductCode)) {
                    ProductCodeList.push(orderItem.ProductCode)
                }
                if (!SaleStaffIdList.includes(orderItem.SaleStaffId)) {
                    SaleStaffIdList.push(orderItem.SaleStaffId)
                }
                if (!CustomerCodeList.includes(orderItem.CustomerCode)) {
                    CustomerCodeList.push(orderItem.CustomerCode)
                }
            }

            const SaleOffProduct_Master = await SaleOffProduct.findAll({
                where: {
                    ProductCode: {
                        [Op.in]: ProductCodeList
                    }
                }
            }, {transaction: transaction})

            const SaleStaff_Master = await SaleStaff.findAll({
                where: {
                    id: {
                        [Op.in]: SaleStaffIdList
                    }
                }
            }, {transaction: transaction})

            const Customer_Master = await Customer.findAll({
                where: {
                    CustomerCode: {
                        [Op.in]: CustomerCodeList
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
                        [Op.in]: ProductCodeList
                    }
                },
                group: ['SaleOffStock.ProductCode'],
            }, {transaction: transaction});

            /**
             *  Handle create order item and stock
             * @param {SaleOffRoute[]} saleOffRoutes
             */
            const bulkCreateItem = async (saleOffRoutes) => {
                let SaleOffOrderItem_Models = []

                /**
                 * Step 2: Format data
                 */
                for (const routeIndex in saleOffRoutes) {
                    for(const orderItem of SaleOffRoutes[routeIndex].SaleOffOrderItems) {
                        // SaleOffProduct check
                        let SaleOffProduct = SaleOffProduct_Master.find(item => {
                            return item.ProductCode == orderItem.ProductCode
                        })
                        if(!SaleOffProduct) {
                            throw new Error(`Mã sản phẩm [${orderItem.ProductCode}] không tồn tại.`);
                        }
    
                        // SaleStaff check
                        let saleStaff = SaleStaff_Master.find(item => {
                            return item.id == orderItem.SaleStaffId
                        })
                        if(!saleStaff) {
                            throw new Error(`Mã nhân viên bán hàng [${orderItem.SaleStaffId}] không tồn tại.`);
                        }
    
                        // Customer check
                        let customer = Customer_Master.find(item => {
                            return item.CustomerCode == orderItem.CustomerCode
                        })
                        if(!customer) {
                            throw new Error(`Mã khách hàng [${orderItem.CustomerCode}] không tồn tại.`);
                        }
    
                        // SaleOffStock check
                        let saleOffStock = SaleOffStock_Master.find(item => {
                            return item.ProductCode == orderItem.ProductCode
                        })
                        if(!saleOffStock) {
                            throw new Error(`Mã sản phẩm [${orderItem.ProductCode}] không tồn tại trong kho.`);
                        }
    
                        // Tính toán để trừ đi số lượng trong stock, lúc nay sẽ update lại SaleOffStock_Master luôn
                        SaleOffStock_Master = SaleOffStock_Master.map(SaleOffStock => {
                            let CurrentQty = helper.unitQtyTransfer(SaleOffStock.LargeUnitQty, SaleOffStock.SmallUnitQty, SaleOffProduct)
                            let OrderQty = helper.unitQtyTransfer(orderItem.LargeUnitQty, orderItem.SmallUnitQty, SaleOffProduct)
    
                            if(SaleOffStock.ProductCode == orderItem.ProductCode) {
                                CurrentQty -= OrderQty
                                if(CurrentQty < 0) {
                                    throw new Error(`Mã sản phẩm [${orderItem.ProductCode}] không đủ số lượng.`);
                                }
                                
                                // Gán lại giá trị mới cho record stock
                                let StockQty = helper.unitQtyLS(CurrentQty, SaleOffProduct)
                                SaleOffStock.LargeUnitQty = StockQty.LargeUnitQty
                                SaleOffStock.SmallUnitQty = StockQty.SmallUnitQty
                            }
    
                            return SaleOffStock
                        })
    
                        let SaleOffOrderItem_Model = {
                            RouteId     : saleOffRoutes[routeIndex].id,
    
                            SaleStaffId : orderItem.SaleStaffId,
                            CustomerCode: orderItem.CustomerCode,
                            ProductCode : orderItem.ProductCode,
    
                            LargeUnitQty: orderItem.LargeUnitQty,
                            SmallUnitQty: orderItem.SmallUnitQty,
                        }
    
                        SaleOffOrderItem_Models.push(SaleOffOrderItem_Model)
                    }
                }

                /**
                 * Step 3: Call action bulkCreate and upsert stock
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

            /**
             *  Handle create route
             * @param {SaleOffOrder} saleOffOrder
             */
            const bulkCreateRoute = async (saleOffOrder) => {
                let SaleOffRoute_Models = []
                for (const route of SaleOffRoutes) {
                    SaleOffRoute_Models.push({
                        OrderCode       : saleOffOrder.OrderCode,
                        RouteNote       : route.RouteNote,
                        RouteQty        : route.RouteQty,
                        DeliveryStaffId1: route.DeliveryStaffId1,
                        DeliveryStaffId2: route.DeliveryStaffId2,
                        DeliveryStaffId3: route.DeliveryStaffId3,
                    })
                }
                
                return await SaleOffRoute.bulkCreate(SaleOffRoute_Models, {transaction: transaction}).then(async (saleOffRoutes) => {
                    return await bulkCreateItem(saleOffRoutes)
                })
            }

            /**
             *  Handle delete order
             */
            const deleteOrder = async () => {
                // chuẩn bị data stock để update lại
                for(const orderItem of exists_SaleOffOrderItems) {
                    // SaleOffProduct check
                    let product = SaleOffProduct_Master.find(item => {
                        return item.ProductCode == orderItem.ProductCode
                    })
                    if(!product) {
                        throw new Error(`Mã sản phẩm [${orderItem.ProductCode}] không tồn tại.`);
                    }

                    // SaleStaff check
                    let saleStaff = SaleStaff_Master.find(item => {
                        return item.id == orderItem.SaleStaffId
                    })
                    if(!saleStaff) {
                        throw new Error(`Mã nhân viên bán hàng [${orderItem.SaleStaffId}] không tồn tại.`);
                    }

                    // Customer check
                    let customer = Customer_Master.find(item => {
                        return item.CustomerCode == orderItem.CustomerCode
                    })
                    if(!customer) {
                        throw new Error(`Mã khách hàng [${orderItem.CustomerCode}] không tồn tại.`);
                    }

                    // SaleOffStock check
                    let saleOffStock = SaleOffStock_Master.find(item => {
                        return item.ProductCode == orderItem.ProductCode
                    })
                    if(!saleOffStock) {
                        throw new Error(`Mã sản phẩm [${orderItem.ProductCode}] không tồn tại trong kho.`);
                    }

                    // Tính toán để trừ đi số lượng trong stock, lúc nay sẽ update lại SaleOffStock_Master luôn
                    SaleOffStock_Master = SaleOffStock_Master.map(SaleOffStock => {
                        let CurrentQty = helper.unitQtyTransfer(SaleOffStock.LargeUnitQty, SaleOffStock.SmallUnitQty, product)
                        let OrderQty = helper.unitQtyTransfer(orderItem.LargeUnitQty, orderItem.SmallUnitQty, product)

                        if(SaleOffStock.ProductCode == orderItem.ProductCode) {
                            CurrentQty += OrderQty
                            if(CurrentQty < 0) {
                                throw new Error(`Mã sản phẩm [${orderItem.ProductCode}] không đủ số lượng.`);
                            }
                            
                            // Gáng lại giá trị mới cho record stock
                            let StockQty = helper.unitQtyLS(CurrentQty, product)
                            SaleOffStock.LargeUnitQty = StockQty.LargeUnitQty
                            SaleOffStock.SmallUnitQty = StockQty.SmallUnitQty
                        }

                        return SaleOffStock
                    })
                }

                // xoá SaleOffOrderItems
                const OrderItemIdList = exists_SaleOffOrderItems.map(i => i.id)
                return await SaleOffOrderItem.destroy({
                    where: {
                        id: {
                            [Op.in]: OrderItemIdList
                        }
                    }
                }, { transaction: transaction }).then(async () => {
                    await SaleOffRoute.destroy({
                        where: {
                            id: {
                                [Op.in]: RouteIdList
                            }
                        }
                    }, { transaction: transaction }).then(async () => {
                        await exists_SaleOffOrder.destroy({ transaction: transaction })
                    })
                })
            }
            
            /**
             * call delete -> create -> update(stock)
             */
            await deleteOrder().then(async () => {
                return await SaleOffOrder.create({
                    OrderCode: OrderCode,
                    OrderDate: OrderDate,
                    OrderNote: OrderNote,
                }, {transaction: transaction}).then(async (saleOffOrder) => {
                    return await bulkCreateRoute(saleOffOrder)
                })
            })

            await transaction.commit();
            return res.json(success());
        } catch (err) {
            console.log(err)
            await transaction.rollback();
            return res.json(error(err.message, 501));
        }
    },

    delete: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            const { OrderCode } = req.body;

            /**
             * validation
             */
            

            /**
             * check exists code
             */
            const exists_SaleOffOrder = await SaleOffOrder.findOne({
                where: {
                    OrderCode: OrderCode
                },
                include: { association: 'saleOffRoutes' }
            })
            if(!exists_SaleOffOrder) {
                throw new Error(`Mã đơn hàng không tồn tại: ${OrderCode}`);
            }
            const RouteIdList = exists_SaleOffOrder.saleOffRoutes.map((route) => route.id)
            const exists_SaleOffOrderItems = await SaleOffOrderItem.findAll({
                where: {
                    RouteId: {
                        [Op.in]: RouteIdList
                    }
                }
            }, {transaction: transaction});
            
            /**
             * GET master data from DB
             */
            let ProductCodeList = []
            let SaleStaffIdList = []
            let CustomerCodeList = []

            for (const orderItem of exists_SaleOffOrderItems) {
                if (!ProductCodeList.includes(orderItem.ProductCode)) {
                    ProductCodeList.push(orderItem.ProductCode)
                }
                if (!SaleStaffIdList.includes(orderItem.SaleStaffId)) {
                    SaleStaffIdList.push(orderItem.SaleStaffId)
                }
                if (!CustomerCodeList.includes(orderItem.CustomerCode)) {
                    CustomerCodeList.push(orderItem.CustomerCode)
                }
            }

            const SaleOffProduct_Master = await SaleOffProduct.findAll({
                where: {
                    ProductCode: {
                        [Op.in]: ProductCodeList
                    }
                }
            }, {transaction: transaction})

            const SaleStaff_Master = await SaleStaff.findAll({
                where: {
                    id: {
                        [Op.in]: SaleStaffIdList
                    }
                }
            }, {transaction: transaction})

            const Customer_Master = await Customer.findAll({
                where: {
                    CustomerCode: {
                        [Op.in]: CustomerCodeList
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
                        [Op.in]: ProductCodeList
                    }
                },
                group: ['SaleOffStock.ProductCode'],
            }, {transaction: transaction});

            /**
             *  Handle delete order
             */
            const deleteOrder = async () => {
                // chuẩn bị data stock để update lại
                for(const orderItem of exists_SaleOffOrderItems) {
                    // SaleOffProduct check
                    let product = SaleOffProduct_Master.find(item => {
                        return item.ProductCode == orderItem.ProductCode
                    })
                    if(!product) {
                        throw new Error(`Mã sản phẩm [${orderItem.ProductCode}] không tồn tại.`);
                    }

                    // SaleStaff check
                    let saleStaff = SaleStaff_Master.find(item => {
                        return item.id == orderItem.SaleStaffId
                    })
                    if(!saleStaff) {
                        throw new Error(`Mã nhân viên bán hàng [${orderItem.SaleStaffId}] không tồn tại.`);
                    }

                    // Customer check
                    let customer = Customer_Master.find(item => {
                        return item.CustomerCode == orderItem.CustomerCode
                    })
                    if(!customer) {
                        throw new Error(`Mã khách hàng [${orderItem.CustomerCode}] không tồn tại.`);
                    }

                    // SaleOffStock check
                    let saleOffStock = SaleOffStock_Master.find(item => {
                        return item.ProductCode == orderItem.ProductCode
                    })
                    if(!saleOffStock) {
                        throw new Error(`Mã sản phẩm [${orderItem.ProductCode}] không tồn tại trong kho.`);
                    }

                    // Tính toán để trừ đi số lượng trong stock, lúc nay sẽ update lại SaleOffStock_Master luôn
                    SaleOffStock_Master = SaleOffStock_Master.map(SaleOffStock => {
                        let CurrentQty = helper.unitQtyTransfer(SaleOffStock.LargeUnitQty, SaleOffStock.SmallUnitQty, product)
                        let OrderQty = helper.unitQtyTransfer(orderItem.LargeUnitQty, orderItem.SmallUnitQty, product)

                        if(SaleOffStock.ProductCode == orderItem.ProductCode) {
                            CurrentQty += OrderQty
                            if(CurrentQty < 0) {
                                throw new Error(`Mã sản phẩm [${orderItem.ProductCode}] không đủ số lượng.`);
                            }
                            
                            // Gáng lại giá trị mới cho record stock
                            let StockQty = helper.unitQtyLS(CurrentQty, product)
                            SaleOffStock.LargeUnitQty = StockQty.LargeUnitQty
                            SaleOffStock.SmallUnitQty = StockQty.SmallUnitQty
                        }

                        return SaleOffStock
                    })
                }

                // xoá SaleOffOrderItems
                const OrderItemIdList = exists_SaleOffOrderItems.map(i => i.id)
                return await SaleOffOrderItem.destroy({
                    where: {
                        id: {
                            [Op.in]: OrderItemIdList
                        }
                    }
                }, { transaction: transaction }).then(async () => {
                    await SaleOffRoute.destroy({
                        where: {
                            id: {
                                [Op.in]: RouteIdList
                            }
                        }
                    }, { transaction: transaction }).then(async () => {
                        await exists_SaleOffOrder.destroy({ transaction: transaction }).then(async () => {
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
                    })
                })
            }
            
            /**
             * call delete -> update(stock)
             */
            await deleteOrder()
            await transaction.commit();
            return res.json(success());
        } catch (err) {
            console.log(err)
            await transaction.rollback();
            return res.json(error(err.message, 501));
        }
    }
};

export default SaleOffOrderController;
