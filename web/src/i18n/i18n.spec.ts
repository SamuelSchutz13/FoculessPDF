import { describe, expect, it } from 'vitest'
import { tools } from '@/lib/tools'
import { i18n, locales } from '.'

// en.ts is typed against pt-BR.ts, so both have the same keys; this checks that the
// tool catalog in lib/tools.ts has every text it needs in those messages.
describe.each(locales)('%s messages', (locale) => {
  const has = (key: string) => i18n.global.te(key, locale)

  it.each(tools.map((tool) => [tool.id, tool] as const))('cover the "%s" tool', (_, tool) => {
    expect(has(`tools.${tool.id}.title`)).toBe(true)
    expect(has(`tools.${tool.id}.description`)).toBe(true)
    expect(has(`accept.${tool.acceptKind}`)).toBe(true)

    for (const field of tool.fields) {
      const key = `tools.${tool.id}.fields.${field.name}`
      expect(has(`${key}.label`)).toBe(true)
      if (field.type === 'text') expect(has(`${key}.placeholder`)).toBe(true)
      else for (const option of field.options) expect(has(`${key}.options.${option.key}`)).toBe(true)
    }
  })
})
