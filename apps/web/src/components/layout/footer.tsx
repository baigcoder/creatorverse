import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export function Footer() {
  const links = {
    Product: [
      { name: 'Features', href: '/features' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'AI Studio', href: '#' },
      { name: 'Course Builder', href: '#' },
      { name: 'Community', href: '#' },
      { name: 'Changelog', href: '#' },
    ],
    Solutions: [
      { name: 'For Coaches', href: '#' },
      { name: 'For Educators', href: '#' },
      { name: 'For Influencers', href: '#' },
      { name: 'For Mentors', href: '#' },
      { name: 'For Businesses', href: '#' },
    ],
    Resources: [
      { name: 'Documentation', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Tutorials', href: '#' },
      { name: 'API Reference', href: '#' },
      { name: 'Status', href: '#' },
    ],
    Company: [
      { name: 'About', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Privacy', href: '#' },
      { name: 'Terms', href: '#' },
      { name: 'Contact', href: '#' },
    ],
  };

  return (
    <footer className="border-t border-border/50 bg-card dark:border-white/[0.06] dark:bg-midnight-raised">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Logo */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl gradient-cta text-xs font-bold text-white">
                CV
              </span>
              <span className="font-display text-lg font-bold text-foreground">
                Creator<span className="text-violet">Verse</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              The creator operating system. Build courses, communities, and workshops that transform lives.
            </p>
          </div>

          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">{category}</h3>
              <ul className="mt-4 space-y-2.5">
                {items.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-violet"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 sm:flex-row dark:border-white/[0.06]">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} CreatorVerse OS. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            Made with <Sparkles className="h-4 w-4 text-violet" /> and AI
          </div>
        </div>
      </div>
    </footer>
  );
}