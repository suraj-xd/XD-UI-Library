"use client";

import Link from "next/link";
import {
  CenterUnderline,
  ComesInGoesOutUnderline,
  GoesOutComesInUnderline,
} from "@/components/underline-animation";

function Footer() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-t from-[#020e02] to-[#031403]/0">
      <div
        style={{ fontFamily: "var(--font-pp-neue-bit)" }}
        className="flex flex-row font-overusedGrotesk items-start text-[#E9FF92] h-full py-36 uppercase space-x-8 text-sm sm:text-xl md:text-2xl lg:text-3xl"
      >
        <div>Contact</div>
        <ul className="flex flex-col space-y-1 h-full">
          <Link href="https://www.linkedin.com/in/gaudsuraj/">
            <CenterUnderline label="LINKEDIN" />
          </Link>
          <Link href="https://www.instagram.com/suraj.xdd/">
            <ComesInGoesOutUnderline label="INSTAGRAM" direction="right" />
          </Link>
          <Link href="https://x.com/notsurajgaud">
            <ComesInGoesOutUnderline label="X (TWITTER)" direction="left" />
          </Link>

          <div className="pt-12">
            <ul className="flex flex-col space-y-1 h-full">
              <Link href="mailto:surajgaudx@gmail.com">
                <GoesOutComesInUnderline
                  label="SURAJGAUDX@GMAIL.COM"
                  direction="left"
                />
              </Link>
            </ul>
          </div>
        </ul>
      </div>
      <div className="w-full py-6 px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            Hosted on
            <a
              href="https://vercel.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline flex items-center gap-0.5 transition-colors duration-200"
            >
              Vercel
            </a>
          </div>
          <div className="flex items-center gap-1 mt-2 md:mt-0">
            Ideated with
              <svg
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  clipRule="evenodd"
                  d="M14.252 8.25h5.624c.088 0 .176.006.26.018l-5.87 5.87a1.889 1.889 0 01-.019-.265V8.25h-2.25v5.623a4.124 4.124 0 004.125 4.125h5.624v-2.25h-5.624c-.09 0-.179-.006-.265-.018l5.874-5.875a1.9 1.9 0 01.02.27v5.623H24v-5.624A4.124 4.124 0 0019.876 6h-5.624v2.25zM0 7.5v.006l7.686 9.788c.924 1.176 2.813.523 2.813-.973V7.5H8.25v6.87L2.856 7.5H0z"
                ></path>
              </svg>
            <span className="text-muted-foreground">by</span>
            <a
              href="https://github.com/suraj-xd"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline font-medium hover:text-primary transition-colors duration-200"
            >
              surajgaud
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Footer };
