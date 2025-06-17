import sequelize from './index';
const { DataTypes } = require('sequelize');

const SaleOffOrder = sequelize.define('SaleOffOrder', {
    OrderCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    OrderDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    OrderNote: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    PriceQty: {
        type: DataTypes.VIRTUAL,
        get() {
            if(this.saleOffRoutes.length < 0) return 0
            let total = 0
            this.saleOffRoutes.forEach(item => {
                total += item.PriceQty
            });
            return total
        }
    },
});

export default SaleOffOrder;
