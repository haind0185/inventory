import sequelize from './index';
const { DataTypes } = require('sequelize');

const SaleOffOrder = sequelize.define('SaleOffOrder', {
    OrderCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    OrderDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    OrderNote: {
        type: DataTypes.STRING,
        allowNull: true,
    },
});

export default SaleOffOrder;
