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
    meta: { 
      requiresAuth: true,
      title: 'MHP File Transfer'
    }
  },
  {
    path: '/download/:id',
    name: 'Download',
    component: Download,
    meta: {
      title: 'MHP File Transfer'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: 'Login - MHP File Transfer'
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: {
      title: 'Register - MHP File Transfer'
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  if (to.meta && to.meta.title) {
    document.title = to.meta.title;
  }
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
