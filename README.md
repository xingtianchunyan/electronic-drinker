# 电子酒友

一款基于 H5 的互动陪伴型应用，核心定位是**"虚拟酒搭子"**。通过卡通风格的酒馆场景与拟人化 Agent 角色，为用户提供喝酒陪伴、情绪疏导、酒文化科普等服务。

## 功能特性

- **酒馆场景**：开屏背景（background0）与酒馆背景（background1）切换
- **AI 酒友「小酒」**：接入 Kimi API，具备酒友人设，支持闲聊、劝酒、健康提醒、酒知识讲解
- **语音交互**：按住说话按钮，支持语音输入（Web Speech API）与文字输入
- **酒文化知识库**：20+ 款主流酒款（白酒/黄酒/葡萄酒/啤酒/威士忌），随机抽取介绍
- **乡建 DAO 登录**：支持乡建 DAO 账号登录，显示稻米余额
- **饮酒消费**：每次饮酒固定扣除 2 稻米，余额不足时提示
- **语音播报**：接入硅基流动 TTS API，Agent 回复同步语音输出
- **气泡对话**：用户气泡与 Agent 气泡区分显示，自动淡出

## 技术栈

- Vue 3 + Vite + TypeScript
- Pinia 状态管理
- Axios HTTP 客户端
- Kimi API（Moonshot AI）对话引擎
- 硅基流动 TTS API 语音合成
- Web Speech API 语音识别

## 部署

### Vercel 部署步骤

1. 登录 [Vercel](https://vercel.com)
2. New Project → Import Git Repository → 选择 `electronic-drinker`
3. Framework Preset 选择 `Vite`
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. 配置环境变量（见下方）
7. Deploy

### 环境变量

在 Vercel Dashboard → Project Settings → Environment Variables 中配置：

| 变量名 | 说明 | 必填 |
|--------|------|------|
| `VITE_KIMI_API_KEY` | Moonshot AI API Key | 是 |
| `VITE_SILICONFLOW_API_KEY` | 硅基流动 API Key | 否（不填则使用浏览器原生语音合成） |

## 素材替换

当前使用静态图片代替 GIF，后续替换方式：

1. 将 `src/assets/agent/actor.png` 替换为 `agent_idle.gif`（待机动画，循环）
2. 添加 `src/assets/agent/agent_drink.gif`（饮酒动作，单次播放）
3. 修改 `src/components/AgentLayer.vue` 中的图片引用

## 酒款知识库

知识库位于 `src/data/wine_knowledge.json`，包含 20 款酒：

- **白酒**：茅台、五粮液、汾酒、泸州老窖、剑南春、西凤酒、董酒、水井坊
- **黄酒**：女儿红、客家娘酒、即墨老酒、龙岩沉缸酒
- **葡萄酒**：拉菲、罗曼尼康帝、酩悦香槟、阿斯蒂莫斯卡托
- **啤酒**：青岛啤酒、鹅岛 IPA
- **威士忌**：麦卡伦18年、響和风醇韵

## 项目结构

```
src/
├── assets/           # 图片素材
│   ├── agent/        # 角色素材
│   └── scene/        # 背景素材
├── components/       # Vue 组件
│   ├── SceneLayer.vue    # 场景层
│   ├── AgentLayer.vue    # 角色层
│   ├── BubbleLayer.vue   # 气泡层
│   ├── UILayer.vue       # UI 控制层
│   ├── MicButton.vue     # 麦克风按钮
│   └── LoginModal.vue    # 登录弹窗
├── composables/      # 组合式函数
├── data/             # 静态数据
├── services/         # API 服务
│   ├── daoApi.ts     # 乡建 DAO 接口
│   ├── kimiApi.ts    # Kimi 对话接口
│   └── ttsApi.ts     # TTS 语音合成
├── stores/           # Pinia Store
├── types/            # TypeScript 类型
└── utils/            # 工具函数
```

## 本地运行

### 前置准备

1. 拉取代码
```bash
git clone https://github.com/xingtianchunyan/electronic-drinker.git
cd electronic-drinker
npm install
```

2. 创建环境变量文件
```bash
cp .env.example .env.local
```
编辑 `.env.local`，填入你的 API Key（不填则对应功能不可用）：
```
VITE_KIMI_API_KEY=your_kimi_key
VITE_SILICONFLOW_API_KEY=your_siliconflow_key
```

### 方式一：开发模式（推荐）

前后端分离运行，热更新，适合开发调试。需要开 **3 个终端**：

| 终端 | 命令 | 作用 | 端口 |
|------|------|------|------|
| 1 | `npm run dev:backend` | 启动 API 代理服务器 | 3001 |
| 2 | `npm run dev:frontend` | 启动 Vite 前端开发服务器 | 3000 |
| 3 | `npm run dev:voice` | 启动 Windows 语音桥接（可选） | 8787 |

然后访问 http://localhost:3000

### 方式二：一键生产模式

构建前端静态文件，用同一台服务器 serve 并代理 API。只需 **1 个终端**：

```bash
npm run serve
```

等价于：
```bash
npm run build   # 构建到 dist/
npm start       # 启动 server/proxy.js
```

然后访问 http://localhost:3000

### 方式三：Docker

```bash
docker-compose up --build
```

然后访问 http://localhost:3000

### Windows 语音桥接（可选）

如需使用 Win+H 语音输入：

```bash
pip install flask pyautogui
python voice-bridge.py
```

点击麦克风按钮时会自动调用 Windows 语音输入面板。

## License

MIT
