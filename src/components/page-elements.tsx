import { ArrowRight } from "lucide-react";
import { type ReactNode } from "react";

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="font-display text-xs font-bold uppercase tracking-[0.24em] text-primary">{children}</p>;
}

export function PageIntro({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <section className="grid-bg border-b pt-36 pb-18">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-5 max-w-5xl font-display text-4xl font-black leading-tight sm:text-5xl lg:text-7xl">{title}</h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground">{copy}</p>
      </div>
    </section>
  );
}

export function TextLink({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center gap-2 font-medium text-primary">{children}<ArrowRight className="h-4 w-4" /></span>;
}