const { DataTypes } = require('sequelize');

const table_name = 'WarehouseExit'

export const create_warehouse_exits = {
    name: '20241025104935_create_warehouse_exits_table',

    async up(queryInterface) {
        await queryInterface.context.createTable(table_name, {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            ExitCode: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            ExitDate: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            ExitType: {
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
