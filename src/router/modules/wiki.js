/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'
import Blank from '@/layout/index2'

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
    {
      path: 'base',
      redirect: '/wiki/base/user',
      component: Blank,
      alwaysShow: true,
      name: 'WikiBase',
      meta: {
        title: '基础管理',
        icon: 'lock'
      },
      children: [
        {
          path: 'user',
          component: () => import('@/views/wiki/base/user'),
          name: 'WikiUser',
          meta: {
            title: '用户管理'
          }
        }
      ]
    },
    {
      path: 'business',
      redirect: '/wiki/business/ad',
      component: Blank,
      alwaysShow: true,
      name: 'WikiBusiness',
      meta: {
        title: '运营管理',
        icon: 'lock'
      },
      children: [
        {
          path: 'books',
          component: () => import('@/views/wiki/business/books/index'),
          name: 'WikiBooks',
          meta: {
            title: '书籍管理'
          }
        },
        {
          path: 'bookmark',
          component: () => import('@/views/wiki/business/bookmark'),
          name: 'WikiBookmark',
          meta: {
            title: '书签管理'
          }
        }
      ]
    },
    {
      path: 'resources',
      redirect: '/wiki/resources/uploadFile',
      component: Blank,
      alwaysShow: true,
      name: 'WikiResources',
      meta: {
        title: '资源管理',
        icon: 'lock'
      },
      children: [
        {
          path: 'uploadFile',
          component: () => import('@/views/wiki/resources/uploadFile'),
          name: 'WikiUploadFile',
          meta: {
            title: '上传记录'
          }
        },
        {
          path: 'images',
          component: () => import('@/views/wiki/resources/images'),
          name: 'WikiImages',
          meta: {
            title: '图片管理'
          }
        }
      ]
    }
  ]
}

const routerMap = {
  Wiki: {
    path: '/wiki',
    component: Layout,
    redirect: '/wiki/base/user',
    alwaysShow: true, // will always show the root menu
    name: 'WikiManagement',
    meta: {
      code: 'wikiManagement'
    }
  },
  WikiBase: {
    path: 'base',
    redirect: '/wiki/base/user',
    component: Blank,
    alwaysShow: true,
    name: 'WikiBaseManagement',
    meta: {
      code: 'baseManagement'
    }
  },
  WikiUser: {
    path: 'user',
    component: () => import('@/views/wiki/base/user'),
    name: 'WikiUser',
    meta: {
      code: 'userManagement'
    }
  },
  WikiCategory: {
    path: 'category',
    component: () => import('@/views/wiki/base/category'),
    name: 'WikiCategory',
    meta: {
      title: '分类管理'
    }
  },
  WikiBusiness: {
    path: 'business',
    redirect: '/wiki/business/ad',
    component: Blank,
    alwaysShow: true,
    name: 'WikiBusiness',
    meta: {
      code: 'businessManagement'
    }
  },
  WikiAd: {
    path: 'ad',
    component: () => import('@/views/wiki/business/ad'),
    name: 'WikiAd',
    meta: {
      code: 'adManagement'
    }
  },
  WikiArticle: {
    path: 'article',
    component: () => import('@/views/wiki/business/article/index'),
    name: 'WikiArticle',
    meta: {
      code: 'articleManagement'
    }
  },
  WikiBooks: {
    path: 'books',
    component: () => import('@/views/wiki/business/books/index2'),
    name: 'WikiBooks',
    meta: {
      code: 'bookManagement'
    }
  },
  WikiBookmark: {
    path: 'bookmark',
    component: () => import('@/views/wiki/business/bookmark'),
    name: 'WikiBookmark',
    meta: {
      code: 'bookmarkManagement'
    }
  },
  WikiArticleAdd: {
    path: 'article/add',
    component: () => import('@/views/wiki/business/article/articleAdd'),
    name: 'WikiArticleAdd',
    hidden: true,
    meta: {
      title: '创建文档',
      noCache: true,
      activeMenu: '/wiki/business/article'
    }
  },
  WikiArticleEdit: {
    path: 'article/edit/:id(\\d+)',
    component: () => import('@/views/wiki/business/article/articleEdit'),
    name: 'WikiArticleEdit',
    hidden: true,
    meta: {
      title: '创建文档',
      noCache: true,
      activeMenu: '/wiki/business/article'
    }
  },
  WikiArticleRecommend: {
    path: 'article/recommend',
    component: () => import('@/views/wiki/business/article/articleRecommend'),
    name: 'WikiArticleRecommend',
    hidden: true,
    meta: {
      title: '创建文档',
      noCache: true,
      activeMenu: '/wiki/business/article'
    }
  },
  WikiBookCatalogAdd: {
    path: 'book/add',
    component: () => import('@/views/wiki/business/books/catalogAdd'),
    name: 'WikiBookCatalogAdd',
    hidden: true,
    meta: {
      title: '创建文档',
      noCache: true,
      activeMenu: '/wiki/business/books'
    }
  },
  WikiBookCatalogEdit: {
    path: 'book/edit/:id(\\d+)',
    // redirect: '/wiki/book/edit/:id(\\d+)',
    component: () => import('@/views/wiki/business/books/catalogEdit'),
    name: 'WikiBookCatalogEdit',
    hidden: true,
    meta: {
      title: '创建文档',
      noCache: true,
      activeMenu: '/wiki/business/books'
    }
  },
  WikiBookChapterAdd: {
    path: 'book/chapter/add',
    component: () => import('@/views/wiki/business/books/chapterCreate'),
    name: 'WikiBookChapterAdd',
    hidden: true,
    meta: {
      title: '创建文档',
      noCache: true,
      activeMenu: '/wiki/business/books'
    }
  },
  WikiBookChapterEdit: {
    path: 'book/chapter/edit/:id([a-zA-Z_0-9]+)',
    component: () => import('@/views/wiki/business/books/chapterEdit'),
    name: 'WikiBookChapterEdit',
    hidden: true,
    meta: {
      title: '创建文档',
      noCache: true,
      activeMenu: '/wiki/business/books'
    }
  },
  WikiBookPreview: {
    path: 'book/preview/:id(\\d+)',
    component: () => import('@/views/wiki/business/books/bookPreview'),
    name: 'WikiBookPreview',
    hidden: true,
    meta: {
      title: '创建文档',
      noCache: true,
      activeMenu: '/wiki/business/books'
    }
  },
  WikiResources: {
    path: 'resources',
    redirect: '/wiki/Resources/images',
    component: Blank,
    alwaysShow: true,
    name: 'WikiResources',
    meta: {
      code: 'resourceManagement'
    }
  },
  WikiResourcesImage: {
    path: 'image',
    component: () => import('@/views/wiki/resources/images'),
    name: 'WikiResourcesImage',
    meta: {
      code: 'imageManagement'
    }
  },
  WikiResourcesVideo: {
    path: 'video',
    component: () => import('@/views/wiki/business/media'),
    name: 'WikiResourcesVideo',
    meta: {
      code: 'videoManagement'
    }
  },
  WikiVideoAdd: {
    path: 'video/add',
    component: () => import('@/views/wiki/business/media/videoAdd'),
    name: 'WikiVideoAdd',
    hidden: true,
    meta: {
      title: '发布视频',
      noCache: true,
      activeMenu: '/wiki/resources/video'
    }
  },
  WikiVideoEdit: {
    path: 'video/edit/:id(\\d+)',
    component: () => import('@/views/wiki/business/media/videoEdit'),
    name: 'WikiVideoEdit',
    hidden: true,
    meta: {
      title: '编辑视频',
      noCache: true,
      activeMenu: '/wiki/resources/video'
    }
  },
  WikiResourcesFile: {
    path: 'file',
    component: () => import('@/views/wiki/resources/files'),
    name: 'WikiResourcesFile',
    meta: {
      code: 'fileManagement'
    }
  },
  WikiResourcesRecord: {
    path: 'record',
    component: () => import('@/views/wiki/resources/uploadFile'),
    name: 'WikiResourcesRecord',
    meta: {
      code: 'uploadRecord'
    }
  }
}

export function getWikiRouter(code) {
  return routerMap[code]
}

export default wikiRouter
