import { createRouter, createWebHashHistory } from 'vue-router'
import Upload from '../views/Upload.vue'
import Download from '../views/Download.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue';
import { Auth } from 'aws-amplify';

const routes = [
  {
    path: '/',
    name: 'Upload',
    component: Upload,
    meta: { requiresAuth: true }
  },
  {
    path: '/download/:id',
    name: 'Download',
    component: Download
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    try {
      await Auth.currentSession();
      next();
      return;
    } catch (e) {
      next('/login');
    }
  } else {
    next();
  }
})

export default router
