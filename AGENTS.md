# AGENTS.md

适用范围

- 本文件仅适用于 `ch-admin2/`。
- 所有新增或修改文件统一使用 UTF-8 编码。

项目事实

- 技术栈为 `Vue 2.6`、`Element UI 2.x`、`Vue CLI 4`、`Vuex 3`、`Vue Router 3`、`JavaScript`。
- 主要目录包括 `src/views`、`src/components`、`src/api`、`src/router`、`src/store`、`src/layout`、`src/utils`、`src/styles`。
- 这是成熟后台模板风格项目，改动应优先保持现有视觉与交互一致性，不要引入和现有页面风格冲突的新范式。

开发约束

- 优先沿用 Vue 2 既有写法与 Options API，不要在局部引入 Vue 3/Composition API 风格。
- 新页面放在 `src/views`，复用组件放 `src/components`，接口请求放 `src/api`，路由改动放 `src/router`，全局状态改动放 `src/store`。
- 尽量复用现有 `Element UI` 组件、表单校验和表格布局模式，不平移到其他 UI 库。
- 样式优先跟随现有 Less/SCSS 习惯和项目变量，不要新增大体量样式依赖。
- 保持中文业务文案和注释风格一致；只对复杂交互、权限判断、兼容处理补注释。

改动边界

- 不编辑 `dist/`、`node_modules/`、截图资源、构建缓存等产物目录。
- 不随意升级 `vue`、`element-ui`、`webpack/vue-cli` 相关基础依赖。
- 需要新增接口时，保持与后端字段命名、权限编码和路由元信息一致。

验证命令

- 开发启动：`npm run dev`
- 生产构建：`npm run build:prod`
- 预发构建：`npm run build:stage`
- Lint：`npm run lint`
- 单测：`npm run test:unit`

提交前检查

- 页面权限、按钮权限、动态路由、字典回显和上传下载能力是否受影响。
- 若改动 `src/api` 或权限路由，确认对应页面、store、mock 或后端接口约定同步一致。
