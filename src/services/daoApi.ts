import axios from 'axios'
import type { LoginParams, LoginResponse, UserDetailResponse, ScoreRewardResponse } from '@/types'

const daoClient = axios.create({
  baseURL: '/api/dao',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const DaoAPI = {
  login: async (params: LoginParams): Promise<LoginResponse> => {
    const response = await daoClient.post('/user/login', params)
    return response.data
  },

  getUserDetail: async (token: string): Promise<UserDetailResponse> => {
    const response = await daoClient.post('/user/login-user-detail', {}, {
      headers: {
        'Authorization': token
      }
    })
    return response.data
  },

  rewardScore: async (token: string, score: number = 2): Promise<ScoreRewardResponse> => {
    const response = await daoClient.post('/score/reward', {
      toUserDid: 'did:plc:oqjsga3dtg3epvqfapzk5aam',
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
