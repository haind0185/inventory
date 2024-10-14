import sequelize from './index';
const { DataTypes } = require('sequelize');

const WarehouseEntry = sequelize.define('WarehouseEntry', {
    EntryCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    EntryDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    ProductCode: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    LargeUnitQty: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    SmallUnitQty: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    ExpiryDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
});

export default WarehouseEntry;
