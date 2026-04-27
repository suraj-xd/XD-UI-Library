"use client";

import { Settings2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type PaletteName = "Ember" | "Lime" | "Bloom" | "Solar" | "Glacier" | "Toxic";
type Direction = "rise" | "fall" | "left" | "right" | "diag" | "burst" | "implode" | "spiral";
type OriginMode = "manual" | "wander" | "orbit";

type Palette = {
  name: PaletteName;
  colors: [number, number, number][];
};

const PALETTES: Palette[] = [
  { name: "Ember", colors: [[26, 4, 22], [192, 30, 70], [255, 132, 168]] },
  { name: "Lime", colors: [[18, 56, 12], [142, 205, 38], [228, 244, 96]] },
  { name: "Bloom", colors: [[58, 12, 64], [210, 50, 165], [255, 148, 222]] },
  { name: "Solar", colors: [[58, 8, 12], [228, 80, 28], [248, 215, 78]] },
  { name: "Glacier", colors: [[6, 16, 42], [36, 128, 210], [180, 232, 255]] },
  { name: "Toxic", colors: [[18, 8, 38], [120, 50, 220], [80, 255, 180]] },
];

const DIRECTIONS: { id: Direction; label: string; icon: string }[] = [
  { id: "rise", label: "Rise", icon: "↑" },
  { id: "fall", label: "Fall", icon: "↓" },
  { id: "left", label: "Left", icon: "←" },
  { id: "right", label: "Right", icon: "→" },
  { id: "diag", label: "Diag", icon: "↗" },
  { id: "burst", label: "Burst", icon: "◉" },
  { id: "implode", label: "Implode", icon: "◎" },
  { id: "spiral", label: "Spiral", icon: "✦" },
];

const STACK_DIRECTIONS: Direction[] = ["implode", "burst", "diag", "fall"];
const OFFSET_RANGE = 0.4;
const ORBIT_RADIUS = 0.12;
const WANDER_INTERVAL = 1.4;

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
  mode: Direction,
  ox: number,
  oy: number,
) {
  const cx = 0.5 + ox;
  const cy = 0.5 + oy;
  const dx = nx - cx;
  const dy = ny - cy;
  const dist = Math.min(1.2, Math.sqrt(dx * dx + dy * dy) / 0.5);
  const angle = Math.atan2(dy, dx);
  let phase = 0;
  let base = ny;

  switch (mode) {
    case "rise": {
      const ey = ny - oy;
      base = ey + (nx - 0.5) * ox * 0.9;
      phase = ey * 5 + time * 2.4;
      break;
    }
    case "fall": {
      const ey = 1 - ny + oy;
      base = ey - (nx - 0.5) * ox * 0.9;
      phase = ey * 5 + time * 2.4;
      break;
    }
    case "left": {
      const ex = nx - ox;
      base = ex + (ny - 0.5) * oy * 0.9;
      phase = ex * 5 + time * 2.4;
      break;
    }
    case "right": {
      const ex = 1 - nx + ox;
      base = ex - (ny - 0.5) * oy * 0.9;
      phase = ex * 5 + time * 2.4;
      break;
    }
    case "diag": {
      const ev = (nx + (1 - ny)) / 2 + (ox - oy) * 0.5;
      base = ev;
      phase = ev * 8 + time * 2.4;
      break;
    }
    case "burst":
      base = 1 - dist * 0.6;
      phase = dist * 5 - time * 2.6;
      break;
    case "implode":
      base = 0.4 + dist * 0.5;
      phase = -dist * 5 + time * 2.6;
      break;
    case "spiral":
      base = 0.55 - dist * 0.25;
      phase = angle * 2 + dist * 4 - time * 3;
      break;
  }

  return (
    base * 0.55 +
    Math.sin(phase) * 0.32 +
    Math.sin(nx * 6.1 + time * 1.1) * 0.09 +
    Math.cos(ny * 5.3 + time * 0.95) * 0.09
  );
}

function drawPixelCircle(
  canvas: HTMLCanvasElement,
  palette: Palette,
  grid: number,
  time: number,
  direction: Direction,
  ox: number,
  oy: number,
) {
  const context = canvas.getContext("2d");
  if (!context) return;

  const width = canvas.width;
  const height = canvas.height;
  const pixel = width / grid;

  context.clearRect(0, 0, width, height);

  for (let y = 0; y < grid; y += 1) {
    for (let x = 0; x < grid; x += 1) {
      const nx = grid === 1 ? 0 : x / (grid - 1);
      const ny = grid === 1 ? 0 : y / (grid - 1);
      const color = getColor(palette, getEnergy(nx, ny, time, direction, ox, oy));
      context.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
      context.fillRect(x * pixel, y * pixel, pixel + 0.6, pixel + 0.6);
    }
  }
}

function PixelOrb({
  className,
  direction,
  grid,
  originX = 0,
  originY = 0,
  orbitSpeed = 1,
  originMode = "manual",
  palette,
  seed = 0,
  size,
  speed,
}: {
  className?: string;
  direction: Direction;
  grid: number;
  originX?: number;
  originY?: number;
  orbitSpeed?: number;
  originMode?: OriginMode;
  palette: Palette;
  seed?: number;
  size: number;
  speed: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    let animationFrame = 0;
    let lastTime: number | null = null;
    let elapsed = seed * 0.35;
    let orbitTime = seed * 0.8;
    let wanderTimer = 0;
    let ox = originX;
    let oy = originY;
    let wanderTargetX = originX + Math.sin(seed + 1) * OFFSET_RANGE * 0.35;
    let wanderTargetY = originY + Math.cos(seed + 2) * OFFSET_RANGE * 0.35;

    const frame = (time: number) => {
      if (lastTime === null) lastTime = time;
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      elapsed += dt * speed;

      if (originMode === "manual") {
        ox = originX;
        oy = originY;
      }

      if (originMode === "orbit") {
        orbitTime += dt * orbitSpeed;
        ox = originX + Math.cos(orbitTime + seed) * ORBIT_RADIUS;
        oy = originY + Math.sin(orbitTime + seed) * ORBIT_RADIUS;
      }

      if (originMode === "wander") {
        wanderTimer += dt;
        if (wanderTimer >= WANDER_INTERVAL) {
          wanderTimer = 0;
          wanderTargetX = originX + Math.sin(time * 0.001 + seed) * OFFSET_RANGE * 0.5;
          wanderTargetY = originY + Math.cos(time * 0.001 + seed * 1.7) * OFFSET_RANGE * 0.5;
        }
        const blend = Math.min(1, dt * 1.6);
        ox += (wanderTargetX - ox) * blend;
        oy += (wanderTargetY - oy) * blend;
      }

      drawPixelCircle(canvas, palette, grid, elapsed, direction, ox, oy);
      animationFrame = requestAnimationFrame(frame);
    };

    animationFrame = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animationFrame);
  }, [direction, grid, orbitSpeed, originMode, originX, originY, palette, seed, size, speed]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={cn(
        "pointer-events-none block shrink-0 rounded-full bg-black shadow-[0_0_0_1px_rgba(255,255,255,0.08)]",
        className,
      )}
      aria-hidden="true"
    />
  );
}

function ThinkingBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex h-[41px] w-[220px] items-center gap-2 rounded-full border border-white/15 bg-black px-1.5 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_10px_34px_rgba(0,0,0,0.45)]">
      {children}
    </div>
  );
}

function ControlButton({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-8 flex-col items-center justify-center gap-1 rounded border border-white/10 bg-white/[0.055] px-2 py-1.5 text-[9px] uppercase tracking-[0.12em] text-white/55 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white",
        active && "border-white bg-white text-black hover:bg-white hover:text-black",
      )}
    >
      {children}
    </button>
  );
}

function RangeControl({
  label,
  max,
  min,
  onChange,
  step,
  suffix,
  value,
}: {
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  step: number;
  suffix?: string;
  value: number;
}) {
  return (
    <label className="grid gap-1.5 text-[9px] uppercase tracking-[0.18em] text-white/35">
      <span className="flex items-center justify-between">
        {label}
        <span className="font-mono text-[10px] normal-case tracking-normal text-white/75">
          {Number.isInteger(value) ? value : value.toFixed(1)}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-white"
      />
    </label>
  );
}

function OriginPad({
  onChange,
  originX,
  originY,
}: {
  onChange: (next: { x: number; y: number }) => void;
  originX: number;
  originY: number;
}) {
  const setFromPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const py = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    onChange({
      x: (px - 0.5) * 2 * OFFSET_RANGE,
      y: (py - 0.5) * 2 * OFFSET_RANGE,
    });
  };

  const dotLeft = (originX / OFFSET_RANGE) * 50 + 50;
  const dotTop = (originY / OFFSET_RANGE) * 50 + 50;

  return (
    <div
      className="relative h-[92px] w-full cursor-crosshair touch-none rounded border border-white/10 bg-white/[0.055]"
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        setFromPointer(event);
      }}
      onPointerMove={(event) => {
        if (event.buttons === 1) setFromPointer(event);
      }}
    >
      <div className="absolute left-2 right-2 top-1/2 h-px bg-white/15" />
      <div className="absolute bottom-2 left-1/2 top-2 w-px bg-white/15" />
      <div
        className="absolute h-3 w-3 rounded-full bg-white shadow-[0_0_0_5px_rgba(255,255,255,0.06)]"
        style={{
          left: `${dotLeft}%`,
          top: `${dotTop}%`,
          transform: "translate(-50%, -50%)",
        }}
      />
    </div>
  );
}

function PaletteButton({
  active,
  onClick,
  palette,
}: {
  active: boolean;
  onClick: () => void;
  palette: Palette;
}) {
  const swatch = `linear-gradient(90deg, rgb(${palette.colors[0].join(",")}) 0%, rgb(${palette.colors[1].join(",")}) 52%, rgb(${palette.colors[2].join(",")}) 100%)`;

  return (
    <ControlButton active={active} onClick={onClick}>
      <span className="h-3 w-full rounded-[2px]" style={{ background: swatch }} />
      <span>{palette.name}</span>
    </ControlButton>
  );
}

export default function AgentThinkingLoader() {
  const [direction, setDirection] = useState<Direction>("implode");
  const [paletteName, setPaletteName] = useState<PaletteName>("Ember");
  const [grid, setGrid] = useState(6);
  const [speed, setSpeed] = useState(5);
  const [originMode, setOriginMode] = useState<OriginMode>("orbit");
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [orbitSpeed, setOrbitSpeed] = useState(4);
  const [stackDirection, setStackDirection] = useState<Direction>("implode");
  const [stackPaletteName, setStackPaletteName] = useState<PaletteName>("Ember");

  const palette = useMemo(
    () => PALETTES.find((item) => item.name === paletteName) ?? PALETTES[0],
    [paletteName],
  );
  const stackPalette = useMemo(
    () => PALETTES.find((item) => item.name === stackPaletteName) ?? PALETTES[0],
    [stackPaletteName],
  );

  return (
    <div className="relative flex min-h-[300px] w-full items-center justify-center overflow-hidden bg-[#050505] px-6 py-8 font-mono text-white">

      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-4 top-4 z-20 h-9 w-9 rounded-full border border-white/10 bg-white/[0.04] text-white/75 hover:bg-white/10 hover:text-white"
            aria-label="Open loader settings"
          >
            <Settings2 className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={10}
          className="z-30 max-h-[min(420px,calc(100vh-96px))] w-[min(820px,calc(100vw-64px))] overflow-auto rounded-md border-white/10 bg-[#0d0d0d] p-3 font-mono text-white shadow-2xl"
        >
          <div className="grid gap-4 md:grid-cols-[1fr_0.78fr_0.9fr]">
            <div className="grid gap-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[9px] uppercase tracking-[0.22em] text-white/35">Agent Thinking</div>
                <PixelOrb
                  direction={direction}
                  grid={grid}
                  originX={origin.x}
                  originY={origin.y}
                  orbitSpeed={orbitSpeed}
                  originMode={originMode}
                  palette={palette}
                  size={40}
                  speed={speed}
                />
              </div>

              <div className="grid gap-1.5">
                <div className="text-[9px] uppercase tracking-[0.18em] text-white/35">Direction</div>
                <div className="grid grid-cols-4 gap-1">
                  {DIRECTIONS.map((item) => (
                    <ControlButton
                      key={item.id}
                      active={direction === item.id}
                      onClick={() => setDirection(item.id)}
                    >
                      <span className="text-sm leading-none tracking-normal">{item.icon}</span>
                      <span>{item.label}</span>
                    </ControlButton>
                  ))}
                </div>
              </div>

              <div className="grid gap-1.5">
                <div className="text-[9px] uppercase tracking-[0.18em] text-white/35">Palette</div>
                <div className="grid grid-cols-3 gap-1">
                  {PALETTES.map((item) => (
                    <PaletteButton
                      key={item.name}
                      active={paletteName === item.name}
                      onClick={() => setPaletteName(item.name)}
                      palette={item}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid content-start gap-3 border-t border-white/10 pt-3 md:border-l md:border-t-0 md:pl-4 md:pt-0">
              <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.18em] text-white/35">
                <span>Origin</span>
                <span className="font-mono text-[10px] normal-case tracking-normal text-white/70">
                  {origin.x >= 0 ? "+" : ""}
                  {origin.x.toFixed(2)}, {origin.y >= 0 ? "+" : ""}
                  {origin.y.toFixed(2)}
                </span>
              </div>
              <OriginPad
                originX={origin.x}
                originY={origin.y}
                onChange={(next) => {
                  setOrigin(next);
                  setOriginMode("manual");
                }}
              />
              <div className="grid grid-cols-4 gap-1">
                <ControlButton
                  active={originMode === "manual" && origin.x === 0 && origin.y === 0}
                  onClick={() => {
                    setOrigin({ x: 0, y: 0 });
                    setOriginMode("manual");
                  }}
                >
                  Reset
                </ControlButton>
                <ControlButton
                  onClick={() => {
                    setOrigin({
                      x: (Math.random() - 0.5) * 2 * OFFSET_RANGE * 0.85,
                      y: (Math.random() - 0.5) * 2 * OFFSET_RANGE * 0.85,
                    });
                    setOriginMode("manual");
                  }}
                >
                  Random
                </ControlButton>
                <ControlButton active={originMode === "wander"} onClick={() => setOriginMode("wander")}>
                  Wander
                </ControlButton>
                <ControlButton active={originMode === "orbit"} onClick={() => setOriginMode("orbit")}>
                  Orbit
                </ControlButton>
              </div>
              <div className="grid gap-2">
                <RangeControl
                  label="Orbit"
                  min={0.2}
                  max={4}
                  step={0.1}
                  value={orbitSpeed}
                  suffix="x"
                  onChange={setOrbitSpeed}
                />
                <RangeControl label="Grid" min={6} max={18} step={1} value={grid} suffix={` x ${grid}`} onChange={setGrid} />
                <RangeControl label="Speed" min={0.2} max={5} step={0.1} value={speed} suffix="x" onChange={setSpeed} />
              </div>
            </div>

            <div className="grid content-start gap-3 border-t border-white/10 pt-3 md:border-l md:border-t-0 md:pl-4 md:pt-0">
              <div className="text-[9px] uppercase tracking-[0.22em] text-white/35">Agents Thinking</div>
              <div className="grid gap-1.5">
                <div className="text-[9px] uppercase tracking-[0.18em] text-white/35">Stack Direction</div>
                <div className="grid grid-cols-4 gap-1">
                  {STACK_DIRECTIONS.map((item) => (
                    <ControlButton
                      key={item}
                      active={stackDirection === item}
                      onClick={() => setStackDirection(item)}
                    >
                      {DIRECTIONS.find((directionItem) => directionItem.id === item)?.label}
                    </ControlButton>
                  ))}
                </div>
              </div>
              <div className="grid gap-1.5">
                <div className="text-[9px] uppercase tracking-[0.18em] text-white/35">Stack Theme</div>
                <div className="grid grid-cols-2 gap-1">
                  {PALETTES.map((item) => (
                    <PaletteButton
                      key={item.name}
                      active={stackPaletteName === item.name}
                      onClick={() => setStackPaletteName(item.name)}
                      palette={item}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <div className="relative z-10 grid w-full max-w-[220px] justify-items-center gap-3.5">
        <ThinkingBadge>
          <PixelOrb
            direction={direction}
            grid={grid}
            orbitSpeed={orbitSpeed}
            originMode={originMode}
            originX={origin.x}
            originY={origin.y}
            palette={palette}
            size={28}
            speed={speed}
          />
          <span className="whitespace-nowrap text-xs font-semibold tracking-[-0.02em] text-white [font-family:'JetBrains_Mono',ui-monospace,monospace]">
            Agent Thinking
          </span>
        </ThinkingBadge>

        <ThinkingBadge>
          <div className="flex h-[29px] min-w-[60px] items-center">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="animate-in fade-in slide-in-from-left-2 duration-300"
                style={{
                  animationDelay: `${index * 110}ms`,
                  animationFillMode: "both",
                  marginLeft: index === 0 ? 0 : -12,
                  zIndex: index + 1,
                }}
              >
                <PixelOrb
                  className="shadow-[0_0_0_3px_#0b0b0b]"
                  direction={stackDirection}
                  grid={6}
                  originMode={index % 2 === 0 ? "orbit" : "wander"}
                  orbitSpeed={2.6 + index * 0.25}
                  palette={PALETTES[(PALETTES.findIndex((item) => item.name === stackPalette.name) + index) % PALETTES.length]}
                  seed={index + 1}
                  size={28}
                  speed={4.2}
                />
              </div>
            ))}
          </div>
          <span className="whitespace-nowrap text-xs font-semibold tracking-[-0.02em] text-white [font-family:'JetBrains_Mono',ui-monospace,monospace]">
            Agents thinking
          </span>
        </ThinkingBadge>
      </div>
    </div>
  );
}
