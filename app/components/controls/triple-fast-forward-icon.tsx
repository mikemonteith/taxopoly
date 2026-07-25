import type { SVGProps } from "react";

export function TripleFastForwardIcon({
  className = "size-4",
  "aria-hidden": ariaHidden = true,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={ariaHidden}
      {...props}
    >
      <path
        d="M2 6L7.5 12L2 18V6ZM9.25 6L14.75 12L9.25 18V6ZM16.5 6L22 12L16.5 18V6Z"
        fill="currentColor"
      />
    </svg>
  );
}
