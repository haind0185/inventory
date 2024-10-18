import sequelize from '../models/index';
import Product from '../models/Product';
import WarehouseEntry from '../models/WarehouseEntry';
import Entry from '../models/Entry';
import Inventory from '../models/Inventory';
import { error, success } from './common/http';

import { t } from '../../src/renderer/i18n'
const { Op } = require("sequelize");
const Joi = require('joi');

const InventoryController = {

    index: async (req, res) => {
        try {
            console.log(req.query)

            /**
             * set condition
             */
            const where = {}

            /**
             * order
             */
            const order_list = ['ProductCode', 'ExpiryDate', 'LargeUnitQty', 'SmallUnitQty', 'ExpireCount', 'ExpirePercent']
            let order = []
            let sort_by = req.query.sort_by == 'desc' ? 'desc' : 'asc'
            if(order_list.includes(req.query.sort)) {
                order = [[req.query.sort, sort_by]]
            }

            const product_order_list = ['ProductName']
            if(product_order_list.includes(req.query.sort)) {
                order = [['product', req.query.sort, sort_by]]
            }


            /**
             * page and limit a page
             */
            const limit = 50
            let offset = req.query.page ? ((req.query.page - 1) * limit) : 0
            
            /**
             * call select action
             */
            const total = await Inventory.count({
                where: where,
            })

            let entries = []
            if(total > 0) {
                entries = await Inventory.findAll({
                    attributes: {
                        include: [
                            [sequelize.literal("(julianday(`Inventory`.`ExpiryDate`) - julianday(date('now')))"), 'ExpireCount'],
                            [sequelize.literal("((julianday(`Inventory`.`ExpiryDate`) - julianday(date('now'))) / `product`.`Expire` * 100)"), 'ExpirePercent'],
                        ]
                    },
                    where: where,
                    order: order,
                    limit: limit,
                    offset: offset,
                    include: [
                        { association: 'product' }
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
};

export default InventoryController;
