import type { ReactElement } from "react"

export interface ComponentShowcaseItem {
  id: string
  title: string
  description: string
  component: ReactElement
  code: string
  link?: string
  dependencies?: string[]
}
