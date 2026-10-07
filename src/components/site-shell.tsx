import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Menu } from "lucide-react";
import { type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Drop your company logo at src/assets/logo.png (or .jpg/.svg/.webp). If it is missing,
// the favicon is used so the site still builds and runs.
const logoFiles = import.meta.glob("/src/assets/logo.{png,jpg,jpeg,svg,webp}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;
const logoUrl = Object.values(logoFiles)[0] ?? "/favicon.png";

const links = [
  { to: "/", label: "Home" },
  { to: "/research", label: "Research" },
  { to: "/products", label: "Products" },
  { to: "/about", label: "About" },
] as const;

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link to="/" aria-label="Cadarcq Technologies home" className="flex items-center gap-3">
            <span className="flex h-11 w-24 items-center justify-center overflow-hidden rounded-sm bg-foreground px-2">
              <img src={logoUrl} alt="Cadarcq Technologies" className="h-full w-full object-contain" />
            </span>
            <span className="hidden font-display text-xs font-bold uppercase leading-tight sm:block">
              Cadarcq<br /><span className="text-primary">Technologies</span>
            </span>
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-8 lg:flex">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                activeOptions={{ exact: link.to === "/" }}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-primary" }}
              >
                {link.label}
              </Link>
            ))}
            <Button asChild size="sm">
              <Link to="/contact">Contact <ArrowUpRight /></Link>
            </Button>
          </nav>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open navigation">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full max-w-xs">
              <SheetHeader className="text-left">
                <SheetTitle className="font-display">Cadarcq Technologies</SheetTitle>
                <SheetDescription>Deep-tech electronics for the hardest frontiers.</SheetDescription>
              </SheetHeader>
              <nav className="mt-10 flex flex-col" aria-label="Mobile navigation">
                {[...links, { to: "/contact", label: "Contact" } as const].map((link, index) => (
                  <SheetClose asChild key={link.to}>
                    <Link
                      to={link.to}
                      activeOptions={{ exact: link.to === "/" }}
                      className="border-b py-5 font-display text-lg text-muted-foreground"
                      activeProps={{ className: "text-primary" }}
                    >
                      <span className="mr-4 text-xs text-primary">0{index + 1}</span>{link.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t bg-card/35">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:grid-cols-2 lg:px-8">
          <div>
            <p className="font-display text-lg font-bold">CADARC<span className="text-primary">Q</span></p>
            <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              Engineering advanced electronics across quantum science, particle detection, sensing and space systems.
            </p>
          </div>
          <div className="sm:text-right">
            <a className="text-sm text-primary hover:text-foreground" href="mailto:bastoffcial@gmail.com">bastoffcial@gmail.com</a>
            <p className="mt-3 text-xs text-muted-foreground">
              © {new Date().getFullYear()} Cadarcq Technologies
              <span className="mx-2">·</span>
              <Link to="/admin/login" className="hover:text-primary">Admin</Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}