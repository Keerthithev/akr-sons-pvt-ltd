import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  X,
  Star,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  Camera,
  Settings,
  Users,
  Award,
  Shield,
  Zap,
  Fuel,
  Gauge,
  Palette,
  Package,
  Heart,
  Share2,
  Download,
  Play,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Progress } from "../../components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Skeleton } from "../../components/ui/skeleton";

interface Vehicle {
  _id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  specs: Record<string, any>;
  features?: string[];
  colors: Array<{
    name: string;
    images: string[];
  }>;
  galleryImages: string[];
  brochure?: string;
  availability: string;
  rating?: number;
  reviewCount?: number;
  prebookCount?: number;
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
}

interface SettingsType {
  bannerHeading: string;
  bannerSubheading: string;
  email: string;
  phone: string;
  address: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    whatsapp?: string;
    twitter?: string;
  };
  specialOffers?: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
}

const VehicleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [galleryImageIndex, setGalleryImageIndex] = useState(0);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [bookingCount, setBookingCount] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);

  // Function to get the appropriate unit for a spec
  const getSpecUnit = (key: string, value: string) => {
    const keyLower = key.toLowerCase();
    const valueLower = value.toLowerCase();
    
    // If value already contains a unit, return as is
    if (valueLower.includes('ps') || valueLower.includes('nm') || valueLower.includes('kmpl') || valueLower.includes('cc')) {
      return value;
    }
    
    // Determine unit based on key
    if (keyLower.includes('power') || keyLower.includes('max power')) {
      return `${value} PS`;
    }
    if (keyLower.includes('torque') || keyLower.includes('max torque')) {
      return `${value} Nm`;
    }
    if (keyLower.includes('mileage') || keyLower.includes('fuel efficiency')) {
      return `${value} kmpl`;
    }
    if (keyLower.includes('engine') && keyLower.includes('cc')) {
      return `${value} cc`;
    }
    if (keyLower.includes('weight') || keyLower.includes('mass')) {
      return `${value} kg`;
    }
    if (keyLower.includes('length') || keyLower.includes('width') || keyLower.includes('height')) {
      return `${value} mm`;
    }
    if (keyLower.includes('tank') || keyLower.includes('capacity')) {
      return `${value} L`;
    }
    if (keyLower.includes('ground clearance')) {
      return `${value} mm`;
    }
    if (keyLower.includes('seat height')) {
      return `${value} mm`;
    }
    if (keyLower.includes('wheelbase')) {
      return `${value} mm`;
    }
    
    return value;
  };

  // Fetch global settings for footer and theme
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/settings`)
      .then(res => res.json())
      .then(data => setSettings(data));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
      setLoading(true);
        const [vehicleResponse, settingsResponse, prebookingsResponse] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/vehicles/${id}`),
          fetch(`${import.meta.env.VITE_API_URL}/api/settings`),
          fetch(`${import.meta.env.VITE_API_URL}/api/prebookings`)
        ]);

        if (vehicleResponse.ok) {
          const vehicleData = await vehicleResponse.json();
          setVehicle(vehicleData);
        }

        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();
          setSettings(settingsData);
        }

        if (prebookingsResponse.ok) {
          const prebookingsData = await prebookingsResponse.json();
          // Store prebookings data for later calculation
          localStorage.setItem('prebookingsData', JSON.stringify(prebookingsData));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // Calculate booking count when vehicle data is loaded
  useEffect(() => {
    if (vehicle && vehicle.name) {
      const prebookingsData = localStorage.getItem('prebookingsData');
      if (prebookingsData) {
        const prebookings = JSON.parse(prebookingsData);
        const vehicleBookings = prebookings.filter((booking: any) => 
          booking.vehicleModel === vehicle.name
        );
        setBookingCount(vehicleBookings.length);
      }
    }
  }, [vehicle]);

  // Auto-rotate colors every 5 seconds
  useEffect(() => {
    if (!vehicle || !vehicle.colors || vehicle.colors.length <= 1 || !isAutoRotating) {
      return;
    }

    const interval = setInterval(() => {
      setSelectedColor((prev) => (prev + 1) % vehicle.colors.length);
      setCurrentImageIndex(0); // Reset to first image when color changes
    }, 5000);

    return () => clearInterval(interval);
  }, [vehicle, isAutoRotating]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    if (heroImageRef.current) {
      // gsap.fromTo(
      //   heroImageRef.current,
      //   { scale: 1, y: 0 },
      //   {
      //     scale: 1.15,
      //     y: -60,
      //     scrollTrigger: {
      //       trigger: heroImageRef.current,
      //       start: 'top center',
      //       end: 'bottom top',
      //       scrub: true,
      //     },
      //   }
      // );
    }
  }, []);

  const getCurrentImages = () => {
    return vehicle?.colors[selectedColor]?.images || vehicle?.galleryImages || ["/hero-bg.jpg"];
  };
  const nextImage = () => {
    const images = getCurrentImages();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };
  const prevImage = () => {
    const images = getCurrentImages();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // 1. Gather all images from all colors for the gallery
  const allGalleryImages = React.useMemo(() => {
    if (!vehicle) return [];
    const colorImages = (vehicle.colors || []).flatMap((color: any) => color.images || []);
    const mainImages = vehicle.galleryImages || [];
    // Remove duplicates
    return Array.from(new Set([...mainImages, ...colorImages]));
  }, [vehicle]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center">
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-32">
          {/* Skeleton rows like YouTube */}
          <div className="space-y-10">
            {[...Array(3)].map((_, row) => (
              <div key={row} className="flex flex-col md:flex-row gap-6">
                <Skeleton className="w-full md:w-1/3 aspect-video rounded-lg" />
                <div className="flex-1 flex flex-col gap-3 justify-center">
                  <Skeleton className="h-6 w-2/3 rounded" />
                  <Skeleton className="h-4 w-1/2 rounded" />
                  <Skeleton className="h-4 w-1/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Vehicle Not Found</h2>
          <p className="text-gray-600 mb-6">The vehicle you're looking for doesn't exist.</p>
          <Button onClick={() => navigate(-1)} size="lg" className="bg-gradient-primary font-bold text-gray-900 rounded-xl hover:scale-105 transition">
            Go Back
          </Button>
        </motion.div>
      </div>
    );
  }

  const currentImages = getCurrentImages();
  const mainImage = currentImages[currentImageIndex] || "/hero-bg.jpg";

  // Grouping map: label -> group
  const specGroups = {
    Engine: [
      'Engine Type', 'Max Power', 'Max Torque', 'Displacement', 'Clutch'
    ],
    Electricals: [
      'Head Lamp', 'Tail Lamp', 'Instrument Cluster'
    ],
    'Brakes & Tyres': [
      'Front Brakes', 'Rear Brakes', 'Front Tyres', 'Rear Tyres', 'Brakes Type'
    ],
    Vehicle: [
      'Fuel Tank', 'Ground Clearance', 'Kerb Weight', 'Suspension Front', 'Suspension Rear', 'Wheel Base'
    ]
  };
  // Build grouped specs from vehicle.specs
  const groupedSpecs = {};
  Object.entries(vehicle.specs || {}).forEach(([label, value]) => {
    let found = false;
    for (const [group, labels] of Object.entries(specGroups)) {
      if (labels.includes(label)) {
        if (!groupedSpecs[group]) groupedSpecs[group] = [];
        groupedSpecs[group].push({ label, value });
        found = true;
        break;
      }
    }
    if (!found) {
      if (!groupedSpecs['Other']) groupedSpecs['Other'] = [];
      groupedSpecs['Other'].push({ label, value });
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/akr-sons-bike-store")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm font-medium">Back to Store</span>
            </button>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-500">AKR & SONS</p>
                <p className="text-sm font-medium text-gray-900">Bike Store</p>
          </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-[4/3] bg-white rounded-xl overflow-hidden shadow-lg">
                <img
                  src={mainImage}
                          alt={vehicle.name}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => {
                    // Show color-specific images in modal, not gallery images
                    const colorImages = vehicle.colors[selectedColor]?.images || [];
                    if (colorImages.length > 0) {
                      setCurrentImageIndex(0);
                      setShowImageGallery(true);
                    }
                  }}
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2">
                  <Camera className="h-5 w-5 text-gray-600" />
                    </div>
                  </div>

                  {/* Thumbnail Gallery */}
              {vehicle.colors[selectedColor]?.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {vehicle.colors[selectedColor].images.slice(0, 4).map((image, index) => (
                    <div
                          key={index}
                      className="aspect-square bg-white rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => setCurrentImageIndex(index)}
                        >
                          <img
                        src={image}
                        alt={`${vehicle.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                    </div>
                      ))}
                </div>
                  )}

                  {/* Color Selector */}
              {vehicle.colors.length > 1 && (
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Available Colors</h3>
                    <button
                      onClick={() => setIsAutoRotating(!isAutoRotating)}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        isAutoRotating
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${isAutoRotating ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}></div>
                      {isAutoRotating ? "Auto" : "Manual"}
                    </button>
                  </div>
                          <div className="flex gap-3">
                    {vehicle.colors.map((color, index) => (
                      <button
                                key={index}
                                onClick={() => {
                          setSelectedColor(index);
                          setCurrentImageIndex(0); // Reset to first image when color changes
                          setIsAutoRotating(false); // Stop auto-rotation when manually selecting
                                }}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                          selectedColor === index
                            ? "bg-green-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                      >
                        {color.name}
                      </button>
                            ))}
                          </div>
                  {isAutoRotating && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Colors will change automatically every 5 seconds
                    </p>
                          )}
                </div>
                  )}
              </div>

            {/* Vehicle Info */}
            <div className="space-y-6">
              {/* Title and Price */}
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{vehicle.name}</h1>
                <p className="text-lg text-gray-600 mb-4">{vehicle.category}</p>
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-3xl font-bold text-green-600">
                    {vehicle.price?.toLocaleString()} LKR
            </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{bookingCount} bookings</span>
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-600 font-medium">{vehicle.availability}</span>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{vehicle.description}</p>
              </div>

              {/* Key Specifications */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Key Specifications</h3>
                <div className="grid grid-cols-2 gap-4">
                  {vehicle.specs?.['Engine(cc)'] && (
                    <div className="flex items-center gap-3">
                      <Zap className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-500">Engine</p>
                        <p className="font-medium">{vehicle.specs['Engine(cc)']} cc</p>
                      </div>
                    </div>
                  )}
                  {vehicle.specs?.Power && (
                    <div className="flex items-center gap-3">
                      <Gauge className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-500">Power</p>
                        <p className="font-medium">{vehicle.specs.Power} PS</p>
                      </div>
                    </div>
                  )}
                  {vehicle.specs?.Torque && (
                    <div className="flex items-center gap-3">
                      <Settings className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-500">Torque</p>
                        <p className="font-medium">{vehicle.specs.Torque} Nm</p>
                      </div>
                    </div>
                  )}
                  {vehicle.specs?.Mileage && (
                    <div className="flex items-center gap-3">
                      <Fuel className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-500">Mileage</p>
                        <p className="font-medium">{vehicle.specs.Mileage} kmpl</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Features Section */}
              {vehicle.features && vehicle.features.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">Features</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {vehicle.features.map((feature: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pre-Book Button */}
              <button
                onClick={() => navigate(`/prebook?vehicle=${encodeURIComponent(vehicle.name)}`)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
              >
                Pre-Book Now
              </button>
            </div>
          </div>

          {/* Detailed Sections */}
          <div className="space-y-8">
            {/* Gallery Section */}
            {vehicle.galleryImages && vehicle.galleryImages.length > 0 && (
              <section className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Photo Gallery</h2>
                
                {/* Desktop Gallery - Grid Layout */}
                <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {vehicle.galleryImages.map((image: string, index: number) => (
                    <div
                      key={index}
                      className="aspect-square overflow-hidden rounded-lg cursor-pointer hover:scale-105 transition-transform shadow-md"
                      onClick={() => {
                        setGalleryImageIndex(index);
                        setShowGalleryModal(true);
                      }}
                    >
                      <img
                        src={image || "/hero-bg.jpg"}
                        alt={`${vehicle.name} gallery ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>

                {/* Mobile Gallery - Slideshow */}
                <div className="md:hidden">
                  <div className="relative aspect-[4/3] bg-white rounded-xl overflow-hidden shadow-lg">
                  <AnimatePresence mode="wait">
                      <motion.img
                        key={galleryImageIndex}
                        src={vehicle.galleryImages[galleryImageIndex] || "/hero-bg.jpg"}
                        alt={`${vehicle.name} gallery ${galleryImageIndex + 1}`}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setShowGalleryModal(true)}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.5 }}
                      />
                  </AnimatePresence>
                    
                    {/* Navigation Buttons */}
                    {vehicle.galleryImages.length > 1 && (
                    <>
                        <button
                          onClick={() => setGalleryImageIndex((galleryImageIndex - 1 + vehicle.galleryImages.length) % vehicle.galleryImages.length)}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-lg transition-all hover:scale-110"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setGalleryImageIndex((galleryImageIndex + 1) % vehicle.galleryImages.length)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-lg transition-all hover:scale-110"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                    </>
                  )}

                  {/* Image Indicators */}
                    {vehicle.galleryImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {vehicle.galleryImages.map((_, index) => (
                          <button
                        key={index}
                            onClick={() => setGalleryImageIndex(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                              index === galleryImageIndex ? "bg-white" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                    )}
                </div>
                  
                  {/* Mobile Thumbnail Indicators */}
                  {vehicle.galleryImages.length > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                      {vehicle.galleryImages.slice(0, 5).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setGalleryImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === galleryImageIndex ? "bg-green-600" : "bg-gray-300"
                          }`}
                        />
                      ))}
                      {vehicle.galleryImages.length > 5 && (
                        <span className="text-xs text-gray-500 ml-2">
                          +{vehicle.galleryImages.length - 5} more
                  </span>
                      )}
                </div>
                  )}
                    </div>
              </section>
            )}

            {/* Complete Specifications */}
            {vehicle.specs && Object.keys(vehicle.specs).length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 text-center">Complete Specifications</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Engine & Performance Card */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Zap className="h-5 w-5 text-green-600" />
                      Engine & Performance
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(vehicle.specs)
                        .filter(([key]) => 
                          key.startsWith('Engine & Performance_') || ['Engine(cc)', 'Power', 'Torque', 'Mileage'].includes(key)
                        )
                        .map(([key, value]) => (
                          <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                            <span className="font-medium text-gray-700">{key.replace('Engine & Performance_', '')}</span>
                            <span className="text-gray-600">{getSpecUnit(key, value)}</span>
                    </div>
                        ))}
                    </div>
                  </div>

                  {/* Transmission & Brakes Card */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Settings className="h-5 w-5 text-green-600" />
                      Transmission & Brakes
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(vehicle.specs)
                        .filter(([key]) => 
                          key.startsWith('Transmission & Brakes_')
                        )
                        .map(([key, value]) => (
                          <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                            <span className="font-medium text-gray-700">{key.replace('Transmission & Brakes_', '')}</span>
                            <span className="text-gray-600">{getSpecUnit(key, value)}</span>
                </div>
                        ))}
                </div>
              </div>

                  {/* Dimensions & Comfort Card */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Gauge className="h-5 w-5 text-green-600" />
                      Dimensions & Comfort
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(vehicle.specs)
                        .filter(([key]) => 
                          key.startsWith('Dimensions & Comfort_')
                        )
                        .map(([key, value]) => (
                          <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                            <span className="font-medium text-gray-700">{key.replace('Dimensions & Comfort_', '')}</span>
                            <span className="text-gray-600">{getSpecUnit(key, value)}</span>
            </div>
                        ))}
                      </div>
                </div>

                  {/* Features & Electricals Card */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      Features & Electricals
                    </h3>
                    <div className="space-y-3">
                                            {Object.entries(vehicle.specs)
                        .filter(([key]) => 
                          key.startsWith('Features & Electricals_')
                        )
                        .map(([key, value]) => (
                          <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                            <span className="font-medium text-gray-700">{key.replace('Features & Electricals_', '')}</span>
                            <span className="text-gray-600">{getSpecUnit(key, value)}</span>
                </div>
                        ))}
                      </div>
                </div>
              </div>

                  </div>
            )}
          </div>
        </div>
      </main>

      {/* FAQ Section - After Complete Specifications */}
      {vehicle.faqs && vehicle.faqs.length > 0 && (
        <section className="bg-white rounded-xl p-6 shadow-sm mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
            {vehicle.faqs.map((faq: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
                                  </div>
                      ))}
                    </div>
        </section>
            )}

      {/* Image Gallery Modal */}
      <AnimatePresence>
        {showImageGallery && (
                        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setShowImageGallery(false)}
          >
            <div className="relative max-w-4xl max-h-[90vh] w-full">
              <button
                onClick={() => setShowImageGallery(false)}
                className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              
              <div className="relative aspect-[4/3] bg-white rounded-xl overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    src={mainImage}
                    alt={`${vehicle.name} ${currentImageIndex + 1}`}
                    className="w-full h-full object-contain"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                  />
                </AnimatePresence>
                
                {/* Navigation Buttons */}
                {currentImages.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex((currentImageIndex - 1 + currentImages.length) % currentImages.length);
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 p-3 rounded-full shadow-lg transition-all hover:scale-110"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex((currentImageIndex + 1) % currentImages.length);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 p-3 rounded-full shadow-lg transition-all hover:scale-110"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}
              </div>
              
              {/* Thumbnail Strip */}
              {currentImages.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {currentImages.map((image, index) => (
                    <button
                          key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                            setCurrentImageIndex(index);
                          }}
                      className={`w-16 h-12 rounded-lg overflow-hidden transition-all ${
                        index === currentImageIndex ? "ring-2 ring-white scale-110" : "opacity-60 hover:opacity-100"
                      }`}
                        >
                          <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                    </button>
                      ))}
                    </div>
            )}
          </div>
              </motion.div>
        )}
      </AnimatePresence>

      {/* Gallery Modal */}
      <AnimatePresence>
        {showGalleryModal && (
              <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setShowGalleryModal(false)}
          >
            <div className="relative max-w-4xl max-h-[90vh] w-full">
              <button
                onClick={() => setShowGalleryModal(false)}
                className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              
              <div className="relative aspect-[4/3] bg-white rounded-xl overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={galleryImageIndex}
                    src={vehicle.galleryImages[galleryImageIndex] || "/hero-bg.jpg"}
                    alt={`${vehicle.name} gallery ${galleryImageIndex + 1}`}
                    className="w-full h-full object-contain"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                  />
                </AnimatePresence>
                
                {/* Navigation Buttons */}
                {vehicle.galleryImages.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setGalleryImageIndex((galleryImageIndex - 1 + vehicle.galleryImages.length) % vehicle.galleryImages.length);
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 p-3 rounded-full shadow-lg transition-all hover:scale-110"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setGalleryImageIndex((galleryImageIndex + 1) % vehicle.galleryImages.length);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 p-3 rounded-full shadow-lg transition-all hover:scale-110"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}
              </div>
              
              {/* Thumbnail Strip */}
              {vehicle.galleryImages.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                  {vehicle.galleryImages.map((image, index) => (
                  <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setGalleryImageIndex(index);
                      }}
                      className={`w-16 h-12 rounded-lg overflow-hidden transition-all ${
                        index === galleryImageIndex ? "ring-2 ring-white scale-110" : "opacity-60 hover:opacity-100"
                    }`}
                    >
                      <img
                        src={image}
                        alt={`Gallery Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                  />
                    </button>
                ))}
              </div>
              )}
          </div>
          </motion.div>
        )}
      </AnimatePresence>

    {/* Footer */}
    <footer className="bg-gray-900 text-white py-10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
              <img src="/images/image copy 2.png" alt="AKR Logo" className="h-12 w-12 rounded-full mb-4" />
              <div className="font-bold text-lg mb-2">{settings?.bannerHeading}</div>
              <p className="text-sm opacity-80">{settings?.bannerSubheading}</p>
          </div>
          <div>
              <div className="font-semibold mb-2">Quick Links</div>
              <ul className="space-y-1 text-sm">
                <li><a href="/akr-sons-bike-store" className="hover:text-green-400">All Bikes</a></li>
                <li><a href="/prebook" className="hover:text-green-400">Pre-Book Now</a></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2">Contact</div>
            <p className="text-sm">{settings?.email}</p>
            <p className="text-sm">{settings?.phone}</p>
            <p className="text-sm">{settings?.address}</p>
          </div>
          <div>
            <div className="font-semibold mb-2">Follow Us</div>
            <div className="flex space-x-4">
                {settings?.socialLinks?.facebook && (
                  <a href={settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-green-400 text-2xl">
                    <i className="fab fa-facebook"></i>
                  </a>
                )}
                {settings?.socialLinks?.instagram && (
                  <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-green-400 text-2xl">
                    <i className="fab fa-instagram"></i>
                  </a>
                )}
                {settings?.socialLinks?.whatsapp && (
                  <a href={settings.socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-green-400 text-2xl">
                    <i className="fab fa-whatsapp"></i>
                  </a>
                )}
                {settings?.socialLinks?.twitter && (
                  <a href={settings.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-green-400 text-2xl">
                    <i className="fab fa-twitter"></i>
                  </a>
                )}
                {(!settings?.socialLinks?.facebook && !settings?.socialLinks?.instagram && !settings?.socialLinks?.whatsapp && !settings?.socialLinks?.twitter) && (
                  <div className="text-sm opacity-60">Social links coming soon</div>
                )}
            </div>
          </div>
        </div>
          <div className="text-center text-xs opacity-70 mt-8">© 2025 {settings?.bannerHeading}. All rights reserved.</div>
        </div>
      </footer>
  
    </div>
  );
};

export default VehicleDetails;
