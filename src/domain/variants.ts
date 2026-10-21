import type { Field, FormDefinition, TemplateError, VariantDefinition } from './types'

const LOCALE_PATTERN = /^[a-z]{2,3}(-[a-z0-9]{2,8})*$/

export function normalizeLocale(value: string): string | null {
  const normalized = value.trim().toLowerCase().replaceAll('_', '-')
  return LOCALE_PATTERN.test(normalized) ? normalized : null
}

export function primaryVariantOf(definition: FormDefinition): VariantDefinition {
  return (
    definition.variants.find((variant) => variant.locale === definition.primaryLocale) ??
    definition.variants[0]
  )
}

export function fieldByLabel(fields: Field[], label: string): Field | undefined {
  return fields.find((field) => field.label === label)
}

export function validateVariantDefinitions(
  variants: VariantDefinition[],
  primaryLocale: string,
): TemplateError[] {
  const errors: TemplateError[] = []
  const primary = variants.find((variant) => variant.locale === primaryLocale)

  if (primary === undefined) {
    return [
      {
        code: 'variant-mismatch',
        detail: 'missing-primary',
        params: { primaryLocale },
        message: `The primary locale "${primaryLocale}" does not match any variant.`,
      },
    ]
  }

  const locales = new Set<string>()
  for (const variant of variants) {
    if (locales.has(variant.locale)) {
      errors.push({
        code: 'duplicate-locale',
        detail: 'duplicate-locale',
        params: { locale: variant.locale },
        message: `The locale "${variant.locale}" is used more than once.`,
      })
    }
    locales.add(variant.locale)
  }

  const primaryByLabel = new Map(primary.fields.map((field) => [field.label, field]))

  for (const variant of variants) {
    if (variant.locale === primary.locale) {
      continue
    }

    const variantByLabel = new Map(variant.fields.map((field) => [field.label, field]))
    const missing = [...primaryByLabel.keys()].filter(
      (label) => !variantByLabel.has(label),
    )
    const extra = [...variantByLabel.keys()].filter(
      (label) => !primaryByLabel.has(label),
    )

    if (missing.length > 0 || extra.length > 0) {
      const details = [
        missing.length > 0 ? `missing: ${missing.join(', ')}` : '',
        extra.length > 0 ? `extra: ${extra.join(', ')}` : '',
      ]
        .filter((part) => part !== '')
        .join('; ')
      errors.push({
        code: 'variant-mismatch',
        detail: 'label-set-mismatch',
        params: {
          locale: variant.locale,
          primaryLocale: primary.locale,
          missing,
          extra,
        },
        message: `The locale "${variant.locale}" does not declare the same labels as "${primary.locale}" (${details}).`,
      })
      continue
    }

    for (const [label, primaryField] of primaryByLabel) {
      const field = variantByLabel.get(label)
      if (field === undefined) {
        continue
      }
      if (field.kind !== primaryField.kind) {
        errors.push({
          code: 'variant-mismatch',
          detail: 'kind-mismatch',
          params: {
            label,
            locale: variant.locale,
            primaryLocale: primary.locale,
            kind: field.kind,
            primaryKind: primaryField.kind,
          },
          message: `The field "${label}" is "${primaryField.kind}" in "${primary.locale}" but "${field.kind}" in "${variant.locale}".`,
          label,
        })
        continue
      }
      if (field.kind === 'select') {
        const primaryCount = primaryField.options?.length ?? 0
        const variantCount = field.options?.length ?? 0
        if (primaryCount !== variantCount) {
          errors.push({
            code: 'option-count-mismatch',
            detail: 'option-count-mismatch',
            params: {
              label,
              locale: variant.locale,
              primaryLocale: primary.locale,
              primaryCount,
              variantCount,
            },
            message: `The select field "${label}" has ${primaryCount} options in "${primary.locale}" but ${variantCount} in "${variant.locale}". Options are paired by position, so the counts must match.`,
            label,
          })
        }
      }
    }
  }

  return errors
}
