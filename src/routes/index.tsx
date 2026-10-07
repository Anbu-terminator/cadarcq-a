import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Atom, Crosshair, Satellite } from "lucide-react";

import neutrinoHero from "@/assets/neutrino-hero.jpg";
import quantumLab from "@/assets/quantum-lab.jpg";
import satellite from "@/assets/vaan-mithra.jpg";
import { Eyebrow, TextLink } from "@/components/page-elements";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cadarcq Technologies — Deep Tech Electronics" },
      { name: "description", content: "Cadarcq Technologies builds deep tech electronics in quantum, cold atoms, dark matter, neutrino detection and next-gen sensors." },
      { property: "og:title", content: "Cadarcq Technologies — Deep Tech Electronics" },
      { property: "og:description", content: "Quantum, cold atoms, dark matter, neutrinos and new sensors — engineered into real products." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <section className="relative flex min-h-[92vh] items-end overflow-hidden pt-20">
        <img src={neutrinoHero} alt="Neutrino detector chamber illuminated by Cherenkov light" width={1536} height={1024} className="absolute inset-0 h-full w-full object-cover" />
        <div className="hero-shade absolute inset-0" />
        <div className="relative mx-auto w-full max-w-7xl px-5 pb-18 lg:px-8 lg:pb-24">
          <Eyebrow>Deep tech electronics</Eyebrow>
          <h1 className="mt-5 max-w-4xl font-display text-4xl font-black leading-tight sm:text-6xl lg:text-7xl">
            Engineering signals from the <span className="text-primary">invisible universe.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-foreground/80">
            Cadarcq Technologies develops advanced electronics for quantum systems, cold atoms, dark matter, neutrino detection, new sensors and climate intelligence from orbit.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg"><Link to="/products">Explore our products <ArrowRight /></Link></Button>
            <Button asChild size="lg" variant="outline"><Link to="/research">Discover our research</Link></Button>
          </div>
        </div>
      </section>

      <section className="border-y bg-card/30 py-7">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px px-5 sm:grid-cols-4 lg:px-8">
          {["Quantum systems", "Particle detection", "New sensors", "Space intelligence"].map((item, index) => (
            <div key={item} className="border-l border-border px-4 py-3">
              <span className="font-display text-xs text-primary">0{index + 1}</span>
              <p className="mt-1 text-sm font-medium">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_0.7fr]">
          <div><Eyebrow>Research frontiers</Eyebrow><h2 className="mt-4 max-w-3xl font-display text-3xl font-bold leading-tight sm:text-5xl">Turning frontier physics into dependable technology.</h2></div>
          <p className="max-w-xl text-base leading-7 text-muted-foreground">Our work joins precision measurement, low-noise electronics and intelligent systems to move advanced science beyond the laboratory.</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            { icon: Atom, title: "Quantum & cold atoms", copy: "Control, readout and instrumentation for quantum communication and atom-based measurement." },
            { icon: Crosshair, title: "Rare event detection", copy: "Sensitive electronics for neutrino and dark-matter experiments where every signal matters." },
            { icon: Satellite, title: "Sensors & space", copy: "Integrated sensing platforms and on-board intelligence for complex environments." },
          ].map(({ icon: Icon, title, copy }) => (
            <article key={title} className="border-t-2 border-primary bg-card/40 p-7">
              <Icon className="h-7 w-7 text-primary" /><h3 className="mt-8 font-display text-xl font-bold">{title}</h3><p className="mt-3 leading-7 text-muted-foreground">{copy}</p>
            </article>
          ))}
        </div>
        <Link to="/research" className="mt-9 inline-block"><TextLink>Explore all research areas</TextLink></Link>
      </section>

      <section className="bg-foreground text-background">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
          <img src={quantumLab} alt="Quantum photonics and cold atom laboratory" loading="lazy" width={1280} height={960} className="h-full min-h-96 w-full object-cover" />
          <div className="flex flex-col justify-center px-5 py-18 lg:px-16">
            <p className="font-display text-xs font-bold uppercase tracking-[0.24em] text-secondary">Built for translation</p>
            <h2 className="mt-5 font-display text-3xl font-black leading-tight sm:text-5xl">From scientific possibility to engineered systems.</h2>
            <p className="mt-6 leading-7 text-background/70">We focus on the electronics, sensing and intelligence that transform ambitious research into instruments designed for real-world operation.</p>
            <Link to="/about" className="mt-9 inline-flex items-center gap-2 font-semibold text-secondary">Meet Cadarcq <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div><Eyebrow>Product horizon</Eyebrow><h2 className="mt-4 font-display text-4xl font-bold">Three technologies moving toward launch.</h2><p className="mt-5 leading-7 text-muted-foreground">A focused roadmap across land sensing, secure quantum communication and orbital climate intelligence.</p><Link to="/products" className="mt-8 inline-block"><TextLink>View the full roadmap</TextLink></Link></div>
          <div className="relative overflow-hidden rounded-md border">
            <img src={satellite} alt="Climate intelligence microsatellite in orbit" loading="lazy" width={1280} height={960} className="aspect-[4/3] w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-background/90 p-5 backdrop-blur"><p className="font-display text-lg font-bold">Vaan Mithra</p><p className="mt-1 text-sm text-muted-foreground">ClimaAI micro satellite · June 2028</p></div>
          </div>
        </div>
      </section>
    </>
  );
}
