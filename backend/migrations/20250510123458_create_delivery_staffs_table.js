const { DataTypes } = require('sequelize');

const table_name = 'DeliveryStaffs'

export const create_delivery_staffs = {
    name: '20250510123458_create_delivery_staffs_table',

    async up(queryInterface) {
        await queryInterface.context.createTable(table_name, {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            DeliveryStaffName: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            DeliveryStaffActive: {
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
