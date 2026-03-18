# 贡献指南

感谢您对 Chao Hua Admin System 项目的关注！我们欢迎任何形式的贡献，包括但不限于：

- 🐛 Bug 报告
- ✨ 新功能建议
- 📝 文档改进
- 🔧 代码优化
- 🧪 测试用例

## 如何贡献

### 1. Fork 项目

首先，请 Fork 本仓库到您的 GitHub 账户。

### 2. 克隆项目

```bash
# 克隆您 Fork 的项目
git clone https://github.com/您的用户名/ch-admin2.git

# 进入项目目录
cd ch-admin2

# 添加上游仓库
git remote add upstream https://github.com/zhimin711/ch-admin2.git
```

### 3. 创建分支

```bash
# 从主分支创建新分支
git checkout -b feature/your-feature-name

# 或者修复 bug
git checkout -b fix/your-bug-description
```

### 4. 开发环境设置

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 5. 代码规范

在提交代码前，请确保：

- 代码符合 ESLint 规范
- 通过所有测试用例
- 添加必要的注释和文档
- 遵循项目的代码风格

```bash
# 运行代码检查
npm run lint

# 自动修复可修复的问题
npm run lint -- --fix

# 运行测试
npm run test:unit
```

### 6. 提交代码

```bash
# 添加修改的文件
git add .

# 提交代码（请使用清晰的提交信息）
git commit -m "feat: 添加新功能描述"

# 推送到您的分支
git push origin feature/your-feature-name
```

### 7. 创建 Pull Request

1. 在 GitHub 上创建 Pull Request
2. 详细描述您的修改内容
3. 关联相关的 Issue（如果有）
4. 等待代码审查

## 提交信息规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Type 类型

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整（不影响功能）
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### 示例

```bash
feat(auth): 添加用户登录功能
fix(api): 修复数据获取接口错误
docs(readme): 更新安装说明
style(component): 调整按钮样式
refactor(utils): 重构工具函数
test(api): 添加接口测试用例
chore(deps): 更新依赖包版本
```

## 代码审查流程

1. **自动检查**: 所有 PR 都会通过 CI/CD 自动检查
2. **代码审查**: 至少需要一位维护者审查
3. **测试验证**: 确保新功能或修复不会破坏现有功能
4. **合并**: 审查通过后合并到主分支

## 报告问题

### Bug 报告

在创建 Issue 时，请提供以下信息：

1. **环境信息**
   - 操作系统
   - Node.js 版本
   - 浏览器版本

2. **重现步骤**
   - 详细的操作步骤
   - 期望的结果
   - 实际的结果

3. **错误信息**
   - 控制台错误信息
   - 网络请求错误
   - 截图或录屏（如果适用）

### 功能建议

在提出新功能建议时，请说明：

1. **功能描述**: 详细描述您希望添加的功能
2. **使用场景**: 说明在什么情况下会用到这个功能
3. **实现建议**: 如果有的话，提供实现思路
4. **相关 Issue**: 检查是否已有类似的功能请求

## 开发指南

### 项目结构

```
src/
├── api/              # API 接口
├── assets/           # 静态资源
├── components/       # 公共组件
├── directive/        # 自定义指令
├── filters/          # 过滤器
├── i18n/             # 国际化
├── icons/            # 图标
├── layout/           # 布局组件
├── router/           # 路由配置
├── store/            # 状态管理
├── styles/           # 样式文件
├── utils/            # 工具函数
└── views/            # 页面组件
```

### 组件开发规范

1. **组件命名**: 使用 PascalCase
2. **文件结构**: 一个组件一个文件夹
3. **Props 定义**: 使用 TypeScript 或 JSDoc 注释
4. **事件命名**: 使用 kebab-case
5. **样式隔离**: 使用 scoped 或 CSS Modules

### API 接口规范

1. **统一错误处理**: 使用统一的错误处理机制
2. **请求拦截**: 在 request 拦截器中处理通用逻辑
3. **响应拦截**: 在 response 拦截器中处理响应数据
4. **接口文档**: 添加详细的接口注释

### 样式规范

1. **CSS 预处理器**: 使用 SCSS
2. **命名规范**: 使用 BEM 命名法
3. **响应式设计**: 支持多种屏幕尺寸
4. **主题支持**: 支持主题切换

## 测试指南

### 单元测试

```bash
# 运行所有测试
npm run test:unit

# 监听模式
npm run test:unit -- --watch

# 生成覆盖率报告
npm run test:unit -- --coverage
```

### 测试文件位置

```
tests/
├── unit/
│   ├── components/   # 组件测试
│   └── utils/        # 工具函数测试
```

### 测试规范

1. **测试覆盖率**: 新功能至少 80% 覆盖率
2. **测试命名**: 描述测试的具体场景
3. **断言清晰**: 使用清晰的断言语句
4. **Mock 使用**: 合理使用 Mock 数据

## 文档贡献

### 文档类型

- README 文档
- API 文档
- 组件文档
- 部署文档
- 开发文档

### 文档规范

1. **语言**: 中英文对照
2. **格式**: 使用 Markdown 格式
3. **图片**: 使用相对路径引用
4. **链接**: 使用绝对路径
5. **代码示例**: 提供完整可运行的示例

## 许可证

通过贡献代码，您同意您的贡献将在 [MIT 许可证](LICENSE) 下发布。

## 联系方式

如果您有任何问题或建议，请通过以下方式联系我们：

- 创建 [Issue](https://github.com/zhimin711/ch-admin2/issues)
- 发送邮件至: zhimin711@sina.com
- 加入讨论群组

再次感谢您的贡献！🎉
