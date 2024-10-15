import sequelize from './index';
import Product from './Product';
const { DataTypes } = require('sequelize');

const WarehouseEntry = sequelize.define('WarehouseEntry', {
    EntryCode: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    EntryDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    ProductCode: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Product,
            key: 'ProductCode',
        },
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
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
});

Product.hasMany(WarehouseEntry, { foreignKey: 'ProductCode' });
WarehouseEntry.belongsTo(Product, { foreignKey: 'ProductCode' });

export default WarehouseEntry;
