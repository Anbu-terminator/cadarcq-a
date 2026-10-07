import { createFileRoute } from "@tanstack/react-router";
import { Atom, BrainCircuit, Crosshair, Orbit, RadioTower, ScanSearch } from "lucide-react";

import quantumLab from "@/assets/quantum-lab.jpg";
import { Eyebrow, PageIntro } from "@/components/page-elements";

export const Route = createFileRoute("/research")({
  head: () => ({ meta: [
    { title: "Research — Cadarcq Technologies" },
    { name: "description", content: "Explore Cadarcq research in quantum systems, cold atoms, dark matter, neutrinos, advanced sensors and space intelligence." },
    { property: "og:title", content: "Research — Cadarcq Technologies" },
    { property: "og:description", content: "Advanced electronics for signals at the edge of measurement." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: ResearchPage,
});

const areas = [
  { icon: Atom, title: "Quantum systems", copy: "Electronics and control architectures for quantum communication, precision measurement and emerging computation platforms.", focus: "Control · readout · timing" },
  { icon: Orbit, title: "Cold atoms", copy: "Instrumentation for atom-based sensing with applications in timing, inertial navigation and gravimetry.", focus: "Vacuum · optics · feedback" },
  { icon: ScanSearch, title: "Dark matter", copy: "Ultra-low-noise acquisition systems designed to identify extremely rare interactions against complex backgrounds.", focus: "Low noise · high sensitivity" },
  { icon: Crosshair, title: "Neutrino detection", copy: "Scalable readout and synchronization electronics for instruments studying the universe's most elusive known particles.", focus: "Detection · synchronization" },
  { icon: RadioTower, title: "New sensors", copy: "Novel sensing platforms that combine physical measurement with dependable electronics for demanding environments.", focus: "Edge sensing · resilience" },
  { icon: BrainCircuit, title: "Space & AI", copy: "Compact payload systems and on-board intelligence that turn Earth-observation data into faster climate insight.", focus: "Payloads · on-board AI" },
];

function ResearchPage() {
  return <>
    <PageIntro eyebrow="Research" title="Finding signal where others see noise." copy="We work across physical science and electronic engineering to make faint, complex or previously inaccessible phenomena measurable." />
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <div className="grid gap-px overflow-hidden border bg-border md:grid-cols-2 lg:grid-cols-3">
        {areas.map(({ icon: Icon, title, copy, focus }, index) => <article key={title} className="group bg-background p-7 transition-colors hover:bg-card sm:p-9">
          <div className="flex items-center justify-between"><Icon className="h-7 w-7 text-primary" /><span className="font-display text-xs text-muted-foreground">0{index + 1}</span></div>
          <h2 className="mt-10 font-display text-xl font-bold">{title}</h2><p className="mt-3 min-h-24 leading-7 text-muted-foreground">{copy}</p><p className="mt-7 border-t pt-4 text-xs font-medium uppercase tracking-[0.16em] text-primary">{focus}</p>
        </article>)}
      </div>
    </section>
    <section className="border-y bg-card/30">
      <div className="mx-auto grid max-w-7xl items-center lg:grid-cols-2">
        <div className="px-5 py-16 lg:px-12"><Eyebrow>Our approach</Eyebrow><h2 className="mt-4 font-display text-3xl font-bold">Science-led. Product-minded.</h2><p className="mt-5 max-w-xl leading-7 text-muted-foreground">Every programme begins with the measurement challenge. From there, we bring together sensing, signal integrity, control and intelligent processing in one engineering path.</p>
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">{["Observe", "Engineer", "Deploy"].map((step, i) => <div key={step} className="border-t border-primary pt-3"><span className="font-display text-xs text-muted-foreground">0{i + 1}</span><p className="mt-1 text-sm font-semibold">{step}</p></div>)}</div>
        </div>
        <img src={quantumLab} alt="Precision quantum photonics laboratory" loading="lazy" width={1280} height={960} className="h-full min-h-96 w-full object-cover" />
      </div>
    </section>
  </>;
}