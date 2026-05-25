import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import Providers from './providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://bloggy.umairrx.dev'),
  title: {
    default: 'Bloggy - Content Workspace',
    template: '%s - Bloggy',
  },
  description: 'A professional, privacy-first content workspace and blogging platform designed for absolute data ownership and beautiful writing experiences.',
  keywords: ['blogging platform', 'privacy-first blog', 'local-first content manager', 'markdown editor', 'SEO blog publisher', 'Next.js workspace'],
  authors: [{ name: 'Umair', url: 'https://bloggy.umairrx.dev' }],
  creator: 'Umair',
  publisher: 'Bloggy',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bloggy.umairrx.dev',
    siteName: 'Bloggy',
    title: 'Bloggy - Content Workspace',
    description: 'A professional, privacy-first content workspace and blogging platform designed for absolute data ownership and beautiful writing experiences.',
    images: [
      {
        url: '/favicon.svg',
        width: 512,
        height: 512,
        alt: 'Bloggy - Content Workspace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bloggy - Content Workspace',
    description: 'A professional, privacy-first content workspace and blogging platform designed for absolute data ownership and beautiful writing experiences.',
    images: ['/favicon.svg'],
    creator: '@umairrx',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Bloggy',
    url: 'https://bloggy.umairrx.dev',
    description: 'A professional, privacy-first content workspace and blogging platform.',
    publisher: {
      '@type': 'Organization',
      name: 'Bloggy',
      logo: {
        '@type': 'ImageObject',
        url: 'https://bloggy.umairrx.dev/favicon.svg',
      },
    },
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-canvas text-ink antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>
          <ThemeProvider>
            <TooltipProvider>
              {children}
              <Toaster />
            </TooltipProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
