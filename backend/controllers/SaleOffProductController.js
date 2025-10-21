import SaleOffProduct from '../models/SaleOffProduct';
import SaleOffStock from '../models/SaleOffStock';
import { error, success } from './common/http';
import { t } from '../../src/renderer/i18n'
import { helper } from '../../src/renderer/helper'
import sequelize from '../models/index';
const xlsx = require('xlsx');
const path = require('path');
const { Op } = require("sequelize");
const Joi = require('joi');

const SaleOffProductController = {

    index: async (req, res) => {
        try {
            console.log(req.query)

            /**
             * set condition
             */
            const where = {}

            if (req.query.ProductCode) {
                where.ProductCode = { [Op.like]: `%${req.query.ProductCode}%` }
            }

            if (req.query.ProductName) {
                where.ProductName = { [Op.like]: `%${req.query.ProductName}%` }
            }

            /**
             * order
             */
            const order_list = ['ProductCode', 'ProductName', 'Price', 'ConversionRate']
            let order = []
            if (order_list.includes(req.query.sort)) {
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
            const total = await SaleOffProduct.count({
                where: where,
            })

            let products = []
            if (total > 0) {
                products = await SaleOffProduct.findAll({
                    where: where,
                    order: order,
                    limit: limit,
                    offset: offset
                });
            }

            let page = parseInt(req.query.page ?? 0)

            return res.json(success({
                items     : products,
                total     : total,
                page      : page,
                page_count: Math.ceil(total / limit),
                firstItem : products.length ? (((page - 1) * limit) + 1) : 0,
                lastItem  : products.length ? ((page * limit) <= total ? (page * limit) : total) : 0,
            }));
        } catch (err) {
            return res.json(error(err.message, 501));
        }
    },

    store: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            console.log(req.body)
            const { ProductCode, ProductName, Price, LargeUnit, SmallUnit, ConversionRate } = req.body;

            /**
             * validation
             */
            const schema = Joi.object({
                ProductCode   : Joi.string().required().min(1).max(200),
                ProductName   : Joi.string().required().min(1).max(200),
                Price         : Joi.number().required().min(0),
                LargeUnit     : Joi.string().required().max(50),
                SmallUnit     : Joi.string().allow(null, '').max(50),
                ConversionRate: Joi.when('SmallUnit', {
                    is       : Joi.string(),
                    then     : Joi.number().min(1).required(),
                    otherwise: Joi.number().allow(null).min(1),
                }),
            }).unknown();

            const validation = schema.validate(req.body);

            if (validation.error) {
                return res.json(error(validation.error.details[0].message))
            }

            /**
             * check exists code
             */
            const existsProduct = await SaleOffProduct.findOne({
                where: {
                    ProductCode: ProductCode
                }
            }, { transaction: transaction })
            if (existsProduct) {
                return res.json(error('Mã sản phẩm đã tồn tại.'));
            }

            /**
             * call create action
             */
            const product = await SaleOffProduct.create({
                ProductCode   : ProductCode,
                ProductName   : ProductName,
                Price         : Price,
                LargeUnit     : LargeUnit,
                SmallUnit     : SmallUnit,
                ConversionRate: ConversionRate,
            }, { transaction: transaction });

            await transaction.commit();
            return res.json(success(product));
        } catch (err) {
            await transaction.rollback();
            return res.json(error(err.message, 501));
        }
    },

    show: async (req, res) => {
        try {
            console.log(req.query)

            if (!req.query.ProductCode) {
                throw new Error(`Thiếu ProductCode.`);
            }

            const product = await SaleOffProduct.findOne({
                where: {
                    'ProductCode': req.query.ProductCode
                }
            })

            if(!product) {
                throw new Error("Mã sản phẩm không tồn tại.");
            }

            return res.json(success(product));
        } catch (err) {
            return res.json(error(err.message, 501));
        }
    },

    update: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            console.log(req.body)
            const { ProductCode, ProductName, Price, LargeUnit, SmallUnit, ConversionRate } = req.body;

            /**
             * validation
             */
            const schema = Joi.object({
                ProductCode   : Joi.string().required().min(1).max(200),
                ProductName   : Joi.string().required().min(1).max(200),
                Price         : Joi.number().required().min(0),
                LargeUnit     : Joi.string().required().max(50),
                SmallUnit     : Joi.string().allow(null, '').max(50),
                ConversionRate: Joi.when('SmallUnit', {
                    is       : Joi.string(),
                    then     : Joi.number().min(1).required(),
                    otherwise: Joi.number().allow(null).min(1),
                }),
            }).unknown();

            const validation = schema.validate(req.body);

            if (validation.error) {
                throw new Error(validation.error.details[0].message)
            }

            /**
             * check exists code
             */
            const existsProduct = await SaleOffProduct.findOne({
                where: {
                    ProductCode: ProductCode
                },
            }, { transaction: transaction })
            if (!existsProduct) {
                throw new Error("Mã sản phẩm không tồn tại.")
            }

            const stock = await SaleOffStock.findOne({
                where: {
                    ProductCode: ProductCode
                }
            }, { transaction: transaction })

            if(stock) {
                if(existsProduct.ConversionRate != ConversionRate) {
                    throw new Error(`Không thể thay đổi Quy cách vì sản phẩm này đã nhập kho rồi`)
                }

                if(existsProduct.ConversionRate && !SmallUnit) {
                    throw new Error(`Vui lòng nhập đơn vị 2 vì đã có Quy cách`)
                }
            }

            /**
             * call create action
             */
            existsProduct.ProductName    = ProductName
            existsProduct.Price          = Price
            existsProduct.LargeUnit      = LargeUnit
            existsProduct.SmallUnit      = SmallUnit
            existsProduct.ConversionRate = SmallUnit ? ConversionRate : null
            
            await existsProduct.save({ transaction: transaction })

            await transaction.commit();
            return res.json(success(existsProduct));
        } catch (err) {
            await transaction.rollback();
            return res.json(error(err.message, 501));
        }
    },

    delete: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            console.log(req.query)

            const { ProductCode } = req.body;

            if(!ProductCode) {
                throw new Error("Không tìm thấy sản phẩm.");
            }

            const product = await SaleOffProduct.findOne({
                where: {
                    ProductCode: ProductCode
                }
            }, { transaction: transaction })

            if(!product) {
                throw new Error("Không tìm thấy mặt hàng.");
            }

            const stocks = await SaleOffStock.findAll({
                where: {
                    ProductCode: ProductCode
                }
            }, { transaction: transaction })

            if(stocks.length > 0) {
                throw new Error("Sản phẩm này đã có trong kho, không thể xóa.");
            }

            await product.destroy({ transaction: transaction })
            
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
                    ProductCode   : item.ProductCode,
                    ProductName   : item.ProductName,
                    Price         : item.Price,
                    ConversionRate: item.ConversionRate,
                }
            })

            await transaction.commit();
            return res.json(success(data));
        } catch (err) {
            await transaction.rollback();
            return res.json(error(err.message, 501));
        }
    },

    bulkCreate: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            const { products } = req.body;

            /**
             * validation
             */
            const schema = Joi.object({
                ProductCode   : Joi.string().required().min(1).max(200),
                ProductName   : Joi.string().required().min(1).max(200),
                Price         : Joi.number().required().min(0),
                LargeUnit     : Joi.string().required().max(50),
                SmallUnit     : Joi.string().allow(null, '').max(50),
                ConversionRate: Joi.when('SmallUnit', {
                    is       : Joi.string(),
                    then     : Joi.number().min(1).required(),
                    otherwise: Joi.number().allow(null).min(1),
                }),
            }).unknown();

            if(products.length <= 0) {
                throw new Error(t('ctr.product.no_product'));
            }

            const duplicateItems = helper.findDuplicates(products, 'ProductCode');
            if(duplicateItems.length > 0) {
                throw new Error(`${duplicateItems[0].ProductCode} bị trùng lặp.`);
            }

            let ProductModels = []
            products.forEach(async (product, index) => {
                let validation = schema.validate(product);
                if (validation.error) {
                    throw new Error(`[${index+1}] ${validation.error.details[0].message}`);
                }

                ProductModels.push({
                    ProductCode   : product.ProductCode,
                    ProductName   : product.ProductName,
                    Price         : product.Price,
                    LargeUnit     : product.LargeUnit,
                    SmallUnit     : product.SmallUnit,
                    ConversionRate: product.ConversionRate,
                })
            });
            
            let exists_products = await SaleOffProduct.findAll({
                where: {
                    ProductCode: {
                        [Op.in]: products.map(item => {
                            return item.ProductCode
                        })
                    }
                }
            }, {transaction: transaction})

            if(exists_products.length > 0) {
                throw new Error(`[${exists_products[0].ProductCode}] ` + t('ctr.product.code_exists'));
            }


            /**
             * call create action
             */
            await SaleOffProduct.bulkCreate( ProductModels, { transaction: transaction });

            await transaction.commit();
            return res.json(success());
        } catch (err) {
            await transaction.rollback();
            return res.json(error(err.message, 501));
        }
    },

    list: async (req, res) => {
        try {
            console.log(req.query)

            /**
             * set condition
             */
            const where = {}

            if (req.query.ProductCode) {
                where.ProductCode = { [Op.like]: `%${req.query.ProductCode}%` }
            }

            if (req.query.ProductName) {
                where.ProductName = { [Op.like]: `%${req.query.ProductName}%` }
            }

            /**
             * order
             */
            const order_list = ['ProductCode', 'ProductName']
            let order = []
            if (order_list.includes(req.query.sort)) {
                let sort_by = req.query.sort_by == 'desc' ? 'desc' : 'asc'
                order = [[req.query.sort, sort_by]]
            }

            /**
             * call select action
             */
            const total = await SaleOffProduct.count({
                where: where,
            })

            let products = []
            if (total > 0) {
                products = await SaleOffProduct.findAll({
                    order: order,
                    // attributes: { include: ['ProductNameLabel'] }
                });
            }

            return res.json(success({
                items: products,
            }));
        } catch (err) {
            return res.json(error(err.message, 501));
        }
    },
};

export default SaleOffProductController;
