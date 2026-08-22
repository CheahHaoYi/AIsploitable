import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AIsploitable | Autonomous Incident & Vulnerability Verification',
  description: 'Autonomous cyber triage and exploitability verification command center powered by local Gemma with MITRE ATT&CK/ATLAS RAG and empirical sandbox verification.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;500;700&family=Roboto:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-white text-[#202124] flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
