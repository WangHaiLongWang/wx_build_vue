import axios from 'axios'
import {
    handleChangeRequestHeader,
    handleConfigureAuth,
    handleAuthError,
    handleGeneralError,
    handleNetworkError
} from './tools'

// axios.interceptors.request.use((config) => {
//     config = handleChangeRequestHeader(config)
//     config = handleConfigureAuth(config)
//     return config
// })


// axios.interceptors.response.use(
//     (response) => {
//         debugger;
//         if (response.status !== 200) return Promise.reject(response.data)
//         handleAuthError(response.data.errno)
//         handleGeneralError(response.data.errno, response.data.errmsg)
//         return response
//     },
//     (err) => {
//         handleNetworkError(err.response.status)
//         Promise.reject(err.response)
//     }
// )

export const Get = (url, data = {}, clearFn) => {
    let headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    }
    data.headers = {
        ...data?.headers,
        ...headers
    }
    return new Promise((resolve) => {
        axios
            .get(url, data)
            .then((result) => {
                let res;
                if (clearFn !== undefined) {
                    res = clearFn(result.data)
                } else {
                    res = result.data
                }
                resolve(res)
            })
            .catch((err) => {
                resolve(err)
            })
    })
}


export const Post = (url, data, params = {}) => {
    return new Promise((resolve) => {
        axios
            .post(url, data, params)
            .then((result) => {
                resolve(result.data)
            })
            .catch((err) => {
                resolve(err)
            })
    })
}

