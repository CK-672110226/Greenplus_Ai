import { useSelector } from 'react-redux'
import { localName } from '../data/wasteItems'

export function useResolvedName() {
  const customLabels = useSelector(s => s.customLabels)
  const language     = useSelector(s => s.user.language)

  return function resolve(materialType) {
    const custom = customLabels[materialType]
    if (custom) return (language === 'th' ? custom.th : custom.en) || materialType
    return localName(materialType, language)
  }
}
