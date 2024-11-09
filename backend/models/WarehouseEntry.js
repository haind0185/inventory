import sequelize from './index';
const { DataTypes } = require('sequelize');

const WarehouseEntry = sequelize.define('WarehouseEntry', {
    EntryCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    EntryDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    EntryType: {
        type: DataTypes.BOOLEAN,
        default: false
    },
    PriceQty: {
        type: DataTypes.VIRTUAL,
        get() {
            if(!this.entries) return 0
            if(this.entries.length < 0) return 0
            let total = 0
            this.entries.forEach(item => {
                total += item.PriceQty
            });
            return total
        }
    },
});

export default WarehouseEntry;
