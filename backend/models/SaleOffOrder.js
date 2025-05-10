import sequelize from './index';
import DeliveryStaff from './DeliveryStaff';
const { DataTypes } = require('sequelize');

const SaleOffOrder = sequelize.define('SaleOffOrder', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
    },
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
    DeliveryStaffId1: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: DeliveryStaff,
            key: 'id',
        },
    },
    DeliveryStaffId2: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
            model: DeliveryStaff,
            key: 'id',
        },
    },
    DeliveryStaffId3: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
            model: DeliveryStaff,
            key: 'id',
        },
    },
});

DeliveryStaff.hasMany(SaleOffOrder, { foreignKey: 'DeliveryStaffId1', sourceKey: 'id', as: 'saleOfOrders1' });
DeliveryStaff.hasMany(SaleOffOrder, { foreignKey: 'DeliveryStaffId2', sourceKey: 'id', as: 'saleOfOrders2' });
DeliveryStaff.hasMany(SaleOffOrder, { foreignKey: 'DeliveryStaffId3', sourceKey: 'id', as: 'saleOfOrders3' });

SaleOffOrder.belongsTo(DeliveryStaff, { foreignKey: 'DeliveryStaffId1', targetKey: 'id', as: 'deliveryStaff1' });
SaleOffOrder.belongsTo(DeliveryStaff, { foreignKey: 'DeliveryStaffId2', targetKey: 'id', as: 'deliveryStaff2' });
SaleOffOrder.belongsTo(DeliveryStaff, { foreignKey: 'DeliveryStaffId3', targetKey: 'id', as: 'deliveryStaff3' });

export default SaleOffOrder;
