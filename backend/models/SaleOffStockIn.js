import sequelize from './index';
const { DataTypes } = require('sequelize');

const SaleOffStockIn = sequelize.define('SaleOffStockIn', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
    },
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
