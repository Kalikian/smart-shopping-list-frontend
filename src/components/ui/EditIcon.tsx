import * as React from "react";

type EditIconProps = React.SVGProps<SVGSVGElement> & {
  size?: number; // px size (width/height)
  strokeWidth?: number; // stroke thickness
};

/** Simple pencil/edit icon (stroke-based, currentColor). */
export default function EditIcon({
  size = 18,
  strokeWidth = 1.6,
  className,
  ...rest
}: EditIconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      aria-hidden
      className={className}
      {...rest}
    >
      <path d="M12.7 3.3l4 4L7 17H3v-4l9.7-9.7z" />
      <path d="M11 5l4 4" />
    </svg>
  );
}
