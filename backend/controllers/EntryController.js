import WarehouseEntry from '../models/WarehouseEntry';
import { error, success } from './common/http';
import { t } from '../../src/renderer/i18n'
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
                    order: order,
                    limit: limit,
                    offset: offset
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

    // store: async (req, res) => {
    //     try {
    //         console.log(req.body)
    //         const { ProductCode, ProductName, LargeUnit, SmallUnit, ConversionRate } = req.body;

    //         /**
    //          * validation
    //          */
    //         const schema = Joi.object({
    //             ProductCode   : Joi.string().required().min(1).max(200),
    //             ProductName   : Joi.string().required().min(1).max(200),
    //             LargeUnit     : Joi.string().required().max(50),
    //             SmallUnit     : Joi.string().allow(null, ''),
    //             ConversionRate: Joi.when('SmallUnit', {
    //                 is: Joi.string(),
    //                 then: Joi.number().min(1).required(),
    //                 otherwise: Joi.number().allow(null).min(1),
    //             }),
    //         }).unknown();

    //         const validation = schema.validate(req.body);

    //         if (validation.error) {
    //             return res.json(error(validation.error.details[0].message))
    //         }

    //         /**
    //          * check exists code
    //          */
    //         const existsProduct = await Product.findOne({
    //             where: {
    //                 ProductCode: ProductCode
    //             }
    //         })
    //         if(existsProduct) {
    //             return res.json(error(t('ctr.product.code_exists')));
    //         }

    //         /**
    //          * call create action
    //          */
    //         const product = await Product.create({
    //             ProductCode   : ProductCode,
    //             ProductName   : ProductName,
    //             LargeUnit     : LargeUnit,
    //             SmallUnit     : SmallUnit,
    //             ConversionRate: ConversionRate,
    //         });
            
    //         return res.json(success(product));
    //     } catch (err) {
    //         return res.json(error(err.message, 501));
    //     }
    // }
};

export default EntryController;
