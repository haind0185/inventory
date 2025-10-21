import Customer from '../models/Customer';
import SaleOffOrderItem from '../models/SaleOffOrderItem';
import { error, success } from './common/http';
import { t } from '../../src/renderer/i18n'
import { helper } from '../../src/renderer/helper'
import sequelize from '../models/index';
const xlsx = require('xlsx');
const path = require('path');
const { Op } = require("sequelize");
const Joi = require('joi');

const CustomerController = {

    index: async (req, res) => {
        try {
            console.log(req.query)

            /**
             * set condition
             */
            const where = {}

            if (req.query.CustomerCode) {
                where.CustomerCode = { [Op.like]: `%${req.query.CustomerCode}%` }
            }
            if (req.query.CustomerName) {
                where.CustomerName = { [Op.like]: `%${req.query.CustomerName}%` }
            }
            if (req.query.CustomerAddress) {
                where.CustomerAddress = { [Op.like]: `%${req.query.CustomerAddress}%` }
            }

            /**
             * order
             */
            const order_list = ['CustomerCode', 'CustomerName', 'CustomerAddress']
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
            const total = await Customer.count({
                where: where,
            })

            let items = []
            if (total > 0) {
                items = await Customer.findAll({
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
            const { CustomerCode, CustomerName, CustomerAddress } = req.body;

            /**
             * validation
             */
            const schema = Joi.object({
                CustomerCode   : Joi.string().required().min(1).max(200),
                CustomerName   : Joi.string().required().min(1).max(200),
                CustomerAddress: Joi.string().allow(null, '').min(0).max(200),
            }).unknown();

            const validation = schema.validate(req.body);

            if (validation.error) {
                return res.json(error(validation.error.details[0].message))
            }

            /**
             * check exists code
             */
            const existsCustomer = await Customer.findOne({
                where: {
                    CustomerCode: CustomerCode
                }
            }, { transaction: transaction })
            if (existsCustomer) {
                return res.json(error('Mã khách hàng này đã tồn tại.'));
            }

            /**
             * call create action
             */
            const customer = await Customer.create({
                CustomerCode   : CustomerCode,
                CustomerName   : CustomerName,
                CustomerAddress: CustomerAddress,
            }, { transaction: transaction });

            await transaction.commit();
            return res.json(success(customer));
        } catch (err) {
            await transaction.rollback();
            return res.json(error(err.message, 501));
        }
    },

    show: async (req, res) => {
        try {
            console.log(req.query)

            if (!req.query.CustomerCode) {
                throw new Error(`Thiếu mã khách hàng.`);
            }

            const customer = await Customer.findOne({
                where: {
                    'CustomerCode': req.query.CustomerCode
                }
            })

            if(!customer) {
                throw new Error("Khách hàng này không tồn tại.");
            }

            return res.json(success(customer));
        } catch (err) {
            return res.json(error(err.message, 501));
        }
    },

    update: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            console.log(req.body)
            const { CustomerCode, CustomerName, CustomerAddress } = req.body;

            /**
             * validation
             */
            const schema = Joi.object({
                CustomerCode   : Joi.string().required().min(1).max(200),
                CustomerName   : Joi.string().required().min(1).max(200),
                CustomerAddress: Joi.string().allow(null, '').min(0).max(200),
            }).unknown();

            const validation = schema.validate(req.body);

            if (validation.error) {
                throw new Error(validation.error.details[0].message)
            }

            /**
             * check exists code
             */
            const customer = await Customer.findOne({
                where: {
                    CustomerCode: CustomerCode
                },
            }, { transaction: transaction })
            if (!customer) {
                throw new Error("Khách hàng này không tồn tại.")
            }


            /**
             * call create action
             */
            customer.CustomerName   = CustomerName
            customer.CustomerAddress = CustomerAddress
            
            await customer.save({ transaction: transaction })

            await transaction.commit();
            return res.json(success(customer));
        } catch (err) {
            await transaction.rollback();
            return res.json(error(err.message, 501));
        }
    },

    delete: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            console.log(req.body)

            const { CustomerCode } = req.body;

            if(!CustomerCode) {
                throw new Error("Không tìm thấy khách hàng.");
            }

            const customer = await Customer.findOne({
                where: {
                    CustomerCode: CustomerCode
                }
            }, { transaction: transaction })

            if(!customer) {
                throw new Error("Không tìm thấy khách hàng.");
            }

            const orderItems = await SaleOffOrderItem.findAll({
                where: {
                    [Op.or]: [
                        { CustomerCode: CustomerCode },
                    ]
                }
            }, { transaction: transaction })

            if(orderItems.length > 0) {
                throw new Error("Khách hàng này đã có đơn hàn, không thể xóa.");
            }

            await customer.destroy({ transaction: transaction })
            
            await transaction.commit();
            return res.json(success());
        } catch (err) {
            await transaction.rollback();
            return res.json(error(err.message, 501));
        }
    },
};

export default CustomerController;
