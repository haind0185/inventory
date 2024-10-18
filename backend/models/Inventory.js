import sequelize from './index';
import Product from './Product';
import WarehouseEntry from './WarehouseEntry';
import moment from 'moment';
const { DataTypes } = require('sequelize');

const Inventory = sequelize.define('Inventory', {
    ProductCode: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Product,
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
    // get attribute
    ExpireCount: {
        type: DataTypes.VIRTUAL,
        get() {
            let product = this.product
            
            if(product) {
                const now = moment().startOf('day')
                const expiryDate = moment(this.ExpiryDate)
                return expiryDate.diff(now, 'days')
            }

            return 0
        }
    },
    ExpirePercent: {
        type: DataTypes.VIRTUAL,
        get() {
            let product = this.product
            if(product) {
                let percent = this.ExpireCount / product.Expire * 100
                if(percent < 0) {
                    percent = 0
                }
                if(percent > 100) {
                    percent = 100
                }
                
                return Math.round(percent)
            }

            return 0
        }
    },
});

Product.hasMany(Inventory, { foreignKey: 'ProductCode', sourceKey: 'ProductCode', as: 'inventories' });
Inventory.belongsTo(Product, { foreignKey: 'ProductCode', targetKey: 'ProductCode', as: 'product' });

export default Inventory;
