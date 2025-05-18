import sequelize from './index';
import SaleOffStockIn from './SaleOffStockIn';
import SaleOffProduct from './SaleOffProduct';
import SaleOffStock from './SaleOffStock';
import { helper } from '../../src/renderer/helper'
const { DataTypes } = require('sequelize');

const SaleOffStockInItem = sequelize.define('SaleOffStockInItem', {
    StockInCode: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: SaleOffStockIn,
            key: 'StockInCode',
        },
    },
    StockInItemNote: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    ProductCode: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: SaleOffProduct,
            key: 'ProductCode',
        },
    },
    LargeUnitQty: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    SmallUnitQty: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },

    Price: {
        type: DataTypes.VIRTUAL,
        get() { 
            if(!this.saleOffProduct) return 0
            return this.saleOffProduct.Price
        }
    },
    Qty: {
        type: DataTypes.VIRTUAL,
        get() {
            if(!this.saleOffProduct) return 0
            return helper.unitQtyTransfer(this.LargeUnitQty, this.SmallUnitQty, this.saleOffProduct)
        }
    },
    PriceQty: {
        type: DataTypes.VIRTUAL,
        get() {
            if(!this.saleOffProduct) return 0
            let Qty = helper.unitQtyTransfer(this.LargeUnitQty, this.SmallUnitQty, this.saleOffProduct)
            return Qty * this.Price
        }
    },
}, {
    hooks: {
        afterBulkCreate: async (instances, options) => {
            const transaction = options.transaction

            let items = []
            for (const item of instances) {
                let key = `${item.ProductCode}`
                if(items[key]) {
                    items[key].LargeUnitQty += item.LargeUnitQty
                    items[key].SmallUnitQty += item.SmallUnitQty
                } else {
                    items[key] = item
                }
            }
            
            for (const i in items) {
                let item = items[i]
                let stock = await SaleOffStock.findOne({
                    where: {
                        ProductCode: item.ProductCode,
                    }
                }, {transaction: transaction});

                let LargeUnitQty = (stock?.LargeUnitQty ?? 0) + item.LargeUnitQty
                let SmallUnitQty = (stock?.SmallUnitQty ?? 0) + item.SmallUnitQty
    
                let product = await SaleOffProduct.findOne({
                    where: {
                        ProductCode: item.ProductCode
                    }
                }, {transaction: transaction});

                if(!product) {
                    throw new Error(`Mã sản phẩm không tồn tại: ${item.ProductCode}`);
                }

                let Qty = helper.unitQty(LargeUnitQty, SmallUnitQty, product)
                
                await SaleOffStock.upsert({
                    ProductCode : item.ProductCode,
                    LargeUnitQty: Qty.LargeUnitQty,
                    SmallUnitQty: Qty.SmallUnitQty,
                }, {
                    transaction: transaction,
                    conflictFields: ['ProductCode']
                });
            }
        }
    }
});

SaleOffStockIn.hasMany(SaleOffStockInItem, { foreignKey: 'StockInCode', sourceKey: 'StockInCode', as: 'saleOffStockInItems' });
SaleOffStockInItem.belongsTo(SaleOffStockIn, { foreignKey: 'StockInCode', targetKey: 'StockInCode', as: 'saleOffStockIn' });

SaleOffProduct.hasMany(SaleOffStockInItem, { foreignKey: 'ProductCode', sourceKey: 'ProductCode', as: 'saleOffStockInItems' });
SaleOffStockInItem.belongsTo(SaleOffProduct, { foreignKey: 'ProductCode', targetKey: 'ProductCode', as: 'saleOffProduct' });

export default SaleOffStockInItem;
