import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
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
                path: '/inventory',
                name: 'Inventory',
                component: () => import("@/views/inventory/InventoryIndex.vue"),
            },
            {
                path: '/inventory-total',
                name: 'InventoryTotal',
                component: () => import("@/views/inventory/InventoryTotal.vue"),
            },
            {
                path: '/products',
                name: 'Products',
                component: () => import("@/views/products/ProductIndex.vue"),
            },
            {
                path: '/entry',
                name: 'Entry',
                component: () => import("@/views/entry/EntryIndex.vue"),
            },
            {
                path: '/exit',
                name: 'Exit',
                component: () => import("@/views/exit/ExitIndex.vue"),
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
    history: createWebHistory(),
    routes,
})

router.beforeEach(async (to, from, next) => {
    next()
})


export default router
