import { Button } from "../components/ui/button"
import { CompanyCard } from "../components/CompanyCard"
import { HeroSlideshow } from "../components/HeroSlideshow"
import React, { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "../components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { AdCompanyCard, FilmRollAdColumn } from "../components/CompanyCard";
// Import icons
import { Car, BedDouble, Phone, Mail, MessageCircle, ShieldCheck, Star, Users } from "lucide-react";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

const AKR_COMPANY_NAME = "AKR & SONS (PVT) LTD";

type Company = {
  name: string;
  description: string;
  icon: string;
  image: string;
  link: string;
};

const quickActionSlideshowImages = [
  "/images/image.png",
  "/images/image copy.png",
  "/images/image copy 2.png"
];

function QuickActionSlideshow() {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % quickActionSlideshowImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  return (
    <img
      src={quickActionSlideshowImages[current]}
      alt="AKR Group Slideshow"
      className="rounded-2xl shadow-xl object-cover w-full max-w-md border-4 border-emerald-200"
      style={{ aspectRatio: '16/9', background: '#f3f4f6' }}
    />
  );
}

export default function Index() {
  // Company data for carousels
  const companies: Company[] = [
    {
      name: "AKR Sons (Pvt) Ltd",
      description: "A trusted premium dealership for Bajaj motorcycles and three-wheelers, offering reliable, fuel-efficient models, flexible financing, and genuine after-sales support.",
      icon: "bicycle",
      image: "/images/akr-sons.jpg",
      link: "/akr-sons-bike-store"
    }
  ];

  // Synchronized carousel state
  const [startIndex, setStartIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setStartIndex((prev) => (prev + 1) % companies.length);
    }, 4500); // Changed from 1500 to 3500 ms
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [companies.length]);

  // Add state for rotating ad companies
  const [adStartIndex, setAdStartIndex] = useState(0);
  useEffect(() => {
    const adInterval = setInterval(() => {
      setAdStartIndex((prev) => (prev + 4) % companies.length);
    }, 4000);
    return () => clearInterval(adInterval);
  }, [companies.length]);
  const adCompanies = [
    companies[(adStartIndex + 0) % companies.length],
    companies[(adStartIndex + 1) % companies.length],
    companies[(adStartIndex + 2) % companies.length],
    companies[(adStartIndex + 3) % companies.length],
  ];

  // Split companies for left/right columns
  const leftAdCompanies = companies.slice(0, Math.ceil(companies.length / 2));
  const rightAdCompanies = companies.slice(Math.ceil(companies.length / 2));

  // Get top and bottom row companies for train/circle effect
  const getTopCompanies = (): Company[] => {
    const result: Company[] = [];
    for (let i = 0; i < 4; i++) {
      result.push(companies[(startIndex + i) % companies.length]);
    }
    return result;
  };
  const getBottomCompanies = (): Company[] => {
    const result: Company[] = [];
    for (let i = 0; i < 4; i++) {
      // 7-i gives the reverse order for the bottom row
      result.push(companies[(startIndex + 7 - i) % companies.length]);
    }
    return result;
  };
  const topCompanies = getTopCompanies();
  const bottomCompanies = getBottomCompanies();

  // Add at the top of the component, after other useState/useEffect hooks
  const messages = [
    "New here? Book your first vehicle or room in just 2 minutes.",
    "Explore our services—booking is fast, easy, and secure.",
    "Need help? Our team is ready to assist you anytime."
  ];
  const [messageIndex, setMessageIndex] = useState(0);
  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 3000);
    return () => clearInterval(msgInterval);
  }, [messages.length]);

  // Add a state for mobile detection
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-emerald-900 to-green-800 border-0 border-b border-white/10 rounded-b-2xl text-white">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Company Name */}
            <div className="flex items-center space-x-3 md:space-x-4">
              <a href="#home" className="flex items-center space-x-3 md:space-x-4 hover:opacity-80 transition-opacity duration-200">
                <img 
                  src="/images/image copy 2.png" 
                  alt="AKR Group Logo" 
                  className="h-10 w-10 md:h-14 md:w-14 object-contain rounded-full shadow-md bg-white" 
                />
                <div className="text-xl md:text-3xl font-extrabold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]" style={{letterSpacing: '0.02em'}}>AKR GROUP OF COMPANIES</div>
              </a>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <a href="#home" className="text-white hover:text-emerald-300 transition-all duration-300 font-medium">
                Home
              </a>
              <a
                href="#companies"
                className="text-white hover:text-emerald-300 transition-all duration-300 font-medium"
              >
                Companies
              </a>
              <a href="#about" className="text-white hover:text-emerald-300 transition-all duration-300 font-medium">
                About
              </a>
              <a
                href="#contact"
                className="text-white hover:text-emerald-300 transition-all duration-300 font-medium"
              >
                Contact
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
              onClick={() => {
                const mobileMenu = document.getElementById('mobile-menu');
                if (mobileMenu) {
                  mobileMenu.classList.toggle('hidden');
                }
              }}
            >
              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          <div id="mobile-menu" className="hidden md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-3">
              <a 
                href="#home" 
                className="text-white hover:text-emerald-300 transition-all duration-300 font-medium py-2 px-3 rounded-lg hover:bg-white/10"
                onClick={() => {
                  document.getElementById('mobile-menu')?.classList.add('hidden');
                }}
              >
                Home
              </a>
              <a
                href="#companies"
                className="text-white hover:text-emerald-300 transition-all duration-300 font-medium py-2 px-3 rounded-lg hover:bg-white/10"
                onClick={() => {
                  document.getElementById('mobile-menu')?.classList.add('hidden');
                }}
              >
                Companies
              </a>
              <a 
                href="#about" 
                className="text-white hover:text-emerald-300 transition-all duration-300 font-medium py-2 px-3 rounded-lg hover:bg-white/10"
                onClick={() => {
                  document.getElementById('mobile-menu')?.classList.add('hidden');
                }}
              >
                About
              </a>
              <a
                href="#contact"
                className="text-white hover:text-emerald-300 transition-all duration-300 font-medium py-2 px-3 rounded-lg hover:bg-white/10"
                onClick={() => {
                  document.getElementById('mobile-menu')?.classList.add('hidden');
                }}
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Slideshow */}
      <section id="home" className="pt-16 md:pt-20 relative overflow-hidden min-h-screen">
        {/* Dynamic Moving Elements Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
          <div className="absolute inset-0">
            {/* Large floating elements */}
            <div className="absolute top-16 left-16 w-16 h-16 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full animate-dynamicFloat1"></div>
            <div className="absolute top-32 right-24 w-12 h-12 bg-gradient-to-br from-emerald-400/25 to-teal-500/25 rounded-full animate-dynamicFloat2"></div>
            <div className="absolute bottom-24 left-1/3 w-14 h-14 bg-gradient-to-br from-teal-400/20 to-green-500/20 rounded-full animate-dynamicFloat3"></div>
            
            {/* Medium moving elements */}
            <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-gradient-to-br from-green-500/30 to-emerald-600/30 rounded-full animate-dynamicMove1"></div>
            <div className="absolute bottom-1/3 right-1/4 w-6 h-6 bg-gradient-to-br from-emerald-500/35 to-teal-600/35 rounded-full animate-dynamicMove2"></div>
            <div className="absolute top-1/3 right-1/3 w-10 h-10 bg-gradient-to-br from-teal-500/25 to-green-600/25 rounded-full animate-dynamicMove3"></div>
            
            {/* Small bouncing elements */}
            <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-green-400/40 rounded-full animate-dynamicBounce1"></div>
            <div className="absolute top-3/4 left-1/3 w-3 h-3 bg-emerald-400/45 rounded-full animate-dynamicBounce2"></div>
            <div className="absolute bottom-1/4 right-1/3 w-5 h-5 bg-teal-400/35 rounded-full animate-dynamicBounce3"></div>
            
            {/* Rotating elements */}
            <div className="absolute top-1/2 left-1/2 w-20 h-20 border-2 border-green-400/20 rounded-full animate-dynamicRotate1"></div>
            <div className="absolute top-1/4 left-1/2 w-12 h-12 border-2 border-emerald-400/25 rounded-full animate-dynamicRotate2"></div>
          </div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="mt-4">
            {/* Main Hero Content */}
            <div className="relative w-full min-h-[320px] md:min-h-[500px] flex items-center justify-center">
              {/* Left ad cards (desktop only) */}
              <div className="hidden md:flex flex-col absolute left-4 top-1/2 -translate-y-1/2 z-10 w-56">
                <FilmRollAdColumn companies={companies} direction="up" visibleCount={3} intervalMs={6000} />
              </div>
              
              {/* Main Hero Content */}
              <div className="w-full max-w-4xl mx-auto text-center relative z-20">
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-emerald-200/50">
                  <h1 className="text-4xl md:text-6xl font-bold text-emerald-800 mb-4">
                    AKR Group of Companies
                  </h1>
                  <p className="text-lg md:text-xl text-gray-700 mb-6 max-w-2xl mx-auto">
                    Discover, shop, and experience the best brands, vehicles, and services—all under one roof.
                  </p>
                  <p className="text-base md:text-lg text-emerald-700 font-semibold mb-8">
                    Your trusted partner in Mannar and beyond.
                  </p>
                  
                  {/* Prominent CTA Button */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                    <Button 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2"
                      onClick={() => window.location.href='/akr-sons-bike-store'}
                    >
                      <Car className="w-5 h-5" />
                      Explore Our Services
                    </Button>
                  </div>
                  
                  {/* Promotional Banner */}
                  <div className="bg-yellow-400 text-yellow-900 font-bold text-sm md:text-base px-6 py-3 rounded-full inline-block shadow-lg">
                    20% off for your first purchase!
                  </div>
                </div>
          </div>
              
              {/* Quick Contact/CTA card (desktop only) */}
              <div className="hidden md:flex flex-col absolute right-4 top-1/2 -translate-y-1/2 z-10 w-72">
                <div className="bg-white/90 rounded-xl shadow-2xl p-4 flex flex-col items-center gap-3 border border-primary/20 ring-1 ring-black/5">
                  <Button className="w-full bg-gradient-primary font-bold text-sm py-1.5 rounded-lg hover:scale-105 transition text-gray-900" onClick={() => window.location.href='/akr-sons-bike-store'}>
                    Book a Vehicle
                  </Button>
                  <Button className="w-full bg-gradient-secondary font-bold text-sm py-1.5 rounded-lg hover:scale-105 transition text-emerald-900" onClick={() => window.location.href='/akr-sons-bike-store'}>
                    Book a Room
                  </Button>
                  <div className="w-full border-t border-gray-200 my-1" />
                  <div className="flex flex-col gap-1 w-full mt-1">
                    <a href="https://wa.me/94773111266" target="_blank" rel="noopener" className="w-full text-emerald-900 font-medium text-sm hover:underline hover:scale-105 transition">WhatsApp</a>
                    <a href="tel:0773111266" className="w-full text-blue-900 font-medium text-sm hover:underline hover:scale-105 transition">Call: 0773111266</a>
                    <a href="mailto:akrfuture@gmail.com" className="w-full text-gray-900 font-medium text-sm hover:underline hover:scale-105 transition">Email</a>
                  </div>
                  {/* Vertical Message Slider */}
                  <div className="w-full mt-1 min-h-[24px] flex items-center justify-center">
                    <span className="text-xs text-gray-700 font-medium transition-all duration-500 text-center">
                      {messages[messageIndex]}
                    </span>
                  </div>
                </div>
                {/* Family/Team Photo below quick actions (desktop) */}
                <div className="flex justify-center mt-6">
                  <QuickActionSlideshow />
                </div>
              </div>
              
              {/* Mobile: show below hero content */}
              <div className="md:hidden flex flex-col gap-4 mt-6 w-full z-10 relative">
                {companies.map(company => (
                  <AdCompanyCard key={company.name} company={company} />
                ))}
                <div className="bg-white/90 rounded-xl shadow-2xl p-7 flex flex-col items-center gap-5 border border-primary/20 ring-1 ring-black/5 mt-4">
                  <Button className="w-full bg-gradient-primary font-bold text-base py-2 rounded-xl hover:scale-105 transition text-gray-900" onClick={() => window.location.href='/akr-sons-bike-store'}>
                    Book a Vehicle
                  </Button>
                  <Button className="w-full bg-gradient-secondary font-bold text-base py-2 rounded-xl hover:scale-105 transition text-emerald-900" onClick={() => window.location.href='/akr-sons-bike-store'}>
                    Book a Room
                  </Button>
                  <div className="w-full border-t border-gray-200 my-2" />
                  <div className="flex flex-col gap-2 w-full mt-1">
                    <a href="https://wa.me/94773111266" target="_blank" rel="noopener" className="w-full text-emerald-900 font-semibold hover:underline hover:scale-105 transition">WhatsApp</a>
                    <a href="tel:0773111266" className="w-full text-blue-900 font-semibold hover:underline hover:scale-105 transition">Call: 0773111266</a>
                    <a href="mailto:akrfuture@gmail.com" className="w-full text-gray-900 font-semibold hover:underline hover:scale-105 transition">Email</a>
                  </div>
                  {/* Vertical Message Slider (Mobile) */}
                  <div className="w-full mt-2 min-h-[32px] flex items-center justify-center">
                    <span className="text-sm text-gray-700 font-medium transition-all duration-500 text-center">
                      {messages[messageIndex]}
                    </span>
                  </div>
                  {/* Family/Team Photo below quick actions (mobile) */}
                  <div className="flex justify-center mt-6 w-full">
                    <QuickActionSlideshow />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Companies Section */}
      <section id="companies" className="py-20 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-50/30 to-transparent"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <div className="w-20 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto"></div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="gradient-text">Our Group Companies</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover the diverse portfolio of companies that make up the AKR Group family. Each division reflects our unwavering commitment to excellence, innovation, and community impact — driving progress across industries while staying rooted in our core values.
            </p>
          </div>
          {/* Responsive Company Cards Grid */}
          <div className="w-full">
            {isMobile ? (
              <Swiper slidesPerView={1} spaceBetween={16}>
                {companies.map((company) => (
                  <SwiperSlide key={company.name}>
                    <div className="w-full max-w-[320px] mx-auto">
                      <CompanyCard {...company} />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {companies.map((company) => (
              <div key={company.name} className="w-full max-w-[320px] mx-auto">
                  <CompanyCard {...company} />
                </div>
              ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Enhanced About Section */}
      <section id="about" className="py-16 md:py-24 bg-white/30 backdrop-blur-md rounded-3xl border border-white/30 shadow-xl mx-2 md:mx-auto max-w-5xl relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-0 left-0 w-full h-32 opacity-10"><path fill="#10b981" fillOpacity="0.2" d="M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,133.3C840,107,960,85,1080,101.3C1200,117,1320,171,1380,197.3L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path></svg>
        </div>
        <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
          {/* Family/Team Photo Placeholder */}
          <div className="flex justify-center mb-8">
            <img 
              src="/images/image copy.png" 
              alt="AKR Group Family/Team Photo" 
              className="rounded-2xl shadow-xl object-cover w-full max-w-md border-4 border-emerald-200" 
              style={{ aspectRatio: '16/9', background: '#f3f4f6' }}
            />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-2 gradient-text">The Story of AKR Group</h2>
          <p className="text-lg md:text-xl text-emerald-800 font-semibold mb-8">From Humble Beginnings to Regional Leadership</p>
          <div className="text-left mx-auto max-w-3xl space-y-8 text-gray-800">
            <div>
              <h3 className="text-2xl font-bold mb-2 gradient-text">Our Journey</h3>
              <p className="mb-2">The story of AKR Group is more than a business journey — it is a legacy of vision, resilience, and a deep commitment to uplift the community.</p>
              <p className="mb-2">In 1978, Mr. Anton began his professional life as a bus driver with the Sri Lanka Transport Board. With unyielding determination and a dream to build something greater, he ventured abroad in 1984. After returning to Sri Lanka in 1989, he set his sights on transforming the regional commercial landscape.</p>
              <p className="mb-2">In 1990, he founded AKA, initially focusing on transport services and innovative mobile fuel sales using containers. Beyond business, Mr. Anton remained devoted to public welfare, launching initiatives to improve community well-being.</p>
              <p className="mb-2">This relentless spirit of progress soon led to the rebranding of AKA as AKR, marking a pivotal phase of growth with the launch of the AKR Filling Station and AKR Wine Store, further expanding the company’s commercial reach and impact.</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2 gradient-text">Our Family Legacy</h3>
              <p className="mb-2">AKR’s strength lies in its roots — a family legacy built on integrity, hard work, and visionary leadership.</p>
              <p className="mb-2">As the torchbearer of this legacy, Mr. Rojar Stalin, Mr. Anton’s son, took over the leadership and propelled the company into a new era. His forward-thinking mindset and commitment to community development have driven AKR to new heights while staying true to the values instilled by his father.</p>
              <p className="mb-2">Together, the family’s collective dedication continues to guide AKR’s mission: empowering communities, fostering economic growth, and creating sustainable value for future generations.</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2 gradient-text">AKR Today: A Pillar of Progress</h3>
              <p className="mb-2">Today, AKR Group stands as a leading, integrated commercial powerhouse in Sri Lanka’s Northern Province. Our diverse range of divisions reflects our commitment to serving a wide spectrum of community and customer needs:</p>
              <ul className="list-disc ml-6 mb-2">
                <li>AKR & Sons (Pvt) Ltd</li>
                <li>AKR Multi Complex</li>
                <li>AKR Construction</li>
                <li>AKR Lanka Filling Station</li>
                <li>AKR Wine Store</li>
                <li>AKR Farm</li>
                <li>AKR's Amma Organization</li>
                <li>Filling Stations</li>
                <li>AKR Easy Credit (Pvt) Ltd</li>
              </ul>
              <p>With each endeavor, we aim to set new standards of quality, reliability, and innovation.</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2 gradient-text">Our Guiding Principle</h3>
              <blockquote className="italic border-l-4 border-emerald-500 pl-4 mb-2 text-emerald-700 font-semibold">"Eradicate poverty, empower through knowledge."</blockquote>
              <p>This ethos reflects our unwavering dedication to community development, education, and creating opportunities for growth. Through various public service initiatives and regional development projects, we strive to make a meaningful impact — transforming lives and building a future where every individual can thrive.</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2 gradient-text">Our Pride & Promise</h3>
              <p>From humble beginnings to becoming a beacon of progress, AKR Group’s journey embodies the spirit of resilience and shared success. We take immense pride in our history and even greater pride in the future we continue to build — together with our family, our employees, and the communities we serve.</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2 gradient-text">Mission & Vision</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-lg mb-1">Mission</h4>
                  <p>To deliver exceptional products and services across diverse industries, while setting new standards in quality, innovation, and customer care — all driven by a deep commitment to uplifting communities and empowering lives.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Vision</h4>
                  <p>To become Sri Lanka’s most trusted and admired business group, recognized for our unwavering dedication to excellence, sustainable growth, and a meaningful impact on every community we serve.</p>
                </div>
              </div>
              <div className="mt-6">
                <h4 className="font-semibold text-lg mb-2">Values</h4>
                <ul className="list-disc ml-6">
                  <li><b>Integrity & Transparency</b> — We build trust through honesty and openness in everything we do.</li>
                  <li><b>Excellence in Service</b> — We go beyond expectations, delivering value at every touchpoint.</li>
                  <li><b>Community Development</b> — We believe in giving back and nurturing strong, resilient communities.</li>
                  <li><b>Sustainable Growth</b> — We grow responsibly, with a focus on long-term impact and environmental stewardship.</li>
                </ul>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2 gradient-text">Our Portfolio</h3>
              <p className="mb-2">Discover the diverse portfolio of companies that make up the AKR Group family. Each division reflects our unwavering commitment to excellence, innovation, and community impact — driving progress across industries while staying rooted in our core values. Together, they form a vibrant ecosystem dedicated to serving people, empowering growth, and building a stronger future.</p>
              <ul className="list-disc ml-6 space-y-1">
                <li><b>AKR Sons (Pvt) Ltd:</b> A trusted premium dealership for Bajaj motorcycles and three-wheelers, offering a diverse range of reliable, fuel-efficient models perfect for every commute and adventure. With flexible financing, genuine after-sales support, and a commitment to quality, we help you ride with confidence and style.</li>
                <li><b>AKR Multi Complex:</b> A vibrant, all-in-one destination offering premium shopping, dining, entertainment, fitness, hospitality, and vehicle services — designed to bring families, guests, and businesses together under one roof.</li>
                <li><b>AKR Construction:</b> Your reliable source for premium construction materials — including sea sand, red soil, metal, gravel, and more — ensuring strong, durable, and high-quality results for every project.</li>
                <li><b>AKR Lanka Filling Station:</b> Your dependable stop for high-quality fuel, petroleum products, and full automotive services — keeping you safe and moving forward with confidence.</li>
                <li><b>AKR Wine Store:</b> A refined retail destination offering a curated selection of fine wines from around the world, crafted for true connoisseurs and enthusiasts alike.</li>
                <li><b>AKR Farm:</b> A forward-thinking agricultural initiative promoting sustainable, organic farming practices to provide fresh, healthy produce from our fields to your table.</li>
                <li><b>AKR's Amma Organization:</b> A heartfelt social initiative dedicated to uplifting communities through charitable projects, education programs, and family-centered support.</li>
                <li><b>AKR Easy Credit (Pvt) Ltd:</b> Your trusted partner for flexible credit solutions and personal loans, empowering individuals and businesses with financial freedom and confidence.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2 gradient-text">AKR's Amma Organization</h3>
              <p className="mb-2 font-semibold text-emerald-700">Empowering Communities, Enriching Lives</p>
              <blockquote className="italic border-l-4 border-emerald-500 pl-4 mb-2 text-emerald-700 font-semibold">"Eradicate poverty, empower through knowledge."</blockquote>
              <p className="mb-2">This isn't just a motto; it's the heartbeat of AKR's Amma. Established in 2019, our organization is deeply committed to serving the community and fostering a brighter future for all in Sri Lanka.</p>
              <h4 className="font-semibold text-lg mb-2 mt-4">Our Initiatives: Making a Difference, Every Day</h4>
              <ul className="list-disc ml-6 mb-2">
                <li><b>Empowering Education:</b> Annual school supply distribution for underprivileged students and support for university students to help them pursue higher education dreams.</li>
                <li><b>Youth Sports Development:</b> Organizing the annual "AKR Challenge Cup Football Tournament" and providing essential gear to local sports clubs.</li>
                <li><b>Hunger Relief Program:</b> Distributing dry ration packs to families below the poverty line and sanitation workers during times of national hardship and the COVID-19 pandemic.</li>
                <li><b>Preserving Our Rich Heritage:</b> Organizing and hosting the traditional bullock cart race, a cherished cultural event in our region.</li>
              </ul>
              <p>At AKR's Amma, we're more than just an organization; we're a movement dedicated to positive change. Join us in building stronger, more educated, and vibrant communities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-3 gradient-text">Get In Touch</h2>
              <p className="text-lg text-gray-600 mb-2">Ready to explore partnership opportunities or learn more about our services?</p>
              <p className="text-base text-emerald-800 font-semibold">We respond to all inquiries within 24 hours.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
              {/* Contact Us Form */}
              <div className="glass-card p-8 shadow-xl">
                <h3 className="text-2xl font-bold gradient-text mb-6">Contact Us</h3>
                <ContactForm />
              </div>
              {/* Contact Info & Leadership */}
              <div className="glass-card p-8 shadow-xl flex flex-col gap-8 justify-between">
                  <div>
                  <h3 className="text-xl font-bold gradient-text mb-4">Contact Information</h3>
                  <div className="flex items-center gap-3 mb-2 text-gray-700"><Mail className="w-5 h-5 text-emerald-600" /> akrfuture@gmail.com</div>
                  <div className="flex items-center gap-3 mb-2 text-gray-700"><Phone className="w-5 h-5 text-blue-700" /> 0773111266</div>
                  <div className="flex items-center gap-3 mb-2 text-gray-700"><Phone className="w-5 h-5 text-blue-700" /> Murunkan: 0232231222</div>
                  <div className="flex items-center gap-3 mb-2 text-gray-700"><Phone className="w-5 h-5 text-blue-700" /> Mannar: (023) 205 1536</div>
                </div>
                <div>
                  <h3 className="text-xl font-bold gradient-text mb-4">Leadership Team</h3>
                  <div className="mb-2"><span className="font-semibold text-gray-800">Founder:</span> <span className="gradient-text-secondary">S. Anton</span></div>
                  <div className="mb-2"><span className="font-semibold text-gray-800">CEO:</span> <span className="gradient-text-secondary">Anton Rojar Stalin</span></div>
                  <div className="text-sm text-gray-600">Mobile: <span className="text-gray-800 font-medium">0773111266</span></div>
                  <div className="text-sm text-gray-600">Email: <span className="text-gray-800 font-medium">antonrojarstalin@gmail.com</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-emerald-900 to-green-800 text-white py-10 mt-12">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <img src="/images/image copy 2.png" alt="AKR Group Logo" className="h-10 mb-3" />
            <div className="font-bold text-lg mb-2">AKR GROUP OF COMPANIES</div>
            <p className="text-sm opacity-80">Empowering industries, Building futures, Creating value.</p>
          </div>
          <div>
            <div className="font-semibold mb-2">Quick Links</div>
            <ul className="space-y-1 text-sm">
              <li><a href="#home" className="hover:underline">Home</a></li>
              <li><a href="#companies" className="hover:underline">Companies</a></li>
              <li><a href="#about" className="hover:underline">About</a></li>
              <li><a href="#contact" className="hover:underline">Contact</a></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2">Contact</div>
            <p className="text-sm">akrfuture@gmail.com</p>
            <p className="text-sm">0773111266</p>
            <div className="flex space-x-3 mt-2">
              <a href="https://wa.me/94773111266" target="_blank" rel="noopener" className="hover:text-green-400"><MessageCircle className="w-5 h-5" /></a>
              <a href="tel:0773111266" className="hover:text-blue-400"><Phone className="w-5 h-5" /></a>
              <a href="mailto:akrfuture@gmail.com" className="hover:text-yellow-400"><Mail className="w-5 h-5" /></a>
            </div>
          </div>
          <div>
            <div className="font-semibold mb-2">Follow Us</div>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-400"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.47.69a4.3 4.3 0 0 0 1.88-2.37 8.59 8.59 0 0 1-2.72 1.04A4.28 4.28 0 0 0 16.11 4c-2.37 0-4.29 1.92-4.29 4.29 0 .34.04.67.11.99C7.69 9.13 4.07 7.38 1.64 4.7c-.37.64-.58 1.38-.58 2.17 0 1.5.76 2.82 1.92 3.6-.7-.02-1.36-.21-1.94-.53v.05c0 2.1 1.5 3.85 3.5 4.25-.36.1-.74.16-1.13.16-.28 0-.54-.03-.8-.08.54 1.7 2.1 2.94 3.95 2.97A8.6 8.6 0 0 1 2 19.54c-.29 0-.57-.02-.85-.05A12.13 12.13 0 0 0 8.29 21.5c7.55 0 11.68-6.26 11.68-11.68 0-.18-.01-.36-.02-.54A8.18 8.18 0 0 0 22.46 6z" /></svg></a>
              <a href="#" className="hover:text-pink-400"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.584.012 4.85.07 1.17.056 1.97.24 2.43.41.59.22 1.01.48 1.45.92.44.44.7.86.92 1.45.17.46.354 1.26.41 2.43.058 1.266.07 1.65.07 4.85s-.012 3.584-.07 4.85c-.056 1.17-.24 1.97-.41 2.43-.22.59-.48 1.01-.92 1.45-.44.44-.7-.86-.92-1.45-.17-.46-.354-1.26-.41-2.43C2.212 15.634 2.2 15.25 2.2 12s.012-3.584.07-4.85c.056-1.17.24-1.97.41-2.43.22-.59.48-1.01.92-1.45.44-.44.86-.7 1.45-.92.46-.17 1.26-.354 2.43-.41C8.416 2.212 8.8 2.2 12 2.2zm0-2.2C8.736 0 8.332.012 7.052.07 5.77.128 4.87.312 4.1.54c-.8.24-1.48.56-2.16 1.24-.68.68-1 .96-1.24 2.16-.228.77-.412 1.67-.47 2.95C.012 8.332 0 8.736 0 12c0 3.264.012 3.668.07 4.948.058 1.28.242 2.18.47 2.95.24.8.56 1.48 1.24 2.16.68.68.96 1 2.16 1.24.77.228 1.67.412 2.95.47C8.332 23.988 8.736 24 12 24s3.668-.012 4.948-.07c1.28-.058 2.18-.242 2.95-.47.8-.24 1.48-.56 2.16-1.24.68-.68 1-1 .24-2.16.228-.77.412-1.67.47-2.95.058-1.28.07-1.684.07-4.948 0-3.264-.012-3.668-.07-4.948-.058-1.28-.242-2.18-.47-2.95-.24-.8-.56-1.48-1.24-2.16-.68-.68-.96-1-2.16-1.24-.77-.228-1.67-.412-2.95-.47C15.668.012 15.264 0 12 0z" /></svg></a>
              <a href="#" className="hover:text-blue-600"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.23 0H1.77C.792 0 0 .77 0 1.72v20.56C0 23.23.792 24 1.77 24h20.46c.978 0 1.77-.77 1.77-1.72V1.72C24 .77 23.208 0 22.23 0zM7.12 20.45H3.56V9h3.56v11.45zM5.34 7.67a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM20.45 20.45h-3.56v-5.6c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.95v5.69h-3.56V9h3.42v1.56h.05c.48-.91 1.65-1.87 3.4-1.87 3.63 0 4.3 2.39 4.3 5.5v6.26z" /></svg></a>
            </div>
          </div>
        </div>
        <div className="text-center text-xs opacity-70 mt-8">© 2025 AKR Group of Companies. All rights reserved.</div>
      </footer>
      {/* NOTE: Admin login should be moved to a separate page, e.g., /admin-login (implement separately) */}
      {/* TODO: Implement /admin-login page for admin access */}
    </div>
  )
}

function ContactForm() {
  const [success, setSuccess] = React.useState(false);
  return (
    <form
      className="space-y-5"
      onSubmit={e => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const name = (form.elements.namedItem('name') as HTMLInputElement).value.trim();
        const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim();
        const phone = (form.elements.namedItem('phone') as HTMLInputElement).value.trim();
        const message = (form.elements.namedItem('message') as HTMLTextAreaElement).value.trim();
        if (!name || !email || !message) {
          setSuccess(false);
          return;
        }
        // Here you would send the form data to your backend or email service
        form.reset();
        setSuccess(true);
      }}
    >
      <div className="relative">
        <input type="text" id="name" name="name" className="peer w-full rounded-lg border border-gray-300 px-4 py-2 pt-6 focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder-transparent" placeholder="Name" required />
        <label htmlFor="name" className="absolute left-4 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm">Name<span className="text-red-500">*</span></label>
      </div>
      <div className="relative">
        <input type="email" id="email" name="email" className="peer w-full rounded-lg border border-gray-300 px-4 py-2 pt-6 focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder-transparent" placeholder="Email" required />
        <label htmlFor="email" className="absolute left-4 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm">Email<span className="text-red-500">*</span></label>
      </div>
      <div className="relative">
        <input type="tel" id="phone" name="phone" className="peer w-full rounded-lg border border-gray-300 px-4 py-2 pt-6 focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder-transparent" placeholder="Phone" />
        <label htmlFor="phone" className="absolute left-4 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm">Phone</label>
      </div>
      <div className="relative">
        <textarea id="message" name="message" rows={4} className="peer w-full rounded-lg border border-gray-300 px-4 py-2 pt-6 focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder-transparent" placeholder="Message" required></textarea>
        <label htmlFor="message" className="absolute left-4 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm">Message<span className="text-red-500">*</span></label>
      </div>
      <button type="submit" className="w-full bg-gradient-primary text-gray-900 font-bold py-2 rounded-xl hover:scale-105 transition">Send Message</button>
      {success && <div className="text-green-700 font-semibold text-center mt-2">Thank you! We have received your message.</div>}
    </form>
  );
}
