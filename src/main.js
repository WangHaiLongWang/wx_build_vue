import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { setupWechatAuth } from '@/configs/wechatAuth'
import { initWeixinSdk } from "@/utils/wx/weixinSdk"


import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
setupWechatAuth(app) // wechat auth

initWeixinSdk({
    debug: true, // 开启调试模式
    appId: import.meta.env.VITE_APP_AppSecret,
    timestamp: '', // 时间戳
    nonceStr: '',  // 随机字符串
    signature: '', // 签名
    jsApiList: ['checkJsApi', 'chooseImage', 'scanQRCode', 'getNetworkType'] // 需要使用的 API 列表
}).then((wx) => {
    // 初始化成功，可以使用 wx 对象调用微信 SDK 提供的方法
    console.log('Weixin SDK ready:', wx);
    app.config.globalProperties.wx = wx
}).catch((error) => {
    console.error('Failed to initialize Weixin SDK:', error);
});

window.app = app;

app.mount('#app')
