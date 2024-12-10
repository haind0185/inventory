import sequelize from './index';
const { DataTypes } = require('sequelize');

const VrpUnassigned = sequelize.define('VrpUnassigned', {
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
     * From: VrpUnassigneds
     */
    VrpAgentCode: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    VrpDelivery: {
        type: DataTypes.FLOAT,
        allowNull: false,
        default: 0,
    },

    // get attribute
});

export default VrpUnassigned;
