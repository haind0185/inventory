import sequelize from './index';
import Product from './Product';
import WarehouseEntry from './WarehouseEntry';
import Inventory from './Inventory';
import { t } from '../../src/renderer/i18n'
import { helper } from '../../src/renderer/helper'
import { error } from '../controllers/common/http';
const { DataTypes } = require('sequelize');

const Entry = sequelize.define('Entry', {
    EntryCode: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: WarehouseEntry,
            key: 'EntryCode',
        },
    },
    EntryDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    EntryType: {
        type: DataTypes.BOOLEAN,
        default: false, // false: normal | true: adjustment
    },
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
    Price: {
        type: DataTypes.FLOAT,
        allowNull: false,
        default: 0,
    },
    StockLargeUnitQty: {
        type: DataTypes.FLOAT,
        allowNull: false,
        default: 0,
    },
    StockSmallUnitQty: {
        type: DataTypes.FLOAT,
        allowNull: false,
        default: 0,
    },
    Note: {
        type: DataTypes.STRING,
        allowNull: true,
        default: null,
    },
    Qty: {
        type: DataTypes.VIRTUAL,
        get() {
            if(!this.product) return 0
            return helper.unitQtyTransfer(this.LargeUnitQty, this.SmallUnitQty, this.product)
        }
    },
    PriceQty: {
        type: DataTypes.VIRTUAL,
        get() {
            if(!this.product) return 0
            let Qty = helper.unitQtyTransfer(this.LargeUnitQty, this.SmallUnitQty, this.product)
            return Qty * this.Price
        }
    },
    ProductNameLabel: {
        type: DataTypes.VIRTUAL,
        get() {
            if(!this.product) return ''
            return `[${this.product.ProductCode}] ${this.product.ProductName} [${this.product.LargeUnit}]` + (this.product.SmallUnit ? `[x${this.product.ConversionRate}][${this.product.SmallUnit}]` : '') + `[${this.product.Expire} ngày]`;
        }
    },
}, {
    hooks: {
        afterBulkCreate: async (instances, options) => {
            const transaction = options.transaction

            let entries = []
            for (const entry of instances) {
                let key = `${entry.ProductCode}${entry.ExpiryDate}`
                if(entries[key]) {
                    entries[key].LargeUnitQty += entry.LargeUnitQty
                    entries[key].SmallUnitQty += entry.SmallUnitQty
                } else {
                    entries[key] = entry
                }
            }
            
            for (const i in entries) {
                let entry = entries[i]
                let inventory = await Inventory.findOne({
                    where: {
                        ProductCode: entry.ProductCode,
                        ExpiryDate: entry.ExpiryDate,
                    }
                }, {transaction: transaction});

                let LargeUnitQty = (inventory?.LargeUnitQty ?? 0) + entry.LargeUnitQty
                let SmallUnitQty = (inventory?.SmallUnitQty ?? 0) + entry.SmallUnitQty
    
                let product = await Product.findOne({
                    where: {
                        ProductCode: entry.ProductCode
                    }
                }, {transaction: transaction});

                if(!product) {
                    throw new Error(t('ctr.product.code_not_exists'));
                }

                let Qty = helper.unitQty(LargeUnitQty, SmallUnitQty, product)
                
                await Inventory.upsert({
                    ProductCode : entry.ProductCode,
                    ExpiryDate  : entry.ExpiryDate,
                    LargeUnitQty: Qty.LargeUnitQty,
                    SmallUnitQty: Qty.SmallUnitQty,
                }, {
                    transaction: transaction,
                    conflictFields: ['ProductCode', 'ExpiryDate']
                });
            }
        }
    }
});

Product.hasMany(Entry, { foreignKey: 'ProductCode', sourceKey: 'ProductCode', as: 'entries' });
Entry.belongsTo(Product, { foreignKey: 'ProductCode', targetKey: 'ProductCode', as: 'product' });

WarehouseEntry.hasMany(Entry, { foreignKey: 'EntryCode', sourceKey: 'EntryCode', as: 'entries' });
Entry.belongsTo(WarehouseEntry, { foreignKey: 'EntryCode', targetKey: 'EntryCode', as: 'warehouseEntry' });

Entry.hasMany(Entry, { foreignKey: 'ProductCode', sourceKey: 'ProductCode', as: 'products' });
// Entry.hasMany(Entry, { foreignKey: 'EntryDate', sourceKey: 'EntryDate', as: 'dates' });
// Entry.hasMany(Entry, { foreignKey: 'EntryCode', sourceKey: 'EntryCode', as: 'codes' });

export default Entry;
