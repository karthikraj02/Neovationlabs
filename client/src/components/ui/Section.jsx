import { cn } from "../../lib/utils";

export default function Section({
  children,
  className,
  border = "top",
  bg = "void",
  as: Tag = "section",
  ...props
}) {
  return (
    <Tag
      className={cn(
        "py-24 md:py-32",
        border === "top" && "border-t border-line",
        border === "bottom" && "border-b border-line",
        border === "both" && "border-y border-line",
        bg === "void" && "bg-void",
        bg === "surface" && "bg-surface/40",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
