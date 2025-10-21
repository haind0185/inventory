import sequelize from './index';
import Customer from './Customer';
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

SaleStaff.belongsToMany(Customer, {
    through: 'SaleStaffCustomers',
    sourceKey: 'id',
    foreignKey: 'SaleStaffId',
    targetKey: 'CustomerCode',
    otherKey: 'CustomerCode',
    as: 'customers'
})

export default SaleStaff;
