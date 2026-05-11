import React from 'react';
import Head from 'next/head';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import EventCarousel from '../components/landing/EventCarousel';
import HowItWorks from '../components/landing/HowItWorks';
import Features from '../components/landing/Features';
import Benefits from '../components/landing/Benefits';
import Testimonials from '../components/landing/Testimonials';
import FAQ from '../components/landing/FAQ';
import EventMapSection from '../components/landing/EventMapSection';
import FinalCTA from '../components/landing/FinalCTA';
import Footer from '../components/landing/Footer';

export default function Home() {
  return (
    <>
      <Head>
        <title>Eventos Córdoba — Gestiona eventos sin caos</title>
        <meta
          name="description"
          content="Plataforma todo-en-uno para crear, organizar y promocionar eventos en Córdoba. Check-in QR, dashboard, mapas y más."
        />
      </Head>

      <Navbar />
      <Hero />
      <EventCarousel />
      <HowItWorks />
      <Features />
      <Benefits />
      <Testimonials />
      <FAQ />
      <EventMapSection />
      <FinalCTA />
      <Footer />
    </>
  );
}
