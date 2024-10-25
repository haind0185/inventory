const { DataTypes } = require('sequelize');

const table_name = 'WarehouseOrders'

export const create_warehouse_orders = {
    name: '20241025111657_create_warehouse_orders_table',

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
            },
            OrderDate: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            OrderType: {
                type: DataTypes.BOOLEAN,
                default: false, // false: entry | true: exit
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
