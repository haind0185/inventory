const { DataTypes } = require('sequelize');

const table_name = 'Order'

export const create_orders = {
    name: '20241025112015_create_orders_table',

    async up (queryInterface) {
        await queryInterface.context.createTable(table_name, {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            /**
             * From: WarehouseOrders
             */
            OrderCode: {
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: 'WarehouseOrders',
                    key: 'OrderCode',
                },
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
             * From: Orders
             */
            ProductCode: {
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: 'Products',
                    key: 'ProductCode',
                },
            },
            LargeUnitQty: {
                type: DataTypes.FLOAT,
                allowNull: false,
                default: 0,
            },
            SmallUnitQty: {
                type: DataTypes.FLOAT,
                allowNull: false,
                default: 0,
            },
            Price: {
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
