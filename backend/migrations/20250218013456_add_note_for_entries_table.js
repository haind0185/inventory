const { DataTypes } = require('sequelize');

const table_name = 'Entries'

export const add_note_entries = {
    name: '20250218013456_add_note_for_entries_table',

    async up(queryInterface) {
        await queryInterface.context.addColumn(table_name, 'Note', {
            type: DataTypes.STRING,
            allowNull: true,
        },);
    },

    async down(queryInterface) {
        await queryInterface.removeColumn(table_name, 'Note');
    }
}
