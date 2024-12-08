import sequelize from './index';
const { DataTypes } = require('sequelize');

const Agent = sequelize.define('Agent', {
    AgentCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    AgentName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    AgentAddress: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    AgentLocationX: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    AgentLocationY: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },

    // get attribute
    AgentNameLabel: {
        type: DataTypes.VIRTUAL,
        get() {
            return `[${this.AgentCode}] ${this.AgentName}`;
        }
    }
});

export default Agent;
