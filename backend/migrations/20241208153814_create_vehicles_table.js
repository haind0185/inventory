const { DataTypes } = require('sequelize');

const table_name = 'Vehicles'

export const create_vehicles = {
    name: '20241208153814_create_vehicles_table',

    async up (queryInterface) {
        await queryInterface.context.createTable(table_name, {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
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
