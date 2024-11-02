import sequelize from '../models/index';
import Product from '../models/Product';
import Inventory from '../models/Inventory';
import { error, success } from './common/http';
import { t } from '../../src/renderer/i18n';
import { Service } from './common/download';
import moment, { RFC_2822 } from 'moment';
import { helper } from '../../src/renderer/helper';
const { Op } = require('sequelize');
const Joi = require('joi');
const xlsx = require('xlsx');

const InventoryController = {
    index: async (req, res) => {
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
                'ExpiryDate',
                'LargeUnitQty',
                'SmallUnitQty',
                'ExpireCount',
                'ExpirePercent',
            ];
            let order = [];
            let sort_by = req.query.sort_by == 'desc' ? 'desc' : 'asc';
            if (order_list.includes(req.query.sort)) {
                order = [[req.query.sort, sort_by]];
            }

            const product_order_list = ['ProductName'];
            if (product_order_list.includes(req.query.sort)) {
                order = [['product', req.query.sort, sort_by]];
            }

            /**
             * page and limit a page
             */
            const limit = 50;
            let offset = req.query.page ? (req.query.page - 1) * limit : 0;

            /**
             * call select action
             */
            const total = await Inventory.count({
                where: where,
                include: [{ association: 'product', where: productWhere }],
            });

            let inventories = [];
            if (total > 0) {
                inventories = await Inventory.findAll({
                    attributes: {
                        include: [
                            [
                                sequelize.literal(
                                    "(julianday(`Inventory`.`ExpiryDate`) - julianday(date('now')))"
                                ),
                                'ExpireCount',
                            ],
                            [
                                sequelize.literal(
                                    "((julianday(`Inventory`.`ExpiryDate`) - julianday(date('now'))) / `product`.`Expire` * 100)"
                                ),
                                'ExpirePercent',
                            ],
                        ],
                    },
                    where: where,
                    order: order,
                    limit: limit,
                    offset: offset,
                    include: [{ association: 'product', where: productWhere }],
                });
            }

            let page = parseInt(req.query.page ?? 0);

            return res.json(
                success({
                    items: inventories,
                    total: total,
                    page: page,
                    page_count: Math.ceil(total / limit),
                    firstItem: inventories.length ? (page - 1) * limit + 1 : 0,
                    lastItem: inventories.length
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

    list: async (req, res) => {
        try {
            console.log(req.query);

            /**
             * call select action
             */
            let inventories = await Inventory.findAll({
                attributes: [
                    'ProductCode',
                    [
                        sequelize.fn('SUM', sequelize.col('LargeUnitQty')),
                        'LargeUnitQty',
                    ],
                    [
                        sequelize.fn('SUM', sequelize.col('SmallUnitQty')),
                        'SmallUnitQty',
                    ],
                    'ProductNameLabelGroup',
                ],
                group: ['Inventory.ProductCode'],
                include: { association: 'product' },
                order: [
                    ['LargeUnitQty', 'DESC'],
                    ['SmallUnitQty', 'DESC'],
                ],
            });

            return res.json(
                success({
                    items: inventories,
                })
            );
        } catch (err) {
            return res.json(error(err.message, 501));
        }
    },

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
                'ProductName',
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
            const groupedRecords = await Inventory.count({
                attributes: ['Inventory.ProductCode'],
                include: [{ association: 'product', where: productWhere }],
                group: ['Inventory.ProductCode'],

                // paginate
                where: where,
            });

            let total = groupedRecords.length;
            let inventories = [];
            if (total > 0) {
                inventories = await Inventory.findAll({
                    attributes: [
                        'ProductCode',
                        [
                            sequelize.literal(
                                '(CASE WHEN `product`.`SmallUnit` IS NOT NULL ' +
                                    'THEN (SUM(`Inventory`.`LargeUnitQty`) + CAST(SUM(`Inventory`.`SmallUnitQty`) / `product`.`ConversionRate` AS INTEGER)) ' +
                                    'ELSE SUM(`Inventory`.`LargeUnitQty`) ' +
                                    'END)'
                            ),
                            'LargeUnitQty',
                        ],

                        [
                            sequelize.literal(
                                '(CASE WHEN `product`.`SmallUnit` IS NOT NULL ' +
                                    'THEN (SUM(`Inventory`.`SmallUnitQty`) % `product`.`ConversionRate`) ' +
                                    'ELSE SUM(`Inventory`.`SmallUnitQty`) ' +
                                    'END)'
                            ),
                            'SmallUnitQty',
                        ],

                        [
                            sequelize.literal(
                                '(CASE WHEN `product`.`SmallUnit` IS NOT NULL THEN SUM(`Inventory`.`LargeUnitQty`) * `product`.`ConversionRate` + SUM(`Inventory`.`SmallUnitQty`) ELSE SUM(`Inventory`.`LargeUnitQty`) END)'
                            ),
                            'Qty',
                        ],

                        [sequelize.literal('product.Price'), 'Price'],

                        [
                            sequelize.literal(
                                '(CASE WHEN `product`.`SmallUnit` IS NOT NULL THEN (SUM(`Inventory`.`LargeUnitQty`) * `product`.`ConversionRate` + SUM(`Inventory`.`SmallUnitQty`)) * `product`.`Price` ELSE SUM(`Inventory`.`LargeUnitQty`) * `product`.`Price` END)'
                            ),
                            'QtyPrice',
                        ],

                        'ProductNameLabelGroup',
                    ],
                    include: [{ association: 'product', where: productWhere }],
                    group: ['Inventory.ProductCode'],

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
                    items: inventories,
                    total: total,
                    page: page,
                    page_count: Math.ceil(total / limit),
                    firstItem: inventories.length ? (page - 1) * limit + 1 : 0,
                    lastItem: inventories.length
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

            const inventoryPrice = await Inventory.findAll({
                attributes: [
                    'Inventory.ProductCode',
                    [
                        sequelize.literal(
                            '(CASE WHEN `product`.`SmallUnit` IS NOT NULL THEN (SUM(`Inventory`.`LargeUnitQty`) * `product`.`ConversionRate` + SUM(`Inventory`.`SmallUnitQty`)) * `product`.`Price` ELSE SUM(`Inventory`.`LargeUnitQty`) * `product`.`Price` END)'
                        ),
                        'QtyPrice',
                    ],
                ],
                include: [{ association: 'product' }],
                group: ['Inventory.ProductCode'],
                raw: true,
            });

            const totalPrice = inventoryPrice.reduce((accumulator, product) => {
                return accumulator + product.QtyPrice;
            }, 0);

            return res.json(
                success({
                    total: inventoryPrice.length,
                    totalPrice: totalPrice,
                })
            );
        } catch (err) {
            return res.json(error(err.message, 501));
        }
    },

    product: async (req, res) => {
        try {
            console.log(req.query);

            const { page, TypeDateFrom, TypeDateTo, ProductCode } = req.query;
            const limit = 50;
            let offset = ((page ?? 1) - 1) * limit;
            /**
             * set condition
             */
            if (!ProductCode) {
                throw new Error('Không tìm thấy mặt hàng.');
            }

            const product = await Product.findOne({
                where: {
                    ProductCode: ProductCode,
                },
            });

            if (!product) {
                throw new Error('Không tìm thấy mặt hàng.');
            }

            let isSmall = product.SmallUnit ? true : false;
            let ConversionRate = product.ConversionRate;

            let whereDate = '';
            if (TypeDateFrom && !TypeDateTo) {
                whereDate = `AND TypeDate >= '${TypeDateFrom}'`;
            }
            if (!TypeDateFrom && TypeDateTo) {
                whereDate = `AND TypeDate <= '${TypeDateTo}'`;
            }

            if (TypeDateFrom && TypeDateTo) {
                whereDate = `AND (TypeDate >= '${TypeDateFrom}' AND TypeDate <= '${TypeDateTo}')`;
            }

            let query = `SELECT
                    ProductCode,
                    EntryCode AS Code,
                    EntryDate AS TypeDate,
                    LargeUnitQty,
                    SmallUnitQty,
                    LargeUnitQty AS CalLargeUnitQty,
                    SmallUnitQty AS CalSmallUnitQty,
                    Price,
                    1 AS Type,
                    createdAt
                FROM
                    Entries 
                WHERE
                    ProductCode = '${ProductCode}'

                UNION

                SELECT
                    ProductCode,
                    ExitCode AS Code,
                    ExitDate AS TypeDate,
                    LargeUnitQty,
                    SmallUnitQty,
                    (0 - LargeUnitQty) AS CalLargeUnitQty,
                    (0 - SmallUnitQty) AS CalSmallUnitQty,
                    Price,
                    0 AS Type,
                    createdAt
                FROM
                    Exits 
                WHERE
                    ProductCode = '${ProductCode}'
                ORDER BY TypeDate ASC, createdAt ASC`;
            let view_table = `(
                ${query}
            )`;

            const [result] = await sequelize.query(
                `SELECT COUNT(*) AS total FROM ${view_table}`
            );

            let total = result[0].total;

            let Qty = isSmall
                ? `(LargeUnitQty * ${ConversionRate} + SmallUnitQty)`
                : `LargeUnitQty`;
            let QtyPrice = `(${Qty} * Price)`;

            let CalQty = isSmall
                ? `(CalLargeUnitQty * ${ConversionRate} + CalSmallUnitQty)`
                : `CalLargeUnitQty`;
            let CalQtyPrice = `(${CalQty} * Price)`;

            let SumQty = `(SUM(${CalQty}) OVER (ORDER BY TypeDate ASC, createdAt ASC))`;
            let SumQtyPrice = `(SUM(${CalQtyPrice}) OVER (ORDER BY TypeDate ASC, createdAt ASC))`;

            let stm = `(SELECT
                    ProductCode,
                    Code,
                    TypeDate,
                    Price,

                    LargeUnitQty,
                    SmallUnitQty,
                    ${Qty} AS Qty,
                    ${QtyPrice} AS QtyPrice,

                    CalLargeUnitQty,
                    CalSmallUnitQty,
                    ${CalQty} AS CalQty,
                    ${CalQtyPrice} AS CalQtyPrice,
                    
                    ${SumQty} AS SumQty,
                    ${SumQtyPrice} AS SumQtyPrice,

                    Type,
                    createdAt
                FROM
                ${view_table} AS view_table)`;

            const [results] = await sequelize.query(`
                SELECT * FROM ${stm}
                WHERE true ${whereDate}
                ORDER BY TypeDate ASC, createdAt ASC
                LIMIT ${limit}
                OFFSET ${offset}
            `);

            return res.json(
                success({
                    items: results,
                    total: total,
                    page: page,
                    page_count: Math.ceil(total / limit),
                    firstItem: results.length ? (page - 1) * limit + 1 : 0,
                    lastItem: results.length
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

    exportReport: async (req, res) => {
        try {
            console.log(`Request.query:`, req.query);

            const inventories = await Inventory.findAll({
                attributes: [
                    'ProductCode',
                    'ProductNameLabelGroup',

                    [
                        sequelize.literal(
                            '(CASE WHEN `product`.`SmallUnit` IS NOT NULL ' +
                                'THEN (SUM(`Inventory`.`LargeUnitQty`) + CAST(SUM(`Inventory`.`SmallUnitQty`) / `product`.`ConversionRate` AS INTEGER)) ' +
                                'ELSE SUM(`Inventory`.`LargeUnitQty`) ' +
                                'END)'
                        ),
                        'LargeUnitQty',
                    ],

                    [
                        sequelize.literal(
                            '(CASE WHEN `product`.`SmallUnit` IS NOT NULL ' +
                                'THEN (SUM(`Inventory`.`SmallUnitQty`) % `product`.`ConversionRate`) ' +
                                'ELSE SUM(`Inventory`.`SmallUnitQty`) ' +
                                'END)'
                        ),
                        'SmallUnitQty',
                    ],

                    [
                        sequelize.literal(
                            '(CASE WHEN `product`.`SmallUnit` IS NOT NULL ' +
                                'THEN SUM(`Inventory`.`LargeUnitQty`) * `product`.`ConversionRate` + SUM(`Inventory`.`SmallUnitQty`) ' +
                                'ELSE SUM(`Inventory`.`LargeUnitQty`) ' +
                                'END)'
                        ),
                        'Qty',
                    ],
                ],
                include: [{ association: 'product' }],
                group: ['Inventory.ProductCode'],
            });

            // format data
            const data = inventories.map((item) => {
                item = item.toJSON();

                return {
                    'Mã sản phẩm': item.ProductCode,
                    'Tên sản phẩm': `${item.product.ProductName}[x${item.product.ConversionRate}]`,
                    'Số lượng (đv1)': item.LargeUnitQty,
                    'Số lượng (đv2)': item.SmallUnitQty,
                    'Số lượng tổng': item.Qty,
                };
            });

            const workbook = xlsx.utils.book_new();
            const worksheet = xlsx.utils.json_to_sheet(data);

            // format data in excel
            Object.keys(data[0]).forEach((column, index) => {
                for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
                    const cellAddress = xlsx.utils.encode_cell({ c: index, r: rowIndex + 1 });
                    if(worksheet[cellAddress]) {
                        if (['Số lượng (đv1)', 'Số lượng (đv2)', 'Số lượng tổng'].includes(column)) {
                            worksheet[cellAddress].z = '#,##0';
                        }
                        // if (['Mã sản phẩm'].includes(column)) {
                        //     worksheet[cellAddress].s = {
                        //         alignment: { horizontal: 'right' } 
                        //     }
                        // }
                    }
                }
            });
            worksheet['!cols'] = [
                { width: 12 },
                { width: 62 },
                { width: 13 },
                { width: 13 },
                { width: 13 },
            ];

            // add worksheet to workbook
            xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

            // add workbook to file and download
            let filename = moment().format('YYYYMMDD_HHmmss') + '_kiem_kho.xlsx';
            const r = await Service.download(workbook, filename);

            if (r) {
                return res.json(
                    success({
                        path: r,
                    })
                );
            }
        } catch (err) {
            return res.json(error(err.message, 501));
        }
    },

    stocktaking: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            if (!req.file) {
                throw new Error("Không tìm thấy file");
            }
    
            const filePath = req.file.path;
            const workbook = xlsx.readFile(filePath);
    
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            let data = xlsx.utils.sheet_to_json(worksheet);

            data = data.map(item => {
                return {
                    ProductCode : item.ProductCode,
                    LargeUnitQty: item.LargeUnitQty,
                    SmallUnitQty: item.SmallUnitQty,
                }
            })

            const inventories = await Inventory.findAll({
                attributes: [
                    'ProductCode',
                    [
                        sequelize.literal(
                            '(CASE WHEN `product`.`SmallUnit` IS NOT NULL ' +
                                'THEN (SUM(`Inventory`.`LargeUnitQty`) + CAST(SUM(`Inventory`.`SmallUnitQty`) / `product`.`ConversionRate` AS INTEGER)) ' +
                                'ELSE SUM(`Inventory`.`LargeUnitQty`) ' +
                                'END)'
                        ),
                        'LargeUnitQty',
                    ],
                    [
                        sequelize.literal(
                            '(CASE WHEN `product`.`SmallUnit` IS NOT NULL ' +
                                'THEN (SUM(`Inventory`.`SmallUnitQty`) % `product`.`ConversionRate`) ' +
                                'ELSE SUM(`Inventory`.`SmallUnitQty`) ' +
                                'END)'
                        ),
                        'SmallUnitQty',
                    ],
                    [
                        sequelize.literal(
                            '(CASE WHEN `product`.`SmallUnit` IS NOT NULL ' +
                                'THEN SUM(`Inventory`.`LargeUnitQty`) * `product`.`ConversionRate` + SUM(`Inventory`.`SmallUnitQty`) ' +
                                'ELSE SUM(`Inventory`.`LargeUnitQty`) ' +
                                'END)'
                        ),
                        'Qty',
                    ],
                ],
                include: [{ association: 'product' }],
                group: ['Inventory.ProductCode'],
            }, {transaction: transaction});

            const results = inventories.map((item) => {
                item = item.toJSON();

                let resItem = {
                    ProductCode: item.ProductCode,
                    ProductName: item.product.ProductName,
                    LargeUnitQty: item.LargeUnitQty,
                    SmallUnitQty: item.SmallUnitQty,
                    Qty: item.Qty,

                    CheckLargeUnitQty: 0,
                    CheckSmallUnitQty: 0,
                    CheckQty: 0,

                    DiscLargeUnitQty: item.LargeUnitQty,
                    DiscSmallUnitQty: item.SmallUnitQty,
                    DiscQty: item.Qty,

                    Class: 'bg-3notfound'
                }

                let checkItem = data.find(i => i.ProductCode == item.ProductCode)
                if(checkItem) {
                    resItem.CheckLargeUnitQty = parseInt(checkItem.LargeUnitQty, 10);
                    resItem.CheckSmallUnitQty = parseInt(checkItem.SmallUnitQty, 10);
                    resItem.CheckQty = helper.unitQtyTransfer(resItem.CheckLargeUnitQty, resItem.CheckSmallUnitQty, item.product)

                    resItem.DiscLargeUnitQty = resItem.LargeUnitQty - resItem.CheckLargeUnitQty
                    resItem.DiscSmallUnitQty =  resItem.SmallUnitQty - resItem.CheckSmallUnitQty
                    resItem.DiscQty = resItem.Qty - resItem.CheckQty
                    resItem.Class = resItem.DiscQty < 0 ? 'bg-1warning' : (resItem.DiscQty > 0 ? 'bg-2omg' : 'bg-4nothing')
                }

                return resItem;
            });
            results.sort((a, b) => Math.abs(b.DiscQty) - Math.abs(a.DiscQty));
            results.sort((a, b) => {
                if (a.Class === b.Class) {
                    return Math.abs(b.DiscQty) - Math.abs(a.DiscQty);
                }
                return a.Class.localeCompare(b.Class);
            });

            await transaction.commit();
            return res.json(success(results));
        } catch (err) {
            await transaction.rollback();
            return res.json(error(err.message, 501));
        }
    },

    exportStocktaking: async (req, res) => {
        try {
            console.log(`Request.body:`, req.body);

            const { data } = req.body;

            // format data
            let dataFormat = data.map((item) => {
                return [
                    item.ProductCode,
                    item.ProductName,
                    item.LargeUnitQty,
                    item.SmallUnitQty,
                    item.Qty,

                    item.CheckLargeUnitQty,
                    item.CheckSmallUnitQty,
                    item.CheckQty,

                    item.DiscLargeUnitQty,
                    item.DiscSmallUnitQty,
                    item.DiscQty,
                ]
            });

            const sheetData = [
                [
                    'Mã mặt hàng',
                    'Tên mặt hàng',
                    'Trong kho',
                    null,
                    null,
                    'Trong file',
                    null,
                    null,
                    'Lệch',
                    null,
                    null,
                ],
                [
                    null,
                    null,
                    'S.L(đv1)',
                    'S.L(đv2)',
                    'Tổng S.L',
                    'S.L(đv1)',
                    'S.L(đv2)',
                    'Tổng S.L',
                    'S.L(đv1)',
                    'S.L(đv2)',
                    'Tổng S.L',
                ],
                ...dataFormat
            ]

            const workbook = xlsx.utils.book_new();
            const worksheet = xlsx.utils.aoa_to_sheet(sheetData);

            worksheet['!merges'] = [
                { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } }, //Mã mặt hàng
                { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } }, //Tên mặt hàng

                { s: { r: 0, c: 2 }, e: { r: 0, c: 4 } }, //Trong kho
                { s: { r: 0, c: 5 }, e: { r: 0, c: 7 } }, //Trong file
                { s: { r: 0, c: 8 }, e: { r: 0, c: 10 } }, //Lệch
            ];
            

            // format data in excel
            for (let rowIndex = 0; rowIndex < sheetData.length; rowIndex++) {
                if(rowIndex == 0 || rowIndex == 1) {
                    continue;
                }
                for(let colIndex = 0; colIndex < 11; colIndex++) {
                    const cellAddress = xlsx.utils.encode_cell({ c: colIndex, r: rowIndex + 1 });
                    if(worksheet[cellAddress]) {
                        if ([2, 3, 4, 5, 6, 7, 8, 9, 10].includes(colIndex)) {
                            worksheet[cellAddress].z = '#,##0';
                        }

                        // worksheet[cellAddress].s = {
                        //     fill: {
                        //         fgColor: { rgb: "D3D3D3" }
                        //     }
                        // };
                    }
                }
            }
            worksheet['!cols'] = [
                { width: 12 },
                { width: 62 },
                { width: 8 },
                { width: 8 },
                { width: 8 },
                { width: 8 },
                { width: 8 },
                { width: 8 },
                { width: 8 },
                { width: 8 },
                { width: 8 },
                
            ];

            // add worksheet to workbook
            xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

            // add workbook to file and download
            let filename = moment().format('YYYYMMDD_HHmmss') + '_kiem_kho_chenh_lech.xlsx';
            const r = await Service.download(workbook, filename);

            if (r) {
                return res.json(
                    success({
                        path: r,
                    })
                );
            }
        } catch (err) {
            return res.json(error(err.message, 501));
        }
    },
};

export default InventoryController;
