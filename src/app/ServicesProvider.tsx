import type { ReactNode } from 'react'
import { ServicesContext } from './services'
import type { Services } from './services'

export function ServicesProvider({
  value,
  children,
}: {
  value: Services
  children: ReactNode
}) {
  return <ServicesContext.Provider value={value}>{children}</ServicesContext.Provider>
}
