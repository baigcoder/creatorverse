import type { Metadata } from 'next';
import { Inter, Space_Grotesk, VT323, JetBrains_Mono } from 'next/font/google';
import '@/styles/globals.css';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { QueryProvider } from '@/components/ui/query-provider';
import { ServiceWorkerRegister } from '@/components/shared/service-worker-register';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const vt323 = VT323({
  subsets: ['latin'],
  variable: '--font-retro',
  display: 'swap',
  weight: ['400'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'Creatorverse Y2K — Turn Your Creativity into Chaos & Cash!',
  description:
    'The ultimate playful Gen Z creator universe. Built like a futuristic arcade where creators launch courses, communities, workshops, and build highly engaging businesses while having massive fun.',
  keywords: [
    'creator platform',
    'online courses',
    'AI course builder',
    'membership site',
    'community platform',
    'coaching platform',
    'workshop platform',
    'creator economy',
    'Creatorverse',
    'Creatorverse Y2K',
    'arcade creator',
  ],
  openGraph: {
    title: 'Creatorverse Y2K — Turn Your Creativity into Chaos & Cash!',
    description: 'A futuristic Y2K digital arcade for Gen Z creators. Host courses, communities, and workshops — all while having pure fun.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Creatorverse Y2K',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Creatorverse Y2K',
    description: 'Turn your knowledge into chaos and cash.',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${vt323.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <ServiceWorkerRegister />
            {children}
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
