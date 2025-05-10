import sequelize from './index';
import SaleOffStockIn from './SaleOffStockIn';
import SaleOffProduct from './SaleOffProduct';
const { DataTypes } = require('sequelize');

const SaleOffStockInItem = sequelize.define('SaleOffStockInItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
    },
    StockInCode: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: SaleOffStockIn,
            key: 'StockInCode',
        },
    },
    StockInItemNote: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    ProductCode: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: SaleOffProduct,
            key: 'ProductCode',
        },
    },
    LargeUnitQty: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    SmallUnitQty: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
});

SaleOffStockIn.hasMany(SaleOffStockInItem, { foreignKey: 'StockInCode', sourceKey: 'StockInCode', as: 'saleOffStockInItems' });
SaleOffStockInItem.belongsTo(SaleOffStockIn, { foreignKey: 'StockInCode', targetKey: 'StockInCode', as: 'saleOffStockIn' });

SaleOffProduct.hasMany(SaleOffStockInItem, { foreignKey: 'ProductCode', sourceKey: 'ProductCode', as: 'saleOffStockInItems' });
SaleOffStockInItem.belongsTo(SaleOffProduct, { foreignKey: 'ProductCode', targetKey: 'ProductCode', as: 'saleOffProduct' });

export default SaleOffStockInItem;
