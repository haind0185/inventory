const { DataTypes } = require('sequelize');

const table_name = 'Products'

export const create_products = {
    name: '20241025062802_create_products_table',

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
            },
            ProductName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            Expire: {
                type: DataTypes.INTEGER,
                allowNull: false,
                default: 0,
            },
            Price: {
                type: DataTypes.FLOAT,
                allowNull: false,
                default: 0,
            },
            LargeUnit: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            SmallUnit: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            ConversionRate: {
                type: DataTypes.INTEGER,
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
