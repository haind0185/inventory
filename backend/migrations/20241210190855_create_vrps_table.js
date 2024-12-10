const { DataTypes } = require('sequelize');

const table_name = 'Vrps'

export const create_vrps = {
    name: '20241210190855_create_vrps_table',

    async up (queryInterface) {
        await queryInterface.context.createTable(table_name, {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            VrpCode: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            VrpDate: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            VrpLocationX: {
                type: DataTypes.FLOAT,
                allowNull: false,
            },
            VrpLocationY: {
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
    },

    async down (queryInterface) {
        await queryInterface.context.dropTable(table_name);
    }
}
