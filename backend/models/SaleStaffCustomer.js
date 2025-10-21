import sequelize from './index';
import SaleStaff from './SaleStaff';
import Customer from './Customer';
const { DataTypes } = require('sequelize');

const SaleStaffCustomer = sequelize.define('SaleStaffCustomer', {
    SaleStaffId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: SaleStaff,
            key: 'id',
        },
    },
    CustomerCode: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Customer,
            key: 'CustomerCode',
        },
    },
})

export default SaleStaffCustomer;
