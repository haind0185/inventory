const { DataTypes } = require('sequelize');

const table_name = 'StickyNotes'

export const create_sticky_notes = {
    name: '20250218013458_create_sticky_notes_table',

    async up(queryInterface) {
        await queryInterface.context.createTable(table_name, {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            /**
             * From StickyNotes
             */
            title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            text: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            x: {
                type: DataTypes.FLOAT,
                allowNull: false,
                default: 0,
            },
            y: {
                type: DataTypes.FLOAT,
                allowNull: false,
                default: 0,
            },
            width: {
                type: DataTypes.FLOAT,
                allowNull: false,
                default: 0,
            },
            height: {
                type: DataTypes.FLOAT,
                allowNull: false,
                default: 0,
            },
            color: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            zIndex: {
                type: DataTypes.INTEGER,
                allowNull: false,
                default: 1,
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
