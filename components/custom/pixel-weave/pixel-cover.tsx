"use client";

import { useMemo, useState, type ImgHTMLAttributes } from "react";
import {
  generateDataURL,
  type PixelWeaveOptions,
} from "@/packages/pixel-weave/src";

export interface PixelCoverProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src"
> {
  seed: string;
  src?: string | null;
  options?: PixelWeaveOptions;
}
function GeneratedCover({
  seed,
  options,
  ...props
}: Omit<PixelCoverProps, "src">) {
  const source = useMemo(() => generateDataURL(seed, options), [seed, options]);
  return <img {...props} src={source} />;
}
function CoverSource({
  src,
  seed,
  options,
  onError,
  ...props
}: PixelCoverProps) {
  const [failed, setFailed] = useState(false);
  if (!src || failed)
    return <GeneratedCover {...props} seed={seed} options={options} />;
  return (
    <img
      {...props}
      src={src}
      onError={(event) => {
        setFailed(true);
        onError?.(event);
      }}
    />
  );
}
/** Resets failure state when the source changes. Artwork is computed only when needed. */
export function PixelCover({
  alt = "",
  loading = "lazy",
  ...props
}: PixelCoverProps) {
  return (
    <CoverSource key={props.src ?? ""} {...props} alt={alt} loading={loading} />
  );
}
