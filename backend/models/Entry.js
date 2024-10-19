import sequelize from './index';
import Product from './Product';
import WarehouseEntry from './WarehouseEntry';
import Inventory from './Inventory';
import { t } from '../../src/renderer/i18n'
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
    
                if(SmallUnitQty > 0) {
                    let product = await Product.findOne({
                        where: {
                            ProductCode: entry.ProductCode
                        }
                    }, {transaction: transaction});
    
                    if(!product) {
                        throw new Error(t('ctr.product.code_not_exists'));
                    }
    
                    if(!product.SmallUnit || product.ConversionRate <= 0) {
                        throw new Error(t('ctr.product.not_have_conversion_rate'));
                    }
    
                    if(SmallUnitQty > product.ConversionRate) {
                        LargeUnitQty += Math.floor(SmallUnitQty / product.ConversionRate)
                        SmallUnitQty = SmallUnitQty % product.ConversionRate
                    }
                }
    
                await Inventory.upsert({
                    ProductCode : entry.ProductCode,
                    ExpiryDate  : entry.ExpiryDate,
                    LargeUnitQty: LargeUnitQty,
                    SmallUnitQty: SmallUnitQty,
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

// Entry.afterCreate(async (entry, options) => {
//     const transaction = options.transaction

//     let inventory = await Inventory.findOne({
//         where: {
//             ProductCode: entry.ProductCode,
//             ExpiryDate: entry.ExpiryDate,
//         }
//     }, {transaction: transaction})

//     let LargeUnitQty = (inventory?.LargeUnitQty ?? 0) + entry.LargeUnitQty
//     let SmallUnitQty = (inventory?.SmallUnitQty ?? 0) + entry.SmallUnitQty

//     if(SmallUnitQty > 0) {
//         let product = await Product.findOne({
//             where: {
//                 ProductCode: entry.ProductCode
//             }
//         }, {transaction: transaction});

//         if(!product) {
//             throw new Error(t('ctr.product.code_not_exists'));
//         }

//         if(!product.SmallUnit || product.ConversionRate <= 0) {
//             throw new Error(t('ctr.product.not_have_conversion_rate'));
//         }

//         if(SmallUnitQty > product.ConversionRate) {
//             LargeUnitQty += Math.floor(SmallUnitQty / product.ConversionRate)
//             SmallUnitQty = SmallUnitQty % product.ConversionRate
//         }
//     }

//     await Inventory.upsert({
//         ProductCode : entry.ProductCode,
//         ExpiryDate  : entry.ExpiryDate,
//         LargeUnitQty: LargeUnitQty,
//         SmallUnitQty: SmallUnitQty,
//     }, {transaction: transaction, conflictFields: ['ProductCode', 'ExpiryDate']}).then((res) => {
//         console.log(res)
//     }).catch((error) => {
//         console.log(error)
//     })
// })

export default Entry;
