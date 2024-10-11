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
                path: '/products',
                name: 'Products',
                component: () => import("@/views/products/ProductIndex.vue"),
            },
            {
                path: '/import',
                name: 'Import',
                component: () => import("@/views/import/ImportIndex.vue"),
            },
            {
                path: '/export',
                name: 'Export',
                component: () => import("@/views/export/exportIndex.vue"),
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
