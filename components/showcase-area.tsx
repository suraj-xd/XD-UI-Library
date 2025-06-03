"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CodeViewer } from "./code-viewer";
import type { ComponentShowcaseItem } from "@/types";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ShowcaseAreaProps {
  components: ComponentShowcaseItem[];
}

export function ShowcaseArea({ components }: ShowcaseAreaProps) {
  const [activeTabs, setActiveTabs] = useState<
    Record<string, "preview" | "code">
  >({});

  const getActiveTab = (componentId: string) =>
    activeTabs[componentId] || "preview";

  const toggleTab = (componentId: string, tab: "preview" | "code") => {
    setActiveTabs((prev) => ({ ...prev, [componentId]: tab }));
  };

  return (
    <main className="flex-1">
      {" "}
      {/* Adjusted for header and toolbar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {components.map((component) => (
          <>
            <div className="flex md:flex-row flex-col items-center justify-between">
              <h1
                style={{ fontFamily: "var(--font-pp-neue-bit)" }}
                className="text-2xl flex items-center text-[#b5c966] font-semibold text-brand-text-primary mb-1"
              >
                {component.title}
              </h1>
              <p className="text-brand-text-secondary opacity-70 mb-5 text-sm">
                {component.description}
              </p>
            </div>
            <section
              key={component.id}
              id={component.id}
              className="scroll-mt-10 bg-black w-full  overflow-hidden mb-20 rounded-[20px]"
            >
              {/* <h2 className="text-2xl font-semibold text-brand-text-primary mb-1">{component.title}</h2>
            <p className="text-brand-text-secondary mb-5 text-sm">{component.description}</p> */}
              <div className="border border-zinc-800/80  bg-brand-bg-page shadow-xl  overflow-hidden w-full rounded-[20px]">
                <div className={`flex ${component.link ? "justify-between" : "justify-end"} w-full p-2 bg-brand-bg-page border-b border-brand-border-subtle`}>
                  {component.link && (
                    <Link
                      target="_blank"
                      href={component.link}
                      className="bg-brand-bg-active flex items-center cursor-pointer text-brand-text-primary shadow-sm rounded-md px-2 py-1 text-xs font-medium h-7"
                    >
                      LIVE
                      <ArrowUpRight className="w-2 h-2 ml-1" />
                    </Link>
                  )}
                  <div className="flex items-center p-0.5 bg-brand-bg-element ">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleTab(component.id, "preview")}
                      className={cn(
                        "rounded-[5px] px-3 py-1 text-xs font-medium h-7",
                        getActiveTab(component.id) === "preview"
                          ? "bg-brand-bg-active text-brand-text-primary shadow-sm"
                          : "text-brand-text-secondary hover:text-brand-text-primary"
                      )}
                    >
                      Preview
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleTab(component.id, "code")}
                      className={cn(
                        "ml-0.5 rounded-[5px] px-3 py-1 text-xs font-medium h-7",
                        getActiveTab(component.id) === "code"
                          ? "bg-brand-bg-active text-brand-text-primary shadow-sm"
                          : "text-brand-text-secondary hover:text-brand-text-primary"
                      )}
                    >
                      Code
                    </Button>
                  </div>
                </div>

                {getActiveTab(component.id) === "preview" ? (
                  <div className="min-h-[400px] flex items-center justify-center w-full">
                    {component.component}
                  </div>
                ) : (
                  <CodeViewer key={component.id} code={component.code} />
                )}
              </div>
              <div className="flex items-center justify-between p-4">
                <p className="text-brand-text-secondary text-sm">
                  Dependencies:
                  {component.dependencies?.map((dependency) => (
                    <code key={dependency} className="text-brand-text-secondary w-fit text-sm font-mono opacity-50 ml-1 mr-1 border border-brand-border-subtle rounded-md px-1 py-0.5 p-2">
                      {dependency}
                    </code>
                  ))}
                </p>
              </div>
            </section>
          </>
        ))}
        {components.length === 0 && (
          <div className="text-center py-10">
            <p className="text-brand-text-secondary">
              No components to display.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
