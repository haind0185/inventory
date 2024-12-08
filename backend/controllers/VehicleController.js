import Agent from '../models/Agent';
import { error, success } from './common/http';
import { t } from '../../src/renderer/i18n'
import { helper } from '../../src/renderer/helper'
import sequelize from '../models/index';
const xlsx = require('xlsx');
const path = require('path');
const { Op } = require("sequelize");
const Joi = require('joi');

const VehicleController = {

    index: async (req, res) => {
        try {
            console.log(req.query)

            /**
             * set condition
             */
            const where = {}

            if (req.query.AgentCode) {
                where.AgentCode = { [Op.like]: `%${req.query.AgentCode}%` }
            }

            if (req.query.AgentName) {
                where.AgentName = { [Op.like]: `%${req.query.AgentName}%` }
            }
            
            if (req.query.AgentAddress) {
                where.AgentAddress = { [Op.like]: `%${req.query.AgentAddress}%` }
            }

            /**
             * order
             */
            const order_list = ['AgentCode', 'AgentName', 'AgentAddress']
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
            const total = await Agent.count({
                where: where,
            })

            let agents = []
            if (total > 0) {
                agents = await Agent.findAll({
                    where: where,
                    order: order,
                    limit: limit,
                    offset: offset
                });
            }

            let page = parseInt(req.query.page ?? 0)

            return res.json(success({
                items     : agents,
                total     : total,
                page      : page,
                page_count: Math.ceil(total / limit),
                firstItem : agents.length ? (((page - 1) * limit) + 1) : 0,
                lastItem  : agents.length ? ((page * limit) <= total ? (page * limit) : total) : 0,
            }));
        } catch (err) {
            return res.json(error(err.message, 501));
        }
    },

    store: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            console.log(req.body)
            const { AgentCode, AgentName, AgentAddress, AgentLocationX, AgentLocationY } = req.body;

            /**
             * validation
             */
            const schema = Joi.object({
                AgentCode     : Joi.string().required().min(1).max(200),
                AgentName     : Joi.string().required().min(1).max(200),
                AgentAddress  : Joi.string().required().min(1).max(300),
                AgentLocationX: Joi.number().required(),
                AgentLocationY: Joi.number().required(),
            }).unknown();

            const validation = schema.validate(req.body);

            if (validation.error) {
                return res.json(error(validation.error.details[0].message))
            }

            /**
             * check exists code
             */
            const existsAgent = await Agent.findOne({
                where: {
                    AgentCode: AgentCode
                }
            }, { transaction: transaction })
            if (existsAgent) {
                return res.json(error('Mã đại lý này đã tồn tại.'));
            }

            /**
             * call create action
             */
            const agent = await Agent.create({
                AgentCode     : AgentCode,
                AgentName     : AgentName,
                AgentAddress  : AgentAddress,
                AgentLocationX: AgentLocationX,
                AgentLocationY: AgentLocationY,
            }, { transaction: transaction });

            await transaction.commit();
            return res.json(success(agent));
        } catch (err) {
            await transaction.rollback();
            return res.json(error(err.message, 501));
        }
    },

    import: async (req, res) => {
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
                    AgentCode     : item.AgentCode,
                    AgentName     : item.AgentName,
                    AgentAddress  : item.AgentAddress,
                    AgentLocationX: item.AgentLocationX,
                    AgentLocationY: item.AgentLocationY,
                }
            })

            await transaction.commit();
            return res.json(success(data));
        } catch (err) {
            await transaction.rollback();
            return res.json(error(err.message, 501));
        }
    },

    bulkCreate: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            const { agents } = req.body;

            /**
             * validation
             */
            const schema = Joi.object({
                AgentCode   : Joi.string().required().min(1).max(200),
                AgentName   : Joi.string().required().min(1).max(200),
                AgentAddress: Joi.string().required().min(1).max(300),
                AgentLocationX: Joi.number().required(),
                AgentLocationY: Joi.number().required(),
            }).unknown();

            if(agents.length <= 0) {
                throw new Error('Cần ít nhất một đại lý.');
            }

            const duplicateItems = helper.findDuplicates(agents, 'AgentCode');
            if(duplicateItems.length > 0) {
                throw new Error(`${duplicateItems[0].AgentCode} bị trùng lặp.`);
            }

            let AgentModels = []
            agents.forEach(async (agent, index) => {
                let validation = schema.validate(agent);
                if (validation.error) {
                    throw new Error(`[${index+1}] ${validation.error.details[0].message}`);
                }

                AgentModels.push({
                    AgentCode     : agent.AgentCode,
                    AgentName     : agent.AgentName,
                    AgentAddress  : agent.AgentAddress,
                    AgentLocationX: agent.AgentLocationX,
                    AgentLocationY: agent.AgentLocationY, 
                })
            });
            
            let exists_agents = await Agent.findAll({
                where: {
                    AgentCode: {
                        [Op.in]: agents.map(item => {
                            return item.AgentCode
                        })
                    }
                }
            }, {transaction: transaction})

            if(exists_agents.length > 0) {
                throw new Error(`[${exists_agents[0].AgentCode}] đã tồn tại.`);
            }


            /**
             * call create action
             */
            await Agent.bulkCreate( AgentModels, { transaction: transaction });

            await transaction.commit();
            return res.json(success());
        } catch (err) {
            await transaction.rollback();
            return res.json(error(err.message, 501));
        }
    },

    show: async (req, res) => {
        try {
            console.log(req.query)

            if (!req.query.AgentCode) {
                throw new Error(`Thiếu AgentCode.`);
            }

            const agent = await Agent.findOne({
                where: {
                    'AgentCode': req.query.AgentCode
                }
            })

            if(!agent) {
                throw new Error('Không tìm thấy đại lý.');
            }

            return res.json(success(agent));
        } catch (err) {
            return res.json(error(err.message, 501));
        }
    },

    update: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            console.log(req.body)
            const { AgentCode, AgentName, AgentAddress, AgentLocationX, AgentLocationY } = req.body;

            /**
             * validation
             */
            const schema = Joi.object({
                AgentCode   : Joi.string().required().min(1).max(200),
                AgentName   : Joi.string().required().min(1).max(200),
                AgentAddress: Joi.string().required().min(1).max(300),
                AgentLocationX: Joi.number().required(),
                AgentLocationY: Joi.number().required(),
            }).unknown();

            const validation = schema.validate(req.body);

            if (validation.error) {
                throw new Error(validation.error.details[0].message)
            }

            /**
             * check exists code
             */
            const existsAgent = await Agent.findOne({
                where: {
                    AgentCode: AgentCode
                },
            }, { transaction: transaction })
            if (!existsAgent) {
                throw new Error('Không tìm thấy đại lý này.')
            }

            /**
             * call create action
             */
            existsAgent.AgentName      = AgentName
            existsAgent.AgentAddress   = AgentAddress
            existsAgent.AgentLocationX = AgentLocationX
            existsAgent.AgentLocationY = AgentLocationY
            
            await existsAgent.save({ transaction: transaction })

            await transaction.commit();
            return res.json(success(existsAgent));
        } catch (err) {
            await transaction.rollback();
            return res.json(error(err.message, 501));
        }
    },

    list: async (req, res) => {
        try {
            console.log(req.query)

            /**
             * set condition
             */
            const where = {}

            if (req.query.AgentCode) {
                where.AgentCode = { [Op.like]: `%${req.query.AgentCode}%` }
            }

            if (req.query.AgentName) {
                where.AgentName = { [Op.like]: `%${req.query.AgentName}%` }
            }
            
            if (req.query.AgentAddress) {
                where.AgentAddress = { [Op.like]: `%${req.query.AgentAddress}%` }
            }

            /**
             * order
             */
            const order_list = ['AgentCode', 'AgentName', 'AgentAddress']
            let order = []
            if (order_list.includes(req.query.sort)) {
                let sort_by = req.query.sort_by == 'desc' ? 'desc' : 'asc'
                order = [[req.query.sort, sort_by]]
            }

            /**
             * call select action
             */
            const total = await Agent.count({
                where: where,
            })

            let agents = []
            if (total > 0) {
                agents = await Agent.findAll({
                    order: order,
                });
            }

            return res.json(success({
                items: agents,
            }));
        } catch (err) {
            return res.json(error(err.message, 501));
        }
    },

    delete: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            console.log(req.query)

            const { AgentCode } = req.body;

            if(!AgentCode) {
                throw new Error("Không tìm thấy đại lý.");
            }

            const agent = await Agent.findOne({
                where: {
                    AgentCode: AgentCode
                }
            }, { transaction: transaction })

            if(!agent) {
                throw new Error("Không tìm thấy đại lý.");
            }

            await agent.destroy({ transaction: transaction })
            
            await transaction.commit();
            return res.json(success());
        } catch (err) {
            await transaction.rollback();
            return res.json(error(err.message, 501));
        }
    }
};

export default VehicleController;
