import sequelize from './index';
import SaleOffStockIn from './SaleOffStockIn';
import SaleOffProduct from './SaleOffProduct';
import SaleOffStock from './SaleOffStock';
const { DataTypes } = require('sequelize');

const SaleOffStockInItem = sequelize.define('SaleOffStockInItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
    },
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
                        ProductCode: entry.ProductCode,
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
