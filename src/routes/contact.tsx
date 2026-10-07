import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Mail, Microscope, Satellite, Users } from "lucide-react";

import { PageIntro } from "@/components/page-elements";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [
    { title: "Contact — Cadarcq Technologies" },
    { name: "description", content: "Contact Cadarcq Technologies about research partnerships, product collaboration and investment." },
    { property: "og:title", content: "Contact — Cadarcq Technologies" },
    { property: "og:description", content: "Start a conversation with the Cadarcq Technologies team." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: ContactPage,
});

function ContactPage() { return <>
  <PageIntro eyebrow="Contact" title="Let's build what comes next." copy="We welcome conversations with researchers, institutions, industry collaborators and investors working toward ambitious technology." />
  <section className="ambient-bg min-h-[520px] py-20"><div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
    <div><p className="text-sm text-muted-foreground">Direct enquiries</p><a href="mailto:bastoffcial@gmail.com" className="mt-3 block break-all font-display text-2xl font-bold text-primary sm:text-3xl">bastoffcial@gmail.com</a><Button asChild className="mt-7"><a href="mailto:bastoffcial@gmail.com">Email Cadarcq <ArrowUpRight /></a></Button></div>
    <div className="grid gap-px border bg-border sm:grid-cols-2">{[
      { icon: Microscope, title: "Research partnerships", copy: "Joint research, technical exploration and experimental programmes." },
      { icon: Satellite, title: "Product collaboration", copy: "Development partners, mission opportunities and field applications." },
      { icon: Users, title: "Investment", copy: "Long-term partners who understand the path from science to scale." },
      { icon: Mail, title: "General enquiries", copy: "Questions about Cadarcq, our focus areas or upcoming products." },
    ].map(({ icon: Icon, title, copy }) => <div key={title} className="bg-background p-7 sm:p-9"><Icon className="h-6 w-6 text-primary"/><h2 className="mt-7 font-display text-lg font-bold">{title}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{copy}</p></div>)}</div>
  </div></section>
  </>; }