import sequelize from './index';
import Product from './Product';
import moment from 'moment';
import { helper } from '../../src/renderer/helper'
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
            if(product && product.Expire) {
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
    ProductNameLabel: {
        type: DataTypes.VIRTUAL,
        get() {
            if(!this.product) return ''
            return `${this.product.ProductName} ` + `[${this.product.Expire} ngày]`;
        }
    },
    ProductNameLabelGroup: {
        type: DataTypes.VIRTUAL,
        get() {
            if(!this.product) return ''
            return `[${this.product.ProductCode}][${this.LargeUnitQty} ${this.product.LargeUnit}]`+(this.product.SmallUnit ? `[${this.SmallUnitQty} ${this.product.SmallUnit}]` : '')+` ${this.product.ProductName}`;
        }
    },
    // Qty: {
    //     type: DataTypes.VIRTUAL,
    //     get() {
    //         if(!this.product) return 0
    //         return helper.unitQtyTransfer(this.LargeUnitQty, this.SmallUnitQty, this.product)
    //     }
    // },
    // Price: {
    //     type: DataTypes.VIRTUAL,
    //     get() {
    //         if(!this.product) return 0
    //         return this.product.Price
    //     }
    // },
    // QtyPrice: {
    //     type: DataTypes.VIRTUAL,
    //     get() {
    //         if(!this.product) return 0
    //         let Qty = helper.unitQtyTransfer(this.LargeUnitQty, this.SmallUnitQty, this.product)
    //         return Qty * this.product.Price
    //     }
    // },
    
}, {
    indexes: [
        {
          unique: true,
          fields: ['ProductCode', 'ExpiryDate'],
        },
    ],
});

Product.hasMany(Inventory, { foreignKey: 'ProductCode', sourceKey: 'ProductCode', as: 'inventories' });
Inventory.belongsTo(Product, { foreignKey: 'ProductCode', targetKey: 'ProductCode', as: 'product' });

export default Inventory;
