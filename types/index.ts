import type { ReactElement, LazyExoticComponent, ComponentType } from "react"

export interface ComponentShowcaseItem {
  id: string
  title: string
  description: string
  component: any
  code: string
  link?: string
  dependencies?: string[]
}
