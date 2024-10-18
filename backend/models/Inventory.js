import sequelize from './index';
import Product from './Product';
import WarehouseEntry from './WarehouseEntry';
const { DataTypes } = require('sequelize');

const Inventory = sequelize.define('Inventory', {
    ProductCode: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Product,
            key: 'ProductCode',
        },
    },
    ExpiryDate: {
        type: DataTypes.DATEONLY,
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
});

Product.hasMany(Inventory, { foreignKey: 'ProductCode', sourceKey: 'ProductCode', as: 'inventories' });
Inventory.belongsTo(Product, { foreignKey: 'ProductCode', targetKey: 'ProductCode', as: 'product' });

export default Inventory;
