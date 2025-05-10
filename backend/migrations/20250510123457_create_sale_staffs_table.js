const { DataTypes } = require('sequelize');

const table_name = 'SaleStaffs'

export const create_sale_staffs = {
    name: '20250510123456_create_sale_staffs_table',

    async up(queryInterface) {
        await queryInterface.context.createTable(table_name, {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            SaleStaffName: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            SaleStaffActive: {
                type: DataTypes.BOOLEAN,
                default: true
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
