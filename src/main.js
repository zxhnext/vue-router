/*
 * @Author: your name
 * @Date: 2020-06-28 19:57:19
 * @LastEditTime: 2020-06-28 21:37:17
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /vue-compiler/src/main.js
 */ 
import Vue from 'vue'
import App from './App.vue'
import router from './router'

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
