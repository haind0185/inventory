const { DataTypes } = require('sequelize');

const table_name = 'SaleOffStockInItems'

export const create_sale_off_stock_in_items = {
    name: '20250510123463_create_sale_off_stock_in_items_table',

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
                references: {
                    model: 'SaleOffStockIns',
                    key: 'StockInCode',
                },
            },
            StockInItemNote: {
                type: DataTypes.STRING,
                allowNull: true,
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
