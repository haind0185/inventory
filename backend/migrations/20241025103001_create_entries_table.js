const { DataTypes } = require('sequelize');

const table_name = 'Entries'

export const create_entries = {
    name: '20241025103001_create_entries_table',

    async up(queryInterface) {
        await queryInterface.context.createTable(table_name, {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            /**
             * From WarehouseEntries
             */
            EntryCode: {
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: 'WarehouseEntries',
                    key: 'EntryCode',
                },
            },
            EntryDate: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            EntryType: {
                type: DataTypes.BOOLEAN,
                default: false, // false: normal | true: adjustment
            },

            /**
             * From Entries
             */
            ProductCode: {
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: 'Products',
                    key: 'ProductCode',
                },
            },
            ExpiryDate: {
                type: DataTypes.DATEONLY,
                allowNull: false,
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
             * After stock in
             */
            StockLargeUnitQty: {
                type: DataTypes.FLOAT,
                allowNull: false,
                default: 0,
            },
            StockSmallUnitQty: {
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

        await queryInterface.context.addIndex(table_name, ['ProductCode', 'EntryDate']);
    },

    async down(queryInterface) {
        await queryInterface.context.dropTable(table_name);
    }
}
