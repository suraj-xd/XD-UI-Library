export const agentThinkingLoaderCode = String.raw`"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

// Load JetBrains Mono in globals.css:
// @import url("https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;600;700&display=swap");

type Direction = "implode" | "burst" | "diag" | "fall";
type Palette = {
  name: string;
  colors: [number, number, number][];
};

const PALETTES: Palette[] = [
  { name: "Ember", colors: [[26, 4, 22], [192, 30, 70], [255, 132, 168]] },
  { name: "Lime", colors: [[18, 56, 12], [142, 205, 38], [228, 244, 96]] },
  { name: "Bloom", colors: [[58, 12, 64], [210, 50, 165], [255, 148, 222]] },
  { name: "Solar", colors: [[58, 8, 12], [228, 80, 28], [248, 215, 78]] },
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function getColor(palette: Palette, energy: number) {
  const e = Math.max(0, Math.min(1, energy));
  const colors = palette.colors;

  if (e < 0.5) {
    const t = e * 2;
    return [
      Math.round(lerp(colors[0][0], colors[1][0], t)),
      Math.round(lerp(colors[0][1], colors[1][1], t)),
      Math.round(lerp(colors[0][2], colors[1][2], t)),
    ];
  }

  const t = (e - 0.5) * 2;
  return [
    Math.round(lerp(colors[1][0], colors[2][0], t)),
    Math.round(lerp(colors[1][1], colors[2][1], t)),
    Math.round(lerp(colors[1][2], colors[2][2], t)),
  ];
}

function getEnergy(
  nx: number,
  ny: number,
  time: number,
  direction: Direction,
  originX: number,
  originY: number,
) {
  const cx = 0.5 + originX;
  const cy = 0.5 + originY;
  const dx = nx - cx;
  const dy = ny - cy;
  const dist = Math.min(1.2, Math.sqrt(dx * dx + dy * dy) / 0.5);

  let base = 0.4 + dist * 0.5;
  let phase = -dist * 5 + time * 2.6;

  if (direction === "burst") {
    base = 1 - dist * 0.6;
    phase = dist * 5 - time * 2.6;
  }

  if (direction === "diag") {
    const ev = (nx + (1 - ny)) / 2 + (originX - originY) * 0.5;
    base = ev;
    phase = ev * 8 + time * 2.4;
  }

  if (direction === "fall") {
    const ey = 1 - ny + originY;
    base = ey - (nx - 0.5) * originX * 0.9;
    phase = ey * 5 + time * 2.4;
  }

  return (
    base * 0.55 +
    Math.sin(phase) * 0.32 +
    Math.sin(nx * 6.1 + time * 1.1) * 0.09 +
    Math.cos(ny * 5.3 + time * 0.95) * 0.09
  );
}

function PixelOrb({
  direction = "implode",
  grid = 6,
  orbitSpeed = 4,
  palette = PALETTES[0],
  seed = 0,
  size = 28,
  speed = 5,
}: {
  direction?: Direction;
  grid?: number;
  orbitSpeed?: number;
  palette?: Palette;
  seed?: number;
  size?: number;
  speed?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    canvas.style.width = size + "px";
    canvas.style.height = size + "px";

    let frameId = 0;
    let lastTime: number | null = null;
    let elapsed = seed * 0.35;
    let orbitTime = seed * 0.8;

    const frame = (time: number) => {
      if (lastTime === null) lastTime = time;
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      elapsed += dt * speed;
      orbitTime += dt * orbitSpeed;

      const originX = Math.cos(orbitTime + seed) * 0.12;
      const originY = Math.sin(orbitTime + seed) * 0.12;
      const pixel = canvas.width / grid;

      context.clearRect(0, 0, canvas.width, canvas.height);

      for (let y = 0; y < grid; y += 1) {
        for (let x = 0; x < grid; x += 1) {
          const nx = x / (grid - 1);
          const ny = y / (grid - 1);
          const color = getColor(
            palette,
            getEnergy(nx, ny, elapsed, direction, originX, originY),
          );

          context.fillStyle =
            "rgb(" + color[0] + ", " + color[1] + ", " + color[2] + ")";
          context.fillRect(x * pixel, y * pixel, pixel + 0.6, pixel + 0.6);
        }
      }

      frameId = requestAnimationFrame(frame);
    };

    frameId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(frameId);
  }, [direction, grid, orbitSpeed, palette, seed, size, speed]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      aria-hidden="true"
      className="pointer-events-none block shrink-0 rounded-full bg-black"
      style={{
        width: size,
        height: size,
        boxShadow: "0 0 0 1px rgba(255,255,255,0.08)",
      }}
    />
  );
}

function BadgeShell({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex h-[41px] w-[220px] items-center gap-2 rounded-full border border-white/15 bg-black px-1.5 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_10px_34px_rgba(0,0,0,0.45)]">
      {children}
    </div>
  );
}

export function AgentThinkingBadge({ label = "Agent Thinking" }: { label?: string }) {
  return (
    <BadgeShell>
      <PixelOrb />
      <span className="whitespace-nowrap text-xs font-semibold tracking-[-0.02em] text-white [font-family:'JetBrains_Mono',ui-monospace,monospace]">
        {label}
      </span>
    </BadgeShell>
  );
}

export function AgentsThinkingBadge({ label = "Agents thinking" }: { label?: string }) {
  return (
    <BadgeShell>
      <div className="flex h-[29px] min-w-[60px] items-center">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="animate-in fade-in slide-in-from-left-2 duration-300"
            style={{
              animationDelay: index * 110 + "ms",
              animationFillMode: "both",
              marginLeft: index === 0 ? 0 : -12,
              zIndex: index + 1,
            }}
          >
            <PixelOrb
              direction="implode"
              palette={PALETTES[index % PALETTES.length]}
              seed={index + 1}
              size={28}
            />
          </div>
        ))}
      </div>
      <span className="whitespace-nowrap text-xs font-semibold tracking-[-0.02em] text-white [font-family:'JetBrains_Mono',ui-monospace,monospace]">
        {label}
      </span>
    </BadgeShell>
  );
}

export default function Demo() {
  return (
    <div className="grid gap-3.5 bg-[#030303] p-8">
      <AgentThinkingBadge />
      <AgentsThinkingBadge />
    </div>
  );
}
`;
