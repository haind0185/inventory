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
            let whereRoute = {}

            if (req.query.Ids) {
                whereRoute = {
                    ...whereRoute,
                    [Op.or]: {
                        DeliveryStaffId1: { [Op.in]: req.query.Ids },
                        DeliveryStaffId2: { [Op.in]: req.query.Ids },
                        DeliveryStaffId3: { [Op.in]: req.query.Ids },
                    },
                }
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
            if (Object.keys(whereOrder).length !== 0) {
                const orders = await SaleOffOrder.findAll({
                    where: whereOrder,
                    attributes: ['OrderCode'],
                })
                const orderCodes = orders.map((o) => o.OrderCode)
    
                whereRoute.OrderCode = {
                    [Op.in]: orderCodes
                }
            }

            const routes = await SaleOffRoute.findAll({
                where: whereRoute,
                attributes: ['DeliveryStaffId1', 'DeliveryStaffId2', 'DeliveryStaffId3'],
            })

            const staffSet = new Set()
            if(req.query.Ids && req.query.Ids.length > 0) {
                routes.forEach((r) => {
                    if (req.query.Ids.includes(r.DeliveryStaffId1)) staffSet.add(r.DeliveryStaffId1)
                    if (req.query.Ids.includes(r.DeliveryStaffId2)) staffSet.add(r.DeliveryStaffId2)
                    if (req.query.Ids.includes(r.DeliveryStaffId3)) staffSet.add(r.DeliveryStaffId3)
                })
            } else {
                routes.forEach((r) => {
                    if (r.DeliveryStaffId1) staffSet.add(r.DeliveryStaffId1)
                    if (r.DeliveryStaffId2) staffSet.add(r.DeliveryStaffId2)
                    if (r.DeliveryStaffId3) staffSet.add(r.DeliveryStaffId3)
                })
            }

            const total = staffSet.size

            // const total = await DeliveryStaff.count({
            //     where: {
            //         ...where,
            //         [Op.or]: [
            //             { '$saleOffRoutes1.id$': { [Op.not]: null } },
            //             { '$saleOffRoutes2.id$': { [Op.not]: null } },
            //             { '$saleOffRoutes3.id$': { [Op.not]: null } },
            //         ],
            //     },
            //     include: [
            //         {
            //             association: 'saleOffRoutes1',
            //             required: false,
            //             include: [
            //                 { association: 'saleOffOrder', where: whereOrder, required: false },
            //                 {
            //                     association: 'saleOffOrderItems',
            //                     required: false,
            //                     include: [
            //                         { association: 'saleOffProduct' },
            //                         { association: 'customer' },
            //                     ],
            //                 },
            //             ],
            //         },
            //         {
            //             association: 'saleOffRoutes2',
            //             required: false,
            //             include: [
            //                 { association: 'saleOffOrder', where: whereOrder, required: false },
            //                 {
            //                     association: 'saleOffOrderItems',
            //                     required: false,
            //                     include: [
            //                         { association: 'saleOffProduct' },
            //                         { association: 'customer' },
            //                     ],
            //                 },
            //             ],
            //         },
            //         {
            //             association: 'saleOffRoutes3',
            //             required: false,
            //             include: [
            //                 { association: 'saleOffOrder', where: whereOrder, required: false },
            //                 {
            //                     association: 'saleOffOrderItems',
            //                     required: false,
            //                     include: [
            //                         { association: 'saleOffProduct' },
            //                         { association: 'customer' },
            //                     ],
            //                 },
            //             ],
            //         },
            //     ],
            //     distinct: true,
            //     col: 'id',
            // })

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

    exportDeliveryStaff: async (req, res) => {
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

            /**
             * Export excel handle
             */
            const data = helper.transformDeliveryStaff(items)
            let sheetData = [['NV giao nhận', 'Tháng', 'Đơn', 'Sản phẩm', 'S.L.1', 'S.L.2', 'Đơn giá', 'S.L', 'Thành tiền', 'Ghi chú']]
            let merges = []
            let currentRow = 1
            for (const staff of data) {
                const startRowStaff = currentRow;

                staff.Months.forEach((month, mIdx) => {
                    const startRowMonth = currentRow;

                    month.Orders.forEach((order, oIdx) => {
                        const startRowOrder = currentRow;

                        order.Products.forEach((product, pIdx) => {
                            sheetData.push([
                                currentRow === startRowStaff ? `${staff.DeliveryStaffName}\n${helper.format_number(staff.StaffQty)}\n${helper.format_number(staff.SupportStaffQty)}` : null,
                                currentRow === startRowMonth ? `${month.Name}\n${helper.format_number(month.MonthQty)}` : null,
                                currentRow === startRowOrder ? `${order.OrderCode}\n${order.OrderDate}\n${helper.format_number(order.orderQty)}`+(order.Workload > 1 ? ` / ${order.Workload}` : '') : null,
                                product.ProductNameLabel,
                                product.LargeUnitQty,
                                product.SmallUnitQty,
                                product.Price,
                                product.Qty,
                                product.PriceQty,
                                product.OrderItemNote,
                            ])
                            currentRow++;
                        })

                        if (order.Products.length > 1) {
                            merges.push({
                                s: { c: 2, r: startRowOrder },
                                e: { c: 2, r: currentRow - 1 }
                            });
                        }
                    })

                    if (month.Orders.reduce((acc, o) => acc + o.Products.length, 0) > 1) {
                        merges.push({
                            s: { c: 1, r: startRowMonth },
                            e: { c: 1, r: currentRow - 1 }
                        });
                    }
                })

                if (staff.Months.reduce((acc, m) => acc + m.Orders.reduce((a, o) => a + o.Products.length, 0), 0) > 1) {
                    merges.push({
                        s: { c: 0, r: startRowStaff },
                        e: { c: 0, r: currentRow - 1 }
                    });
                }
            }

            const worksheet = xlsx.utils.aoa_to_sheet(sheetData);
            worksheet['!merges'] = merges;
            worksheet['!cols'] = [
                { wch: 13 },
                { wch: 12 },
                { wch: 13 },
                { wch: 40 },
                { wch: 8  },
                { wch: 8  },
                { wch: 10 },
                { wch: 8  },
                { wch: 13 },
                { wch: 40 },
            ];

            // format data in excel
            for (let rowIndex = 0; rowIndex < sheetData.length; rowIndex++) {
                for(let colIndex = 0; colIndex < 10; colIndex++) {
                    const cellAddress = xlsx.utils.encode_cell({ c: colIndex, r: rowIndex });
                    if(worksheet[cellAddress]) {
                        if(rowIndex == 0) {
                            worksheet[cellAddress].s = {
                                ...worksheet[cellAddress].s,
                                alignment: {
                                    vertical: "center",
                                    horizontal: "center",
                                },
                            }
                        } else {
                            if ([0, 1, 2].includes(colIndex)) {
                                worksheet[cellAddress].s = {
                                    ...worksheet[cellAddress].s,
                                    alignment: {
                                        vertical: "center",
                                        horizontal: "center",
                                        wrapText: true,
                                    },
                                }
                            }

                            if ([4, 5, 6, 7, 8].includes(colIndex)) {
                                worksheet[cellAddress].z = '#,##0';
                            }

                            if ([3, 4, 5, 6, 7, 8, 9].includes(colIndex)) {
                                worksheet[cellAddress].s = {
                                    ...worksheet[cellAddress].s,
                                    alignment: {
                                        vertical: "center",
                                    },
                                }
                            }
                        }
                    }
                }
            }
            console.log(worksheet)

            const workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
            let filename = moment().format('YYYYMMDD_HHmmss') + '_bao_cao_giao_nhan.xlsx';
            const r = await Service.downloadStyle(workbook, filename);
            console.log(r)
            if (r) {
                return res.json(
                    success({
                        path: r,
                    })
                );
            } else {
                return res.json(
                    success({})
                );
            }
        } catch (err) {
            console.log(err)
            return res.json(error(err.message, 501))
        }
    },
}

export default SaleOffReportController
