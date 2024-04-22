import { Get } from "@/services/request";

// 公众号获取accessToken 用于调用接口
export const getAccessTokenService = () => {
    let url = `/api/cgi-bin/token`
    return Get(url, {
        params: {
            grant_type: 'client_credential',
            appid: import.meta.env.VITE_APP_APPID,
            secret: import.meta.env.VITE_APP_AppSecret,
        },
    })
}

// 公众号生成票 用于调用接口
export const getTicketService = (accessToken) => {
    let url = `/api/cgi-bin/ticket/getticket`
    return Get(url, {
        params: {
            type: 'jsapi',
            access_token: accessToken,
        },
    })
}