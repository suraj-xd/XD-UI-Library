"use client";

import { useState, useEffect, useCallback } from "react";
import { ShowcaseArea } from "./showcase-area";
import type { ComponentShowcaseItem } from "@/types";
import { useMediaQuery } from "@/hooks/use-media-query"; // Assuming you have this hook
import { showcaseComponents } from "@/lib/showcase-components";
import { SpotlightNewDemo } from "./spotlight";
import { Footer } from "./footer";

interface ShowcaseLayoutProps {
  pageTitle?: string; // Made optional as header is now static
  components?: ComponentShowcaseItem[];
  githubUrl: string;
  twitterUrl: string; // Updated from docsUrl
}

export function ShowcaseLayout({
  components = showcaseComponents,
  githubUrl,
  twitterUrl,
}: ShowcaseLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>(
    components[0]?.id || ""
  );
  const isMobile = useMediaQuery("(max-width: 768px)");

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const scrollToSection = useCallback(
    (sectionId: string) => {
      const element = document.getElementById(sectionId);
      if (element) {
        const headerOffset = 70; // Approx header height + margin
        const elementPosition =
          element.getBoundingClientRect().top +
          window.pageYOffset -
          headerOffset;
        window.scrollTo({ top: elementPosition, behavior: "smooth" });
        setActiveSection(sectionId); // Set active section immediately
        if (isMobile) closeSidebar();
      }
    },
    [isMobile]
  );

  useEffect(() => {
    const handleScroll = () => {
      let currentSectionId = "";
      const offset = window.innerHeight * 0.3; // Point of activation in viewport

      for (const component of components) {
        const element = document.getElementById(component.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Check if the element is roughly in the middle of the viewport
          if (rect.top < offset && rect.bottom > offset) {
            currentSectionId = component.id;
            break;
          }
        }
      }

      // If no section is in the middle (e.g. at the very top/bottom),
      // find the one closest to the top of the viewport
      if (!currentSectionId) {
        let minDistance = Number.POSITIVE_INFINITY;
        for (const component of components) {
          const element = document.getElementById(component.id);
          if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top >= 0 && rect.top < minDistance) {
              minDistance = rect.top;
              currentSectionId = component.id;
            }
          }
        }
      }

      if (currentSectionId && currentSectionId !== activeSection) {
        setActiveSection(currentSectionId);
      } else if (
        !currentSectionId &&
        components.length > 0 &&
        window.scrollY < 100
      ) {
        // Default to first section if scrolled to top
        setActiveSection(components[0].id);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, [components, activeSection]);

  useEffect(() => {
    if (!isMobile && isSidebarOpen) {
      closeSidebar(); // Close sidebar if screen resizes to desktop while mobile sidebar is open
    }
  }, [isMobile, isSidebarOpen]);

  return (
    <div className="flex flex-col min-h-screen bg-[#031403] text-brand-text-primary hide-scroll-bar">
      {/* <FontShowcase /> */}

      <SpotlightNewDemo />
      <div className="flex flex-1">
        {/* <Sidebar
          components={components}
          isOpen={isSidebarOpen && isMobile}
          onClose={closeSidebar}
          activeSection={activeSection}
          scrollToSection={scrollToSection}
        /> */}
        <ShowcaseArea components={components} />
      </div>
      {/* <Toolbar githubUrl={githubUrl} twitterUrl={twitterUrl} /> */}
      <Footer />
    </div>
  );
}
