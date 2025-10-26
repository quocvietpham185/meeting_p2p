import type { Metadata } from 'next';
import '../styles/index.css';

export const metadata: Metadata = {
  title: 'VideoMeet',
  description: 'Join seamless meetings and connect with your team anywhere',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="mdl-js">
      <body className="antialiased bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
