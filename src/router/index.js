import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Lazy-loaded components
const LoginView = () => import('../views/LoginView.vue')
const RegisterView = () => import('../views/RegisterView.vue')
const DashboardView = () => import('../views/DashboardView.vue')
const WhiteboardView = () => import('../views/WhiteboardView.vue')
const JoinView = () => import('../views/JoinView.vue')
const NotFoundView = () => import('../views/NotFoundView.vue')

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/whiteboard/:roomId',
    name: 'whiteboard',
    component: WhiteboardView,
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/join',
    name: 'join',
    component: JoinView,
    meta: { requiresAuth: false }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !authStore.isLoggedIn) {
    next('/login')
  } else if (!requiresAuth && authStore.isLoggedIn && (to.name === 'login' || to.name === 'register')) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
