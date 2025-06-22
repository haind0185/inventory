import moment from 'moment'
import sequelize from '../models/index'
import { error, success } from './common/http'
import { t } from '../../src/renderer/i18n'
import { Service } from './common/download'
import { helper } from '../../src/renderer/helper'
import SaleOffOrderItem from '../models/SaleOffOrderItem'
import Customer from '../models/Customer'
import SaleStaff from '../models/SaleStaff'
import DeliveryStaff from '../models/DeliveryStaff'
import SaleOffProduct from '../models/SaleOffProduct'
import SaleOffOrder from '../models/SaleOffOrder'
import SaleOffRoute from '../models/SaleOffRoute'
const { Op } = require('sequelize')
const Joi = require('joi')
const xlsx = require('xlsx')

const SaleOffReportController = {
    customer: async (req, res) => {
        try {
            /**
             * set condition
             */
            let where = {}
            let whereOrder = {}

            if (req.query.CustomerCodes) {
                where.CustomerCode = {
                    [Op.in]: req.query.CustomerCodes
                }
            }
            if(req.query.OrderDateFrom) {
                whereOrder.OrderDate = { ...whereOrder.OrderDate, [Op.gte]: `${req.query.OrderDateFrom}` }
            }

            if(req.query.OrderDateTo) {
                whereOrder.OrderDate = { ...whereOrder.OrderDate, [Op.lte]: `${req.query.OrderDateTo}` }
            }

            /**
             * order
             */
            const order_list = []
            let order = [];
            let sort_by = req.query.sort_by == 'desc' ? 'desc' : 'asc'
            if (order_list.includes(req.query.sort)) {
                order = [[req.query.sort, sort_by]]
            }

            /**
             * page and limit a page
             */
            const limit = 50;
            let offset = req.query.page ? (req.query.page - 1) * limit : 0

            /**
             * call select action
             */
            const total = await Customer.count({
                where: where,
                include: [
                    { 
                        association: 'saleOffOrderItems',
                        required: true,
                        include: [
                            { 
                                association: 'saleOffRoute',
                                required: true,
                                include: [
                                    { association: 'saleOffOrder', required: true, where: whereOrder },
                                ]
                            },
                        ]
                    }
                ],
                distinct: true,
                col: 'id'
            })

            let items = []
            if (total > 0) {
                items = await Customer.findAll({
                    where: where,
                    order: [...order],
                    limit: limit,
                    offset: offset,
                    include: [
                        { 
                            association: 'saleOffOrderItems',
                            include: [
                                { 
                                    association: 'saleOffRoute',
                                    include: [
                                        { association: 'saleOffOrder', required: true, where: whereOrder },
                                    ]
                                },
                                { association: 'saleOffProduct' },
                                { association: 'saleStaff' }
                            ]
                        }
                    ],
                    raw: true,
                    nest: true
                })
            }

            let page = parseInt(req.query.page ?? 1)

            return res.json(success({
                items: helper.transformDataCustomer(items),
                itemsOrigin: items,
                total: total,
                page: page,
                page_count: Math.ceil(total / limit),
                firstItem: items.length ? (((page - 1) * limit) + 1) : 0,
                lastItem: items.length ? ((page * limit) <= total ? (page * limit) : total) : 0,
            }))
        } catch (err) {
            console.log(err)
            return res.json(error(err.message, 501))
        }
    },

    saleStaff: async (req, res) => {
        try {
            /**
             * set condition
             */
            let where = {}
            let whereOrder = {}

            if (req.query.Ids) {
                where.id = {
                    [Op.in]: req.query.Ids
                }
            }
            if(req.query.OrderDateFrom) {
                whereOrder.OrderDate = { ...whereOrder.OrderDate, [Op.gte]: `${req.query.OrderDateFrom}` }
            }

            if(req.query.OrderDateTo) {
                whereOrder.OrderDate = { ...whereOrder.OrderDate, [Op.lte]: `${req.query.OrderDateTo}` }
            }

            /**
             * order
             */
            const order_list = []
            let order = [];
            let sort_by = req.query.sort_by == 'desc' ? 'desc' : 'asc'
            if (order_list.includes(req.query.sort)) {
                order = [[req.query.sort, sort_by]]
            }

            /**
             * page and limit a page
             */
            const limit = 50;
            let offset = req.query.page ? (req.query.page - 1) * limit : 0

            /**
             * call select action
             */
            const total = await SaleStaff.count({
                where: where,
                include: [
                    { 
                        association: 'saleOffOrderItems',
                        required: true,
                        include: [
                            { 
                                association: 'saleOffRoute',
                                required: true,
                                include: [
                                    { association: 'saleOffOrder', required: true, where: whereOrder },
                                ]
                            },
                        ]
                    }
                ],
                distinct: true,
                col: 'id'
            })

            let items = []
            if (total > 0) {
                items = await SaleStaff.findAll({
                    where: where,
                    order: [...order],
                    limit: limit,
                    offset: offset,
                    include: [
                        { 
                            association: 'saleOffOrderItems',
                            include: [
                                { 
                                    association: 'saleOffRoute',
                                    include: [
                                        { association: 'saleOffOrder', required: true, where: whereOrder },
                                    ]
                                },
                                { association: 'saleOffProduct' },
                            ]
                        }
                    ],
                    raw: true,
                    nest: true
                })
            }

            let page = parseInt(req.query.page ?? 1)

            return res.json(success({
                items: helper.transformDataSaleStaff(items),
                // items: items,
                itemsOrigin: items,
                total: total,
                page: page,
                page_count: Math.ceil(total / limit),
                firstItem: items.length ? (((page - 1) * limit) + 1) : 0,
                lastItem: items.length ? ((page * limit) <= total ? (page * limit) : total) : 0,
            }))
        } catch (err) {
            console.log(err)
            return res.json(error(err.message, 501))
        }
    },

    deliveryStaff: async (req, res) => {
        try {
            /**
             * set condition
             */
            let where = {}
            let whereOrder = {}

            if (req.query.Ids) {
                where.id = {
                    [Op.in]: req.query.Ids
                }
            }
            if(req.query.OrderDateFrom) {
                whereOrder.OrderDate = { ...whereOrder.OrderDate, [Op.gte]: `${req.query.OrderDateFrom}` }
            }

            if(req.query.OrderDateTo) {
                whereOrder.OrderDate = { ...whereOrder.OrderDate, [Op.lte]: `${req.query.OrderDateTo}` }
            }

            /**
             * order
             */
            const order_list = []
            let order = [];
            let sort_by = req.query.sort_by == 'desc' ? 'desc' : 'asc'
            if (order_list.includes(req.query.sort)) {
                order = [[req.query.sort, sort_by]]
            }

            /**
             * page and limit a page
             */
            const limit = 50;
            let offset = req.query.page ? (req.query.page - 1) * limit : 0

            /**
             * call select action
             */
            const total = await DeliveryStaff.count({
                where: {
                    ...where,
                    [Op.or]: [
                        { '$saleOffRoutes1.id$': { [Op.not]: null } },
                        { '$saleOffRoutes2.id$': { [Op.not]: null } },
                        { '$saleOffRoutes3.id$': { [Op.not]: null } },
                    ],
                },
                include: [
                    {
                        association: 'saleOffRoutes1',
                        required: false,
                        include: [
                            { association: 'saleOffOrder', where: whereOrder, required: false },
                            {
                                association: 'saleOffOrderItems',
                                required: false,
                                include: [
                                    { association: 'saleOffProduct' },
                                    { association: 'customer' },
                                ],
                            },
                        ],
                    },
                    {
                        association: 'saleOffRoutes2',
                        required: false,
                        include: [
                            { association: 'saleOffOrder', where: whereOrder, required: false },
                            {
                                association: 'saleOffOrderItems',
                                required: false,
                                include: [
                                    { association: 'saleOffProduct' },
                                    { association: 'customer' },
                                ],
                            },
                        ],
                    },
                    {
                        association: 'saleOffRoutes3',
                        required: false,
                        include: [
                            { association: 'saleOffOrder', where: whereOrder, required: false },
                            {
                                association: 'saleOffOrderItems',
                                required: false,
                                include: [
                                    { association: 'saleOffProduct' },
                                    { association: 'customer' },
                                ],
                            },
                        ],
                    },
                ],
                distinct: true,
                col: 'id',
            })

            let items = []
            if (total > 0) {
                items = await DeliveryStaff.findAll({
                    order: [...order],
                    limit: limit,
                    offset: offset,
                    where: {
                        ...where,
                    },
                    include: [
                        {
                            association: 'saleOffRoutes1',
                            attributes: {
                                include: [
                                    [
                                        sequelize.literal(`(
                                            (CASE WHEN "saleOffRoutes1"."DeliveryStaffId1" IS NOT NULL THEN 1 ELSE 0 END) +
                                            (CASE WHEN "saleOffRoutes1"."DeliveryStaffId2" IS NOT NULL THEN 1 ELSE 0 END) +
                                            (CASE WHEN "saleOffRoutes1"."DeliveryStaffId3" IS NOT NULL THEN 1 ELSE 0 END)
                                        )`),
                                        'workLoad',
                                    ],
                                ],
                            },
                            required: false,
                            where: {
                                id: { [Op.not]: null },
                            },
                            include: [
                                { association: 'saleOffOrder', where: whereOrder, required: false },
                                {
                                    association: 'saleOffOrderItems',
                                    required: false,
                                    include: [
                                        { association: 'saleOffProduct' },
                                        { association: 'customer' },
                                    ],
                                },
                            ],
                        },
                        {
                            association: 'saleOffRoutes2',
                            attributes: {
                                include: [
                                    [
                                        sequelize.literal(`(
                                            (CASE WHEN "saleOffRoutes2"."DeliveryStaffId1" IS NOT NULL THEN 1 ELSE 0 END) +
                                            (CASE WHEN "saleOffRoutes2"."DeliveryStaffId2" IS NOT NULL THEN 1 ELSE 0 END) +
                                            (CASE WHEN "saleOffRoutes2"."DeliveryStaffId3" IS NOT NULL THEN 1 ELSE 0 END)
                                        )`),
                                        'workLoad',
                                    ],
                                ],
                            },
                            required: false,
                            where: {
                                id: { [Op.not]: null },
                            },
                            include: [
                                { association: 'saleOffOrder', where: whereOrder, required: false },
                                {
                                    association: 'saleOffOrderItems',
                                    required: false,
                                    include: [
                                        { association: 'saleOffProduct' },
                                        { association: 'customer' },
                                    ],
                                },
                            ],
                        },
                        {
                            association: 'saleOffRoutes3',
                            attributes: {
                                include: [
                                    [
                                        sequelize.literal(`(
                                            (CASE WHEN "saleOffRoutes3"."DeliveryStaffId1" IS NOT NULL THEN 1 ELSE 0 END) +
                                            (CASE WHEN "saleOffRoutes3"."DeliveryStaffId2" IS NOT NULL THEN 1 ELSE 0 END) +
                                            (CASE WHEN "saleOffRoutes3"."DeliveryStaffId3" IS NOT NULL THEN 1 ELSE 0 END)
                                        )`),
                                        'workLoad',
                                    ],
                                ],
                            },
                            required: false,
                            where: {
                                id: { [Op.not]: null },
                            },
                            include: [
                                { association: 'saleOffOrder', where: whereOrder, required: false },
                                {
                                    association: 'saleOffOrderItems',
                                    required: false,
                                    include: [
                                        { association: 'saleOffProduct' },
                                        { association: 'customer' },
                                    ],
                                },
                            ],
                        },
                    ],
                    raw: true,
                    nest: true,
                })
            }

            let page = parseInt(req.query.page ?? 1)

            return res.json(success({
                items: helper.transformDeliveryStaff(items),
                // items: items,
                itemsOrigin: items,
                total: total,
                page: page,
                page_count: Math.ceil(total / limit),
                firstItem: items.length ? (((page - 1) * limit) + 1) : 0,
                lastItem: items.length ? ((page * limit) <= total ? (page * limit) : total) : 0,
            }))
        } catch (err) {
            console.log(err)
            return res.json(error(err.message, 501))
        }
    },
}

export default SaleOffReportController
