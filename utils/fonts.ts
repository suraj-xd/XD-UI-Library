import { Instrument_Serif } from "next/font/google";
import localFont from "next/font/local";

export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-instrument-serif",
});

export const satoshi = localFont({
  src: [
    {
      path: "../public/fonts/satoshi/Satoshi-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/satoshi/Satoshi-LightItalic.otf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../public/fonts/satoshi/Satoshi-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/satoshi/Satoshi-Italic.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../public/fonts/satoshi/Satoshi-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/satoshi/Satoshi-MediumItalic.otf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../public/fonts/satoshi/Satoshi-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/satoshi/Satoshi-BoldItalic.otf",
      weight: "700",
      style: "italic",
    },
    {
      path: "../public/fonts/satoshi/Satoshi-Black.otf",
      weight: "900",
      style: "normal",
    },
    {
      path: "../public/fonts/satoshi/Satoshi-BlackItalic.otf",
      weight: "900",
      style: "italic",
    },
  ],
  variable: "--font-satoshi",
});

export const ppNeueBit = localFont({
  src: [
    {
      path: "../public/fonts/neue/ppneuebit-bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-pp-neue-bit",
});

export const ppRightSerif = localFont({
  src: [
    {
      path: "../public/fonts/right/PP Right Serif - Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/right/PP Right Serif - Light Italic.otf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../public/fonts/right/PP Right Serif - Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/right/PP Right Serif - Bold Italic.otf",
      weight: "700",
      style: "italic",
    },
    {
      path: "../public/fonts/right/PP Right Serif - Narrow Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/right/PP Right Serif - Tall Fine.otf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../public/fonts/right/PP Right Serif - Tall Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/right/PP Right Serif - Tight Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/right/PP Right Serif - Wide Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/right/PP Right Serif - Wide Black.otf",
      weight: "900",
      style: "normal",
    },
    {
      path: "../public/fonts/right/PP Right Serif - Spatial Fine.otf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../public/fonts/right/PP Right Serif - Spatial Black.otf",
      weight: "900",
      style: "normal",
    },
    {
      path: "../public/fonts/right/PP Right Serif - Compact Dark.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/right/PP Right Serif - Compact Black.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-pp-right-serif",
});

export const ppMondwest = localFont({
  src: [
    {
      path: "../public/fonts/mondwest/ppmondwest-regular.otf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-pp-mondwest",
});
