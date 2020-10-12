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
  ]
}

const routerMap = {
  Wiki: {
    path: '/wiki',
    component: Layout,
    redirect: '/wiki/base/user',
    alwaysShow: true, // will always show the root menu
    name: 'Wiki',
    meta: {
      title: '极客管理',
      icon: 'lock'
    }
  },
  WikiBase: {
    path: 'base',
    redirect: '/wiki/base/user',
    component: Blank,
    alwaysShow: true,
    name: 'WikiBase',
    meta: {
      title: '集群管理',
      icon: 'lock'
    }
  },
  WikiUser: {
    path: 'user',
    component: () => import('@/views/wiki/base/user'),
    name: 'WikiUser',
    meta: {
      title: '用户管理'
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
      title: '运营管理',
      icon: 'lock'
    }
  },
  WikiAd: {
    path: 'ad',
    component: () => import('@/views/wiki/business/ad'),
    name: 'WikiAd',
    meta: {
      title: '广告管理'
    }
  },
  WikiArticle: {
    path: 'article',
    component: () => import('@/views/wiki/business/article/index'),
    name: 'WikiArticle',
    meta: {
      title: '文章管理'
    }
  },
  WikiBooks: {
    path: 'books',
    component: () => import('@/views/wiki/business/books/index'),
    name: 'WikiBooks',
    meta: {
      title: '书籍管理'
    }
  },
  WikiBookmark: {
    path: 'bookmark',
    component: () => import('@/views/wiki/business/bookmark'),
    name: 'WikiBookmark',
    meta: {
      title: '权限管理'
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
      title: '运营管理',
      icon: 'lock'
    }
  },
  WikiResourcesImage: {
    path: 'image',
    component: () => import('@/views/wiki/resources/images'),
    name: 'WikiResourcesImage',
    meta: {
      title: '广告管理'
    }
  },
  WikiResourcesFile: {
    path: 'file',
    component: () => import('@/views/wiki/resources/files'),
    name: 'WikiResourcesFile',
    meta: {
      title: '文章管理'
    }
  },
  WikiResourcesRecord: {
    path: 'record',
    component: () => import('@/views/wiki/resources/uploadFile'),
    name: 'WikiResourcesRecord',
    meta: {
      title: '书籍管理'
    }
  }
}

export function getWikiRouter(code) {
  return routerMap[code]
}
export default wikiRouter
