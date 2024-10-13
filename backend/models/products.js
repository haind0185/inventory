import sequelize from './index';
const { DataTypes } = require('sequelize');

const Product = sequelize.define('Product', {
    code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    unit1: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    unit2: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    specific: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
});

export default Product;
