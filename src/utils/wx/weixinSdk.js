
import wx from 'weixin-js-sdk';
import CryptoJS from 'crypto-js';
import { getAccessTokenService, getTicketService } from "@/services/wx"
let accessTokenTimer = null
let ticketTimer = null

// 定义 SHA-1 加密函数
function sha1 (str) {
    return CryptoJS.SHA1(str).toString();
}



// 获取accessToken
export function getAccessToken (isExpiration = false) {
    if (!isExpiration && window.localStorage.getItem('accessToken')) {
        return Promise.resolve(window.localStorage.getItem('accessToken'))
    }
    clearInterval(accessTokenTimer);
    accessTokenTimer = null;
    // 判断当前acssess
    return getAccessTokenService().then(res => {
        if (res?.access_token) {
            window.localStorage.setItem('accessToken', res.access_token)
            accessTokenTimer = setInterval(() => {
                getAccessTokenService()
            }, (res?.expires_in || 7200) * 1000)
            return res.access_token
        } else {
            return ''
        }
    })
}

// access_token生成票
export function getTicket () {
    if (window.localStorage.getItem('ticket')) {
        return Promise.resolve(window.localStorage.getItem('ticket'))
    }
    let accessToken = window.localStorage.getItem('accessToken');
    if (!accessToken) {
        return getAccessToken(true).then(() => {
            getTicket()
        })
    }
    clearInterval(ticketTimer);
    ticketTimer = null;
    getTicketService(accessToken).then(res => {
        if (res?.ticket) {
            window.localStorage.setItem('ticket', res.ticket)
            ticketTimer = setInterval(() => {
                window.localStorage.removeItem('ticket')
                window.localStorage.removeItem('accessToken')
                getTicket()
            }, (res?.expires_in || 7200) * 1000)
            return res.access_token
        } else {
            return ''
        }
    })

}

// 生成签名
export function getSign () {
    let ticket = window.localStorage.getItem('ticket')
    if (!ticket) {
        return getTicket().then(() => {
            return getSign()
        })
    }
    const nonceStr = Math.random().toString(36).substr(2, 15); // 随机字符串
    const timestamp = Math.floor(Date.now() / 1000); // 当前时间戳（秒）
    let url = window.location.href.replace(/\#.+[^\s]/, '')
    let str = `jsapi_ticket=${ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`
    let sha1Str = sha1(str)
    return Promise.resolve({
        nonceStr: nonceStr,
        timestamp: timestamp,
        signature: sha1Str,
        appId: import.meta.env.VITE_APP_AppSecret
    })
}


// 初始化wx 对象
export function initWeixinSdk (config) {
    return new Promise((resolve, reject) => {
        getSign().then(res => {
            wx.config({
                debug: config.debug || false, // 开启调试模式
                jsApiList: config.jsApiList || [],
                appId: res.appId,
                timestamp: res.timestamp, // 时间戳
                nonceStr: res.nonceStr, // 随机字符串
                signature: res.signature, // 签名
            });

            wx.ready(() => {
                console.log('Weixin SDK initialized');
                resolve(wx);
            });

            wx.error((error) => {
                console.error('Weixin SDK initialization error:', error);
                reject(error);
            });
        })

    });
}


// 判断当前客户端版本是否支持指定JS接口

export function isCheckJsApi (list = ['chooseImage']) {
    let wx = window.app.config.globalProperties.wx
    if (wx) {
        wx.checkJsApi({
            jsApiList: list, // 需要检测的JS接口列表，所有JS接口列表见附录2,
            success: function (res) {
                // 以键值对的形式返回，可用的api值true，不可用为false
                // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
            }
        });
    }
}