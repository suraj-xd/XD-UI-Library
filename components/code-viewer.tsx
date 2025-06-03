"use client"

import { useState } from "react"
import { Highlight, themes } from "prism-react-renderer"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

interface CodeViewerProps {
  code: string
  language?: string
}

export function CodeViewer({ code, language = "tsx" }: CodeViewerProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-10 text-brand-text-secondary hover:text-brand-text-primary opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleCopy}
        aria-label="Copy code"
      >
        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
      </Button>
      <Highlight   theme={themes.ultramin} code={code} language={language as any}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={`${className} p-4 invert rounded-b-md overflow-y-auto text-sm bg-neutral-900 h-[500px]`} // bg-neutral-900 for code block
            style={style}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line, key: i })}>
                {line.map((token, key) => (
                  <span key={token.types[0]} {...getTokenProps({ token, key })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  )
}
