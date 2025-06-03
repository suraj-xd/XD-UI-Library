"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"

export default function CounterExample() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex items-center justify-center gap-4 p-8 bg-brand-bg-page rounded-lg text-brand-text-primary">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setCount(count - 1)}
        className="text-brand-text-primary border-brand-border-subtle hover:bg-brand-bg-active"
        aria-label="Decrement count"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="text-4xl font-mono min-w-[60px] text-center">{count}</span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setCount(count + 1)}
        className="text-brand-text-primary border-brand-border-subtle hover:bg-brand-bg-active"
        aria-label="Increment count"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
