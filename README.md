# pnpm monorepo — toolkit

TypeScript + ESMule 标准 monorepo，统一管理 Vue / React / Chrome Extension 等前端项目。

## 目录结构

```
toolkit/
├── package.json              ← root config, type=module, catalog
├── pnpm-workspace.yaml       ← packages/* + catalog 声明
├── tsconfig.base.json        ← 所有子项目 extends 的公共 TS 配置
├── .npmrc                    ← pnpm 行为配置
├── .gitignore
└── packages/                 ← 所有子项目
    ├── vue-site/             ← [待创建]
    ├── react-site/           ← [待创建]
    └── ai-select-ask/        ← AI 选中问答 Chrome 插件
```

## 约定

- **所有子项目都是 ESM** — 根 `package.json` 声明 `"type": "module"`
- **TypeScript 版本统一管理** — 通过 `pnpm-workspace.yaml` 的 `catalog` 声明，子项目引用 `"typescript": "catalog:"`
- **所有子项目 extends `../../tsconfig.base.json`** — 公共 compilerOptions 不重复写
- 子项目 `tsconfig.json` 只需覆盖 `include` / `paths` / `rootDir` / `outDir` / `jsx`

## 常用命令

| 干什么 | 命令 |
|---|---|
| 装所有依赖 | `pnpm install` |
| 开发（全部并行） | `pnpm dev` |
| 类型检查（全部） | `pnpm typecheck` |
| 构建（全部） | `pnpm build` |
| Lint（全部） | `pnpm lint` |
| 单独操作某个 | `pnpm --filter ai-select-ask dev` |
| 给某个加依赖 | `pnpm --filter ai-select-ask add axios` |
| 给某个加 TS 开发依赖 | `pnpm --filter ai-select-ask add -D typescript@catalog:` |
| 更新 catalog TS 版本 | 改 `pnpm-workspace.yaml` 中 `catalog.typescript` |

## 添加新项目

```bash
# Vue
cd packages && pnpm create vue vue-site

# React
cd packages && pnpm create vite react-site --template react-ts

# Chrome Extension（手动）
mkdir packages/my-extension && cd packages/my-extension && pnpm init
```

## 子项目 package.json 模板

```jsonc
{
  "name": "@toolkit/vue-site",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "typecheck": "tsc --noEmit",
    "lint": "eslint ."
  },
  "devDependencies": {
    "typescript": "catalog:"
  }
}
```

## 子项目 tsconfig.json 模板

```jsonc
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src", "env.d.ts"]
}
```

## 子项目间引用

```json
{
  "dependencies": {
    "@toolkit/shared-utils": "workspace:*"
  }
}
```