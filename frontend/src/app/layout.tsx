import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MyTrade AI Indicator — NSE & BSE AI Trading Indicator',
  description: 'Private high-performance AI Trading Indicator for NSE/BSE charts, options, and strategy execution.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased overflow-hidden">
        {children}
      </body>
    </html>
  );
}
