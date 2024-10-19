import sequelize from './index';
const { DataTypes } = require('sequelize');

const Product = sequelize.define('Product', {
    ProductCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    ProductName: {
        type: DataTypes.STRING,
        allowNull: false,
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
    Expire: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    // get attribute
    ProductNameLabel: {
        type: DataTypes.VIRTUAL,
        get() {
            return `[${this.ProductCode}] ${this.ProductName} [${this.LargeUnit}]` + (this.SmallUnit ? `[${this.SmallUnit}]` : '') + `[${this.Expire} ngày]`;
        }
    }
});

export default Product;
