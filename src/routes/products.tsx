import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Mountain, Satellite, ShieldCheck } from "lucide-react";

import satellite from "@/assets/vaan-mithra.jpg";
import { PageIntro } from "@/components/page-elements";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/products")({
  head: () => ({ meta: [
    { title: "Products & Roadmap — Cadarcq Technologies" },
    { name: "description", content: "Cadarcq's roadmap: Hill Sentinel, QKD and the Vaan Mithra ClimaAI micro satellite." },
    { property: "og:title", content: "Products & Roadmap — Cadarcq Technologies" },
    { property: "og:description", content: "Three deep-tech product programmes moving from research toward deployment." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: ProductsPage,
});

const products = [
  { number: "01", icon: Mountain, name: "Hill Sentinel", category: "Advanced sensing system", description: "A sensing programme created to bring persistent awareness and dependable intelligence to challenging landscapes.", milestones: [{ label: "MVP", date: "April 2027" }, { label: "Final product", date: "September 2027" }] },
  { number: "02", icon: ShieldCheck, name: "QKD", category: "Quantum key distribution", description: "Secure-communication technology built around quantum principles to protect critical information exchange.", milestones: [{ label: "Target launch", date: "April 2028" }] },
  { number: "03", icon: Satellite, name: "Vaan Mithra", category: "ClimaAI micro satellite", description: "A compact Earth-observation platform designed to combine environmental sensing with intelligent climate analysis.", milestones: [{ label: "Target launch", date: "June 2028" }] },
];

function ProductsPage() { return <>
  <PageIntro eyebrow="Product roadmap" title="Advanced systems, built toward the real world." copy="Our first three programmes translate frontier science into focused products for sensing, secure communication and climate intelligence." />
  <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
    <div className="space-y-5">{products.map(({ number, icon: Icon, name, category, description, milestones }) => <article key={name} className="grid overflow-hidden border bg-card/25 lg:grid-cols-[120px_1fr_0.75fr]">
      <div className="flex items-center justify-between border-b p-7 lg:flex-col lg:items-start lg:border-r lg:border-b-0"><span className="font-display text-4xl font-black text-primary">{number}</span><Icon className="h-7 w-7 text-muted-foreground" /></div>
      <div className="p-7 lg:p-10"><p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">{category}</p><h2 className="mt-3 font-display text-2xl font-bold sm:text-3xl">{name}</h2><p className="mt-4 max-w-2xl leading-7 text-muted-foreground">{description}</p></div>
      <div className="border-t bg-background/60 p-7 lg:border-l lg:border-t-0 lg:p-10"><p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Milestones</p><div className="mt-5 space-y-5">{milestones.map(({ label, date }) => <div key={label}><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 font-display font-bold text-primary">{date}</p></div>)}</div></div>
    </article>)}</div>
  </section>
  <section className="border-y bg-foreground text-background"><div className="mx-auto grid max-w-7xl items-center lg:grid-cols-2"><img src={satellite} alt="Vaan Mithra climate intelligence microsatellite" loading="lazy" width={1280} height={960} className="h-full min-h-96 w-full object-cover" /><div className="px-5 py-16 lg:px-14"><p className="font-display text-xs font-bold uppercase tracking-[0.24em] text-secondary">Work with us</p><h2 className="mt-5 font-display text-3xl font-black">Partner on the next frontier.</h2><p className="mt-5 leading-7 text-background/70">We welcome conversations with research institutions, mission partners and investors who share a long-term view of deep technology.</p><Button asChild className="mt-8"><Link to="/contact">Start a conversation <ArrowRight /></Link></Button></div></div></section>
  </>; }