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
});

export default Product;
