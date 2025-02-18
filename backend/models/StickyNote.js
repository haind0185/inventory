import sequelize from './index';
const { DataTypes } = require('sequelize');

const StickyNote = sequelize.define('StickyNote', {
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
});

export default StickyNote;
