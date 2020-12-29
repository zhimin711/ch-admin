import Vue from 'vue'
import locale from 'element-ui/lib/locale'
import VueI18n from 'vue-i18n'
import Cookies from 'js-cookie'
import messages from './lang'

Vue.use(VueI18n)

export function getLanguage() {
  const chooseLanguage = Cookies.get('language')
  if (chooseLanguage) return chooseLanguage

  // if has not choose language
  const language = (navigator.language || navigator.browserLanguage).toLowerCase()
  const locales = Object.keys(messages)
  for (const locale of locales) {
    if (language.indexOf(locale) > -1) {
      return locale
    }
  }
  return 'zh'
}

// translate router.meta.title, be used in breadcrumb sidebar tagsview
export function translatedRouteTitle(code, title) {
  if (code) {
    const hasKey = this.$te('route.' + code)
    if (hasKey) {
      // $t :this method from vue-i18n, inject in @/lang/index.js
      const translatedTitle = this.$t('route.' + code)

      return translatedTitle
    }
  }
  return code || title
}

// 从localStorage获取语言选择。
const i18n = new VueI18n({
  locale: getLanguage(), // 初始未选择默认 zh 中文
  messages
})
locale.i18n((key, value) => i18n.t(key, value)) // 兼容element

export default i18n
