import type { ReactNode } from "react";

export function Panel({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      {title ? (
        <h2 className="marquee-title mb-3 text-lg text-token">{title}</h2>
      ) : null}
      {children}
    </section>
  );
}
