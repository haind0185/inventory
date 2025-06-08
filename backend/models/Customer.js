import sequelize from './index';
const { DataTypes } = require('sequelize');

const Customer = sequelize.define('Customer', {
    // id: {
    //     type: DataTypes.INTEGER,
    //     primaryKey: true,
    //     allowNull: false,
    // },
    CustomerCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    CustomerName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    CustomerAddress: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    // get attribute
    CustomerNameLabel: {
        type: DataTypes.VIRTUAL,
        get() {
            return `[${this.CustomerCode}] ${this.CustomerName}`;
        }
    }
});

export default Customer;
