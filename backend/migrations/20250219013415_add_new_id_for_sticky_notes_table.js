const { DataTypes } = require('sequelize');

const table_name = 'StickyNotes'

export const add_new_id_sticky_notes = {
    name: '20250219013415_add_new_id_for_sticky_notes_table',

    async up(queryInterface) {
        await queryInterface.context.addColumn(table_name, 'new_id', {
            type: DataTypes.STRING,
            allowNull: false,
        });

        await queryInterface.context.addConstraint(table_name, {
            fields: ['new_id'],
            type: 'unique',
            name: 'unique_new_id_constraint',
        });

        await queryInterface.context.removeColumn(table_name, "id");
        await queryInterface.context.renameColumn(table_name, "new_id", "id");
    },

    async down(queryInterface) {
        console.log("Rollback không khả thi vì mất dữ liệu id cũ.");
    }
}
