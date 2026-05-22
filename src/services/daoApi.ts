import axios from 'axios'
import type { LoginParams, LoginResponse, UserDetailResponse, ScoreRewardResponse } from '@/types'

const daoClient = axios.create({
  baseURL: import.meta.env.VITE_DAO_BASE_URL || '/api/dao',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
// daoClient.interceptors.request.use((config) => {
//   const token = sessionStorage.getItem('dao_token')
//   if (token) {
//     config.headers.Authorization = token
//   }
//   return config
// })

const FIXED_COOKIE = '7b8M711h0qh4W7gFkWgTuQX0EwJsDJl1EOjUVRCd'
const FIXED_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0'
const FIXED_CAPTCHA = 'eyJjZXJ0aWZ5SWQiOiJGUkd3M1RGZjJoIiwic2NlbmVJZCI6IjE0bnpjaDdiIiwiaXNTaWduIjp0cnVlLCJzZWN1cml0eVRva2VuIjoiNm9PbzdlNzJuQTYxdVZMaVpWS2lMWUxyQTU0WEwrcXdVV2hlZ0p1ejdNNGUza3BmQnR5QjlZZkpvS3gyM1crQWhuM3pwYzNRZEViWTlMNjFsc3o4dWFCUFVvWkl3bGh3elRERG0xenNRMTM1Nk5HWnh0WVZucEdQUVUrT1RtSXYifQ=='

export const DaoAPI = {
  login: async (params: LoginParams): Promise<LoginResponse> => {
    const response = await axios.post('https://xjdao.net/api/v1/user/login', {
      phone: params.phone || '',
      email: params.email || '',
      password: params.password,
      domainName: params.domainName,
      loginType: 1,
      phoneRegion: '86',
      sceneId: '14nzch7b',
      captchaVerifyParam: FIXED_CAPTCHA
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `_c_WBKFRo=${FIXED_COOKIE}`,
        'Origin': 'https://xjdao.net',
        'Referer': 'https://xjdao.net/',
        'User-Agent': FIXED_UA
      },
      timeout: 15000
    })
    return response.data
  },

  getUserDetail: async (token: string): Promise<UserDetailResponse> => {
    const response = await axios.post('https://xjdao.net/api/v1/user/login-user-detail', null, {
      headers: {
        'Authorization': token,
        'Cookie': `_c_WBKFRo=${FIXED_COOKIE}`,
        'User-Agent': FIXED_UA
      },
      timeout: 15000
    })
    return response.data
  },

  rewardScore: async (token: string, score: number = 2): Promise<ScoreRewardResponse> => {
    const response = await axios.post('https://xjdao.net/api/v1/score/reward', {
      toUserDid: 'did:plc:cqwrsuxq4sb4uxcqgnnhcf4x',
      extendInfo: '电子酒友-饮酒消费',
      score
    }, {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
        'Cookie': `_c_WBKFRo=${FIXED_COOKIE}`,
        'User-Agent': FIXED_UA
      },
      timeout: 15000
    })
    return response.data
  }
}

// 使用代理的备用方案
export const DaoAPIProxy = {
  login: async (params: LoginParams): Promise<LoginResponse> => {
    const response = await daoClient.post('/user/login', {
      phone: params.phone || '',
      email: params.email || '',
      password: params.password,
      domainName: params.domainName,
      loginType: 1,
      phoneRegion: '86',
      sceneId: '14nzch7b',
      captchaVerifyParam: FIXED_CAPTCHA
    })
    return response.data
  },

  getUserDetail: async (): Promise<UserDetailResponse> => {
    const response = await daoClient.post('/user/login-user-detail', null)
    return response.data
  },

  rewardScore: async (score: number = 2): Promise<ScoreRewardResponse> => {
    const response = await daoClient.post('/score/reward', {
      toUserDid: 'did:plc:cqwrsuxq4sb4uxcqgnnhcf4x',
      extendInfo: '电子酒友-饮酒消费',
      score
    })
    return response.data
  }
}
