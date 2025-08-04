"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Square, Pause } from "lucide-react";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { PauseIcon, PlayIcon, StopIcon } from "@phosphor-icons/react";

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  label?: string;
  width?: number;
  height?: number;
}

const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, icon, label, width = 124, height = 74, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative transition-all duration-200 hover:scale-105 active:scale-95",
          className
        )}
        {...props}
      >
        <svg
          width={width}
          height={height}
          viewBox="0 0 224 144"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="pointer-events-none"
        >
          <g filter="url(#filter0_ddd_3_18)">
            <mask
              id="mask0_3_18"
              style={{ maskType: "alpha" }}
              maskUnits="userSpaceOnUse"
              x="32"
              y="16"
              width="160"
              height="80"
            >
              <rect
                x="32.5"
                y="16.5"
                width="159"
                height="79"
                rx="39.5"
                fill="#D9D9D9"
                stroke="url(#paint0_linear_3_18)"
              />
            </mask>
            <g mask="url(#mask0_3_18)">
              <foreignObject x="-73" y="-49" width="370" height="210">
                <div
                  style={{
                    backdropFilter: "blur(1px)",
                    clipPath: "url(#bgblur_0_3_18_clip_path)",
                    height: "100%",
                    width: "100%",
                  }}
                ></div>
              </foreignObject>
              <g filter="url(#filter1_g_3_18)" data-figma-bg-blur-radius="2">
                <rect
                  x="-48"
                  y="-24"
                  width="320"
                  height="160"
                  rx="80"
                  fill="white"
                  fillOpacity="0.01"
                />
              </g>
              <rect
                x="32.5"
                y="16.5"
                width="159"
                height="79"
                rx="39.5"
                fill="white"
                fillOpacity="0.01"
                stroke="url(#paint1_linear_3_18)"
              />
            </g>
          </g>
          <defs>
            <filter
              id="filter0_ddd_3_18"
              x="0"
              y="0"
              width="224"
              height="144"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset dy="16" />
              <feGaussianBlur stdDeviation="16" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0"
              />
              <feBlend
                mode="normal"
                in2="BackgroundImageFix"
                result="effect1_dropShadow_3_18"
              />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset dy="4" />
              <feGaussianBlur stdDeviation="4" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0"
              />
              <feBlend
                mode="normal"
                in2="effect1_dropShadow_3_18"
                result="effect2_dropShadow_3_18"
              />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset dy="1" />
              <feGaussianBlur stdDeviation="2" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0"
              />
              <feBlend
                mode="normal"
                in2="effect2_dropShadow_3_18"
                result="effect3_dropShadow_3_18"
              />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect3_dropShadow_3_18"
                result="shape"
              />
            </filter>
            <filter
              id="filter1_g_3_18"
              x="-73"
              y="-49"
              width="370"
              height="210"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.0099999997764825821 0.0099999997764825821"
                numOctaves="3"
                seed="3000"
              />
              <feDisplacementMap
                in="shape"
                scale="50"
                xChannelSelector="R"
                yChannelSelector="G"
                result="displacedImage"
                width="100%"
                height="100%"
              />
              <feMerge result="effect1_texture_3_18">
                <feMergeNode in="displacedImage" />
              </feMerge>
            </filter>
            <clipPath id="bgblur_0_3_18_clip_path" transform="translate(73 49)">
              <rect x="-48" y="-24" width="320" height="160" rx="80" />
            </clipPath>
            <linearGradient
              id="paint0_linear_3_18"
              x1="112"
              y1="16"
              x2="112"
              y2="96"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="white" />
              <stop offset="0.36" stopColor="#808080" />
              <stop offset="1" stopColor="white" />
            </linearGradient>
            <linearGradient
              id="paint1_linear_3_18"
              x1="112"
              y1="16"
              x2="112"
              y2="96"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="white" />
              <stop offset="0.36" stopColor="#808080" />
              <stop offset="1" stopColor="white" />
            </linearGradient>
          </defs>
        </svg>

        {/* Content overlay */}
        <div className="absolute bottom-4 inset-0 flex items-center justify-center">
          <div className="flex items-center gap-2 text-gray-700 font-medium">
            {icon && <span className="flex-shrink-0">{icon}</span>}
            {label && <span className="text-sm">{label}</span>}
          </div>
        </div>
      </button>
    );
  }
);

GlassButton.displayName = "GlassButton";

export default function GlassAudioRecorder() {
  const [isRecording, setIsRecording] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(92); // 1:32 in seconds
  const [waveformData, setWaveformData] = useState<number[]>([]);

  // Generate random waveform data for animation
  useEffect(() => {
    const interval = setInterval(() => {
      if (isRecording && !isPaused) {
        setWaveformData((prev) => {
          const newData = [...prev];
          if (newData.length > 5) {
            newData.shift();
          }
          newData.push(Math.random() * 60 + 20);
          return newData;
        });
        setTime((prev) => prev + 1);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  // Initialize with some waveform data (only 5 bars)
  useEffect(() => {
    const initialData = Array.from(
      { length: 5 },
      () => Math.random() * 60 + 20
    );
    setWaveformData(initialData);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    setIsRecording(false);
    setIsPaused(false);
    setTime(0);
    setWaveformData([]);
  };

  return (
    <div className="min-h-[600px] w-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-gradient-to-t from-[#f7f7f7] to-white rounded-3xl px-12 py-6 pt-8 max-w-md w-full">
        {/* Recording Indicator */}
        <div className="flex items-center gap-3 mb-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isRecording && !isPaused ? "bg-[#EF5519]" : "bg-gray-400"
            }`}
          />
          <h1 className="text-lg font-medium text-gray-900">
            {isRecording
              ? isPaused
                ? "Paused"
                : "Listening"
              : "Ready to Record"}
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-gray-500 text-lg font-light leading-relaxed mb-8">
          Speak freely, we'll make sense of it after.
        </p>
        <div className="flex justify-between items-center ">
          <div className="flex items-center justify-start gap-4 pb-3">
            {/* Waveform Visualization */}
            <div className="flex items-center gap-0.5 h-6">
              {waveformData.map((height, index) => (
                <div
                  key={index}
                  className={`w-0.5 bg-gray-400 rounded-full transition-all duration-100 ${
                    isRecording && !isPaused ? "opacity-100" : "opacity-30"
                  }`}
                  style={{
                    height: `${Math.max(height * 0.24, 4)}px`, // Scale down and ensure minimum height
                  }}
                />
              ))}
            </div>
            {/* Timer */}
            <div className="text-sm font-mono text-gray-500 font-light">
              {formatTime(time)}
            </div>
          </div>
          {/* Timer and Controls */}
          <div className="flex items-center justify-between">
            {/* Control Buttons */}
            <div className="flex items-center">
              {/* Pause/Play Button */}
              <GlassButton
                onClick={handlePause}
                icon={
                  isPaused ? (
                    <PlayIcon weight="fill" size={18} />
                  ) : (
                    <PauseIcon weight="fill" size={18} />
                  )
                }
                width={140}
                height={75}
                disabled={!isRecording}
                className="relative -right-20"
              />

              {/* Stop Button */}
              <GlassButton
                onClick={handleStop}
                icon={<StopIcon weight="fill" size={18} />}
                width={140}
                height={75}
                className="relative -right-8"
              />
            </div>
          </div>
        </div>

        {/* Additional Info */}
        {!isRecording && (
          <div className="mt-8 text-center">
            <Button
              onClick={() => {
                setIsRecording(true);
                setTime(0);
                setWaveformData([]);
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl"
            >
              Start Recording
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}