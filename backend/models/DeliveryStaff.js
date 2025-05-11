import sequelize from './index';
import { ACTIVE_LIST } from '../../src/renderer/constant'
const { DataTypes } = require('sequelize');

const DeliveryStaff = sequelize.define('DeliveryStaff', {
    // id: {
    //     type: DataTypes.INTEGER,
    //     primaryKey: true,
    //     allowNull: false,
    // },
    DeliveryStaffName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    DeliveryStaffActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },

    // get attribute
    ActiveLabel: {
        type: DataTypes.VIRTUAL,
        get() {
            return ACTIVE_LIST[this.DeliveryStaffActive] ?? '-';
        }
    }
});

export default DeliveryStaff;
