import sequelize from './index';
const { DataTypes } = require('sequelize');

const Vehicle = sequelize.define('Vehicle', {
    VehicleCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    VehicleCapacity: {
        type: DataTypes.FLOAT,
        allowNull: false,
        default: 0,
    },
});

export default Vehicle;
