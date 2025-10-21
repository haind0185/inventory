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

    ProductName: {
        type: DataTypes.VIRTUAL,
        get() {
            if(!this.saleOffProduct) return ''
            return `[${this.saleOffProduct.ProductCode}] ${this.saleOffProduct.ProductName}`;
        }
    },
    
});

SaleOffProduct.hasMany(SaleOffStock, { foreignKey: 'ProductCode', sourceKey: 'ProductCode', as: 'saleOffStocks' });
SaleOffStock.belongsTo(SaleOffProduct, { foreignKey: 'ProductCode', targetKey: 'ProductCode', as: 'saleOffProduct' });

export default SaleOffStock;
