import moment from 'moment'
import sequelize from '../models/index'
import { error, success } from './common/http'
import { t } from '../../src/renderer/i18n'
import { Service } from './common/download'
import { helper } from '../../src/renderer/helper'
import SaleOffOrderItem from '../models/SaleOffOrderItem'
import Customer from '../models/Customer'
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
                                include: [
                                    { association: 'saleOffOrder', where: whereOrder },
                                ]
                            },
                        ]
                    }
                ],
                distinct: true,
                col: 'id' // hoặc 'id' nếu bạn không alias
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
                                        { association: 'saleOffOrder', where: whereOrder },
                                        { association: 'deliveryStaff1' },
                                        { association: 'deliveryStaff2' },
                                        { association: 'deliveryStaff3' },
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
                items: helper.transformData(items),
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
