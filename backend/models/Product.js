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
    Expire: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
            return `[${this.ProductCode}] ${this.ProductName} [${this.LargeUnit}]` + (this.SmallUnit ? `[x${this.ConversionRate}][${this.SmallUnit}]` : '') + `[${this.Expire} ngày]`;
        }
    }
});

export default Product;
