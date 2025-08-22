# Chao Hua Admin System

<p align="center">
  <img width="320" src="src/assets/logo.jpg" alt="Chao Hua Admin">
</p>

<p align="center">
  <a href="https://github.com/vuejs/vue">
    <img src="https://img.shields.io/badge/vue-2.6.10-brightgreen.svg" alt="vue">
  </a>
  <a href="https://github.com/ElemeFE/element">
    <img src="https://img.shields.io/badge/element--ui-2.15.7-brightgreen.svg" alt="element-ui">
  </a>
  <a href="https://github.com/zhimin711/ch-admin2/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/mashape/apistatus.svg" alt="license">
  </a>
  <a href="https://github.com/zhimin711/ch-admin2/releases">
    <img src="https://img.shields.io/github/release/zhimin711/ch-admin2.svg" alt="GitHub release">
  </a>
</p>

简体中文 | [English](./README.en.md)

## 项目简介

Chao Hua Admin System 是一个基于 Vue 2 + Element UI 的企业级 DevOps 管理平台，专为云原生和微服务架构设计。该系统集成了多种主流中间件和服务的可视化管理功能，提供了完整的权限管理、项目管理、监控告警等企业级功能。

## 核心特性

### 🚀 技术栈
- **前端框架**: Vue 2.6.10 + Vue Router + Vuex
- **UI 组件库**: Element UI 2.15.7
- **构建工具**: Vue CLI 4.4.4
- **图表库**: ECharts 5.3.2
- **地图**: 高德地图 Vue AMap
- **富文本编辑器**: TinyMCE 5.5.1
- **代码编辑器**: CodeMirror 5.65.4

### 🏗️ 系统架构
- **权限管理**: 基于角色的访问控制 (RBAC)
- **多租户支持**: 完整的租户隔离和管理
- **动态路由**: 基于权限的动态菜单生成
- **国际化**: 支持多语言切换
- **主题定制**: 支持多种主题和自定义样式

### 📊 功能模块

#### 1. 用户权限管理 (UPMS)
- 用户管理：用户信息、角色分配、权限控制
- 角色管理：角色定义、权限配置
- 部门管理：组织架构、层级管理
- 租户管理：多租户隔离、资源分配
- 项目管理：项目创建、成员管理、权限分配

#### 2. 服务治理 (Nacos)
- 服务注册与发现
- 配置管理：配置中心、版本控制
- 命名空间管理：环境隔离、资源分组
- 服务监控：健康检查、服务列表
- 集群管理：节点管理、负载均衡

#### 3. 消息队列管理
- **RocketMQ**: 集群管理、主题管理、消费者管理、消息监控
- **Kafka**: 集群配置、主题管理、消费者组管理
- 消息追踪和监控
- 性能指标展示

#### 4. 数据同步 (Canal)
- Canal 实例管理
- 数据源配置
- 同步任务监控
- 告警配置

#### 5. 系统管理
- 应用实例管理
- 数据源管理
- 代码生成器
- 系统监控
- 日志管理

#### 6. 知识库 (Wiki)
- 文章管理
- 分类管理
- 文件上传
- 搜索功能
- 用户计划管理

#### 7. 开发运维 (DevOps)
- 接口管理
- 服务调用测试
- 配置管理
- 监控告警

### 🎨 界面特性
- **响应式设计**: 支持多种屏幕尺寸
- **主题切换**: 多种预设主题和自定义主题
- **国际化**: 支持中英文切换
- **权限控制**: 细粒度的页面和功能权限控制
- **数据可视化**: 丰富的图表和监控面板

## 快速开始

### 环境要求
- Node.js >= 12.0
- npm >= 8.0.0

### 安装依赖
```bash
# 克隆项目
git clone https://github.com/zhimin711/ch-admin2.git

# 进入项目目录
cd ch-admin2

# 安装依赖
npm install

# 或使用淘宝镜像加速
npm install --registry=https://registry.npm.taobao.org
```

### 开发环境
```bash
# 启动开发服务器
npm run dev

# 浏览器访问
http://localhost:9527
```

### 生产构建
```bash
# 构建测试环境
npm run build:stage

# 构建生产环境
npm run build:prod
```

### 其他命令
```bash
# 代码检查
npm run lint

# 代码检查并自动修复
npm run lint -- --fix

# 预览构建结果
npm run preview

# 运行测试
npm run test:unit
```

## 项目结构

```
ch-admin2/
├── build/                 # 构建配置
├── mock/                  # Mock 数据
├── public/                # 静态资源
├── src/
│   ├── api/              # API 接口
│   │   ├── upms/         # 用户权限管理
│   │   ├── nacos/        # Nacos 服务治理
│   │   ├── rocketmq/     # RocketMQ 消息队列
│   │   ├── canal/        # Canal 数据同步
│   │   ├── wiki/         # 知识库
│   │   └── sys/          # 系统管理
│   ├── assets/           # 静态资源
│   ├── components/       # 公共组件
│   ├── directive/        # 自定义指令
│   ├── filters/          # 过滤器
│   ├── i18n/             # 国际化
│   ├── icons/            # 图标
│   ├── layout/           # 布局组件
│   ├── router/           # 路由配置
│   ├── store/            # 状态管理
│   ├── styles/           # 样式文件
│   ├── utils/            # 工具函数
│   └── views/            # 页面组件
│       ├── dashboard/    # 仪表盘
│       ├── upms/         # 用户权限管理
│       ├── nacos/        # Nacos 管理
│       ├── rocketMQ/     # RocketMQ 管理
│       ├── canal/        # Canal 管理
│       ├── wiki/         # 知识库
│       └── sys/          # 系统管理
├── tests/                # 测试文件
└── package.json          # 项目配置
```

## 配置说明

### 环境变量
项目支持多环境配置，在根目录创建对应的环境文件：

- `.env.development` - 开发环境
- `.env.staging` - 测试环境  
- `.env.production` - 生产环境

### 代理配置
开发环境下的 API 代理配置在 `vue.config.js` 中：

```javascript
proxy: {
  [process.env.VUE_APP_API]: {
    target: `http://your-api-server:port/`,
    changeOrigin: true,
    pathRewrite: {
      ['^' + process.env.VUE_APP_API]: ''
    }
  }
}
```

## 部署说明

### Docker 部署
项目提供了 Docker 配置文件：

```bash
# 构建镜像
docker build -t ch-admin:latest -f build/Dockerfile .

# 运行容器
docker run -p 80:80 ch-admin:latest
```

### Kubernetes 部署
项目包含 K8s 部署配置文件：

```bash
# 应用配置
kubectl apply -f build/k8s-deploy.yaml
```

## 浏览器支持

现代浏览器和 Internet Explorer 10+。

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>Safari |
| --------- | --------- | --------- | --------- |
| IE10, IE11, Edge | last 2 versions | last 2 versions | last 2 versions |

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进项目。

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 许可证

本项目基于 [MIT](https://github.com/zhimin711/ch-admin2/blob/master/LICENSE) 许可证开源。

## 联系方式

- 作者: zhimin711 <zhimin711@sina.com>
- 项目地址: https://github.com/zhimin711/ch-admin2

## 致谢

感谢以下开源项目的支持：
- [vue-element-admin](https://github.com/PanJiaChen/vue-element-admin) - 基础模板
- [Element UI](https://github.com/ElemeFE/element) - UI 组件库
- [Vue.js](https://github.com/vuejs/vue) - 前端框架