import sequelize from './index';
const { DataTypes } = require('sequelize');

const SaleOffProduct = sequelize.define('SaleOffProduct', {
    ProductCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    ProductName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Price: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    LargeUnit: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    SmallUnit: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    ConversionRate: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },

    // get attribute
    ProductNameLabel: {
        type: DataTypes.VIRTUAL,
        get() {
            return `[${this.ProductCode}] ${this.ProductName}`;
        }
    }
});

export default SaleOffProduct;
