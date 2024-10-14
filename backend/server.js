import sequelize from './models/index';
import ProductRoutes from './routes/ProductRoutes';
import EntryRoutes from './routes/EntryRoutes';

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

sequelize.sync({ force: false }).then(() => {
});

export default server;
