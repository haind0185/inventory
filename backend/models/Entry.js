import sequelize from './index';
import Product from './Product';
import WarehouseEntry from './WarehouseEntry';
const { DataTypes } = require('sequelize');

const Entry = sequelize.define('Entry', {
    EntryCode: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: WarehouseEntry,
            key: 'EntryCode',
        },
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

Product.hasMany(Entry, { foreignKey: 'ProductCode', sourceKey: 'ProductCode', as: 'entries' });
Entry.belongsTo(Product, { foreignKey: 'ProductCode', targetKey: 'ProductCode', as: 'product' });

WarehouseEntry.hasMany(Entry, { foreignKey: 'EntryCode', sourceKey: 'EntryCode', as: 'entries' });
Entry.belongsTo(WarehouseEntry, { foreignKey: 'EntryCode', targetKey: 'EntryCode', as: 'warehouseEntry' });

export default Entry;
