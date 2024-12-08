const { DataTypes } = require('sequelize');

const table_name = 'Agents'

export const create_agents = {
    name: '20241208150355_create_agents_table',

    async up (queryInterface) {
        await queryInterface.context.createTable(table_name, {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
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

            /**
             * From: Timestamp
             */
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: true,
            }
        });
    },

    async down (queryInterface) {
        await queryInterface.context.dropTable(table_name);
    }
}
