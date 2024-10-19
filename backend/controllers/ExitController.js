import WarehouseExit from '../models/WarehouseExit';
import Exit from '../models/Exit';
import Product from '../models/Product';
import { error, success } from './common/http';
import { t } from '../../src/renderer/i18n'
import sequelize from '../models/index';
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
                return res.json(error(validation.error.details[0].message))
            }

            // Exit
            const schema = Joi.object({
                ProductCode : Joi.string().required(),
                ExpiryDate  : Joi.string().required(),
                LargeUnitQty: Joi.number().required().min(0),
                SmallUnitQty: Joi.number().required().min(0),
            }).unknown();
            if(exits.length <= 0) {
                return res.json(error(t('ctr.exit.no_exit')));
            }
            exits.forEach((exit, index) => {
                let validation = schema.validate(exit);
                if (validation.error) {
                    return res.json(error(`[${index+1}] ${validation.error.details[0].message}`))
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
                return res.json(error(t('ctr.exit.code_exists')));
            }

            /**
             * call create action
             */

            const create = async (ExitCode, exits) => {
                for (const exit of exits) {
                    await Exit.create({
                        ExitCode: ExitCode,
                        ProductCode: exit.ProductCode,
                        ExpiryDate: exit.ExpiryDate,
                        LargeUnitQty: exit.LargeUnitQty,
                        SmallUnitQty: exit.SmallUnitQty,
                    }, {transaction: transaction});
                }
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
