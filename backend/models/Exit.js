import sequelize from './index';
import Product from './Product';
import WarehouseExit from './WarehouseExit';
import Inventory from './Inventory';
import { t } from '../../src/renderer/i18n'
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
});

Product.hasMany(Exit, { foreignKey: 'ProductCode', sourceKey: 'ProductCode', as: 'exits' });
Exit.belongsTo(Product, { foreignKey: 'ProductCode', targetKey: 'ProductCode', as: 'product' });

WarehouseExit.hasMany(Exit, { foreignKey: 'ExitCode', sourceKey: 'ExitCode', as: 'exits' });
Exit.belongsTo(WarehouseExit, { foreignKey: 'ExitCode', targetKey: 'ExitCode', as: 'warehouseExit' });

Exit.afterCreate(async (exit, options) => {
    const transaction = options.transaction

    let inventory = await Inventory.findOne({
        where: {
            ProductCode: exit.ProductCode,
            ExpiryDate: exit.ExpiryDate,
        }
    }, {transaction: transaction})

    if(!inventory) {
        throw new Error(t('ctr.exit.code_not_exists'));
    }
    
    inventory.LargeUnitQty -= exit.LargeUnitQty
    inventory.SmallUnitQty -= exit.SmallUnitQty

    if(inventory.LargeUnitQty < 0 || inventory.SmallUnitQty < 0) {
        throw new Error(t('ctr.exit.many_qty'));
    }

    await inventory.save({transaction: transaction})
})

export default Exit;
