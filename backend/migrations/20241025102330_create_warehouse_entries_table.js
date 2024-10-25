const { DataTypes } = require('sequelize');

const table_name = 'WarehouseEntries'

export const create_warehouse_entries = {
    name: '20241025102330_create_warehouse_entries_table',

    async up(queryInterface) {
        await queryInterface.context.createTable(table_name, {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            EntryCode: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            EntryDate: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            EntryType: {
                type: DataTypes.BOOLEAN,
                default: false
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
