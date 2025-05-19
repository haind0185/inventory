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
};

export default SaleOffStockController;
