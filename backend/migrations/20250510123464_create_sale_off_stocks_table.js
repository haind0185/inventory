const { DataTypes } = require('sequelize');

const table_name = 'SaleOffStocks'

export const create_sale_off_stocks = {
    name: '20250510123464_create_sale_off_stocks_table',

    async up(queryInterface) {
        await queryInterface.context.createTable(table_name, {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            ProductCode: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                references: {
                    model: 'SaleOffProducts',
                    key: 'ProductCode',
                },
            },
            LargeUnitQty: {
                type: DataTypes.FLOAT,
                allowNull: false,
            },
            SmallUnitQty: {
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

    async down(queryInterface) {
        await queryInterface.context.dropTable(table_name);
    }
}
