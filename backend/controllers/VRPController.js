import { error, success } from './common/http';
import { t } from '../../src/renderer/i18n'
import { helper } from '../../src/renderer/helper'
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
    }
};

export default VRPController;
