import WarehouseEntry from '../models/WarehouseEntry';
import Product from '../models/Product';
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

            if(req.query.EntryDate) {
                where.EntryDate = { [Op.eq]: `${req.query.EntryDate}` }
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
                    offset: offset,
                    include: [
                        { model:  Product }
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
        try {
            console.log(req.body)
            const { entries, EntryCode, EntryDate } = req.body;

            /**
             * validation
             */
            const schema = Joi.object({
                ProductCode : Joi.string().required(),
                LargeUnitQty: Joi.number().required().min(0),
                SmallUnitQty: Joi.number().required().min(0),
                ExpiryDate  : Joi.string().required(),
            }).unknown();

            if(entries.length <= 0) {
                return res.json(error(t('ctr.entry.no_entry')));
            }

            entries.forEach((entry, index) => {
                let validation = schema.validate(entry);
                if (validation.error) {
                    return res.json(error(`[${index+1}]${validation.error.details[0].message}`))
                }
            });

            /**
             * check exists code
             */
            const entrySchema = Joi.object({
                EntryCode: Joi.string().required(),
                EntryDate: Joi.string().required(),
            })
            let validation = entrySchema.validate({EntryCode: EntryCode, EntryDate: EntryDate});
            if (validation.error) {
                return res.json(error(validation.error.details[0].message))
            }

            const existsEntry = await WarehouseEntry.findOne({
                where: {
                    EntryCode: EntryCode
                }
            })
            if(existsEntry) {
                return res.json(error(t('ctr.entry.code_exists')));
            }

            /**
             * call create action
             */
            entries.forEach(async (entry, index) => {
                await WarehouseEntry.create({
                    EntryCode: EntryCode,
                    EntryDate: EntryDate,
                    ProductCode: entry.ProductCode,
                    LargeUnitQty: entry.LargeUnitQty,
                    SmallUnitQty: entry.SmallUnitQty,
                    ExpiryDate: entry.ExpiryDate,
                });
            })

            return res.json(success());
        } catch (err) {
            return res.json(error(err.message, 501));
        }
    }
};

export default EntryController;
