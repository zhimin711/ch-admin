export default {
  message: {
    'switchLanguage': 'switch English Language Success！',
    deleteTip: 'Confirm to remove the selected data?',
    deleteSuccess: 'Delete success!'
  },
  input: {
    tips: {
      select: 'Please Select',
      userId: 'User ID',
      username: 'Username',
      realName: 'Real Name',
      status: 'Status',
      departmentName: 'please input department name',
      projectName: 'please input project name'
    }
  },
  route: {
    dashboard: 'Dashboard',
    documentation: 'Documentation',
    guide: 'Guide',
    systemManagement: 'System Management',
    userManagement: 'User Management',
    roleManagement: 'Role Management',
    permissionManagement: 'Permission Management',
    dictManagement: 'Dict Management',
    departmentManagement: 'Department Management',
    positionManagement: 'Position Management',
    logManagement: 'Log Management',
    loginLog: 'Login Log',
    operateLog: 'Operate Log',
    wikiManagement: 'Wiki Management',
    baseManagement: 'Base MG',
    resourceManagement: 'Resource MG',
    businessManagement: 'Business MG',
    uploadManagement: 'Upload Management',
    imageManagement: 'Images',
    fileManagement: 'Files',
    uploadRecord: 'Upload Records',
    adManagement: 'Ad',
    articleManagement: 'Article',
    bookManagement: 'Book',
    bookmarkManagement: 'Bookmark',
    kafkaManagement: 'Kafka Management',
    clusterManagement: 'Cluster Management',
    topicManagement: 'Topic Management',
    mockData: 'Mock Data',
    messageSearch: 'Message Search',
    dubboCall: 'Dubbo Call',
    profile: 'Profile',
    errorLog: 'Error Log',
    page401: '401',
    page404: '404'
  },
  navbar: {
    dashboard: 'Dashboard',
    github: 'Github',
    logOut: 'Log Out',
    profile: 'Profile',
    theme: 'Theme',
    size: 'Global Size'
  },
  login: {
    title: 'Login Form',
    logIn: 'Login',
    username: 'Username',
    password: 'Password',
    any: 'any',
    thirdparty: 'Or connect with',
    thirdpartyTips: 'Can not be simulated on local, so please combine you own business simulation! ! !'
  },
  documentation: {
    documentation: 'Documentation',
    github: 'Github Repository'
  },
  label: {
    actions: 'Actions',
    status: 'Status',
    enable: 'Enabled',
    disable: 'Disabled',
    hidden: 'Hidden',
    code: 'Code',
    name: 'Name',
    description: 'Description',
    sort: 'Sort',
    address: 'Address',
    icon: 'Icon',
    type: 'Type',
    method: 'Method',
    parent: 'Parent',
    warning: 'Warning',
    success: 'Success',
    tip: 'Tip',
    btn: 'Button',
    detail: 'Detail',
    catalog: 'Catalog',
    menu: 'Menu',
    interface: 'Interface',
    createTime: 'Create Time',
    updateTime: 'Update Time'
  },
  user: {
    add: 'Add User',
    edit: 'Edit User',
    name: 'User Name',
    roles: 'Assign Roles',
    initPwd: 'Init Password',
    department: 'Department',
    userId: 'User ID',
    username: 'Username',
    realName: 'Real Name',
    email: 'Email',
    mobilePhone: 'Mobile Phone',
    introduction: 'Introduction',
    userId2: 'User ID(System Generate)',
    position: 'Position',
    roles0: 'All Roles',
    roles1: 'Assign Roles'
  },
  role: {
    add: 'Add Role',
    edit: 'Edit Role',
    permissions: 'Assign Permissions'
  },
  permission: {
    add: 'Add Permission',
    edit: 'Edit Permission',
    switchRoles: 'Switch roles',
    tips: 'In some cases, using v-permission will have no effect. For example: Element-UI  el-tab or el-table-column and other scenes that dynamically render dom. You can only do this with v-if.'
  },
  department: {
    add: 'Add Department',
    edit: 'Edit Department',
    addChild: 'Add Child',
    positions: 'Assign Positions'
  },
  cluster: {
    add: 'Add Cluster',
    edit: 'Edit Cluster',
    name: 'Cluster Name'
  },
  guide: {
    description: 'The guide page is useful for some people who entered the project for the first time. You can briefly introduce the features of the project. Demo is based on ',
    button: 'Show Guide'
  },
  components: {
    documentation: 'Documentation',
    tinymceTips: 'Rich text is a core feature of the management backend, but at the same time it is a place with lots of pits. In the process of selecting rich texts, I also took a lot of detours. The common rich texts on the market have been basically used, and I finally chose Tinymce. See the more detailed rich text comparison and introduction.',
    dropzoneTips: 'Because my business has special needs, and has to upload images to qiniu, so instead of a third party, I chose encapsulate it by myself. It is very simple, you can see the detail code in @/components/Dropzone.',
    stickyTips: 'when the page is scrolled to the preset position will be sticky on the top.',
    backToTopTips1: 'When the page is scrolled to the specified position, the Back to Top button appears in the lower right corner',
    backToTopTips2: 'You can customize the style of the button, show / hide, height of appearance, height of the return. If you need a text prompt, you can use element-ui el-tooltip elements externally',
    imageUploadTips: 'Since I was using only the vue@1 version, and it is not compatible with mockjs at the moment, I modified it myself, and if you are going to use it, it is better to use official version.'
  },
  table: {
    dynamicTips1: 'Fixed header, sorted by header order',
    dynamicTips2: 'Not fixed header, sorted by click order',
    dragTips1: 'The default order',
    dragTips2: 'The after dragging order',
    title: 'Title',
    importance: 'Imp',
    type: 'Type',
    remark: 'Remark',
    search: 'Search',
    add: 'Add',
    export: 'Export',
    reviewer: 'reviewer',
    id: 'ID',
    date: 'Date',
    createDate: 'Create Date',
    author: 'Author',
    readings: 'Readings',
    status: 'Status',
    actions: 'Actions',
    edit: 'Edit',
    publish: 'Publish',
    draft: 'Draft',
    delete: 'Delete',
    cancel: 'Cancel',
    confirm: 'Confirm'
  },
  btn: {
    search: 'Search',
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    copy: 'Copy',
    reset: 'Reset',
    publish: 'Publish',
    draft: 'Draft',
    confirm: 'Confirm',
    save: 'Save',
    close: 'Close',
    cancel: 'Cancel',
    _cancel: 'Cancel',
    _confirm: 'Confirm',
    avatarUpload: 'Avatar Upload'
  },
  example: {
    warning: 'Creating and editing pages cannot be cached by keep-alive because keep-alive include does not currently support caching based on routes, so it is currently cached based on component name. If you want to achieve a similar caching effect, you can use a browser caching scheme such as localStorage. Or do not use keep-alive include to cache all pages directly. See details'
  },
  errorLog: {
    tips: 'Please click the bug icon in the upper right corner',
    description: 'Now the management system are basically the form of the spa, it enhances the user experience, but it also increases the possibility of page problems, a small negligence may lead to the entire page deadlock. Fortunately Vue provides a way to catch handling exceptions, where you can handle errors or report exceptions.',
    documentation: 'Document introduction'
  },
  excel: {
    export: 'Export',
    selectedExport: 'Export Selected Items',
    placeholder: 'Please enter the file name (default excel-list)'
  },
  zip: {
    export: 'Export',
    placeholder: 'Please enter the file name (default file)'
  },
  pdf: {
    tips: 'Here we use window.print() to implement the feature of downloading PDF.'
  },
  tagsView: {
    refresh: 'Refresh',
    close: 'Close',
    closeOthers: 'Close Others',
    closeAll: 'Close All'
  },
  settings: {
    title: 'Page style setting',
    theme: 'Theme Color',
    tagsView: 'Open Tags-View',
    fixedHeader: 'Fixed Header',
    sidebarLogo: 'Sidebar Logo',
    default: 'Default（Big）',
    medium: 'Medium',
    small: 'Small',
    mini: 'Mini'
  }
}
