/*
 * All i18n resources specified in the plugin `include` option can be loaded
 * at once using the import syntax
 */
import messages from '@intlify/unplugin-vue-i18n/messages'
import style from '@proctoring/sdk/assets/scss/base.module.scss'
import { createI18n } from 'vue-i18n'

const STORAGE_KEY = 'proctoring_last_user_locale'

const defaultLocale = 'ru'
const fallbackLocale = 'ru'

const i18n = createI18n({
  legacy: false,
  locale: defaultLocale,
  fallbackLocale,
  messages,
  pluralRules: {
    ru(choice, choicesLength) {
      if (choice === 0) {
        return 0
      }

      const teen = choice > 10 && choice < 20
      const endsWithOne = choice % 10 === 1
      if (!teen && endsWithOne) {
        return 1
      }
      if (!teen && choice % 10 >= 2 && choice % 10 <= 4) {
        return 2
      }

      return choicesLength < 4 ? 2 : 3
    },
  },
})

export function setLocale(
  locale: string | null = JSON.parse(localStorage.getItem(STORAGE_KEY) || '""'),
): void {
  i18n.global.locale.value
    // Looking if locale available
    = i18n.global.availableLocales.find(lang => lang === locale)
    // Checking one of the system language is available
      || navigator.languages.find(lang => lang === defaultLocale)
      || navigator.languages.find(lang => i18n.global.availableLocales.includes(lang))
    // Stay with default for propper typings
      || defaultLocale

  localStorage.setItem(STORAGE_KEY, JSON.stringify(i18n.global.locale.value))

  // const { direction } = availableLocales[locale]
  const root = document.getElementById(style.app)!

  // root.setAttribute('dir', direction)
  root.setAttribute('lang', i18n.global.locale.value)
}

export default i18n
