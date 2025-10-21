import sequelize from './index';
import SaleOffOrder from './SaleOffOrder';
import SaleStaff from './SaleStaff';
import Customer from './Customer';
import SaleOffProduct from './SaleOffProduct';
import SaleOffRoute from './SaleOffRoute';
import { helper } from '../../src/renderer/helper'
const { DataTypes } = require('sequelize');

const SaleOffOrderItem = sequelize.define('SaleOffOrderItem', {
    RouteId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: SaleOffRoute,
            key: 'id',
        },
    },
    OrderItemNote: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    SaleStaffId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: SaleStaff,
            key: 'id',
        },
    },
    CustomerCode: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Customer,
            key: 'CustomerCode',
        },
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
            return Qty * this.saleOffProduct.Price
        }
    },
});

SaleOffRoute.hasMany(SaleOffOrderItem, { foreignKey: 'RouteId', sourceKey: 'id', as: 'saleOffOrderItems' });
SaleOffOrderItem.belongsTo(SaleOffRoute, { foreignKey: 'RouteId', targetKey: 'id', as: 'saleOffRoute' });

SaleStaff.hasMany(SaleOffOrderItem, { foreignKey: 'SaleStaffId', sourceKey: 'id', as: 'saleOffOrderItems' });
SaleOffOrderItem.belongsTo(SaleStaff, { foreignKey: 'SaleStaffId', targetKey: 'id', as: 'saleStaff' });

Customer.hasMany(SaleOffOrderItem, { foreignKey: 'CustomerCode', sourceKey: 'CustomerCode', as: 'saleOffOrderItems' });
SaleOffOrderItem.belongsTo(Customer, { foreignKey: 'CustomerCode', targetKey: 'CustomerCode', as: 'customer' });

SaleOffProduct.hasMany(SaleOffOrderItem, { foreignKey: 'ProductCode', sourceKey: 'ProductCode', as: 'saleOffOrderItems' });
SaleOffOrderItem.belongsTo(SaleOffProduct, { foreignKey: 'ProductCode', targetKey: 'ProductCode', as: 'saleOffProduct' });

export default SaleOffOrderItem;
