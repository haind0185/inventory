const { DataTypes } = require('sequelize');

const table_name = 'Inventories'

export const create_inventories = {
    name: '20241025104439_create_inventories_table',

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

        await queryInterface.context.addConstraint(table_name, {
            fields: ['ProductCode', 'ExpiryDate'],
            type: 'unique',
            name: 'unique_Inventories_ProductCode_ExpiryDate_constraint',
        });

        await queryInterface.context.addIndex(table_name, ['ProductCode', 'ExpiryDate']);
    },

    async down(queryInterface) {
        await queryInterface.context.dropTable(table_name);
    }
}
