const { DataTypes } = require('sequelize');

const table_name = 'SaleOffRoutes'

export const create_sale_off_routes = {
    name: '20250510123461_create_sale_off_routes_table',

    async up(queryInterface) {
        await queryInterface.context.createTable(table_name, {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            OrderCode: {
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: 'SaleOffOrders',
                    key: 'OrderCode',
                },
            },
            RouteNote: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            DeliveryStaffId1: {
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: 'DeliveryStaffs',
                    key: 'id',
                },
            },
            DeliveryStaffId2: {
                type: DataTypes.STRING,
                allowNull: true,
                references: {
                    model: 'DeliveryStaffs',
                    key: 'id',
                },
            },
            DeliveryStaffId3: {
                type: DataTypes.STRING,
                allowNull: true,
                references: {
                    model: 'DeliveryStaffs',
                    key: 'id',
                },
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

    async down(queryInterface) {
        await queryInterface.context.dropTable(table_name);
    }
}
