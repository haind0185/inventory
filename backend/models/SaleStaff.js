import sequelize from './index';
const { DataTypes } = require('sequelize');

const SaleStaff = sequelize.define('SaleStaff', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
    },
    SaleStaffName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    SaleStaffActive: {
        type: DataTypes.BOOLEAN,
        default: true
    },
});

export default SaleStaff;
