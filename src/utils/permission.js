import store from '@/store'

/**
 * @param {Array} value
 * @returns {Boolean}
 * @example see @/views/permission/directive.vue
 */
export default function checkPermission(value) {
  if (value && value instanceof Array && value.length > 0) {
    const roles = store.getters && store.getters.roles
    const permissionRoles = value

    const hasPermission = roles.some(role => {
      return permissionRoles.includes(role)
    })

    if (!hasPermission) {
      return false
    }
    return true
  } else {
    console.error(`need roles! Like v-permission="['admin','editor']"`)
    return false
  }
}

export function checkPermission2(value) {
  if (typeof value === 'string') {
    value = [value]
  }
  if (value && value instanceof Array && value.length > 0) {
    const permissions = store.getters && store.getters.permissions
    const permissionCodes = value

    const hasPermission = permissions.some(permission => {
      return permissionCodes.includes(permission.code)
    })
    return hasPermission
  } else {
    // console.error(`need roles! Like v-permission="['admin','editor']"`)
    return false
  }
}
