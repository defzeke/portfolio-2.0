import type { ComponentProps } from "react";

type Variant = "primary" | "outline" | "light";

const styles: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700",
  outline: "border border-line text-ink hover:border-brand-600 hover:text-brand-700",
  light: "bg-white text-brand-800 hover:bg-brand-50",
};

type Props = ComponentProps<"a"> & { variant?: Variant };

export default function Button({ variant = "primary", className = "", ...props }: Props) {
  return (
    <a
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
