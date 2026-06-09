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

[简体中文](./README.md) | English

## Introduction

Chao Hua Admin System is an enterprise-level DevOps management platform based on Vue 2 + Element UI, specifically designed for cloud-native and microservices architecture. The system integrates visual management functions for various mainstream middleware and services, providing complete enterprise-level features such as permission management, project management, monitoring and alerting.

## Core Features

### 🚀 Tech Stack
- **Frontend Framework**: Vue 2.6.10 + Vue Router + Vuex
- **UI Component Library**: Element UI 2.15.7
- **Build Tool**: Vue CLI 4.4.4
- **Charts Library**: ECharts 5.3.2
- **Maps**: AMap Vue AMap
- **Rich Text Editor**: TinyMCE 5.5.1
- **Code Editor**: CodeMirror 5.65.4

### 🏗️ System Architecture
- **Permission Management**: Role-Based Access Control (RBAC)
- **Multi-tenant Support**: Complete tenant isolation and management
- **Dynamic Routing**: Permission-based dynamic menu generation
- **Internationalization**: Multi-language support
- **Theme Customization**: Multiple themes and custom styles support

### 📊 Feature Modules

#### 1. User Permission Management (UPMS)
- User Management: User information, role assignment, permission control
- Role Management: Role definition, permission configuration
- Department Management: Organizational structure, hierarchical management
- Tenant Management: Multi-tenant isolation, resource allocation
- Project Management: Project creation, member management, permission assignment

#### 2. Service Governance (Nacos)
- Service Registration and Discovery
- Configuration Management: Configuration center, version control
- Namespace Management: Environment isolation, resource grouping
- Service Monitoring: Health checks, service lists
- Cluster Management: Node management, load balancing

#### 3. Message Queue Management
- **RocketMQ**: Cluster management, topic management, consumer management, message monitoring
- **Kafka**: Cluster configuration, topic management, consumer group management
- Message tracking and monitoring
- Performance metrics display

#### 4. Data Synchronization (Canal)
- Canal instance management
- Data source configuration
- Sync task monitoring
- Alert configuration

#### 5. System Management
- Application instance management
- Data source management
- Code generator
- System monitoring
- Log management

#### 6. Knowledge Base (Wiki)
- Article management
- Category management
- File upload
- Search functionality
- User plan management

#### 7. Development Operations (DevOps)
- Interface management
- Service call testing
- Configuration management
- Monitoring and alerting

### 🎨 Interface Features
- **Responsive Design**: Support for multiple screen sizes
- **Theme Switching**: Multiple preset themes and custom themes
- **Internationalization**: Support for Chinese and English switching
- **Permission Control**: Fine-grained page and function permission control
- **Data Visualization**: Rich charts and monitoring panels

## Quick Start

### Prerequisites
- Node.js >= 12.0
- npm >= 8.0.0

### Installation
```bash
# Clone the project
git clone https://github.com/zhimin711/ch-admin2.git

# Enter the project directory
cd ch-admin2

# Install dependencies
npm install

# Or use Taobao registry for faster installation
npm install --registry=https://registry.npm.taobao.org
```

### Development
```bash
# Start development server
npm run dev

# Browser access
http://localhost:9527
```

### Production Build
```bash
# Build for staging environment
npm run build:stage

# Build for production environment
npm run build:prod
```

### Other Commands
```bash
# Code linting
npm run lint

# Code linting with auto-fix
npm run lint -- --fix

# Preview build results
npm run preview

# Run tests
npm run test:unit
```

## Project Structure

```
ch-admin2/
├── build/                 # Build configuration
├── mock/                  # Mock data
├── public/                # Static assets
├── src/
│   ├── api/              # API interfaces
│   │   ├── upms/         # User permission management
│   │   ├── nacos/        # Nacos service governance
│   │   ├── rocketmq/     # RocketMQ message queue
│   │   ├── canal/        # Canal data synchronization
│   │   ├── wiki/         # Knowledge base
│   │   └── sys/          # System management
│   ├── assets/           # Static assets
│   ├── components/       # Common components
│   ├── directive/        # Custom directives
│   ├── filters/          # Filters
│   ├── i18n/             # Internationalization
│   ├── icons/            # Icons
│   ├── layout/           # Layout components
│   ├── router/           # Route configuration
│   ├── store/            # State management
│   ├── styles/           # Style files
│   ├── utils/            # Utility functions
│   └── views/            # Page components
│       ├── dashboard/    # Dashboard
│       ├── upms/         # User permission management
│       ├── nacos/        # Nacos management
│       ├── rocketMQ/     # RocketMQ management
│       ├── canal/        # Canal management
│       ├── wiki/         # Knowledge base
│       └── sys/          # System management
├── tests/                # Test files
└── package.json          # Project configuration
```

## Configuration

### Environment Variables
The project supports multi-environment configuration. Create corresponding environment files in the root directory:

- `.env.development` - Development environment
- `.env.staging` - Staging environment  
- `.env.production` - Production environment

### Proxy Configuration
API proxy configuration for development environment is in `vue.config.js`:

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

## Deployment

### Docker Deployment
The project provides Docker configuration files:

```bash
# Build image
docker build -t ch-admin:latest -f build/Dockerfile .

# Run container
docker run -p 80:80 ch-admin:latest
```

### Kubernetes Deployment
The project includes K8s deployment configuration files:

```bash
# Apply configuration
kubectl apply -f build/k8s-deploy.yaml
```

## Browser Support

Modern browsers and Internet Explorer 10+.

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>Safari |
| --------- | --------- | --------- | --------- |
| IE10, IE11, Edge | last 2 versions | last 2 versions | last 2 versions |

## Contributing

We welcome contributions! Please feel free to submit Issues and Pull Requests to help improve the project.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the [MIT](https://github.com/zhimin711/ch-admin2/blob/master/LICENSE) License.

## Contact

- Author: zhimin711 <zhimin711@sina.com>
- Project URL: https://github.com/zhimin711/ch-admin2

## Acknowledgments

Thanks to the following open source projects for their support:
- [vue-element-admin](https://github.com/PanJiaChen/vue-element-admin) - Base template
- [Element UI](https://github.com/ElemeFE/element) - UI component library
- [Vue.js](https://github.com/vuejs/vue) - Frontend framework