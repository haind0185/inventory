import sequelize from '../models'
import { create_products } from './20241025062802_create_products_table'
import { create_warehouse_entries } from './20241025102330_create_warehouse_entries_table'
import { create_entries } from './20241025103001_create_entries_table'
import { create_inventories } from './20241025104439_create_inventories_table'
import { create_warehouse_exits } from './20241025104935_create_warehouse_exits_table'
import { create_exits } from './20241025105215_create_exits_table'
import { create_warehouse_orders } from './20241025111657_create_warehouse_orders_table'
import { create_orders } from './20241025112015_create_orders_table'
import { create_agents } from './20241208150355_create_agents_table'
import { create_vehicles } from './20241208153814_create_vehicles_table'

import { create_vrps } from './20241210190855_create_vrps_table'
import { create_vrp_routes } from './20241210191188_create_vrp_routes_table'
import { create_vrp_unassigneds } from './20241210191953_create_vrp_unassigneds_table'

const { Umzug, SequelizeStorage } = require('umzug');

const migrations = [
    create_products,
    create_warehouse_entries,
    create_entries,
    create_inventories,
    create_warehouse_exits,
    create_exits,
    create_warehouse_orders,
    create_orders,
    create_agents,
    create_vehicles,
    create_vrps,
    create_vrp_routes,
    create_vrp_unassigneds,
]

export const migrator = new Umzug({
    migrations: migrations,
    storage: new SequelizeStorage({ sequelize }),
    context: sequelize.getQueryInterface(),
    logger: console,
});