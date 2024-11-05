import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'

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
    next()
})


export default router
