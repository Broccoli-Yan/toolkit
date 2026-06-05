# toolkit — pnpm monorepo

AI 友好配置文件 · 给 Claude / Copilot / Cursor 等 AI 编码助手使用。

## 项目概览

- **包管理器**: pnpm >= 9（workspace monorepo）
- **类型系统**: TypeScript ^5.7（统一 catalog 管理）
- **模块系统**: ESM（`"type": "module"` 在根 package.json 声明）
- **Node 要求**: >= 18

## 目录结构

```
toolkit/
├── package.json              # root: private, type=module, catalog
├── pnpm-workspace.yaml       # packages/* + catalog.typescript: ^5.7.0
├── tsconfig.base.json        # 所有子项目 extends 的公共 TS 配置
├── .npmrc                    # pnpm 行为配置
├── pnpm-lock.yaml
└── packages/
    └── ai-select-ask/        # AI 选中问答 — Chrome Extension (React + Vite)
```

## 常用命令

| 操作 | 命令 | 说明 |
|------|------|------|
| 安装依赖 | `pnpm install` | 首次 clone 后执行 |
| 开发（全量并行） | `pnpm dev` | 所有子项目 dev script 一起跑 |
| 构建（全量） | `pnpm build` | |
| 全量类型检查 | `pnpm typecheck` | |
| 全量 lint | `pnpm lint` | |
| 仅操作某子项目 | `pnpm --filter <name> <script>` | 例: `pnpm --filter ai-select-ask dev` |
| 给子项目加依赖 | `pnpm --filter ai-select-ask add <pkg>` | |
| 给子项目加 dev 依赖 | `pnpm --filter ai-select-ask add -D <pkg>` | |

## 关键约定

### TypeScript
- **所有子项目必须 extends `../../tsconfig.base.json`**
- base 已配置: `strict: true`, `noUncheckedIndexedAccess`, `moduleResolution: bundler`, `target: ESNext`
- base 已设置 `noEmit: true` — 仅用于类型检查，实际构建由 Vite 负责
- 子项目 tsconfig 只需覆盖: `include`, `paths`, `rootDir`, `outDir`, `jsx`
- TypeScript 版本通过 `pnpm-workspace.yaml` 的 `catalog` 统一声明，子项目用 `"typescript": "catalog:"` 引用

### 子项目命名
- package.json name: `@toolkit/<name>`（如 `@toolkit/ai-select-ask`）
- 所有子项目 `"private": true`

### 模块
- 所有子项目 ESM
- Vite 构建，`moduleResolution: bundler`

### .gitignore 关键项
- `node_modules/`, `dist/`, `build/` 等构建产物均被忽略
- `.env` / `.env.local` 被忽略（API Key 等敏感信息）

## 添加新子项目

```bash
# 在 packages/ 下创建，参考 ai-select-ask 的 package.json 和 tsconfig.json
# 确保 extends ../../tsconfig.base.json
```

## 子项目间依赖

```json
{
  "dependencies": {
    "@toolkit/shared-utils": "workspace:*"
  }
}
```
