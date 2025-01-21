import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { watch } from 'vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('../views/Home.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/products',
      component: () => import('../views/Products.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/cart',
      component: () => import('../views/Cart.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/checkout',
      component: () => import('../views/Checkout.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/order-confirmation/:id',
      component: () => import('../views/OrderConfirmation.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      component: () => import('../views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      component: () => import('../views/Register.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/orders',
      component: () => import('../views/Orders.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  
  if (authStore.loading) {
    // Wait for auth to initialize
    await new Promise<void>((resolve) => {
      const unwatch = watch(() => authStore.loading, (loading) => {
        if (!loading) {
          unwatch()
          resolve()
        }
      })
    })
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  
  if (requiresAuth && !authStore.user) {
    next('/login')
  } else {
    next()
  }
})

export default router