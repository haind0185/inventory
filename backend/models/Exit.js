import sequelize from './index';
import Product from './Product';
import WarehouseExit from './WarehouseExit';
import Inventory from './Inventory';
import { t } from '../../src/renderer/i18n'
import { helper } from '../../src/renderer/helper'
const { DataTypes } = require('sequelize');

const Exit = sequelize.define('Exit', {
    ExitCode: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: WarehouseExit,
            key: 'ExitCode',
        },
    },
    ExitDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    ExitType: {
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
        defaultValue: 0,
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
});

Product.hasMany(Exit, { foreignKey: 'ProductCode', sourceKey: 'ProductCode', as: 'exits' });
Exit.belongsTo(Product, { foreignKey: 'ProductCode', targetKey: 'ProductCode', as: 'product' });

WarehouseExit.hasMany(Exit, { foreignKey: 'ExitCode', sourceKey: 'ExitCode', as: 'exits' });
Exit.belongsTo(WarehouseExit, { foreignKey: 'ExitCode', targetKey: 'ExitCode', as: 'warehouseExit' });

Exit.hasMany(Exit, { foreignKey: 'ProductCode', sourceKey: 'ProductCode', as: 'products' });

export default Exit;
