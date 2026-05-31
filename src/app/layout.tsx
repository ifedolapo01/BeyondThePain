import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Beyond the Pain',
  description: 'A platform to share your experiences, emotionally and mentally.',
  keywords: ['beyond the pain', 'mental health', 'emotional support', 'stories', 'experiences'],
  openGraph: {
    title: 'Beyond the Pain',
    description: 'A platform to share your experiences, emotionally and mentally.',
    url: 'https://beyondthepain.vercel.app',
    siteName: 'Beyond the Pain',
    images: [
      {
        url: '/logo.png', // Assuming logo.png is in public folder
        width: 800,
        height: 600,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Beyond the Pain',
    description: 'A platform to share your experiences, emotionally and mentally.',
    images: ['/logo.png'],
  },
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} min-h-screen`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then((registrations) => {
                  if (registrations.length > 0) {
                    Promise.all(registrations.map(r => r.unregister())).then(() => {
                      console.log('Stale service worker(s) cleared. Reloading page...');
                      window.location.reload();
                    });
                  }
                });
              }
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-background text-foreground" suppressHydrationWarning>
        <Navbar />
        <main className="flex-grow pt-28 pb-16">
          {children}
        </main>
      </body>
    </html>
  );
}
