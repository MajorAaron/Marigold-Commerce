import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabase'

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

router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !session) {
    next('/login')
  } else if (session && (to.path === '/login' || to.path === '/register')) {
    next('/')
  } else {
    next()
  }
})

export default router