import axios from 'axios'
import type { LoginParams, LoginResponse, UserDetailResponse, ScoreRewardResponse } from '@/types'

const daoClient = axios.create({
  baseURL: 'https://xjdao.net/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Priority': 'u=1, i',
    'Sec-Ch-Ua': '"Chromium";v="148", "Microsoft Edge";v="148", "Not/A)Brand";v="99"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin'
  }
})

export const DaoAPI = {
  login: async (params: LoginParams): Promise<LoginResponse> => {
    const response = await daoClient.post('/user/login', params)
    return response.data
  },

  getUserDetail: async (token: string): Promise<UserDetailResponse> => {
    const response = await daoClient.post('/user/login-user-detail', null, {
      headers: {
        'Authorization': token
      }
    })
    return response.data
  },

  rewardScore: async (token: string, score: number = 2): Promise<ScoreRewardResponse> => {
    const response = await daoClient.post('/score/reward', {
      toUserDid: 'did:plc:cqwrsuxq4sb4uxcqgnnhcf4x',
      extendInfo: '电子酒友-饮酒消费',
      score
    }, {
      headers: {
        'Authorization': token
      }
    })
    return response.data
  }
}

// 兼容旧名称导出
export const DaoAPIProxy = DaoAPI
