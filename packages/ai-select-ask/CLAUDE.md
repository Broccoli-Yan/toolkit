# @toolkit/ai-select-ask — AI 选中问答 Chrome 插件

> 给 Claude / Copilot / Cursor 等 AI 编码助手使用的项目参考文件。
> 修改此项目代码前请先阅读本文。

## 功能概述

用户在网页上**选中文本或右键图片** → 右键菜单点击 "AI 选中问答" → 弹出独立窗口 → 输入问题 → 通过 OpenAI 兼容 API 流式获取回答。

## 技术栈

| 层面 | 技术 |
|------|------|
| 框架 | React 19 |
| 构建 | Vite 6 |
| 语言 | TypeScript 5.7 (strict) |
| 样式 | 纯 CSS（无 UI 库） |
| Chrome API | Manifest V3, Service Worker, contextMenus, storage, windows |

## 目录结构

```
packages/ai-select-ask/
├── package.json              # @toolkit/ai-select-ask, scripts
├── tsconfig.json             # extends ../../tsconfig.base.json, jsx: react-jsx
├── vite.config.ts            # 双入口: popup + service-worker
├── public/
│   ├── manifest.json         # Chrome Manifest V3
│   └── icons/                # 16/48/128 px + SVG
├── popup/
│   └── index.html            # popup 独立入口 HTML
├── src/
│   ├── shared/               # 共享类型和常量
│   │   ├── types.ts          # CaptureData, Settings, ChatMessage, StorageData
│   │   └── const.ts          # DEFAULT_SETTINGS, CONTEXT_MENU_ID, STORAGE_KEYS
│   ├── service-worker/
│   │   └── index.ts          # 右键菜单 + 捕获内容 + 弹出窗口
│   └── popup/
│       ├── index.tsx          # React 入口
│       ├── App.tsx            # 顶层组件：组装布局
│       ├── App.css            # 全部样式（约 480 行）
│       ├── components/
│       │   ├── CapturedContent.tsx   # 展示捕获的文本/图片
│       │   ├── ChatInput.tsx         # 输入框 + 发送按钮
│       │   ├── ChatResponse.tsx      # 消息列表 + 流式打字效果
│       │   └── SettingsDialog.tsx    # API 设置弹窗（获取模型、下拉选择）
│       ├── hooks/
│       │   ├── useCapture.ts         # 从 chrome.storage 读取捕获内容
│       │   ├── useSettings.ts        # 读写 API 设置
│       │   └── useStreamChat.ts      # 流式聊天核心逻辑
│       └── lib/
│           ├── api-client.ts         # fetch + SSE streaming (AsyncGenerator)
│           └── sse-parser.ts         # SSE "data:" 行解析
└── dist/                     # 构建产物（加载到 Chrome）
```

## 架构数据流

```
网页上选中文本/图片
  ↓ (chrome.contextMenus.onClicked)
service-worker/index.ts
  → 构建 CaptureData → chrome.storage.local.set("lastCapture", data)
  → chrome.windows.create({ url: "popup/index.html", type: "popup" })
  ↓
popup/index.html 加载 → React mount → App.tsx
  → useCapture() 从 storage 读取 captureData
  → useSettings() 从 storage 读取 API 设置
  ↓
用户输入问题 → Enter
  → useStreamChat.startStreaming(question, captureData, settings)
    → api-client.streamChatCompletions() → POST /v1/chat/completions (stream: true)
    → SSE 逐行解析 → AsyncGenerator<string>
    → setMessages() 逐 token 更新 UI
```

## Vite 构建关键点

- **双入口**: `popup/index.html`（popup 页面）和 `src/service-worker/index.ts`（Service Worker）
- **Service Worker 必须是单文件**: `entryFileNames` 对 service-worker 返回不带 hash 的 `service-worker.js`
- **禁止 shared chunks**: `manualChunks` 对 service-worker 返回 `undefined`，`modulePreload: false`
- **开发模式**: `vite build --watch --mode development`
- **构建产物在 `dist/`**，在 Chrome `chrome://extensions/` 中"加载已解压的扩展程序"加载此目录

## 核心类型

```typescript
interface CaptureData {
  type: "text" | "image";
  text: string | null;
  imageUrl: string | null;
  sourceUrl: string;
  timestamp: number;
}

interface Settings {
  baseUrl: string;   // OpenAI 兼容 API 地址
  apiKey: string;
  model: string;
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}
```

## Chrome 扩展关键 API

| API | 用途 | 文件 |
|-----|------|------|
| `chrome.contextMenus` | 注册右键菜单 "AI 选中问答"，contexts: ["selection", "image"] | service-worker |
| `chrome.storage.local` | 存储捕获内容和设置 | service-worker, useCapture, useSettings |
| `chrome.windows.create` | 创建独立 popup 窗口（520×700，定位到浏览器右侧） | service-worker |
| `chrome.action.onClicked` | 点击扩展图标也打开 popup | service-worker |
| `chrome.runtime.onInstalled` | 安装/更新时重新注册右键菜单 | service-worker |

## 权限声明 (manifest.json)

```json
{
  "permissions": ["contextMenus", "storage", "activeTab"],
  "host_permissions": []  // 不请求任何 host 权限，所有网络请求走 popup 页面自身
}
```

## 开发流程

```bash
# 安装依赖（在 monorepo 根目录）
cd toolkit && pnpm install

# 启动开发（watch 模式，文件变更自动重构建）
pnpm --filter ai-select-ask dev

# 类型检查
pnpm --filter ai-select-ask typecheck

# 生产构建
pnpm --filter ai-select-ask build
```

## 在 Chrome 中加载

1. 打开 `chrome://extensions/`
2. 开启右上角**开发者模式**
3. 点击**加载已解压的扩展程序**
4. 选择 `packages/ai-select-ask/dist/` 目录
5. 每次修改代码 → Vite watch 自动 rebuild → 在 `chrome://extensions/` 中点击插件的刷新图标

## API 兼容性

插件使用 **OpenAI 兼容的 Chat Completions API**（`/v1/chat/completions` + SSE streaming）。

支持的服务商（非穷举）：
- OpenAI (`https://api.openai.com`)
- 任何 OpenAI 兼容代理（如 LiteLLM、OpenRouter、One API 等）

### 请求格式

```
POST {baseUrl}/v1/chat/completions
Authorization: Bearer {apiKey}
Content-Type: application/json

{
  "model": "{model}",
  "messages": [
    { "role": "system", "content": "You are a helpful assistant. ..." },
    { "role": "user", "content": "{question}" }
  ],
  "stream": true
}
```

### 模型列表获取

`GET {baseUrl}/v1/models` → `{ data: [{ id: "gpt-4" }, ...] }`

## 样式系统

- **纯 CSS**（`App.css`），约 480 行，无 CSS Modules / Tailwind / styled-components
- 命名约定: BEM 风格（`.app-header`, `.chat-msg-user`）
- 主要颜色: `#4f46e5`（靛蓝主色）, `#1a1a1a`（文字）, `#e5e5e5`（边框）
- Popup 窗口尺寸: 520×700 px

## 修改代码注意事项

### 修改 service-worker 时
- service-worker **不能** import 任何共享文件（Vite 会内联，但不支持模块引用）
- 它与 popup 完全隔离，类型定义是**手写重复的**（见 service-worker/index.ts 第 4-10 行的 `CaptureData` 接口）
- 如果需要共享类型，**必须**在两个文件中分别定义（或修改 Vite 配置使其共享）

### 修改 popup 组件时
- 状态管理全用 React hooks，无全局状态库
- 聊天流式响应通过 `useStreamChat` hook 管理，核心是 `AsyncGenerator`
- SSE 解析器 (`sse-parser.ts`) 只解析 `data:` 行，`[DONE]` 表示结束

### 修改设置相关代码时
- Settings 通过 `chrome.storage.local` 持久化
- SettingsDialog 支持从 API 获取模型列表并过滤搜索
- `fetchModels()` 如 URL 以 `/` 结尾会自动 strip，避免双斜杠

### 通用注意
- TypeScript strict 模式，禁止 `noUnusedLocals` 和 `noUnusedParameters`
- `noUncheckedIndexedAccess` 开启，数组/对象索引访问必须处理 undefined
- Manifest V3 不允许远程代码，所有 JS 必须打包在扩展内
- 不需要 `host_permissions`，所有 API 请求走 popup 页面的 fetch
