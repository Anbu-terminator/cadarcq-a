import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, CircuitBoard, FlaskConical, Rocket } from "lucide-react";

import neutrinoHero from "@/assets/neutrino-hero.jpg";
import { Eyebrow, PageIntro } from "@/components/page-elements";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "About — Cadarcq Technologies" },
    { name: "description", content: "Cadarcq Technologies turns frontier physics into advanced electronic products for science, security and the planet." },
    { property: "og:title", content: "About — Cadarcq Technologies" },
    { property: "og:description", content: "A deep-tech electronics company connecting scientific ambition with engineered reality." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: AboutPage,
});

function AboutPage() { return <>
  <PageIntro eyebrow="About Cadarcq" title="Built for problems that demand new technology." copy="Cadarcq Technologies is a deep-tech electronics startup working where measurement is difficult, signals are faint and the potential impact is significant." />
  <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-2 lg:px-8"><div><Eyebrow>Our mission</Eyebrow><h2 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl">Move breakthrough science beyond the laboratory.</h2></div><div className="space-y-5 text-lg leading-8 text-muted-foreground"><p>We believe the next generation of transformative products will emerge from the intersection of fundamental physics, advanced electronics and intelligent computation.</p><p>Our role is to build the practical bridge: robust systems that can sense, communicate and operate in the environments where they are needed.</p></div></section>
  <section className="border-y bg-card/30"><div className="mx-auto grid max-w-7xl md:grid-cols-3">{[
    { icon: FlaskConical, title: "Scientific depth", copy: "We begin with first principles and the physics of the problem." },
    { icon: CircuitBoard, title: "Engineering discipline", copy: "We design for dependable performance, not demonstrations alone." },
    { icon: Rocket, title: "Long-term ambition", copy: "We build patiently toward technologies with meaningful global value." },
  ].map(({ icon: Icon, title, copy }) => <div key={title} className="border-b p-8 md:border-r md:border-b-0 lg:p-12"><Icon className="h-7 w-7 text-primary"/><h3 className="mt-8 font-display text-xl font-bold">{title}</h3><p className="mt-3 leading-7 text-muted-foreground">{copy}</p></div>)}</div></section>
  <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:px-8"><img src={neutrinoHero} alt="Advanced neutrino detector facility" loading="lazy" width={1536} height={1024} className="aspect-[3/2] w-full rounded-md object-cover"/><div><Eyebrow>Collaboration</Eyebrow><h2 className="mt-4 font-display text-3xl font-bold">The hardest problems are shared.</h2><p className="mt-5 leading-7 text-muted-foreground">Cadarcq is building at the intersection of research and industry. We are open to collaborative development, research partnerships and strategic investment.</p><Button asChild className="mt-8"><Link to="/contact">Connect with us <ArrowRight /></Link></Button></div></section>
  </>; }