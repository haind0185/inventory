const { DataTypes } = require('sequelize');

const table_name = 'Exits'

export const add_note_exits = {
    name: '20250218013457_add_note_for_exits_table',

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
