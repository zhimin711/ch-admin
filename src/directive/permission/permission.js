import store from '@/store'

function checkPermission(el, binding) {
  const { value } = binding
  const permissions = store.getters && store.getters.permissions

  let permissionRoles = []
  if (typeof value === 'string') {
    permissionRoles.push(value)
  } else if (value && value instanceof Array) {
    permissionRoles = value
  }
  if (permissionRoles.length > 0) {
    const hasPermission = permissions.some(permission => {
      return permissionRoles.includes(permission.code)
    })

    if (!hasPermission && !(process.env.VUE_APP_MOCK_BASE === 'true')) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  } else {
    throw new Error(`need roles! Like v-permission="['xxx']"`)
  }
}

export default {
  inserted(el, binding) {
    checkPermission(el, binding)
  },
  update(el, binding) {
    checkPermission(el, binding)
  }
}
