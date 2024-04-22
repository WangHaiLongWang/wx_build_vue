import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { loadCookie, loadStorage, removeStorage, saveCookie } from '@/utils/cache'
import { ACCESS_TOKEN, LOGIN_STATUS, USER_INFO, NODE_ENV } from '@/utils/constants'

export const useUserStore = defineStore('user', {
    state: () => {
        return {
            loginStatus: Number(loadCookie(LOGIN_STATUS, '0')),
            accessToken: loadStorage(ACCESS_TOKEN, ''),
            userInfo: loadStorage(USER_INFO, { username: '' })
        }
    },
    actions: {
        setLoginStatus (loginStatusData) {
            if ((loginStatusData === 0 || loginStatusData === 1) && NODE_ENV === 'production') {
                removeStorage(ACCESS_TOKEN)
                removeStorage(USER_INFO)
            }
            this.loginStatus = saveCookie(LOGIN_STATUS, String(loginStatusData), { expires: 7 })
        },
        setUserInfo (userInfoData) {
            this.userInfo = saveStorage(USER_INFO, userInfoData)
        },
        setAccessToken (accessTokenData) {
            this.accessToken = saveStorage(ACCESS_TOKEN, accessTokenData)
        }
    }
}
)
