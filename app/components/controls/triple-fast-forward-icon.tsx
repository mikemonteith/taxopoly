import type { SVGProps } from "react";

const TRIANGLE_PATHS = {
  1: ["M7 6L15 12L7 18V6Z"],
  2: ["M5 6L10.5 12L5 18V6Z", "M12.5 6L18 12L12.5 18V6Z"],
  3: [
    "M2 6L7.5 12L2 18V6Z",
    "M9.25 6L14.75 12L9.25 18V6Z",
    "M16.5 6L22 12L16.5 18V6Z",
  ],
} as const;

type SimulationSpeedIconProps = SVGProps<SVGSVGElement> & {
  arrows?: keyof typeof TRIANGLE_PATHS;
};

export function SimulationSpeedIcon({
  arrows = 1,
  className = "size-4",
  "aria-hidden": ariaHidden = true,
  ...props
}: SimulationSpeedIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={ariaHidden}
      {...props}
    >
      {TRIANGLE_PATHS[arrows].map((path, index) => (
        <path
          key={index}
          d={path}
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

export function TripleFastForwardIcon(props: SVGProps<SVGSVGElement>) {
  return <SimulationSpeedIcon arrows={3} {...props} />;
}
