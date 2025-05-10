import ProductRoutes from './routes/ProductRoutes';
import EntryRoutes from './routes/EntryRoutes';
import ExitRoutes from './routes/ExitRoutes';
import InventoryRoutes from './routes/InventoryRoutes';
import CompareRoutes from './routes/CompareRoutes';
import StickyNoteRoutes from './routes/StickyNoteRoutes';
import SaleOffRoutes from './routes/SaleOffRoutes';
import { migrator } from './migrations';
const express = require('express');
const cors = require('cors');

/**
 * sever setup
 */
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
server.use('/compares', CompareRoutes);
server.use('/sticky-note', StickyNoteRoutes);
server.use('/sale-off', SaleOffRoutes);

/**
 * Migration
 */
const runMigrations = async () => {
    try {
        await migrator.up();
        console.log('Migrations executed successfully!');
    } catch (error) {
        console.error('Error executing migrations:', error);
    }
};
runMigrations();


export default server;
