import sequelize from './index';
const { DataTypes } = require('sequelize');

const WarehouseExit = sequelize.define('WarehouseExit', {
    ExitCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    ExitDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    ExitType: {
        type: DataTypes.BOOLEAN,
        default: false
    },
    PriceQty: {
        type: DataTypes.VIRTUAL,
        get() {
            if(this.exits.length < 0) return 0
            let total = 0
            this.exits.forEach(item => {
                total += item.PriceQty
            });
            return total
        }
    },
});

export default WarehouseExit;
