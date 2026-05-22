// 类型定义

export interface UserInfo {
  id: string;
  email: string;
  phone: string;
  phoneRegion: string;
  nickName: string;
  domainName: string;
  did: string;
  score: number;
  nodeUser: boolean;
  disable: boolean;
}

export interface LoginParams {
  phone?: string;
  email?: string;
  password: string;
  domainName: string;
}

export interface LoginResponse {
  data: {
    token: string;
    blueSkyToken: string;
    blueSkyRefreshToken: string;
  };
  success: boolean;
  message: string;
  code: number;
  errorData: any[];
}

export interface UserDetailResponse {
  data: UserInfo;
  success: boolean;
  code: number;
}

export interface ScoreRewardResponse {
  data: boolean;
  success: boolean;
  message: string;
  code: number;
  errorData: any[];
}

export interface Wine {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  origin: string;
  alcohol_content: string;
  history: string;
  brewing_process: string;
  tasting_notes: string;
  culture: string;
  fun_facts: string[];
  tags: string[];
  image?: string;
}

export interface WineDatabase {
  wines: Wine[];
  categories: Record<string, {
    description: string;
    subcategories: string[];
  }>;
  drinking_tips: string[];
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface BubbleMessage {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: number;
  duration?: number;
}

export interface FunctionTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: string;
      properties: Record<string, any>;
      required: string[];
    };
  };
}
