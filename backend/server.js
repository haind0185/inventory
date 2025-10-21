import ProductRoutes from './routes/ProductRoutes';
import EntryRoutes from './routes/EntryRoutes';
import ExitRoutes from './routes/ExitRoutes';
import InventoryRoutes from './routes/InventoryRoutes';
import AgentRoutes from './routes/AgentRoutes';
import VRPRoutes from './routes/VRPRoutes';
import CompareRoutes from './routes/CompareRoutes';
import StickyNoteRoutes from './routes/StickyNoteRoutes';
import SaleOffRoutes from './routes/SaleOffRoutes';
import MasterRoutes from './routes/MasterRoutes';
import { migrator } from './migrations';
const express = require('express');
const cors = require('cors');

/**
 * sever setup
 */
var server = express();

// Enable CORS (Cross-Origin Resource Sharing)
server.use(cors());
server.use(express.json({ limit: '10mb' })); // Tăng giới hạn lên 10MB
server.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Define router
 */
server.use('/products', ProductRoutes);
server.use('/entries', EntryRoutes);
server.use('/exits', ExitRoutes);
server.use('/inventory', InventoryRoutes);
server.use('/agents', AgentRoutes);
server.use('/vrp', VRPRoutes);
server.use('/compares', CompareRoutes);
server.use('/sticky-note', StickyNoteRoutes);
server.use('/sale-off', SaleOffRoutes);
server.use('/master', MasterRoutes);

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
