import Product from '../models/Product';
import { error, success } from './common/http';
import { t } from '../../src/renderer/i18n'
import { helper } from '../../src/renderer/helper'
import sequelize from '../models/index';
const xlsx = require('xlsx');
const path = require('path');
const { Op } = require("sequelize");
const Joi = require('joi');

const ProductController = {

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
            const order_list = ['ProductCode', 'ProductName', 'Expire', 'ConversionRate']
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
            const total = await Product.count({
                where: where,
            })

            let products = []
            if (total > 0) {
                products = await Product.findAll({
                    where: where,
                    order: order,
                    limit: limit,
                    offset: offset
                });
            }

            let page = parseInt(req.query.page ?? 0)

            return res.json(success({
                items: products,
                total: total,
                page: page,
                page_count: Math.ceil(total / limit),
                firstItem: products.length ? (((page - 1) * limit) + 1) : 0,
                lastItem: products.length ? ((page * limit) <= total ? (page * limit) : total) : 0,
            }));
        } catch (err) {
            return res.json(error(err.message, 501));
        }
    },

    store: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            console.log(req.body)
            const { ProductCode, ProductName, LargeUnit, SmallUnit, ConversionRate, Expire } = req.body;

            /**
             * validation
             */
            const schema = Joi.object({
                ProductCode: Joi.string().required().min(1).max(200),
                ProductName: Joi.string().required().min(1).max(200),
                Expire: Joi.number().required().min(0),
                LargeUnit: Joi.string().required().max(50),
                SmallUnit: Joi.string().allow(null, ''),
                ConversionRate: Joi.when('SmallUnit', {
                    is: Joi.string(),
                    then: Joi.number().min(1).required(),
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
            const existsProduct = await Product.findOne({
                where: {
                    ProductCode: ProductCode
                }
            }, { transaction: transaction })
            if (existsProduct) {
                return res.json(error(t('ctr.product.code_exists')));
            }

            /**
             * call create action
             */
            const product = await Product.create({
                ProductCode: ProductCode,
                ProductName: ProductName,
                LargeUnit: LargeUnit,
                SmallUnit: SmallUnit,
                ConversionRate: ConversionRate,
                Expire: Expire,
            }, { transaction: transaction });

            await transaction.commit();
            return res.json(success(product));
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
    
            const filePath = path.join(__dirname, '../../' + req.file.path);
            const workbook = xlsx.readFile(filePath);
    
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            let data = xlsx.utils.sheet_to_json(worksheet);

            data = data.map(item => {
                return {
                    ProductCode: item.ProductCode,
                    ProductName: item.ProductName,
                    Expire: item.Expire,
                    ConversionRate: item.ConversionRate,
                }
            })

            return res.json(success(data));
        } catch (err) {
            await transaction.rollback();
            return res.json(error(err.message, 501));
        }
    },

    bulkCreate: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            // console.log(req.body)
            const { products } = req.body;

            /**
             * validation
             */
            const schema = Joi.object({
                ProductCode: Joi.string().required().min(1).max(200),
                ProductName: Joi.string().required().min(1).max(200),
                Expire: Joi.number().required().min(0),
                LargeUnit: Joi.string().required().max(50),
                SmallUnit: Joi.string().allow(null, ''),
                ConversionRate: Joi.when('SmallUnit', {
                    is: Joi.string(),
                    then: Joi.number().min(1).required(),
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
                    ProductCode: product.ProductCode,
                    ProductName: product.ProductName,
                    Expire: product.Expire,
                    LargeUnit: product.LargeUnit,
                    SmallUnit: product.SmallUnit,
                    ConversionRate: product.ConversionRate,
                })
            });
            
            let exists_products = await Product.findAll({
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
            await Product.bulkCreate( ProductModels, { transaction: transaction });

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
            const total = await Product.count({
                where: where,
            })

            let products = []
            if (total > 0) {
                products = await Product.findAll({
                    order: order,
                    attributes: { include: ['ProductNameLabel'] }
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

export default ProductController;
