import React from 'react';
import { getProjects, getAutomations } from '@/lib/db';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Services from '@/components/Services';
import FAQSection from '@/components/FAQSection';
import AIDeepDive from '@/components/AIDeepDive';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const projects = await getProjects();
  const automations = await getAutomations();
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';
  const whatsappUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}` : '#';
  const webhookUrl = process.env.LEAD_WEBHOOK_URL || '/api/leads';

  return (
    <div className="min-h-screen bg-light text-dark font-sans flex flex-col selection:bg-secondary selection:text-dark">
      <Header />
      <main className="flex-grow">
        <Hero />
        <About />
        <Services />
        <FAQSection whatsappUrl={whatsappUrl} />
        <AIDeepDive automations={automations} />
        <Projects projects={projects} />
        <Contact webhookUrl={webhookUrl} />
      </main>
      <Footer whatsappUrl={whatsappUrl} />
    </div>
  );
}
