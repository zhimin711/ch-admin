import * as vClickOutside from 'v-click-outside-x'

const install = function(Vue) {
  Vue.directive('clickOutside', vClickOutside)
}

if (window.Vue) {
  window.clickOutside = vClickOutside
  Vue.use(install); // eslint-disable-line
}

vClickOutside.install = install
export default vClickOutside
