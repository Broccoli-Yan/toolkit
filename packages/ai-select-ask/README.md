# AI 选中问答

> 选中网页任意内容，一键向 AI 提问 —— 支持文本 & 图片，流式秒回。

一个轻量级 Chrome 浏览器扩展，通过右键菜单捕获选中内容，在独立窗口中与 OpenAI 兼容的大模型对话。

> 📸 截图待补充，请将配图放入 `docs/images/` 目录，参考 `docs/images/README.md`。

---

## 目录

- [功能介绍](#功能介绍)
- [安装方式](#安装方式)
- [使用指南](#使用指南)
- [API 设置](#api-设置)
- [本地开发](#本地开发)
- [常见问题](#常见问题)
- [技术栈](#技术栈)

---

## 功能介绍

| 功能 | 说明 |
|------|------|
| 📝 **选中文本提问** | 选中网页文字 → 右键 "AI 选中问答" → 输入问题 |
| 🖼️ **选中图片提问** | 右键图片 → "AI 选中问答" → 输入问题 |
| ⚡ **流式响应** | 答案逐字输出，不用等待 |
| 🔧 **自定义模型** | 支持任意 OpenAI 兼容 API（OpenAI / LiteLLM / One API / OpenRouter 等） |
| 📋 **一键获取模型列表** | 输入 API 地址和 Key 后自动拉取可用模型 |
| 💾 **设置持久化** | API 配置保存在浏览器本地，一次配置永久使用 |

### 使用流程

```
网页选中内容 → 右键菜单 → 弹出独立窗口 → 输入问题 → Enter 发送 → 流式获取回答
```

---

## 安装方式

### 方式一：Chrome 应用商店（待上架）

> 暂未上架，敬请期待。

### 方式二：开发者模式加载（推荐）

1. 下载本项目或 clone 到本地
2. 打开 Chrome 浏览器，地址栏输入 `chrome://extensions/`
3. 打开右上角 **开发者模式** 开关
4. 点击左上角 **加载已解压的扩展程序**
5. 选择 `packages/ai-select-ask/dist/` 目录
6. 扩展图标会出现在浏览器工具栏右上角

### 方式三：本地构建

```bash
cd toolkit
pnpm install
pnpm --filter ai-select-ask build
# 然后按方式二的步骤，加载 dist/ 目录
```

---

## 使用指南

### 第一步：配置 API

使用前需要配置大模型 API：

1. 点击浏览器工具栏的扩展图标（拼图 → AI 选中问答），弹出窗口
2. 点击右上角 **⚙ 齿轮图标** 打开设置
3. 填写以下信息：

| 字段 | 说明 | 示例 |
|------|------|------|
| **Base URL** | API 服务地址 | `https://api.openai.com` |
| **API Key** | 你的 API 密钥 | `sk-xxxxxxxx` |
| **Model** | 模型名称（可手动输入或点击"获取模型"自动拉取） | `gpt-4o` |

4. 推荐操作：填好 Base URL 和 API Key 后，点击 **🔍 获取模型** 按钮，从下拉列表中选择模型
5. 点击 **保存**

### 第二步：提问

1. 在任意网页上**选中一段文字**，或**右键一张图片**
2. 在选中区域点击右键，选择菜单中的 **"AI 选中问答"**
3. 弹出独立窗口，顶部会显示你选中的内容预览
4. 在底部输入框输入你的问题，例如：
   - "翻译成英文"
   - "总结这段话"
   - "解释这段代码"
   - "图片里有什么？"
5. 按 **Enter** 发送（Shift+Enter 换行）
6. AI 回答会逐字流式输出，回答完成后显示耗时

### 快捷操作

| 操作 | 方式 |
|------|------|
| 发送消息 | `Enter` |
| 换行 | `Shift + Enter` |
| 清除已捕获内容 | 点击捕获预览区的 × 按钮 |
| 打开设置 | 点击右上角 ⚙ |
| 重新打开窗口 | 点击浏览器工具栏的扩展图标 |

### 支持的上下文

- **选中文本**：文本内容会作为 system prompt 的一部分传给模型
- **选中图片**：图片 URL 会传给模型（需要模型支持多模态）
- 每次提问都会附带**来源网页 URL**作为上下文

---

## API 设置

### 兼容的服务商

本插件使用 **OpenAI 兼容的 Chat Completions API**，以下服务商均可使用：

| 服务商 | Base URL | 说明 |
|--------|----------|------|
| OpenAI | `https://api.openai.com` | 官方服务 |
| OpenRouter | `https://openrouter.ai/api` | 多模型聚合 |
| 硅基流动 | `https://api.siliconflow.cn` | 国内服务商 |
| DeepSeek | `https://api.deepseek.com` | 官方服务 |
| One API | 自定义地址 | 自建代理 |
| LiteLLM | 自定义地址 | 自建代理 |
| 其他兼容代理 | 自定义地址 | 只要支持 `/v1/chat/completions` 即可 |

### 接口要求

- **Chat**: `POST {baseUrl}/v1/chat/completions` — 支持 `stream: true`
- **模型列表**（可选）: `GET {baseUrl}/v1/models` — 用于自动获取模型

### 隐私说明

- API Key 和设置保存在 Chrome 本地存储（`chrome.storage.local`）
- 不会上传到任何第三方服务器
- 网络请求仅发送到你配置的 Base URL
- 本插件不收集任何用户数据

---

## 本地开发

### 环境要求

- Node.js >= 18
- pnpm >= 9

### 开发命令

```bash
# 进入 monorepo 根目录
cd toolkit

# 安装依赖
pnpm install

# 启动开发模式（watch，修改代码自动重新构建）
pnpm --filter ai-select-ask dev

# 类型检查
pnpm --filter ai-select-ask typecheck

# 生产构建
pnpm --filter ai-select-ask build
```

### 调试

1. 启动开发模式后，`dist/` 目录会保持最新
2. 在 `chrome://extensions/` 中点击插件的 **刷新** 图标
3. 右键 Service Worker 可以打开 DevTools 查看后台日志
4. Popup 窗口可以右键 → 检查，打开独立的 DevTools

### 项目结构

```
packages/ai-select-ask/
├── public/
│   ├── manifest.json         # Chrome 扩展配置 (Manifest V3)
│   └── icons/                # 扩展图标
├── popup/
│   └── index.html            # Popup 窗口 HTML
├── src/
│   ├── shared/               # 共享类型和常量
│   ├── service-worker/       # 后台 Service Worker
│   └── popup/                # Popup 窗口 React 应用
│       ├── components/       # UI 组件
│       ├── hooks/            # React Hooks
│       └── lib/              # 工具库（API 客户端、SSE 解析）
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 常见问题

### Q: 点击右键菜单没有反应？

确认：
1. 已在 `chrome://extensions/` 中开启开发者模式并加载了插件
2. 已选中文字或右键了图片
3. 浏览器未拦截弹窗（检查地址栏右侧的弹窗拦截图标）

### Q: 提示 "API error (4xx)" 怎么办？

- **401**: API Key 错误或过期，请检查设置中的 Key 是否正确
- **404**: Base URL 不正确，确认地址是否包含多余路径（如 `/v1` 应该放在 Base URL 里还是去掉）
- **403**: 账号余额不足或无权访问该模型
- **429**: 请求频率过高，稍等再试

### Q: 提示 "Failed to fetch" 怎么办？

- 检查 Base URL 是否以 `https://` 开头
- 检查网络是否能访问该地址
- 某些服务商可能需要科学上网

### Q: 如何修改弹窗大小？

弹窗大小在 `src/service-worker/index.ts` 中配置：

```typescript
const popupWidth = 520;   // 宽度
const popupHeight = 700;  // 高度
```

### Q: 支持哪些模型？

只要服务商提供的是 OpenAI 兼容 Chat Completions API，理论上都支持。文本模型直接可用，多模态模型（如 GPT-4o）可同时处理文本和图片。

### Q: 如何卸载？

在 `chrome://extensions/` 中找到 "AI 选中问答"，点击移除即可。所有本地设置也会一并删除。

---

## 技术栈

| 技术 | 用途 |
|------|------|
| React 19 | Popup UI 框架 |
| TypeScript 5.7 (strict) | 类型安全 |
| Vite 6 | 构建工具 |
| Chrome Manifest V3 | 扩展框架 |
| Chrome Extensions API | contextMenus / storage / windows |
| SSE (Server-Sent Events) | 流式响应解析 |
| 纯 CSS | 样式（无第三方 UI 库） |
| pnpm workspace | monorepo 管理 |

---

## License

MIT
