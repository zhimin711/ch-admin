import request from '@/utils/request2'

const namespace = '/upms/interface'

// 获取项目列表
export function getProjects() {
  return request({
    url: `/upms/projects/list`,
    method: 'get'
  })
}

// 根据项目获取模块列表
export function getModules(projectId) {
  return request({
    url: `${namespace}/modules`,
    method: 'get',
    params: {
      projectId: projectId
    }
  })
}

// 根据模块获取接口列表
export function getInterfaces(moduleId) {
  return request({
    url: `${namespace}/interfaces`,
    method: 'get',
    params: {
      moduleId: moduleId
    }
  })
}

// 获取接口详情
export function getInterfaceDetail(interfaceId) {
  return request({
    url: `${namespace}/detail`,
    method: 'get',
    params: {
      interfaceId: interfaceId
    }
  })
}
