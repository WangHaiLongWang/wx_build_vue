import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { parse, stringify } from 'qs'
import { useUserStore } from "@/stores/user";

import { storeToRefs } from 'pinia'
import vueWechatAuth from '@/plugins/vueWechatAuth'

const router = createRouter({
    history: createWebHistory(import.meta.envBASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/about',
            name: 'about',
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import('../views/AboutView.vue')
        }
    ]
})

router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore()
    const { loginStatus } = storeToRefs(userStore)
    switch (loginStatus.value) {
        case 0:
            vueWechatAuth.redirectUri = processUrl()
            await userStore.setLoginStatus(1)
            window.location.href = vueWechatAuth.authUrl
            break
        case 1:
            try {
                vueWechatAuth.returnFromWechat(to.fullPath)
                await processLogin(vueWechatAuth.code)
                next()
            } catch (err) {
                await userStore.setLoginStatus(0)
                next()
            }
            break
        case 2:
            next()
            break
    }
})

/**
 * 处理url链接
 */
function processUrl () {
    const url = window.location.href
    // 解决多次登录url添加重复的code与state问题
    const params = parse(url.split('?')[1])
    let redirectUrl = url
    if (params.code && params.state) {
        delete params.code
        delete params.state
        const query = stringify(params)
        if (query.length) {
            redirectUrl = `${url.split('?')[0]}?${query}`
        } else {
            redirectUrl = `${url.split('?')[0]}`
        }
    }
    return redirectUrl
}

/**
 * 处理登录
 * @param code
 */
function processLogin (code) {
    const userStore = useUserStore()
    const data = { code }
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
        try {
            const { userInfo, accessToken } = await CommonServer.login(data)
            await userStore.setLoginStatus(2)
            await userStore.setAccessToken(accessToken)
            await userStore.setUserInfo(userInfo)
            resolve({ status: 1, data: '登录成功' })
        } catch (err) {
            reject(err)
        }
    })
}

export default router
