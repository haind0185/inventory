const { DataTypes } = require('sequelize');

const table_name = 'VrpUnassigneds'

export const create_vrp_unassigneds = {
    name: '20241210191953_create_vrp_unassigneds_table',

    async up (queryInterface) {
        await queryInterface.context.createTable(table_name, {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            
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
