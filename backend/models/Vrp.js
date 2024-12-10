import sequelize from './index';
const { DataTypes } = require('sequelize');

const Vrp = sequelize.define('Vrp', {
    VrpCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    VrpDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    VrpLocationX: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    VrpLocationY: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },

    // get attribute
});

export default Vrp;
