const { DataTypes } = require('sequelize');

const table_name = 'Customers'

export const create_customers = {
    name: '20250510123459_create_customers_table',

    async up(queryInterface) {
        await queryInterface.context.createTable(table_name, {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            CustomerCode: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            CustomerName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            CustomerAddress: {
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
