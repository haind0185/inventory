import sequelize from './models/index';
import ProductRoutes from './routes/ProductRoutes';
import EntryRoutes from './routes/EntryRoutes';
import ExitRoutes from './routes/ExitRoutes';
import InventoryRoutes from './routes/InventoryRoutes';

const express = require('express');
const cors = require('cors');

var server = express();

// Enable CORS (Cross-Origin Resource Sharing)
server.use(cors());
server.use(express.json());  // For parsing application/json

/**
 * Define router
 */
server.use('/products', ProductRoutes);
server.use('/entries', EntryRoutes);
server.use('/exits', ExitRoutes);
server.use('/inventory', InventoryRoutes);

sequelize.sync({ force: false }).then(async () => {
    const queryInterface = sequelize.getQueryInterface();
    const query = `SELECT m.sql AS sql FROM "main".sqlite_master m WHERE m.type = 'table' AND m.name = 'Inventories'`;
    sequelize.query(query, {
        type: sequelize.QueryTypes.SELECT,
    }).then(async (columns) => {
        const constraintName = 'unique_ProductCode_ExpiryDate_constraint';
        const constraint = columns.find(c => c.sql.includes(constraintName));
        if(!constraint) {
            await queryInterface.addConstraint('Inventories', {
                    fields: ['ProductCode', 'ExpiryDate'],
                    type: 'unique',
                    name: constraintName,
            });
        }
    });
});

export default server;
