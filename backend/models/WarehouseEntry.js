import sequelize from './index';
const { DataTypes } = require('sequelize');

const WarehouseEntry = sequelize.define('WarehouseEntry', {
    EntryCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    EntryDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
});

export default WarehouseEntry;
