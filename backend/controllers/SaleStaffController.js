import SaleStaff from '../models/SaleStaff';
import SaleOffOrderItem from '../models/SaleOffOrderItem';
import { error, success } from './common/http';
import { ACTIVE_LIST } from '../../src/renderer/constant'
import { t } from '../../src/renderer/i18n'
import { helper } from '../../src/renderer/helper'
import sequelize from '../models/index';
const xlsx = require('xlsx');
const path = require('path');
const { Op } = require("sequelize");
const Joi = require('joi');

const SaleStaffController = {

    index: async (req, res) => {
        try {
            console.log(req.query)

            /**
             * set condition
             */
            const where = {}

            if (req.query.SaleStaffName) {
                where.SaleStaffName = { [Op.like]: `%${req.query.SaleStaffName}%` }
            }

            const status = helper.parseBoolean(req.query.SaleStaffActive)
            if (status !== undefined) {
                where.SaleStaffActive = status
            }

            /**
             * order
             */
            const order_list = ['SaleStaffName', 'SaleStaffActive',]
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
            const total = await SaleStaff.count({
                where: where,
            })

            let items = []
            if (total > 0) {
                items = await SaleStaff.findAll({
                    where: where,
                    order: order,
                    limit: limit,
                    offset: offset
                });
            }

            let page = parseInt(req.query.page ?? 0)

            return res.json(success({
                items     : items,
                total     : total,
                page      : page,
                page_count: Math.ceil(total / limit),
                firstItem : items.length ? (((page - 1) * limit) + 1) : 0,
                lastItem  : items.length ? ((page * limit) <= total ? (page * limit) : total) : 0,
            }));
        } catch (err) {
            return res.json(error(err.message, 501));
        }
    },

    store: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            console.log(req.body)
            const { SaleStaffName } = req.body;

            /**
             * validation
             */
            const schema = Joi.object({
                SaleStaffName: Joi.string().required().min(1).max(200),
            }).unknown();

            const validation = schema.validate(req.body);

            if (validation.error) {
                return res.json(error(validation.error.details[0].message))
            }

            /**
             * check exists code
             */
            const existsSaleStaff = await SaleStaff.findOne({
                where: {
                    SaleStaffName: SaleStaffName
                }
            }, { transaction: transaction })
            if (existsSaleStaff) {
                return res.json(error('Tên nhân viên này đã tồn tại.'));
            }

            /**
             * call create action
             */
            const staff = await SaleStaff.create({
                SaleStaffName: SaleStaffName,
            }, { transaction: transaction });

            await transaction.commit();
            return res.json(success(staff));
        } catch (err) {
            await transaction.rollback();
            return res.json(error(err.message, 501));
        }
    },

    show: async (req, res) => {
        try {
            console.log(req.query)

            if (!req.query.id) {
                throw new Error(`Thiếu id.`);
            }

            const staff = await SaleStaff.findOne({
                where: {
                    'id': req.query.id
                }
            })

            if(!staff) {
                throw new Error("Nhân viên này không tồn tại.");
            }

            return res.json(success(staff));
        } catch (err) {
            return res.json(error(err.message, 501));
        }
    },

    update: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            console.log(req.body)
            const { id, SaleStaffName, SaleStaffActive } = req.body;

            /**
             * validation
             */
            const schema = Joi.object({
                SaleStaffName  : Joi.string().required().min(1).max(200),
                SaleStaffActive: Joi.boolean().required(),
            }).unknown();

            const validation = schema.validate(req.body);

            if (validation.error) {
                throw new Error(validation.error.details[0].message)
            }

            /**
             * check exists code
             */
            const existsStaff = await SaleStaff.findOne({
                where: {
                    id: id
                },
            }, { transaction: transaction })
            if (!existsStaff) {
                throw new Error("Nhân viên này không tồn tại.")
            }


            /**
             * call create action
             */
            existsStaff.SaleStaffName   = SaleStaffName
            existsStaff.SaleStaffActive = SaleStaffActive
            
            await existsStaff.save({ transaction: transaction })

            await transaction.commit();
            return res.json(success(existsStaff));
        } catch (err) {
            await transaction.rollback();
            return res.json(error(err.message, 501));
        }
    },

    delete: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            console.log(req.body)

            const { id } = req.body;

            if(!id) {
                throw new Error("Không tìm thấy nhân viên.");
            }

            const staff = await SaleStaff.findOne({
                where: {
                    id: id
                }
            }, { transaction: transaction })

            if(!staff) {
                throw new Error("Không tìm thấy nhân viên.");
            }

            const orderItems = await SaleOffOrderItem.findAll({
                where: {
                    SaleStaffId: id
                }
            }, { transaction: transaction })

            if(orderItems.length > 0) {
                throw new Error("Nhân viên bán hàng này đã có đơn hàng, không thể xóa.");
            }

            await staff.destroy({ transaction: transaction })
            
            await transaction.commit();
            return res.json(success());
        } catch (err) {
            await transaction.rollback();
            return res.json(error(err.message, 501));
        }
    },
};

export default SaleStaffController;
