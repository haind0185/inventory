import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import { store } from '@/store'

const routes = [
    {
        path: '',
        redirect: '/dashboard',
        component: () => import("@/views/layouts/Master.vue"),
        meta: {
            requiresAuth: true,
        },
        children: [
            {
                path: '/dashboard',
                name: 'Dashboard',
                component: () => import("@/views/dashboard/DashboardIndex.vue"),
            },
            {
                path: '/compare',
                name: 'Compare',
                component: () => import("@/views/compare/CompareIndex.vue"),
            },
            {
                path: '/products',
                name: 'Products',
                component: () => import("@/views/products/ProductIndex.vue"),
            },
            {
                path: '/',
                name: 'Inventories',
                children: [
                    {
                        path: '/inventory',
                        name: 'Inventory',
                        component: () => import("@/views/inventory/InventoryIndex.vue"),
                    },
                    {
                        path: '/inventory/total',
                        name: 'InventoryTotal',
                        component: () => import("@/views/inventory/InventoryTotal.vue"),
                    },
                    {
                        path: '/inventory/product',
                        name: 'InventoryProduct',
                        component: () => import("@/views/inventory/InventoryProduct.vue"),
                    },
                    {
                        path: '/inventory/safety-stock',
                        name: 'InventorySafetyStock',
                        component: () => import("@/views/inventory/InventorySafetyStock.vue"),
                    },
                ]
            },
            {
                path: '/',
                name: 'Entries',
                children: [
                    {
                        path: '/entry',
                        name: 'Entry',
                        component: () => import("@/views/entry/EntryIndex.vue"),
                    },
                    {
                        path: '/entry/product-expiry',
                        name: 'EntryProductExpiry',
                        component: () => import("@/views/entry/EntryProductExpiry.vue"),
                    },
                    {
                        path: '/entry/product',
                        name: 'EntryProduct',
                        component: () => import("@/views/entry/EntryProduct.vue"),
                    },
                    {
                        path: '/entry/date',
                        name: 'EntryDate',
                        component: () => import("@/views/entry/EntryDate.vue"),
                    },
                ]
            },
            {
                path: '/',
                name: 'Exits',
                children: [
                    {
                        path: '/exit',
                        name: 'Exit',
                        component: () => import("@/views/exit/ExitIndex.vue"),
                    },
                    {
                        path: '/exit/product',
                        name: 'ExitProduct',
                        component: () => import("@/views/exit/ExitProduct.vue"),
                    },
                    {
                        path: '/exit/date',
                        name: 'ExitDate',
                        component: () => import("@/views/exit/ExitDate.vue"),
                    },
                ]
            },
            {
                path: '/',
                name: 'sale-off',
                children: [
                    {
                        path: 'product',
                        name: 'SaleOffProduct',
                        component: () => import("@/views/saleOff/product/SaleOffProductIndex.vue"),
                    },
                    {
                        path: 'sale-staff',
                        name: 'SaleStaff',
                        component: () => import("@/views/saleOff/saleStaff/SaleStaffIndex.vue"),
                    },
                    {
                        path: 'delivery-staff',
                        name: 'DeliveryStaff',
                        component: () => import("@/views/saleOff/deliveryStaff/DeliveryStaffIndex.vue"),
                    },
                    {
                        path: 'customer',
                        name: 'Customer',
                        component: () => import("@/views/saleOff/customer/CustomerIndex.vue"),
                    },
                ]
            },
            {
                path: '/errors',
                children: [
                    {
                        path: '/errors/401',
                        name: 'Unauthorize',
                        component: () => import("@/views/errors/401Unauthorized.vue"),
                    },
                ],
            },
            {
                path: '/:pathMatch(.*)*',
                name: "NotFound",
                redirect: '/dashboard',
                component: () => import("@/views/errors/404NotFound.vue"),
            },
        ]
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

router.beforeEach(async (to, from, next) => {
    store.closePageSearch()
    next()
})


export default router
