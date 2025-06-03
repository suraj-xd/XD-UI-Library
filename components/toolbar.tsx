"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LayoutGrid, Github, Twitter } from "lucide-react" // Using Twitter icon
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation" // To determine active state

interface ToolbarProps {
  githubUrl: string
  twitterUrl: string // Changed from follow
}

export function Toolbar({ githubUrl, twitterUrl }: ToolbarProps) {
  const pathname = usePathname() // Assuming examples page is root or /examples

  const toolbarItems = [
    {
      name: "Examples",
      icon: LayoutGrid,
      href: "/",
      activeCondition: () => pathname === "/" || pathname.startsWith("/examples"),
    },
    { name: "GitHub", icon: Github, href: githubUrl, count: "6.3k", target: "_blank" },
    { name: "Twitter", icon: Twitter, href: twitterUrl, target: "_blank" },
  ]

  return (
    <footer className="fixed bottom-3 p-4 left-0 right-0 z-50 h-20 flex items-center justify-center pointer-events-none">
      <nav className="flex items-center justify-center gap-2 p-1.5 bg-brand-bg-element/80 backdrop-blur-md border border-brand-border-subtle rounded-xl shadow-2xl pointer-events-auto">
        {toolbarItems.map((item) => {
          const isActive = item.activeCondition ? item.activeCondition() : false
          return (
            <Button
              key={item.name}
              variant="ghost"
              asChild
              className={cn(
                "flex p-2 items-center justify-center px-2 py-1.5 rounded-lg text-xs transition-all duration-200 ease-out hover:bg-gray-100/5",
                isActive
                  ? "bg-gray-100/10"
                  : "text-brand-text-secondary hover:text-brand-text-primary",
              )}
            >
              <Link href={item.href} target={item.target} aria-current={isActive ? "page" : undefined}>
                <item.icon className="h-5 w-5 mb-0.5" />
                {item.name}
                {item.count && <span className="sr-only"> ({item.count})</span>}
              </Link>
            </Button>
          )
        })}
      </nav>
    </footer>
  )
}
