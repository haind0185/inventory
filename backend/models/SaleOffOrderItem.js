import sequelize from './index';
import SaleOffOrder from './SaleOffOrder';
import SaleStaff from './SaleStaff';
import Customer from './Customer';
import SaleOffProduct from './SaleOffProduct';
const { DataTypes } = require('sequelize');

const SaleOffOrderItem = sequelize.define('SaleOffOrderItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
    },
    OrderCode: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: SaleOffOrder,
            key: 'OrderCode',
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
});

SaleOffOrder.hasMany(SaleOffOrderItem, { foreignKey: 'OrderCode', sourceKey: 'OrderCode', as: 'saleOffOrderItems' });
SaleOffOrderItem.belongsTo(SaleOffOrder, { foreignKey: 'OrderCode', targetKey: 'OrderCode', as: 'saleOffOrder' });

SaleStaff.hasMany(SaleOffOrderItem, { foreignKey: 'SaleStaffId', sourceKey: 'id', as: 'saleOffOrderItems' });
SaleOffOrderItem.belongsTo(SaleStaff, { foreignKey: 'SaleStaffId', targetKey: 'id', as: 'saleStaff' });

Customer.hasMany(SaleOffOrderItem, { foreignKey: 'CustomerCode', sourceKey: 'CustomerCode', as: 'saleOffOrderItems' });
SaleOffOrderItem.belongsTo(Customer, { foreignKey: 'CustomerCode', targetKey: 'CustomerCode', as: 'customer' });

SaleOffProduct.hasMany(SaleOffOrderItem, { foreignKey: 'ProductCode', sourceKey: 'ProductCode', as: 'saleOffOrderItems' });
SaleOffOrderItem.belongsTo(SaleOffProduct, { foreignKey: 'ProductCode', targetKey: 'ProductCode', as: 'saleOffProduct' });

export default SaleOffOrderItem;
