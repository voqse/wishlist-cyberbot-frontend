import { createI18n } from 'vue-i18n'

import en from '@/locales/en'
import ru from '@/locales/ru'

export type Locale = keyof typeof messages

const messages = {
  en,
  ru,
}

const defaultLocale = 'en'
const fallbackLocale = 'en'

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

const trim = (locale: string) => locale.split(/-|_/)[0] as Locale

export function setLocale(
  locale?: Locale,
): void {
  const appLocales = i18n.global.availableLocales
  const userLocale
    // Looking if locale available
    = appLocales.find(lang => lang === locale)
      // Checking one of the system languages available
      || navigator.languages.map(trim).find(lang => appLocales.includes(lang))
      // Stay with default for propper typings
      || defaultLocale

  i18n.global.locale.value = userLocale as Locale

  const root = document.documentElement!
  root.setAttribute('lang', userLocale)
  root.setAttribute('dir', i18n.global.t('meta.direction'))
}

export default i18n
