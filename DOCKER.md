# 🍺 电子酒友 — 本地 Docker 运行指南

## 环境要求

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)（Windows 用户安装此版本）
- [Git](https://git-scm.com/download/win)
- VSCode（可选，但推荐）

## 快速启动

### 1. 拉取代码

```bash
git clone https://github.com/xingtianchunyan/electronic-drinker.git
cd electronic-drinker
```

### 2. 启动容器

```bash
docker-compose up
```

首次构建可能需要 2-3 分钟（下载 Node 镜像 + 安装依赖 + 构建前端）。

### 3. 打开应用

浏览器访问 **http://localhost:3000**

---

## 本地开发模式（无需 Docker）

如果你想改代码实时预览：

```bash
npm install
npm run dev
```

然后访问 http://localhost:3000

---

## 技术说明

| 组件 | 说明 |
|------|------|
| 前端 | Vue 3 + Vite，构建产物在 `dist/` |
| 代理服务器 | Express + http-proxy-middleware，文件 `server/proxy.js` |
| 端口 | 3000 |
| API 代理 | `/api/dao/*` → `https://xjdao.net/api/v1/*`（自动注入 Origin、Cookie、UA） |

代理服务器解决了浏览器的 CORS 限制，不需要安装任何浏览器插件。

---

## 常见问题

**Q: `docker-compose up` 报错 "port already in use"**
A: 3000 端口被占用，修改 `docker-compose.yml` 里的 `ports: - "3001:3000"`，然后访问 http://localhost:3001

**Q: 如何修改固定参数（Cookie、验证码）**
A: 编辑 `server/proxy.js` 文件开头的常量，然后 `docker-compose up --build` 重新构建

**Q: 前端代码修改后如何生效**
A: 开发模式用 `npm run dev`；生产模式需要重新构建镜像 `docker-compose up --build`
