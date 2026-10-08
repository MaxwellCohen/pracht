/**
 * Solid `<Image>` component. Uses framework-free `getImageProps()` under the hood.
 */
import h from "@solidjs/h";
import { getImageProps, type ImageProps as BaseImageProps } from "./image.ts";

export type SolidImageProps = BaseImageProps;

/** Responsive `<img>` for Solid apps. */
export function Image(props: SolidImageProps) {
  const imgProps = getImageProps(props);
  return h("img", imgProps as Record<string, unknown>);
}
