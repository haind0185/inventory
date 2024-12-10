import sequelize from './index';
const { DataTypes } = require('sequelize');

const VrpRoute = sequelize.define('VrpRoute', {
    /**
     * From: Vrps
     */
    VrpCode: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'Vrps',
            key: 'VrpCode',
        },
    },
    VrpDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },

    /**
     * From: VrpRoutes
     */
    VrpVehicleCode: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    VrpCapacity: {
        type: DataTypes.FLOAT,
        allowNull: false,
        default: 0,
    },
    VrpDelivery: {
        type: DataTypes.FLOAT,
        allowNull: false,
        default: 0,
    },
    VrpGeometry: {
        type: DataTypes.TEXT,
        allowNull: false,
    },

    // get attribute
});

export default VrpRoute;
