const { DataTypes } = require('sequelize');

const table_name = 'SaleStaffCustomers'

export const create_sale_customers = {
    name: '20250608123456_create_sale_staffs_customer_table',

    async up(queryInterface) {
        await queryInterface.context.createTable(table_name, {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            SaleStaffId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'SaleStaffs',
                    key: 'id',
                },
            },
            CustomerCode: {
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: 'Customers',
                    key: 'CustomerCode',
                },
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

        await queryInterface.context.addConstraint(table_name, {
            fields: ['SaleStaffId', 'CustomerCode'],
            type: 'unique',
            name: 'unique_SaleStaffs_id_Customers_CustomerCode_constraint',
        });

        await queryInterface.context.addIndex(table_name, ['SaleStaffId', 'CustomerCode']);
    },

    async down(queryInterface) {
        await queryInterface.context.dropTable(table_name);
    }
}
