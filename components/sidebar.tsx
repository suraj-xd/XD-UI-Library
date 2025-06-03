"use client"
import { cn } from "@/lib/utils"
import type { ComponentShowcaseItem } from "@/types"
import { FrigateIcon } from "./icons" // Placeholder for Frigade icon

interface SidebarProps {
  components: ComponentShowcaseItem[]
  isOpen: boolean
  onClose: () => void
  activeSection: string
  scrollToSection: (id: string) => void
}

export function Sidebar({ components, isOpen, onClose, activeSection, scrollToSection }: SidebarProps) {
  const handleLinkClick = (id: string) => {
    scrollToSection(id)
    if (isOpen) onClose()
  }

  const sidebarItems = [
    { id: "input", title: "Input" },
    { id: "activity", title: "Activity" },
    { id: "slider", title: "Slider" },
    { id: "countdown", title: "Countdown" },
    { id: "motion-for-react", title: "Motion for React" },
  ]

  // Use actual components if available, otherwise map from sidebarItems
  const displayComponents = components.length > 0 ? components : sidebarItems

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-30 bg-black/70 md:hidden" onClick={onClose} />}
      <aside
        className={cn(
          "fixed top-0 left-0 z-20 h-[calc(100vh-3.5rem-3.5rem)] w-56 bg-brand-bg-page transition-transform duration-300 ease-in-out md:translate-x-0 md:bg-brand-bg-page pt-4 flex flex-col",
          isOpen ? "translate-x-0 !bg-brand-bg-element" : "-translate-x-full",
        )}
      >
        <nav className="flex-grow px-3 py-2 overflow-y-auto">
          <ul className="space-y-0.5">
            {displayComponents.map((component) => (
              <li key={component.id}>
                <button
                  onClick={() => handleLinkClick(component.id)}
                  className={cn(
                    "w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors font-mono uppercase opacity-80",
                    activeSection === component.id
                      ? "text-brand-text-primary font-medium"
                      : "text-brand-text-secondary hover:text-brand-text-primary opacity-50",
                  )}
                  aria-current={activeSection === component.id ? "page" : undefined}
                >
                  {component.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  )
}
