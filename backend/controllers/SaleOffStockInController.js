import SaleOffStockIn from '../models/SaleOffStockIn';
import SaleOffStockInItem from '../models/SaleOffStockInItem';
import SaleOffProduct from '../models/SaleOffProduct';
import SaleOffStock from '../models/SaleOffStock';

import { error, success } from './common/http';
import { t } from '../../src/renderer/i18n'
import { helper } from '../../src/renderer/helper'
import sequelize from '../models/index';
const xlsx = require('xlsx');
const { Op } = require("sequelize");
const Joi = require('joi');

const SaleOffStockInController = {

    index: async function (req, res) {
        try {
            console.log(req.query)

            /**
             * set condition
             */
            const where = {}

            if(req.query.StockInCode) {
                where.StockInCode = { [Op.like]: `%${req.query.StockInCode}%` }
            }

            if(req.query.StockInDate) {
                where.StockInDate = { [Op.eq]: `${req.query.StockInDate}` }
            }

            if(req.query.StockInDateFrom) {
                where.StockInDate = { ...where.StockInDate, [Op.gte]: `${req.query.StockInDateFrom}` }
            }

            if(req.query.StockInDateTo) {
                where.StockInDate = { ...where.StockInDate, [Op.lte]: `${req.query.StockInDateTo}` }
            }

            if(req.query.ProductCode) {
                where.ProductCode = { [Op.like]: `%${req.query.ProductCode}%` }
            }

            /**
             * order
             */
            const order_list = ['StockInCode', 'StockInDate']
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
            const total = await SaleOffStockIn.count({
                where: where,
            })

            let items = []
            if(total > 0) {
                items = await SaleOffStockIn.findAll({
                    where: where,
                    order: [['StockInDate', 'DESC'], ['id', 'DESC']],
                    limit: limit,
                    offset: offset,
                    include: [
                        { association: 'saleOffStockInItems', include: [{ association: 'saleOffProduct' }] }
                    ]
                });
            }

            let page = parseInt(req.query.page ?? 0)

            return res.json(success({
                items: items,
                total: total,
                page: page,
                page_count: Math.ceil(total / limit),
                firstItem: items.length ? (((page - 1) * limit) + 1) : 0,
                lastItem: items.length ? ((page * limit) <= total ? (page * limit) : total) : 0,
            }));
        } catch (err) {
            return res.json(error(err.message, 501));
        }
    },

    show: async function (req, res) {
        try {
            console.log(req.query)

            if (!req.query.StockInCode) {
                throw new Error(`Thiếu StockInCode.`);
            }

            const items = await SaleOffStockIn.findOne({
                where: {
                    StockInCode: req.query.StockInCode,
                },
                include: [
                    {
                        association: 'saleOffStockInItems',
                        include: [{ association: 'saleOffProduct' }],
                    },
                ],
            })

            if(!items) {
                throw new Error(`Không tìm thấy đơn nhập này.`);
            }

            return res.json(success(items));
        } catch (err) {
            return res.json(error(err.message, 501));
        }
    },

    store: async function (req, res) {
        const transaction = await sequelize.transaction();
        try {
            const { StockInCode, StockInDate, StockInNote, items } = req.body;

            /**
             * validation
             */
            // SaleOffStockIn
            const stockInSchema = Joi.object({
                StockInCode: Joi.string().required(),
                StockInDate: Joi.string().required(),
                StockInNote: Joi.string().allow(null, '').min(0).max(200),
            }).unknown()
            let validation = stockInSchema.validate({StockInCode: StockInCode, StockInDate: StockInDate, StockInNote: StockInNote});
            if (validation.error) {
                throw new Error(validation.error.details[0].message);
            }

            // SaleOffStockInItem
            const schema = Joi.object({
                ProductCode    : Joi.string().required(),
                LargeUnitQty   : Joi.number().required().min(0),
                SmallUnitQty   : Joi.number().required().min(0),
                StockInItemNote: Joi.string().allow(null, '').min(0).max(200),
            }).unknown();
            if(items.length <= 0) {
                throw new Error("Cần nhập ít nhất một sản phẩm.");
            }
            items.forEach((item, index) => {
                let validation = schema.validate(item);
                if (validation.error) {
                    throw new Error(`[${index+1}] ${validation.error.details[0].message}`);
                }
            });

            /**
             * check exists code
             */
            const exists_stock_in = await SaleOffStockIn.findOne({
                where: {
                    StockInCode: StockInCode
                }
            })
            if(exists_stock_in) {
                throw new Error("Mã nhập hàng này đã tồn tại.");
            }

            /**
             * call create action
             */

            const products = await SaleOffProduct.findAll({
                where: {
                    ProductCode: {
                        [Op.in]: items.map(item => {
                            return item.ProductCode
                        })
                    }
                }
            }, {transaction: transaction})

            const create = async (stockIn, items) => {
                let SaleOffStockInItemModels = []
                for(const i in items) {
                    let item = items[i]

                    // Product check
                    let product = products.find(prd => {
                        return prd.ProductCode == item.ProductCode
                    })
                    if(!product) {
                        throw new Error(`Mã sản phẩm [${item.ProductCode}] không tồn tại.`);
                    }

                    let SaleOffStockInItemModel = {
                        StockInCode    : stockIn.StockInCode,
                        StockInItemNote: item.StockInItemNote,
                        ProductCode    : item.ProductCode,
                        LargeUnitQty   : item.LargeUnitQty,
                        SmallUnitQty   : item.SmallUnitQty,
                    }

                    SaleOffStockInItemModels.push(SaleOffStockInItemModel)
                }

                await SaleOffStockInItem.bulkCreate(SaleOffStockInItemModels, {transaction: transaction});
            }

            await SaleOffStockIn.create({
                StockInCode: StockInCode,
                StockInDate: StockInDate,
                StockInNote: StockInNote,
            }, {transaction: transaction}).then(async (stockIn) => {
                return await create(stockIn, items)
            })

            await transaction.commit();
            return res.json(success());
        } catch (err) {
            await transaction.rollback();
            return res.json(error(err.message, 501));
        }
    },

    import: async function (req, res) {
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

    update: async function (req, res) {
        const transaction = await sequelize.transaction();
        try {
            const { StockInCode, StockInDate, StockInNote, items } = req.body;

            /**
             * validation
             */
            // SaleOffStockIn
            const stockInSchema = Joi.object({
                StockInCode: Joi.string().required(),
                StockInDate: Joi.string().required(),
                StockInNote: Joi.string().allow(null, '').min(0).max(200),
            }).unknown()
            let validation = stockInSchema.validate({StockInCode: StockInCode, StockInDate: StockInDate, StockInNote: StockInNote});
            if (validation.error) {
                throw new Error(validation.error.details[0].message);
            }

            // SaleOffStockInItem
            const schema = Joi.object({
                ProductCode    : Joi.string().required(),
                LargeUnitQty   : Joi.number().required().min(0),
                SmallUnitQty   : Joi.number().required().min(0),
                StockInItemNote: Joi.string().allow(null, '').min(0).max(200),
            }).unknown();
            if(items.length <= 0) {
                throw new Error("Cần nhập ít nhất một sản phẩm.");
            }
            items.forEach((item, index) => {
                let validation = schema.validate(item);
                if (validation.error) {
                    throw new Error(`[${index+1}] ${validation.error.details[0].message}`);
                }
            });

            /**
             * check exists code
             */
            const exists_stock_in = await SaleOffStockIn.findOne({
                where: {
                    StockInCode: StockInCode
                }
            })
            if(!exists_stock_in) {
                throw new Error("Không tìm thấy đơn nhập này.");
            }

            /**
             * call update action
             */

            const oldItems = await SaleOffStockInItem.findAll({
                    where: {
                        StockInCode: StockInCode,
                    },
                }, {transaction: transaction})

            const products = await SaleOffProduct.findAll({
                where: {
                    ProductCode: {
                        [Op.in]: [...oldItems.map(item => {
                            return item.ProductCode
                        }), ...items.map(item => {
                            return item.ProductCode
                        })]
                    }
                }
            }, {transaction: transaction})

            const update = async (items) => {
                let stocksUpdate = []

                // Chỉnh sửa và xóa item
                for(const index in oldItems) {
                    let oldItem = oldItems[index]
                    // Product check
                    let product = products.find(prd => {
                        return prd.ProductCode == oldItem.ProductCode
                    })
                    if(!product) {
                        throw new Error(`Mã sản phẩm [${oldItem.ProductCode}] không tồn tại 1.`);
                    }

                    const item = items.find(i => i.id == oldItem.id)
                    let qty = 0
                    let oldQty = helper.unitQtyTransfer(oldItem.LargeUnitQty, oldItem.SmallUnitQty, product)
                    if(item) {
                        qty = helper.unitQtyTransfer(item.LargeUnitQty, item.SmallUnitQty, product)
                        
                        oldItem.LargeUnitQty = item.LargeUnitQty
                        oldItem.SmallUnitQty = item.SmallUnitQty

                        await oldItem.save({ transaction: transaction })
                    } else {
                        await oldItem.destroy({ transaction: transaction })
                    }
                    
                    let stockUpdate = stocksUpdate.find(stock => stock.ProductCode == product.ProductCode)
                    if(stockUpdate) {
                        stocksUpdate = stocksUpdate.map(stock => {
                            if(stock.ProductCode == product.ProductCode) {
                                stock.Qty = stock.Qty + (qty - oldQty)
                            }
                            return stock
                        })
                    } else {
                        stocksUpdate.push({ProductCode: product.ProductCode, Qty: qty - oldQty})
                    }
                }

                if(stocksUpdate.length > 0) {
                    await updateStock(stocksUpdate)
                }  
            }

            const create = async (stockIn, items) => {
                // Thêm item
                let SaleOffStockInItemModels = []
                for(const index in items) {
                    const item = items[index]
                    // Product check
                    let product = products.find(prd => {
                        return prd.ProductCode == item.ProductCode
                    })
                    if(!product) {
                        throw new Error(`Mã sản phẩm [${item.ProductCode}] không tồn tại 2.`);
                    }

                    if(!item?.id || !oldItems.find(i => i.id == item.id)) {
                        let SaleOffStockInItemModel = {
                            StockInCode    : stockIn.StockInCode,
                            StockInItemNote: item.StockInItemNote,
                            ProductCode    : item.ProductCode,
                            LargeUnitQty   : item.LargeUnitQty,
                            SmallUnitQty   : item.SmallUnitQty,
                        }

                        SaleOffStockInItemModels.push(SaleOffStockInItemModel)
                    }
                }

                if(SaleOffStockInItemModels.length > 0) {
                    await SaleOffStockInItem.bulkCreate(SaleOffStockInItemModels, {transaction: newTransaction});
                }
            }
            const updateStock = async (items) => {
                const stocks = await SaleOffStock.findAll({
                    where: {
                        ProductCode: {
                            [Op.in]: items.map(item => {
                                return item.ProductCode
                            })
                        }
                    }
                }, {transaction: transaction})

                for(const index in stocks) {
                    let stock = stocks[index]

                    // Product check
                    let product = products.find(prd => {
                        return prd.ProductCode == stock.ProductCode
                    })
                    if(!product) {
                        throw new Error(`Mã sản phẩm [${stock.ProductCode}] không tồn tại 3.`);
                    }

                    const item = items.find(i => i.ProductCode ==  stock.ProductCode)
                    if(item) {
                        let OldQty = helper.unitQtyTransfer(stock.LargeUnitQty, stock.SmallUnitQty, product)
                        let NewQty = OldQty + item.Qty;

                        let Qty = helper.unitQtyLS(NewQty, product)

                        stock.LargeUnitQty = Qty.LargeUnitQty
                        stock.SmallUnitQty = Qty.SmallUnitQty
                        if(stock.LargeUnitQty < 0 || stock.SmallUnitQty < 0) {
                            throw new Error(`Mã sản phẩm [${stock.ProductCode}] trong kho không đủ số lượng để điều chỉnh. Kiểm tra lại kho.`);
                        }
                        await stock.save({transaction: transaction})
                    } else {
                        throw new Error(`Mã sản phẩm [${stock.ProductCode}] không tồn tại trong kho.`);
                    }
                }
            }

            // step 1:
            exists_stock_in.StockInDate = StockInDate
            exists_stock_in.StockInNote = StockInNote
            await exists_stock_in.save({ transaction: transaction }).then(async () => {
                return await update(items)
            })
            await transaction.commit();
            
            // step 2:
            const newTransaction = await sequelize.transaction();
            await create(exists_stock_in, items, oldItems)


            await newTransaction.commit();
            return res.json(success());
        } catch (err) {
            await transaction.rollback();
            console.log(err)
            return res.json(error(err.message, 501));
        }
    },
};


export default SaleOffStockInController;
