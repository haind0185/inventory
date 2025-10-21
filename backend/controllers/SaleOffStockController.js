import sequelize from '../models/index';
import SaleOffStock from '../models/SaleOffStock';
import { error, success } from './common/http';
import { t } from '../../src/renderer/i18n';
import { Service } from './common/download';
import moment from 'moment';
import { helper } from '../../src/renderer/helper';
const { Op } = require('sequelize');
const Joi = require('joi');
const xlsx = require('xlsx');

const SaleOffStockController = {
    total: async (req, res) => {
        try {
            console.log(req.query);

            /**
             * set condition
             */
            const where = {};
            const productWhere = {};
            if (req.query.ProductCode) {
                where.ProductCode = { [Op.like]: `%${req.query.ProductCode}%` };
            }
            if (req.query.ProductName) {
                productWhere.ProductName = {
                    [Op.like]: `%${req.query.ProductName}%`,
                };
            }

            /**
             * order
             */
            const order_list = [
                'ProductCode',
                'LargeUnitQty',
                'SmallUnitQty',
                'Qty',
                'Price',
                'QtyPrice',
            ];
            let order = [];
            let sort_by = req.query.sort_by == 'desc' ? 'desc' : 'asc';
            if (order_list.includes(req.query.sort)) {
                order = [[req.query.sort, sort_by]];
            }

            /**
             * page and limit a page
             */
            const limit = 100;
            let offset = req.query.page ? (req.query.page - 1) * limit : 0;

            /**
             * call select action
             */
            const groupedRecords = await SaleOffStock.count({
                attributes: ['SaleOffStock.ProductCode'],
                include: [{ association: 'saleOffProduct', where: productWhere }],
                group: ['SaleOffStock.ProductCode'],

                // paginate
                where: where,
            });

            let total = groupedRecords.length;
            let stocks = [];
            if (total > 0) {
                stocks = await SaleOffStock.findAll({
                    attributes: [
                        'ProductCode',
                        'LargeUnitQty',
                        'SmallUnitQty',

                        [
                            sequelize.literal(
                                '(CASE WHEN `saleOffProduct`.`SmallUnit` IS NOT NULL THEN SUM(`SaleOffStock`.`LargeUnitQty`) * `saleOffProduct`.`ConversionRate` + SUM(`SaleOffStock`.`SmallUnitQty`) ELSE SUM(`SaleOffStock`.`LargeUnitQty`) END)'
                            ),
                            'Qty',
                        ],

                        [sequelize.literal('saleOffProduct.Price'), 'Price'],

                        [
                            sequelize.literal(
                                '(CASE WHEN `saleOffProduct`.`SmallUnit` IS NOT NULL THEN (SUM(`SaleOffStock`.`LargeUnitQty`) * `saleOffProduct`.`ConversionRate` + SUM(`SaleOffStock`.`SmallUnitQty`)) * `saleOffProduct`.`Price` ELSE SUM(`SaleOffStock`.`LargeUnitQty`) * `saleOffProduct`.`Price` END)'
                            ),
                            'QtyPrice',
                        ],

                        'ProductName',
                    ],
                    include: [{ association: 'saleOffProduct', where: productWhere }],
                    group: ['SaleOffStock.ProductCode'],

                    // paginate
                    where: where,
                    order: order,
                    limit: limit,
                    offset: offset,
                });
            }

            let page = parseInt(req.query.page ?? 0);

            return res.json(
                success({
                    items: stocks,
                    total: total,
                    page: page,
                    page_count: Math.ceil(total / limit),
                    firstItem: stocks.length ? (page - 1) * limit + 1 : 0,
                    lastItem: stocks.length
                        ? page * limit <= total
                            ? page * limit
                            : total
                        : 0,
                })
            );
        } catch (err) {
            return res.json(error(err.message, 501));
        }
    },

    totalPrice: async (req, res) => {
        try {
            console.log(req.query);

            const stockPrice = await SaleOffStock.findAll({
                attributes: [
                    'SaleOffStock.ProductCode',
                    [
                        sequelize.literal(
                            '(CASE WHEN `saleOffProduct`.`SmallUnit` IS NOT NULL THEN (SUM(`SaleOffStock`.`LargeUnitQty`) * `saleOffProduct`.`ConversionRate` + SUM(`SaleOffStock`.`SmallUnitQty`)) * `saleOffProduct`.`Price` ELSE SUM(`SaleOffStock`.`LargeUnitQty`) * `saleOffProduct`.`Price` END)'
                        ),
                        'QtyPrice',
                    ],
                ],
                include: [{ association: 'saleOffProduct' }],
                group: ['SaleOffStock.ProductCode'],
                raw: true,
            });

            const totalPrice = stockPrice.reduce((accumulator, product) => {
                return accumulator + product.QtyPrice;
            }, 0);

            return res.json(
                success({
                    total: stockPrice.length,
                    totalPrice: totalPrice,
                })
            );
        } catch (err) {
            return res.json(error(err.message, 501));
        }
    },

    exportTotal: async (req, res) => {
        try {
            console.log(req.query);

            /**
             * set condition
             */
            const where = {};
            const productWhere = {};
            if (req.query.ProductCode) {
                where.ProductCode = { [Op.like]: `%${req.query.ProductCode}%` };
            }
            if (req.query.ProductName) {
                productWhere.ProductName = {
                    [Op.like]: `%${req.query.ProductName}%`,
                };
            }

            /**
             * order
             */
            const order_list = [
                'ProductCode',
                'LargeUnitQty',
                'SmallUnitQty',
                'Qty',
                'Price',
                'QtyPrice',
            ];
            let order = [];
            let sort_by = req.query.sort_by == 'desc' ? 'desc' : 'asc';
            if (order_list.includes(req.query.sort)) {
                order = [[req.query.sort, sort_by]];
            }

            /**
             * page and limit a page
             */
            const limit = 100;
            let offset = req.query.page ? (req.query.page - 1) * limit : 0;

            /**
             * call select action
             */
            const groupedRecords = await SaleOffStock.count({
                attributes: ['SaleOffStock.ProductCode'],
                include: [{ association: 'saleOffProduct', where: productWhere }],
                group: ['SaleOffStock.ProductCode'],

                // paginate
                where: where,
            });

            let total = groupedRecords.length;
            let stocks = [];
            if (total > 0) {
                stocks = await SaleOffStock.findAll({
                    attributes: [
                        'ProductCode',
                        'LargeUnitQty',
                        'SmallUnitQty',

                        [
                            sequelize.literal(
                                '(CASE WHEN `saleOffProduct`.`SmallUnit` IS NOT NULL THEN SUM(`SaleOffStock`.`LargeUnitQty`) * `saleOffProduct`.`ConversionRate` + SUM(`SaleOffStock`.`SmallUnitQty`) ELSE SUM(`SaleOffStock`.`LargeUnitQty`) END)'
                            ),
                            'Qty',
                        ],

                        [sequelize.literal('saleOffProduct.Price'), 'Price'],

                        [
                            sequelize.literal(
                                '(CASE WHEN `saleOffProduct`.`SmallUnit` IS NOT NULL THEN (SUM(`SaleOffStock`.`LargeUnitQty`) * `saleOffProduct`.`ConversionRate` + SUM(`SaleOffStock`.`SmallUnitQty`)) * `saleOffProduct`.`Price` ELSE SUM(`SaleOffStock`.`LargeUnitQty`) * `saleOffProduct`.`Price` END)'
                            ),
                            'QtyPrice',
                        ],

                        'ProductName',
                    ],
                    include: [{ association: 'saleOffProduct', where: productWhere }],
                    group: ['SaleOffStock.ProductCode'],

                    // paginate
                    where: where,
                    order: order,
                    limit: limit,
                    offset: offset,
                });
            }

            /**
             * Export excel handle
             */
            let sheetData = [['Mã sản phẩm', 'Tên sản phẩm', 'S.L.1', 'S.L.2', 'S.L', 'Đơn giá', 'Tổng tiền']]
            const plainResults = stocks.map(r => r.get({ plain: true }));
            for (const stock of plainResults) {
                sheetData.push([
                    stock.ProductCode,
                    stock.saleOffProduct.ProductName,
                    stock.LargeUnitQty,
                    stock.SmallUnitQty,
                    stock.Qty,
                    stock.Price,
                    stock.QtyPrice,
                ])
            }
            const worksheet = xlsx.utils.aoa_to_sheet(sheetData);
            worksheet['!cols'] = [
                { wch: 13 },
                { wch: 40 },
                { wch: 8  },
                { wch: 8  },
                { wch: 8  },
                { wch: 13 },
                { wch: 13 },
            ];

            // format data in excel
            for (let rowIndex = 0; rowIndex < sheetData.length; rowIndex++) {
                for(let colIndex = 0; colIndex < 7; colIndex++) {
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
                            if ([0].includes(colIndex)) {
                                worksheet[cellAddress].s = {
                                    ...worksheet[cellAddress].s,
                                    alignment: {
                                        vertical: "center",
                                        horizontal: "center",
                                        wrapText: true,
                                    },
                                }
                            }

                            if ([2, 3, 4, 5, 6].includes(colIndex)) {
                                worksheet[cellAddress].z = '#,##0';
                            }
                        }
                    }
                }
            }

            const workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
            let filename = moment().format('YYYYMMDD_HHmmss') + '_bao_cao_kho.xlsx';
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
            return res.json(error(err.message, 501));
        }
    },
};

export default SaleOffStockController;
