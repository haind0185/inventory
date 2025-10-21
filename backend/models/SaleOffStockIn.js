import sequelize from './index';
const { DataTypes } = require('sequelize');

const SaleOffStockIn = sequelize.define('SaleOffStockIn', {
    StockInCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    StockInDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    StockInNote: {
        type: DataTypes.STRING,
        allowNull: true,
    },
});

export default SaleOffStockIn;
