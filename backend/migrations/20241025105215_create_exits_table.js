const { DataTypes } = require('sequelize');

const table_name = 'Exits'

export const create_exits = {
    name: '20241025105215_create_exits_table',

    async up(queryInterface) {
        await queryInterface.context.createTable(table_name, {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            /**
             * From: WarehouseExits
             */
            ExitCode: {
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: 'WarehouseExits',
                    key: 'ExitCode',
                },
            },
            ExitDate: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            ExitType: {
                type: DataTypes.BOOLEAN,
                default: false, // false: normal | true: adjustment
            },

            /**
             * From: Exits
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
             * From: After stock out
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

        await queryInterface.context.addIndex(table_name, ['ProductCode', 'ExitDate']);
    },

    async down(queryInterface) {
        await queryInterface.context.dropTable(table_name);
    }
}
