import { error, success } from './common/http';
import { t } from '../../src/renderer/i18n'
import { helper } from '../../src/renderer/helper'
import sequelize from '../models/index';
const xlsx = require('xlsx');
const path = require('path');
const { Op } = require("sequelize");
const Joi = require('joi');

const VRPController = {
    calculate: async (req, res) => {
        try {
            
        } catch (error) {
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
                    AgentCode    : item.AgentCode,
                    AgentDelivery: item.AgentDelivery,
                }
            })

            await transaction.commit();
            return res.json(success(data));
        } catch (err) {
            await transaction.rollback();
            return res.json(error(err.message, 501));
        }
    },
};

export default VRPController;
