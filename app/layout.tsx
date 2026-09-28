import type { Metadata } from 'next';
// @ts-ignore - CSS modules are handled by Next.js during build; editor typings may not be available here.
import './globals.css';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import NodeBackground from "../components/NodeBackground";
import ScrollEffects from "../components/ScrollEffects";

export const metadata: Metadata = {
  title: 'Resolves Protocol',
  description: 'Resolves protocol website converted to Next.js with multiple routes.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><div className="aurora-bg"/><div className="scroll-progress"/><Navbar/><NodeBackground /><ScrollEffects />{children}<Footer/></body></html>;
}