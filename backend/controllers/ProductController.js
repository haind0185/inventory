import Product from '../models/Products';
import { error, success } from './http';
const { Op } = require("sequelize");
const Joi = require('joi');

const ProductController = {

    index: async (req, res) => {
        try {
            console.log(req.query)

            // where
            const where = {}

            if(req.query.code) {
                where.code = { [Op.like]: `%${req.query.code}%` }
            }

            if(req.query.name) {
                where.name = { [Op.like]: `%${req.query.name}%` }
            }

            // order
            const order_list = ['code', 'name']
            let order = []
            if(order_list.includes(req.query.sort)) {
                let sort_by = req.query.sort_by == 'desc' ? 'desc' : 'asc'
                order = [[req.query.sort, sort_by]]
            }
            
            const products = await Product.findAll({
                where: where,
                order: order,
            });
            return res.json(success(products));
        } catch (err) {
            return res.json(error(err.message, 501));
        }
    },

    store: async (req, res) => {
        try {
            console.log(req.body)

            const { code, name, unit1, unit2, specific } = req.body;

            const specificRule = Joi.number()
            if(unit2) {
                specificRule.allow(null)
            }
            specificRule.min(1)

            const schema = Joi.object({
                code    : Joi.string().required().min(1).max(200),
                name    : Joi.string().required().min(1).max(200),
                unit1   : Joi.string().required().max(50),
                unit2   : Joi.string().allow(null, ''),
                specific: specificRule,
            }).unknown();

            const validation = schema.validate(req.body);

            if (validation.error) {
                return res.json(error(validation.error.details[0].message))
            }

            const product = await Product.create({
                code    : code,
                name    : name,
                unit1   : unit1,
                unit2   : unit2,
                specific: specific,
            });
            
            return res.json(success(product));
        } catch (err) {
            return res.json(error(err.message, 501));
        }
    }
};

export default ProductController;
