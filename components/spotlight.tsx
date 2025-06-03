"use client";
import React from "react";
import { Spotlight } from "@/components/spot";
import { ExternalLink, Info, Star } from "lucide-react";
import { Button } from "./ui/button";

export function SpotlightNewDemo() {
  return (
    <div className="h-screen w-full rounded-md flex md:items-center md:justify-center bg-[#031403]/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
      <Spotlight />
      <div className=" p-4 max-w-7xl  mx-auto relative z-10  w-full pt-20 md:pt-0">
        <h1
          style={{ fontFamily: "var(--font-pp-neue-bit)" }}
          className="relative text-4xl md:text-7xl flex justify-center items-center flex-col font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-[#b5c966] to-[#E9FF92] bg-opacity-50"
        >
          <img
            src="/s_logo.png"
            alt="logo"
            className="size-20 my-5 -rotate-6 rounded-2xl z-0 object-cover"
          />
          <div className="relative flex flex-col items-center">
            <p className="w-fit relative text-4xl md:text-7xl z-[1] font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-[#b5c966] to-[#E9FF92] bg-opacity-50">
              XD :UI Library
            </p>
            <p className="w-fit relative text-4xl md:text-7xl z-[1] font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-[#b5c966] to-[#E9FF92] bg-opacity-50">
              AI / Generic React UI Components
            </p>
          </div>
        </h1>
        <p className="mt-4 font-normal text-sm text-neutral-300 max-w-lg text-center mx-auto">
          My personal set of small UI components for my projects.
        </p>
        <div className="flex mt-4 items-center gap-1 text-xs bg-gray-50/10 rounded-md p-2 w-fit mx-auto">
          Built with on
          <a
            href="https://shadcn.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium gap-1 text-primary hover:underline flex items-center transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              className="size-4"
            >
              <rect width="256" height="256" fill="none"></rect>
              <line
                x1="208"
                y1="128"
                x2="128"
                y2="208"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="32"
              ></line>
              <line
                x1="192"
                y1="40"
                x2="40"
                y2="192"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="32"
              ></line>
            </svg>
            Shadcn/UI
          </a>
        </div>
        <p className="mt-4 font-normal text-neutral-300 opacity-50 text-xs max-w-lg text-center mx-auto flex items-center justify-center gap-2">
          <Info className="h-4 w-4 ml-1.5 opacity-75" />
          We'll be adding more components as I go.
        </p>
        <div className="text-center pt-8 pb-4">
          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-3">
            <Button
              variant="outline"
              className="w-full sm:w-auto bg-brand-bg-button border-brand-border-subtle hover:border-neutral-600 text-brand-text-button hover:bg-neutral-700 transition-colors px-5 py-2.5 rounded-lg"
              asChild
            >
              <a
                href="https://21st.dev/suraj-xd"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Star className="h-4 w-4 ml-1.5 opacity-75" />
                Star this repo{" "}
                <ExternalLink className="h-4 w-4 ml-1.5 opacity-75" />
              </a>
            </Button>
            <Button
              variant="ghost"
              className="w-full sm:w-auto text-brand-text-secondary hover:text-brand-text-primary hover:bg-brand-bg-element transition-colors px-5 py-2.5 rounded-lg"
              asChild
            >
              <a
                href="https://github.com/suraj-xd/"
                target="_blank"
                rel="noopener noreferrer"
              >
                All Components{" "}
                <ExternalLink className="h-4 w-4 ml-1.5 opacity-75" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
