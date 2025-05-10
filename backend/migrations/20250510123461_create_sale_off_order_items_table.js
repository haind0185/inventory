const { DataTypes } = require('sequelize');

const table_name = 'SaleOffOrderItems'

export const create_sale_off_order_items = {
    name: '20250510123461_create_sale_off_order_items_table',

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
            OrderItemNote: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            SaleStaffId: {
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: 'SaleStaffs',
                    key: 'id',
                },
            },
            CustomerCode: {
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: 'Customers',
                    key: 'CustomerCode',
                },
            },
            ProductCode: {
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: 'SaleOffProducts',
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
