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

// Sale off migration
import { create_sale_off_products } from './20250510123456_create_sale_off_products_table'
import { create_sale_staffs } from './20250510123457_create_sale_staffs_table'
import { create_delivery_staffs } from './20250510123458_create_delivery_staffs_table'
import { create_customers } from './20250510123459_create_customers_table'
import { create_sale_off_orders } from './20250510123460_create_sale_off_orders_table'
import { create_sale_off_order_items } from './20250510123461_create_sale_off_order_items_table'
import { create_sale_off_routes } from './20250510123461_create_sale_off_routes_table'
import { create_sale_off_order_stock_ins } from './20250510123462_create_sale_off_stock_ins_table'
import { create_sale_off_stock_in_items } from './20250510123463_create_sale_off_stock_in_items_table'
import { create_sale_off_stocks } from './20250510123464_create_sale_off_stocks_table'
import { create_sale_customers } from './20250608123456_create_sale_staffs_customer_table'

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

    // Sale off migration
    create_sale_off_products,
    create_sale_staffs,
    create_delivery_staffs,
    create_customers,
    create_sale_off_orders,
    create_sale_off_order_items,
    create_sale_off_routes,
    create_sale_off_order_stock_ins,
    create_sale_off_stock_in_items,
    create_sale_off_stocks,
    create_sale_customers,
]

export const migrator = new Umzug({
    migrations: migrations,
    storage: new SequelizeStorage({ sequelize }),
    context: sequelize.getQueryInterface(),
    logger: console,
});