/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const wikiRouter = {
  path: '/wiki',
  component: Layout,
  redirect: '/wiki/category',
  alwaysShow: true, // will always show the root menu
  name: 'Wiki Manager',
  meta: {
    title: '极客管理',
    icon: 'lock'
  },
  children: [
    // {
    //   path: 'category',
    //   component: () => import('@/views/wiki/category'),
    //   name: 'Category',
    //   meta: {
    //     title: '分类管理'
    //   }
    // },
    // {
    //   path: 'uploadFile',
    //   component: () => import('@/views/wiki/uploadFile'),
    //   name: 'WikiUploadRecordManager',
    //   meta: {
    //     title: '上传记录',
    //     roles: ['admin']
    //   }
    // }
  ]
}
export default wikiRouter
