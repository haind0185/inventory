const { DataTypes } = require('sequelize');

const table_name = 'SaleOffStockIns'

export const create_sale_off_order_stock_ins = {
    name: '20250510123462_create_sale_off_stock_ins_table',

    async up(queryInterface) {
        await queryInterface.context.createTable(table_name, {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            StockInCode: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            StockInDate: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            StockInNote: {
                type: DataTypes.STRING,
                allowNull: true,
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
