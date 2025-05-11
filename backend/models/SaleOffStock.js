import sequelize from './index';
import SaleOffProduct from './SaleOffProduct';
const { DataTypes } = require('sequelize');

const SaleOffStock = sequelize.define('SaleOffStock', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
    },
    ProductCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        references: {
            model: SaleOffProduct,
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
    
});

SaleOffProduct.hasMany(SaleOffStock, { foreignKey: 'ProductCode', sourceKey: 'ProductCode', as: 'saleOffStocks' });
SaleOffStock.belongsTo(SaleOffProduct, { foreignKey: 'ProductCode', targetKey: 'ProductCode', as: 'saleOffProduct' });

export default SaleOffStock;
