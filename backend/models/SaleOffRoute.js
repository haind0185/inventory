import sequelize from './index';
import DeliveryStaff from './DeliveryStaff';
const { DataTypes } = require('sequelize');

const SaleOffRoute = sequelize.define('SaleOffRoute', {
    OrderCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    RouteNote: {
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

DeliveryStaff.hasMany(SaleOffRoute, { foreignKey: 'DeliveryStaffId1', sourceKey: 'id', as: 'saleOfOrders1' });
DeliveryStaff.hasMany(SaleOffRoute, { foreignKey: 'DeliveryStaffId2', sourceKey: 'id', as: 'saleOfOrders2' });
DeliveryStaff.hasMany(SaleOffRoute, { foreignKey: 'DeliveryStaffId3', sourceKey: 'id', as: 'saleOfOrders3' });

SaleOffRoute.belongsTo(DeliveryStaff, { foreignKey: 'DeliveryStaffId1', targetKey: 'id', as: 'deliveryStaff1' });
SaleOffRoute.belongsTo(DeliveryStaff, { foreignKey: 'DeliveryStaffId2', targetKey: 'id', as: 'deliveryStaff2' });
SaleOffRoute.belongsTo(DeliveryStaff, { foreignKey: 'DeliveryStaffId3', targetKey: 'id', as: 'deliveryStaff3' });

export default SaleOffRoute;
