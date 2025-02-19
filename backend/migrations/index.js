import sequelize from '../models'
import { create_products } from './20241025062802_create_products_table'
import { create_warehouse_entries } from './20241025102330_create_warehouse_entries_table'
import { create_entries } from './20241025103001_create_entries_table'
import { create_inventories } from './20241025104439_create_inventories_table'
import { create_warehouse_exits } from './20241025104935_create_warehouse_exits_table'
import { create_exits } from './20241025105215_create_exits_table'
import { create_warehouse_orders } from './20241025111657_create_warehouse_orders_table'
import { create_orders } from './20241025112015_create_orders_table'
import { add_note_entries } from './20250218013456_add_note_for_entries_table'
import { add_note_exits } from './20250218013457_add_note_for_exits_table'
import { create_sticky_notes } from './20250218013458_create_sticky_notes_table'
import { add_new_id_sticky_notes } from './20250219013415_add_new_id_for_sticky_notes_table'

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
    add_note_entries,
    add_note_exits,
    create_sticky_notes,
    add_new_id_sticky_notes,
]

export const migrator = new Umzug({
    migrations: migrations,
    storage: new SequelizeStorage({ sequelize }),
    context: sequelize.getQueryInterface(),
    logger: console,
});