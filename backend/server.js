import sequelize from './models/index';
import UserRoutes from './routes/UserRoutes';
import ProductRoutes from './routes/ProductRoutes';

const express = require('express');
const cors = require('cors');

var server = express();

// Enable CORS (Cross-Origin Resource Sharing)
server.use(cors());
server.use(express.json());  // For parsing application/json

/**
 * Define router
 */
server.use('/users', UserRoutes);
server.use('/products', ProductRoutes);

sequelize.sync({ force: false }).then(() => {
});

server.reload = () => {
    server = express()
    server.use(cors());
    server.use(express.json());  // For parsing application/json

    /**
     * Define router
     */
    server.use('/users', UserRoutes);
    server.use('/products', ProductRoutes);

    sequelize.sync({ force: false }).then(() => {
    });
    return server
}

export default server;
