const { DataTypes } = require('sequelize');

const table_name = 'VrpRoutes'

export const create_vrp_routes = {
    name: '20241210191188_create_vrp_routes_table',

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
