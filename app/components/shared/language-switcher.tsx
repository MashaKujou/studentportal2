'use client'

import { useLanguage } from '@/app/contexts/language-context'
import { SUPPORTED_LANGUAGES, Language } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center gap-1">
      <Globe className="w-4 h-4 text-muted-foreground" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="bg-transparent border-none text-sm cursor-pointer hover:text-foreground transition-colors"
      >
        {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>
    </div>
  )
}
