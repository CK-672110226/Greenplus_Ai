import { useSelector } from 'react-redux'
import { useEffect } from 'react'
import i18n from '../i18n'
import { en } from '../i18n/en'
import { th } from '../i18n/th'

const translations = { en, th }

export function useT() {
  const language = useSelector(s => s.user.language)
  useEffect(() => { i18n.changeLanguage(language) }, [language])
  return translations[language] ?? en
}
