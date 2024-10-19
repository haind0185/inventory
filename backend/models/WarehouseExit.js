import sequelize from './index';
const { DataTypes } = require('sequelize');

const WarehouseExit = sequelize.define('WarehouseExit', {
    ExitCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    ExitDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    ExitType: {
        type: DataTypes.BOOLEAN,
        default: false
    }
});

export default WarehouseExit;
