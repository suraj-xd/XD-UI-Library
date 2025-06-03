'use client'

import React, { useEffect, useRef, useState } from "react"
import { motion, useAnimationControls, ValueAnimationTransition } from "framer-motion"
import { cn } from "@/lib/utils"

interface UnderlineBaseProps {
  label: string
  className?: string
  onClick?: () => void
  underlineHeightRatio?: number
  underlinePaddingRatio?: number
  transition?: ValueAnimationTransition
}

interface DirectionalUnderlineProps extends UnderlineBaseProps {
  direction?: "left" | "right"
}

// Center Underline
export function CenterUnderline({
  label,
  className,
  onClick,
  transition = { duration: 0.25, ease: "easeInOut" },
  underlineHeightRatio = 0.1,
  underlinePaddingRatio = 0.01,
  ...props
}: UnderlineBaseProps) {
  const textRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const updateUnderlineStyles = () => {
      if (textRef.current) {
        const fontSize = parseFloat(getComputedStyle(textRef.current).fontSize)
        const underlineHeight = fontSize * underlineHeightRatio
        const underlinePadding = fontSize * underlinePaddingRatio
        textRef.current.style.setProperty(
          "--underline-height",
          `${underlineHeight}px`
        )
        textRef.current.style.setProperty(
          "--underline-padding",
          `${underlinePadding}px`
        )
      }
    }

    updateUnderlineStyles()
    window.addEventListener("resize", updateUnderlineStyles)

    return () => window.removeEventListener("resize", updateUnderlineStyles)
  }, [underlineHeightRatio, underlinePaddingRatio])

  return (
    <motion.span
      className={cn("relative inline-block cursor-pointer", className)}
      whileHover="visible"
      onClick={onClick}
      ref={textRef}
      {...props}
    >
      <span>{label}</span>
      <motion.div
        className="absolute left-1/2 bg-current -translate-x-1/2"
        style={{
          height: "var(--underline-height)",
          bottom: "calc(-1 * var(--underline-padding))",
        }}
        variants={{
          hidden: {
            width: 0,
            originX: 0.5,
          },
          visible: {
            width: "100%",
            transition: transition,
          },
        }}
      />
    </motion.span>
  )
}

// Comes In Goes Out Underline
export function ComesInGoesOutUnderline({
  label,
  direction = "left",
  className,
  onClick,
  underlineHeightRatio = 0.1,
  underlinePaddingRatio = 0.01,
  transition = {
    duration: 0.4,
    ease: "easeInOut",
  },
  ...props
}: DirectionalUnderlineProps) {
  const controls = useAnimationControls()
  const [blocked, setBlocked] = useState(false)
  const textRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const updateUnderlineStyles = () => {
      if (textRef.current) {
        const fontSize = parseFloat(getComputedStyle(textRef.current).fontSize)
        const underlineHeight = fontSize * underlineHeightRatio
        const underlinePadding = fontSize * underlinePaddingRatio
        textRef.current.style.setProperty(
          "--underline-height",
          `${underlineHeight}px`
        )
        textRef.current.style.setProperty(
          "--underline-padding",
          `${underlinePadding}px`
        )
      }
    }

    updateUnderlineStyles()
    window.addEventListener("resize", updateUnderlineStyles)

    return () => window.removeEventListener("resize", updateUnderlineStyles)
  }, [underlineHeightRatio, underlinePaddingRatio])

  const animate = async () => {
    if (blocked) return

    setBlocked(true)

    await controls.start({
      width: "100%",
      transition,
      transitionEnd: {
        left: direction === "left" ? "auto" : 0,
        right: direction === "left" ? 0 : "auto",
      },
    })

    await controls.start({
      width: 0,
      transition,
      transitionEnd: {
        left: direction === "left" ? 0 : "",
        right: direction === "left" ? "" : 0,
      },
    })

    setBlocked(false)
  }

  return (
    <motion.span
      className={cn("relative inline-block cursor-pointer", className)}
      onHoverStart={animate}
      onClick={onClick}
      ref={textRef}
      {...props}
    >
      <span>{label}</span>
      <motion.span
        className={cn("absolute bg-current w-0", {
          "left-0": direction === "left",
          "right-0": direction === "right",
        })}
        style={{
          height: "var(--underline-height)",
          bottom: "calc(-1 * var(--underline-padding))",
        }}
        animate={controls}
      />
    </motion.span>
  )
}

// Goes Out Comes In Underline
export function GoesOutComesInUnderline({
  label,
  direction = "left",
  className,
  onClick,
  underlineHeightRatio = 0.1,
  underlinePaddingRatio = 0.01,
  transition = {
    duration: 0.5,
    ease: "easeOut",
  },
  ...props
}: DirectionalUnderlineProps) {
  const controls = useAnimationControls()
  const [blocked, setBlocked] = useState(false)
  const textRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const updateUnderlineStyles = () => {
      if (textRef.current) {
        const fontSize = parseFloat(getComputedStyle(textRef.current).fontSize)
        const underlineHeight = fontSize * underlineHeightRatio
        const underlinePadding = fontSize * underlinePaddingRatio
        textRef.current.style.setProperty(
          "--underline-height",
          `${underlineHeight}px`
        )
        textRef.current.style.setProperty(
          "--underline-padding",
          `${underlinePadding}px`
        )
      }
    }

    updateUnderlineStyles()
    window.addEventListener("resize", updateUnderlineStyles)

    return () => window.removeEventListener("resize", updateUnderlineStyles)
  }, [underlineHeightRatio, underlinePaddingRatio])

  const animate = async () => {
    if (blocked) return

    setBlocked(true)

    await controls.start({
      width: 0,
      transition,
      transitionEnd: {
        left: direction === "left" ? "auto" : 0,
        right: direction === "left" ? 0 : "auto",
      },
    })

    await controls.start({
      width: "100%",
      transition,
      transitionEnd: {
        left: direction === "left" ? 0 : "",
        right: direction === "left" ? "" : 0,
      },
    })

    setBlocked(false)
  }

  return (
    <motion.span
      className={cn("relative inline-block cursor-pointer", className)}
      onHoverStart={animate}
      onClick={onClick}
      ref={textRef}
      {...props}
    >
      <span className="sr-only">{label}</span>
      <span aria-hidden="true">{label}</span>
      <motion.span
        className={cn("absolute bg-current", {
          "left-0": direction === "left",
          "right-0": direction === "right",
        })}
        style={{
          height: "var(--underline-height)",
          bottom: "calc(-1 * var(--underline-padding))",
          width: "100%",
        }}
        animate={controls}
        aria-hidden="true"
      />
    </motion.span>
  )
}