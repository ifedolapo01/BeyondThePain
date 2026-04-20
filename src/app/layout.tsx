import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Beyond the Pain',
  description: 'A platform to share your experiences, emotionally and mentally.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} min-h-screen`} suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col bg-background text-foreground" suppressHydrationWarning>
        <Navbar />
        <main className="flex-grow pt-28 pb-16 px-6 max-w-5xl mx-auto w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
