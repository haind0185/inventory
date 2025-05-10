import sequelize from './index';
const { DataTypes } = require('sequelize');

const DeliveryStaff = sequelize.define('DeliveryStaff', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
    },
    DeliveryStaffName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    DeliveryStaffActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
});

export default DeliveryStaff;
