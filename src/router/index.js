import Vue from 'vue'
import VueRouter from 'vue-router'
import home from '../views/Home.vue'
import {getAuth} from '@/firebase'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: home,
    meta: {
      needsUser: false,
    },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    meta: {
      needsUser: true,
    },
    component: () => import(/* webpackChunkName: "about" */ '../views/Dashboard.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import(/* webpackChunkName: "about" */ '../views/Login.vue')
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import(/* webpackChunkName: "about" */ '../views/Signup.vue')
  },
  {
    path: '/settings',
    name: 'settings',
    meta: {
      needsUser: true,
    },
    component: () => import(/* webpackChunkName: "about" */ '../views/Settings.vue')
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

// poziva se prije promjene svake rute
// pogleda gdje smo i gdje idemo i next se pokrece ako dozvolimo
router.beforeEach( (to, from, next) => {
  
  const user = getAuth().currentUser

  if(!user && to.meta.needsUser){
    next("/");
  }else if (user && !to.meta.needsUser) {
    next("/dashboard");
  } else {
    next();
  }
  
})

export default router