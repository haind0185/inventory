import sequelize from './index';
import { ACTIVE_LIST } from '../../src/renderer/constant'
const { DataTypes } = require('sequelize');

const SaleStaff = sequelize.define('SaleStaff', {
    SaleStaffName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    SaleStaffActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    
    // get attribute
    ActiveLabel: {
        type: DataTypes.VIRTUAL,
        get() {
            return ACTIVE_LIST[this.SaleStaffActive] ?? '-';
        }
    }
});

export default SaleStaff;
