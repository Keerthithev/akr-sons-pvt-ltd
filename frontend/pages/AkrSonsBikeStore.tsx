import React, { useCallback, useEffect, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Row, Col, Card, Button, Typography, Badge, Spin, message, Modal, Tag, Select, Image, Grid, Collapse, Drawer } from "antd"
import { ArrowLeftOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined, EyeOutlined, CalendarOutlined, StarFilled, ShoppingCartOutlined, LeftOutlined, RightOutlined, PictureOutlined, ThunderboltOutlined, HomeOutlined, SmileOutlined, SearchOutlined, HeartOutlined, InfoCircleOutlined, MenuOutlined, CloseOutlined, GiftOutlined, DollarOutlined, CarOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router-dom"
import SEO from '../components/SEO';

type SettingsType = {
  mode: string;
  bannerImages: string[];
  bannerText: string;
  bannerHeading: string;
  bannerSubheading: string;
  phone: string;
  email: string;
  address: string;
  companyName: string;
  socialLinks?: {
    facebook: string;
    instagram: string;
    whatsapp: string;
    twitter: string;
  };
  openingHours?: string[];
  specialOffers?: Array<{
    title: string;
    description: string;
    condition: string;
    icon: string;
  }>;
};

const { Title, Text } = Typography
const { Panel } = Collapse
const AKR_COMPANY_NAME = "AKR & SONS (PVT) LTD"

export default function AkrSonsBikeStore() {
  const navigate = useNavigate()
  const [showSlideshow, setShowSlideshow] = useState(false)
  const [selectedColors, setSelectedColors] = useState<{ [key: string]: any }>({})
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [company, setCompany] = useState<any>(null)
  const [selectedType, setSelectedType] = useState<string>('All')
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false)
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("Default")
  const [selectedBikes, setSelectedBikes] = useState<string[]>([])
  const [showComparison, setShowComparison] = useState(false)
  const [showComparisonGuide, setShowComparisonGuide] = useState(false)
  const [prebookings, setPrebookings] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const screens = Grid.useBreakpoint()
  const carouselRef = useRef<HTMLDivElement>(null);
  const cardWidth = 336;
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    setSettingsLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/settings`)
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setSettingsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching settings:', err);
        setSettingsLoading(false);
      });
  }, []);

  const heroImages = settings?.bannerImages && settings.bannerImages.length > 0
    ? settings.bannerImages
    : [];
  const [heroIndex, setHeroIndex] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const [slideIndexes, setSlideIndexes] = useState<{ [id: string]: number }>({});
  const handlePrev = (id: string, images: string[]) => {
    setSlideIndexes(idx => ({
      ...idx,
      [id]: (idx[id] ?? 0) === 0 ? images.length - 1 : (idx[id] ?? 0) - 1
    }));
  };
  const handleNext = (id: string, images: string[]) => {
    setSlideIndexes(idx => ({
      ...idx,
      [id]: (idx[id] ?? 0) === images.length - 1 ? 0 : (idx[id] ?? 0) + 1
    }));
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        // Fetch vehicles and all booking types in parallel
        const [vehiclesRes, prebookingsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/vehicles`),
          fetch(`${import.meta.env.VITE_API_URL}/api/prebookings`)
        ]);
        
        console.log('Vehicles response status:', vehiclesRes.status);
        console.log('Prebookings response status:', prebookingsRes.status);
        
        const vehiclesData = await vehiclesRes.json();
        const prebookingsData = await prebookingsRes.json();
        
        console.log('Fetched vehicles:', vehiclesData);
        console.log('Fetched prebookings:', prebookingsData);
        console.log('Prebookings data type:', typeof prebookingsData);
        console.log('Prebookings data length:', Array.isArray(prebookingsData) ? prebookingsData.length : 'Not an array');
        
        // Debug: Check the structure of prebookings data
        if (prebookingsData && Array.isArray(prebookingsData) && prebookingsData.length > 0) {
          console.log('Sample prebooking structure:', prebookingsData[0]);
          console.log('All prebooking vehicleIds:', prebookingsData.map((b: any) => b.vehicleId));
          
          // Check all possible field names that might reference vehicles
          const sampleBooking = prebookingsData[0];
          console.log('All fields in sample booking:', Object.keys(sampleBooking));
          console.log('vehicleId field:', sampleBooking.vehicleId);
          console.log('vehicle field:', sampleBooking.vehicle);
          console.log('bikeId field:', sampleBooking.bikeId);
          console.log('bike field:', sampleBooking.bike);
          console.log('productId field:', sampleBooking.productId);
          console.log('product field:', sampleBooking.product);
        } else {
          console.log('No prebookings data or empty array');
        }
        
        // Debug: Check vehicle IDs
        console.log('Vehicle IDs from vehicles:', vehiclesData.map((v: any) => v._id));
        
        // Calculate total booking counts for each vehicle
        // For now, we'll use prebookings data and filter by status
        const vehicleBookingCounts: { [key: string]: number } = {};
        
        // Count all prebookings (including ordered and delivered status)
        prebookingsData.forEach((booking: any) => {
          console.log('Processing booking:', booking);
          console.log('Booking vehicleModel:', booking.vehicleModel);
          if (booking.vehicleModel) {
            // Use vehicleModel (which contains the vehicle name) to match with vehicle names
            const vehicleName = booking.vehicleModel;
            vehicleBookingCounts[vehicleName] = (vehicleBookingCounts[vehicleName] || 0) + 1;
            console.log(`Added booking for vehicle "${vehicleName}", new count: ${vehicleBookingCounts[vehicleName]}`);
          }
        });
        
        console.log('Total vehicle booking counts:', vehicleBookingCounts);
        
        // Filter out vehicles that are not available and add booking counts
        console.log('Total vehicles from API:', vehiclesData.length);
        console.log('All vehicle names:', vehiclesData.map((v: any) => v.name));
        
        const filteredVehicles = vehiclesData
          .filter((v: any) => {
            console.log(`Checking vehicle: ${v.name}, available: ${v.available}`);
            return v.available !== false;
          })
          .map((vehicle: any) => {
            console.log('Processing vehicle:', vehicle.name);
            console.log('Original colors:', vehicle.colors);
            console.log('Original images:', vehicle.images);
            console.log('Gallery images:', vehicle.galleryImages);
            
            return {
              ...vehicle,
              // Use total booking count from prebookings
              prebookCount: vehicleBookingCounts[vehicle.name] || 0,
              // Ensure specs are properly structured
              specs: vehicle.specs || {},
              // Ensure colors are properly structured
              colors: vehicle.colors || [],
              // Use galleryImages if available, otherwise use images
              images: vehicle.galleryImages?.length > 0 ? vehicle.galleryImages : (vehicle.images || [])
            };
          });
        
        console.log('Filtered vehicles count:', filteredVehicles.length);
        console.log('Filtered vehicle names:', filteredVehicles.map((v: any) => v.name));
        
        console.log('Processed vehicles:', filteredVehicles); // Debug log
        setVehicles(filteredVehicles);
        setPrebookings(prebookingsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError("Failed to load vehicles.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleColorChange = (bikeId: string, color: any) => {
    setSelectedColors(prev => ({
      ...prev,
      [bikeId]: color
    }))
  }

  const getBikeImage = (bike: any) => {
    if (bike.colors && bike.colors.length > 0) {
      const selected = selectedColors[bike._id] || bike.colors[0]
      if (selected.images && selected.images.length > 0) {
        return selected.images[0]
      }
    }
    if (bike.images && bike.images.length > 0) {
      return bike.images[0]
    }
    return "/images/placeholder.svg"
  }

  const openImagePreview = (bike: any) => {
    const imgs = (selectedColors[bike._id]?.images || bike.colors?.[0]?.images || bike.images || [])
    setPreviewImages(imgs)
    setImagePreviewOpen(true)
  }

  // Recommendation categories
  const recommendationCategories = [
    { 
      id: 'All',
      title: "All Bikes", 
      description: "View all available bikes",
      filter: (bikes: any[]) => bikes
    },
    { 
      id: 'Popular',
      title: "Most Popular", 
      description: "Best selling bikes",
      filter: (bikes: any[]) => bikes.filter(b => b.prebookCount > 0).sort((a, b) => (b.prebookCount || 0) - (a.prebookCount || 0)).slice(0, 6)
    },
    { 
      id: 'Budget',
      title: "Budget Friendly", 
      description: "Affordable options",
      filter: (bikes: any[]) => bikes.filter(b => b.price && b.price < 150000).sort((a, b) => (a.price || 0) - (b.price || 0)).slice(0, 6)
    },
    { 
      id: 'Premium',
      title: "Premium Range", 
      description: "High-end models",
      filter: (bikes: any[]) => bikes.filter(b => b.price && b.price > 200000).sort((a, b) => (b.price || 0) - (a.price || 0)).slice(0, 6)
    },
    { 
      id: 'Efficient',
      title: "Fuel Efficient", 
      description: "Best mileage",
      filter: (bikes: any[]) => bikes.filter(b => b.specs?.Mileage && parseFloat(b.specs.Mileage) > 40).sort((a, b) => parseFloat(b.specs?.Mileage || '0') - parseFloat(a.specs?.Mileage || '0')).slice(0, 6)
    }
  ];

  // Get filtered vehicles based on selected category and search
  const getFilteredVehicles = () => {
    let filtered = vehicles.filter(v => {
      const matchesSearch = v.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           v.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      console.log(`Filtering vehicle: ${v.name}`);
      console.log(`  - Search term: "${searchTerm}", matches: ${matchesSearch}`);
      console.log(`  - Final result: ${matchesSearch}`);
      
      return matchesSearch;
    });

    // Apply category filter if not "All"
    if (selectedCategory !== 'All') {
      const category = recommendationCategories.find(cat => cat.id === selectedCategory);
      if (category) {
        filtered = category.filter(filtered);
      }
    }

    console.log('Final filtered vehicles for display:', filtered.map(v => v.name));
    return filtered;
  };

  const filteredVehicles = getFilteredVehicles();
  
  console.log('Final filtered vehicles for display:', filteredVehicles.map(v => v.name));

  // Handle bike selection for comparison
  const toggleBikeSelection = (bikeId: string) => {
    setSelectedBikes(prev => {
      if (prev.includes(bikeId)) {
        return prev.filter(id => id !== bikeId);
      } else if (prev.length < 3) {
        return [...prev, bikeId];
      }
      return prev;
    });
  };

  // Get selected bikes for comparison
  const selectedBikesData = vehicles.filter(bike => selectedBikes.includes(bike._id));

  return (
    <>
      <SEO 
        title="AKR & Sons - Bajaj Dealer in Sri Lanka | Motorcycle & Scooter Dealership"
        description="AKR & Sons is the leading Bajaj motorcycle and scooter dealer in Sri Lanka. Explore our wide range of bikes, scooters, and commercial vehicles. Visit us for the best deals and financing options."
        keywords="Bajaj dealer Sri Lanka, motorcycle dealer, scooter dealer, bike shop, AKR Sons, Bajaj bikes, motorcycle financing, scooter financing, Sri Lanka motorcycles"
        canonical="https://akr.lk/akr-sons-bike-store"
      />
      <div style={{ minHeight: "100vh", background: "#ffffff" }}>
      {/* Professional Mobile-Responsive Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo and Company Name */}
            <div className="flex items-center space-x-3">
              <img src="/images/image copy 2.png" alt="AKR Logo" className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" />
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">AKR & SONS (PVT) LTD</h1>
                <p className="text-xs text-gray-600">Premium Bike Store & Management System</p>
      </div>
              <div className="sm:hidden">
                <h1 className="text-sm font-bold text-gray-900">AKR & SONS</h1>
                <p className="text-xs text-gray-600">Bike Store</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="relative">
                <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search bikes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-64"
                />
          </div>
              <Button 
                type="primary" 
                className="bg-green-600 hover:bg-green-700 border-green-600"
                onClick={() => navigate('/prebook')}
              >
                Pre-Book Now
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setMobileMenuOpen(true)}
                className="text-gray-600 hover:text-gray-900"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <Drawer
        title={
          <div className="flex items-center space-x-3">
            <img src="/images/image copy 2.png" alt="AKR Logo" className="h-8 w-8 rounded-full" />
            <div>
              <h2 className="font-bold text-gray-900">AKR & SONS</h2>
              <p className="text-xs text-gray-600">Bike Store</p>
            </div>
          </div>
        }
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={280}
        className="mobile-menu-drawer"
      >
        <div className="space-y-4">
          {/* Search in Mobile Menu */}
          <div className="relative">
            <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search bikes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Mobile Menu Items */}
          <div className="space-y-2">
            <Button
              type="primary"
              className="w-full bg-green-600 hover:bg-green-700 border-green-600"
              onClick={() => {
                navigate('/prebook');
                setMobileMenuOpen(false);
              }}
            >
              Pre-Book Now
            </Button>
            
            <Button
              type="default"
              className="w-full"
              onClick={() => {
                navigate('/');
                setMobileMenuOpen(false);
              }}
            >
              Home
            </Button>
          </div>

          {/* Contact Info in Mobile Menu */}
          <div className="pt-4 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Contact Info</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <PhoneOutlined className="text-green-600" />
                <span>{settings?.phone || '+94 77 311 1266'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MailOutlined className="text-green-600" />
                <span>{settings?.email || 'akrfuture@gmail.com'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <EnvironmentOutlined className="text-green-600" />
                <span>{settings?.address || 'Jaffna, Sri Lanka'}</span>
              </div>
            </div>
          </div>

          {/* Special Offers in Mobile Menu */}
          {settings?.specialOffers && settings.specialOffers.length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Special Offers</h3>
              <div className="space-y-3">
                {settings.specialOffers.map((offer, idx) => (
                  <div key={idx} className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="font-bold text-green-700 text-sm mb-1">{offer.title}</div>
                    <div className="text-gray-600 text-xs mb-2">{offer.description}</div>
                    <div className="text-green-600 text-xs font-medium">{offer.condition}</div>
                  </div>
                ))}
                <p className="text-xs text-gray-500 text-center">* Can choose only one offer per purchase</p>
              </div>
          </div>
        )}
        </div>
      </Drawer>

      {/* Professional Mobile-Responsive Hero Section */}
      <section className="relative w-full min-h-[400px] sm:min-h-[500px] md:min-h-[600px] flex items-center justify-center overflow-hidden">
        {heroImages.map((img, idx) => (
          <img
            key={img}
            src={img}
            alt="AKR & SONS Hero"
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${idx === heroIndex ? 'opacity-100 z-0' : 'opacity-0 z-0'}`}
            style={{ transition: 'opacity 1s' }}
            />
          ))}
        <div className="absolute inset-0 bg-black/50 z-10" />
        
        <div className="relative z-20 w-full px-4 sm:px-6 py-8">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Left Side - Main Content */}
              <div className="text-white text-center lg:text-left">
                {settingsLoading ? (
                  <div className="animate-pulse">
                    <div className="h-12 bg-white/20 rounded-lg mb-4"></div>
                    <div className="h-8 bg-white/20 rounded-lg mb-6"></div>
                    <div className="h-4 bg-white/20 rounded mb-2"></div>
                    <div className="h-4 bg-white/20 rounded mb-2"></div>
                    <div className="h-4 bg-white/20 rounded w-3/4 mb-8"></div>
                    {/* Button loading placeholders */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                      <div className="h-14 bg-white/20 rounded-xl w-40"></div>
                      <div className="h-14 bg-white/20 rounded-xl w-40"></div>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-white leading-tight">
                      {settings?.bannerHeading}
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto lg:mx-0 text-gray-200 leading-relaxed">
                      {settings?.bannerSubheading}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                      <Button 
                        size="large"
                        className="bg-green-600 hover:bg-green-700 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2"
                        onClick={() => document.getElementById('bike-grid')?.scrollIntoView({ behavior: 'smooth' })}
                      >
                        <ShoppingCartOutlined className="w-5 h-5" />
                        Explore Bikes
                      </Button>
            <Button
                        size="large"
                        className="bg-white/20 hover:bg-white/30 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2 border border-white/30"
                        onClick={() => navigate('/prebook')}
                      >
                        <CalendarOutlined className="w-5 h-5" />
                        Pre-Book Now
            </Button>
        </div>
                  </>
                )}
      </div>

              {/* Right Side - Empty for now */}
              <div className="hidden lg:block">
                {/* Right side content can be added here if needed */}
            </div>
      </div>
          </div>
        </div>
      </section>

      {/* Special Offers Section */}
      {settingsLoading ? (
        <section className="hidden lg:block py-8 bg-gradient-to-r from-green-50 to-green-100">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded-lg mb-2 mx-auto w-64"></div>
                <div className="h-4 bg-gray-200 rounded-lg mx-auto w-48"></div>
              </div>
              </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((idx) => (
                <div key={idx} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
          </div>
              ))}
        </div>
      </div>
        </section>
      ) : (
        settings?.specialOffers && settings.specialOffers.length > 0 && (
          <section className="hidden lg:block py-8 bg-gradient-to-r from-green-50 to-green-100">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Special Offers Available</h2>
                <p className="text-gray-600">Exclusive deals for our valued customers</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {settings.specialOffers.map((offer, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-6 shadow-lg border border-green-200 hover:shadow-xl transition-all duration-300">
                    <div className="text-center">
                      <div className="font-bold text-green-600 text-lg mb-2">{offer.title}</div>
                      <div className="text-gray-600 text-sm mb-3">{offer.description}</div>
                      <div className="text-green-700 text-sm font-medium">{offer.condition}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-6">
                <p className="text-sm text-gray-500">* Can choose only one offer per purchase</p>
              </div>
            </div>
          </section>
        )
      )}

      {/* Recommendation Categories */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">What are you looking for?</h2>
            <p className="text-gray-600">Choose from our curated recommendations</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {recommendationCategories.map((category) => (
              <Card
                key={category.id}
                hoverable
                className={`text-center cursor-pointer transition-all duration-300 hover:scale-105 ${
                  selectedCategory === category.id 
                    ? 'ring-2 ring-green-500 bg-green-50 border-green-200' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <div className="p-3 sm:p-4">
                  <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2">{category.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{category.description}</p>
                  {selectedCategory === category.id && (
                    <div className="mt-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mx-auto"></div>
          </div>
                  )}
          </div>
              </Card>
            ))}
          </div>
          
          {/* Selected Category Info */}
          {selectedCategory !== 'All' && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
                <span className="text-sm font-medium">
                  Showing {filteredVehicles.length} bikes from "{recommendationCategories.find(cat => cat.id === selectedCategory)?.title}"
                </span>
                <Button
                  type="text"
                  size="small"
                  onClick={() => setSelectedCategory('All')}
                  className="text-green-600 hover:text-green-800"
                >
                  View All
                </Button>
          </div>
            </div>
          )}
        </div>
      </section>

      {/* Comparison Guide Banner */}
      {selectedBikes.length > 0 && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <InfoCircleOutlined className="text-green-600 text-xl" />
          <div>
                  <h3 className="font-semibold text-green-800">Compare Vehicles</h3>
                  <p className="text-sm text-green-700">
                    Selected {selectedBikes.length} vehicle(s). Click the heart icon on vehicle cards to add more for comparison.
                  </p>
            </div>
          </div>
              {selectedBikes.length >= 2 && (
                <Button
                  type="primary"
                  className="bg-green-600 hover:bg-green-700 border-green-600"
                  onClick={() => setShowComparison(true)}
                >
                  Compare Now
                </Button>
              )}
        </div>
    </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Side - Product Grid */}
          <div className="lg:col-span-3">
            <div id="bike-grid">
              {loading ? (
                <div className="text-center py-12">
                  <Spin size="large" />
                  <p className="mt-4 text-gray-600">Loading vehicles...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600 text-lg">{error}</p>
                </div>
              ) : filteredVehicles.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">No vehicles found matching your criteria.</p>
                </div>
              ) : loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {[1, 2, 3, 4, 5, 6].map((idx) => (
                    <div key={idx} className="bg-white rounded-lg shadow-lg overflow-hidden">
                      <div className="animate-pulse">
                        {/* Image placeholder */}
                        <div className="w-full h-48 bg-gray-200"></div>
                        {/* Content placeholders */}
                        <div className="p-4">
                          <div className="h-6 bg-gray-200 rounded mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                          <div className="flex justify-between items-center">
                            <div className="h-5 bg-gray-200 rounded w-20"></div>
                            <div className="h-5 bg-gray-200 rounded w-16"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredVehicles.map((bike) => {
                    // Get images from selected color or first color or gallery images
                    const selectedColor = selectedColors[bike._id];
                    let images = [];
                    
                    // Priority: selected color images > first color images > gallery images > direct images
                    if (selectedColor?.images && selectedColor.images.length > 0) {
                      images = selectedColor.images;
                    } else if (bike.colors?.[0]?.images && bike.colors[0].images.length > 0) {
                      images = bike.colors[0].images;
                    } else if (bike.galleryImages && bike.galleryImages.length > 0) {
                      images = bike.galleryImages;
                    } else if (bike.images && bike.images.length > 0) {
                      images = bike.images;
                    }
                    
                    // Debug logging for image sources
                    console.log(`Bike: ${bike.name}`);
                    console.log('Selected color:', selectedColor);
                    console.log('First color:', bike.colors?.[0]);
                    console.log('Final images array:', images);
                    console.log('Gallery images:', bike.galleryImages);
                    console.log('Direct images:', bike.images);
                    
                    // Get specs from the backend data structure with proper units
                    const engine = bike.specs?.['Engine(cc)'] || bike.specs?.['Engine Type'] || bike.specs?.Displacement || bike.specs?.Engine;
                    const power = bike.specs?.Power || bike.specs?.['Max Power'];
                    const torque = bike.specs?.Torque || bike.specs?.['Max Torque'];
                    const mileage = bike.specs?.Mileage;
                    
            const price = bike.price;
                    const rating = bike.rating || 4.5;
                    const reviewCount = bike.reviewCount || Math.floor(Math.random() * 200) + 50;
                    const isSelected = selectedBikes.includes(bike._id);
                    
            return (
                <Card
                        key={bike._id}
                  hoverable
                        className={`h-full transition-all duration-300 ${isSelected ? 'ring-2 ring-green-500' : ''}`}
                  cover={
                          <div className="relative w-full h-48 overflow-hidden bg-gray-100">
                      {images && images.length > 0 ? (
                          <img
                                src={images[0]}
                            alt={bike.name}
                                className="w-full h-full object-cover"
                            draggable={false}
                                onError={e => { 
                                  console.error(`Failed to load image: ${images[0]}`);
                                  (e.currentTarget as HTMLImageElement).src = '/images/placeholder.svg'; 
                                }}
                                onLoad={() => console.log(`Successfully loaded image: ${images[0]}`)}
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">
                                <PictureOutlined style={{ fontSize: 48 }} />
                                <span className="ml-2 text-sm">No Image Available</span>
                        </div>
                      )}
                            <Badge 
                              className="absolute top-2 right-2" 
                              color="green"
                              text="New"
                            />
                            <Button
                              type="text"
                              icon={<HeartOutlined />}
                              className={`absolute top-2 left-2 ${isSelected ? 'bg-green-500 text-white' : 'bg-white/80 hover:bg-white'}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleBikeSelection(bike._id);
                              }}
                            />
                    </div>
                  }
                        bodyStyle={{ padding: 16 }}
                >
                        {/* Color Selector */}
                  {bike.colors && bike.colors.length > 0 && (
                          <div className="mb-3 flex items-center gap-2">
                            <span className="text-sm text-gray-600">Color:</span>
                      {bike.colors.map((color: any, idx: number) => (
                        <div
                          key={color.value || color.name || idx}
                                className="w-4 h-4 rounded-full border-2 border-gray-300 cursor-pointer hover:scale-110 transition"
                                style={{ backgroundColor: color.hex }}
                          title={color.name}
                          onClick={() => handleColorChange(bike._id, color)}
                        />
                      ))}
                    </div>
                  )}

                        {/* Bike Name */}
                        <div className="flex items-center justify-between mb-2">
                          <Title level={5} style={{ margin: 0, fontWeight: 600 }}>{bike.name}</Title>
                          <div className="flex items-center gap-1">
                            <CalendarOutlined style={{ color: '#22c55e', fontSize: 14 }} />
                            <span className="text-sm font-medium">{bike.prebookCount || 0}</span>
                            <span className="text-xs text-gray-500">total</span>
                  </div>
                  </div>

                        {/* Specifications */}
                        <div className="text-sm text-gray-600 mb-3 space-y-1">
                          {engine && <div>Engine: <span className="font-medium">{engine} cc</span></div>}
                          {power && <div>Power: <span className="font-medium">{power} PS</span></div>}
                          {torque && <div>Torque: <span className="font-medium">{torque} Nm</span></div>}
                          {mileage && <div>Mileage: <span className="font-medium">{mileage} kmpl</span></div>}
                        </div>

                  {/* Price */}
                        <div className="mb-4">
                          <div className="text-lg font-bold text-gray-900">
                            {price ? `Rs ${Number(price).toLocaleString('en-IN')}/=` : 'Price on request'}
                  </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                    <Button
                            type="primary"
                            className="flex-1 bg-green-600 hover:bg-green-700 border-green-600"
                      onClick={() => navigate(`/akr-sons-bike-store/${bike._id}`)}
                    >
                            View
                    </Button>
                    <Button
                            className="flex-1 border-green-600 text-green-600 hover:bg-green-50"
                      onClick={() => navigate('/prebook')}
                    >
                      Pre-Book
                    </Button>
                  </div>
                </Card>
            );
          })}
        </div>
              )}
      </div>
    </div>

          {/* Right Sidebar - Compare Bikes */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <Title level={4} className="mb-4">Compare Bikes</Title>
              
              {/* Selected Bikes for Comparison */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Selected Bikes ({selectedBikes.length}/3)</h4>
                  {selectedBikes.length > 0 && (
                    <Button
                      type="text"
                      size="small"
                      onClick={() => setSelectedBikes([])}
                      className="text-red-500 hover:text-red-700"
                    >
                      Clear All
                    </Button>
                  )}
                </div>
                
                {selectedBikes.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <HeartOutlined className="text-gray-400 text-2xl mb-2" />
                    <p className="text-sm text-gray-600">No bikes selected</p>
                    <p className="text-xs text-gray-500 mt-1">Click the heart icon on bike cards to add them for comparison</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedBikesData.map(bike => (
                      <div key={bike._id} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <img 
                          src={getBikeImage(bike)} 
                          alt={bike.name} 
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{bike.name}</p>
                          <p className="text-xs text-gray-600">
                            {bike.price ? `Rs ${Number(bike.price).toLocaleString('en-IN')}/=` : 'Price on request'}
                          </p>
                        </div>
            <Button
                          type="text"
                          size="small"
                          onClick={() => toggleBikeSelection(bike._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
            </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Comparison Actions */}
              {selectedBikes.length >= 2 && (
                <div className="space-y-2">
                  <Button
                    type="primary"
                    className="w-full bg-green-600 hover:bg-green-700 border-green-600"
                    onClick={() => setShowComparison(true)}
                    size="large"
                  >
                    Compare Now ({selectedBikes.length} bikes)
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    Compare specifications, pricing, and features
                  </p>
                </div>
              )}

              {/* Instructions */}
              {selectedBikes.length < 2 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-2">
                    <InfoCircleOutlined className="text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">How to compare:</p>
                      <ul className="text-xs text-blue-700 mt-1 space-y-1">
                        <li>• Click the heart icon on bike cards</li>
                        <li>• Select 2-3 bikes to compare</li>
                        <li>• Click "Compare Now" to see details</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <Title level={3}>Frequently Asked Questions</Title>
            <p className="text-gray-600">Find answers to common questions about our bikes and special offers</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <Collapse 
              accordion
              items={[
                {
                  key: '1',
                  label: 'What special offers are available for ready cash payments?',
                  children: (
                    <div className="text-gray-700 space-y-3">
                      <p>We offer several exclusive benefits for ready cash payments:</p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><strong>Full Tank Petrol + Jacket + Helmet:</strong> Get a full tank of petrol, a stylish jacket, and a helmet with your new ride.</li>
                        <li><strong>15,000 LKR Discount:</strong> Enjoy an instant discount of 15,000 LKR on your purchase.</li>
                        <li><strong>Registration Fee Waived:</strong> We'll cover your registration fee for a hassle-free start.</li>
                      </ul>
                      <p className="text-green-600 font-semibold">All these offers are exclusively for Ready Cash Payments only!</p>
                    </div>
                  )
                },
                {
                  key: '2',
                  label: 'What financing options are available for bike purchases?',
                  children: (
                    <div className="text-gray-700 space-y-3">
                      <p>We offer multiple financing options to make your bike purchase convenient:</p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><strong>Ready Cash Payment:</strong> Full payment with special offers and discounts</li>
                        <li><strong>Leasing via AKR Easy Credit:</strong> Our in-house financing with competitive rates</li>
                        <li><strong>Other Leasing Companies:</strong> We work with various external financing partners</li>
                      </ul>
                      <p>Contact our sales team for detailed financing terms and eligibility criteria.</p>
                    </div>
                  )
                },
                {
                  key: '3',
                  label: 'How can I pre-book a bike and what is the process?',
                  children: (
                    <div className="text-gray-700 space-y-3">
                      <p>The pre-booking process is simple and secure:</p>
                      <ol className="list-decimal list-inside space-y-2 ml-4">
                        <li><strong>Select Your Bike:</strong> Choose from our wide range of Bajaj bikes</li>
                        <li><strong>Fill Pre-booking Form:</strong> Provide your contact details and preferences</li>
                        <li><strong>Confirmation:</strong> Receive confirmation via phone or email</li>
                        <li><strong>Visit Showroom:</strong> Complete the purchase process at our showroom</li>
                      </ol>
                      <p>Pre-booking helps us prepare your bike and ensures priority service. Contact us at 0232231222 or 0773111266 for assistance.</p>
                    </div>
                  )
                }
              ]}
            />
          </div>
        </div>
      </div>

      {/* Bike Comparison Modal */}
      <Modal
        title={
          <div className="text-center">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Compare Bikes</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Side-by-side comparison of {selectedBikesData.length} bikes</p>
          </div>
        }
        open={showComparison}
        onCancel={() => setShowComparison(false)}
        width="98%"
        style={{ maxWidth: '1400px' }}
        footer={null}
        className="comparison-modal"
      >
        {selectedBikesData.length >= 2 ? (
          <div className="overflow-x-auto max-h-[80vh]">
            <table className="w-full border-collapse min-w-[700px] text-xs">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gradient-to-r from-green-50 to-blue-50">
                  <th className="border p-1 sm:p-2 text-left bg-white">
                    <div className="font-bold text-gray-900 text-xs">Specifications</div>
                  </th>
                  {selectedBikesData.map(bike => (
                    <th key={bike._id} className="border p-1 sm:p-2 text-center bg-white">
                      <div className="text-center">
                        <img 
                          src={getBikeImage(bike)} 
                          alt={bike.name} 
                          className="w-12 h-12 sm:w-16 sm:h-16 object-cover mx-auto mb-1 sm:mb-2 rounded-lg shadow-md"
                        />
                        <div className="font-bold text-gray-900 text-xs sm:text-sm">{bike.name}</div>
                        <div className="text-xs text-gray-600 mb-1">{bike.category}</div>
                        <div className="text-xs sm:text-sm font-bold text-green-600 mb-1">
                          {bike.price ? `Rs ${Number(bike.price).toLocaleString('en-IN')}/=` : 'Price on request'}
                        </div>
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <CalendarOutlined style={{ color: '#22c55e', fontSize: 10 }} />
                          <span className="font-medium text-xs">{bike.prebookCount || 0}</span>
                          <span className="text-xs text-gray-500">total</span>
                        </div>
                        <Badge 
                          status={bike.available ? "success" : "error"} 
                          text={bike.available ? "In Stock" : "Out of Stock"}
                          className="text-xs"
                        />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Key Highlights */}
                <tr className="bg-yellow-50">
                  <td className="border p-1 sm:p-2 font-bold text-yellow-800 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <ThunderboltOutlined className="text-yellow-600 text-xs" />
                      <span className="text-xs">Key Highlights</span>
                    </div>
                  </td>
                  {selectedBikesData.map(bike => (
                    <td key={bike._id} className="border p-1 sm:p-2 text-center bg-yellow-50">
                      <div className="space-y-1">
                        <div className="text-xs">
                          {bike.specs?.['Engine Type'] || bike.specs?.Displacement || 'N/A'}
                        </div>
                        <div className="text-xs">
                          {bike.specs?.Power || bike.specs?.['Max Power'] || 'N/A'}
                        </div>
                        <div className="text-xs">
                          {bike.specs?.Mileage ? `${bike.specs.Mileage} kmpl` : 'N/A'}
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Engine & Performance */}
                <tr className="bg-blue-50">
                  <td className="border p-1 sm:p-2 font-bold text-blue-800">
                    <div className="flex items-center gap-1">
                      <ThunderboltOutlined className="text-blue-600 text-xs" />
                      <span className="text-xs">Engine & Performance</span>
                    </div>
                  </td>
                  {selectedBikesData.map(bike => (
                    <td key={bike._id} className="border p-1 sm:p-2 text-center bg-blue-50">
                      <div className="space-y-1">
                        <div className="text-xs">
                          <span className="hidden sm:inline">Engine: </span>
                          <span className="sm:hidden">(</span>
                          {bike.specs?.['Engine Type'] || bike.specs?.Displacement || bike.specs?.Engine || 'N/A'}
                          <span className="sm:hidden">)</span>
                        </div>
                        <div className="text-xs">
                          <span className="hidden sm:inline">Capacity: </span>
                          <span className="sm:hidden">(</span>
                          {bike.specs?.Displacement || bike.specs?.['Engine Capacity'] || 'N/A'}
                          <span className="sm:hidden">)</span>
                        </div>
                        <div className="text-xs">
                          <span className="hidden sm:inline">Power: </span>
                          <span className="sm:hidden">(</span>
                          {bike.specs?.Power || bike.specs?.['Max Power'] || 'N/A'}
                          <span className="sm:hidden">)</span>
                        </div>
                        <div className="text-xs">
                          <span className="hidden sm:inline">Torque: </span>
                          <span className="sm:hidden">(</span>
                          {bike.specs?.Torque || bike.specs?.['Max Torque'] || 'N/A'}
                          <span className="sm:hidden">)</span>
                        </div>
                        <div className="text-xs">
                          <span className="hidden sm:inline">Mileage: </span>
                          <span className="sm:hidden">(</span>
                          {bike.specs?.Mileage ? `${bike.specs.Mileage} kmpl` : 'N/A'}
                          <span className="sm:hidden">)</span>
                        </div>
                        <div className="text-xs">
                          <span className="hidden sm:inline">Speed: </span>
                          <span className="sm:hidden">(</span>
                          {bike.specs?.['Top Speed'] || bike.specs?.Speed || 'N/A'}
                          <span className="sm:hidden">)</span>
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Transmission & Brakes */}
                <tr className="bg-green-50">
                  <td className="border p-1 sm:p-2 font-bold text-green-800">
                    <div className="flex items-center gap-1">
                      <ThunderboltOutlined className="text-green-600 text-xs" />
                      <span className="text-xs">Transmission & Brakes</span>
                    </div>
                  </td>
                  {selectedBikesData.map(bike => (
                    <td key={bike._id} className="border p-1 sm:p-2 text-center bg-green-50">
                      <div className="space-y-1">
                        <div className="text-xs">
                          <span className="hidden sm:inline">Gearbox: </span>
                          <span className="sm:hidden">(</span>
                          {bike.specs?.Gearbox || bike.specs?.Transmission || 'N/A'}
                          <span className="sm:hidden">)</span>
                        </div>
                        <div className="text-xs">
                          <span className="hidden sm:inline">Clutch: </span>
                          <span className="sm:hidden">(</span>
                          {bike.specs?.Clutch || 'N/A'}
                          <span className="sm:hidden">)</span>
                        </div>
                        <div className="text-xs">
                          <span className="hidden sm:inline">Front Brake: </span>
                          <span className="sm:hidden">(</span>
                          {bike.specs?.['Front Brake'] || bike.specs?.Brakes || 'N/A'}
                          <span className="sm:hidden">)</span>
                        </div>
                        <div className="text-xs">
                          <span className="hidden sm:inline">Rear Brake: </span>
                          <span className="sm:hidden">(</span>
                          {bike.specs?.['Rear Brake'] || 'N/A'}
                          <span className="sm:hidden">)</span>
                        </div>
                        <div className="text-xs">
                          <span className="hidden sm:inline">ABS: </span>
                          <span className="sm:hidden">(</span>
                          {bike.specs?.ABS || 'N/A'}
                          <span className="sm:hidden">)</span>
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Dimensions & Comfort */}
                <tr className="bg-purple-50">
                  <td className="border p-1 sm:p-2 font-bold text-purple-800">
                    <div className="flex items-center gap-1">
                      <ThunderboltOutlined className="text-purple-600 text-xs" />
                      <span className="text-xs">Dimensions & Comfort</span>
                    </div>
                  </td>
                  {selectedBikesData.map(bike => (
                    <td key={bike._id} className="border p-1 sm:p-2 text-center bg-purple-50">
                      <div className="space-y-1">
                        <div className="text-xs">
                          <span className="hidden sm:inline">Length: </span>
                          <span className="sm:hidden">(</span>
                          {bike.specs?.Length || 'N/A'}
                          <span className="sm:hidden">)</span>
                        </div>
                        <div className="text-xs">
                          <span className="hidden sm:inline">Width: </span>
                          <span className="sm:hidden">(</span>
                          {bike.specs?.Width || 'N/A'}
                          <span className="sm:hidden">)</span>
                        </div>
                        <div className="text-xs">
                          <span className="hidden sm:inline">Height: </span>
                          <span className="sm:hidden">(</span>
                          {bike.specs?.Height || 'N/A'}
                          <span className="sm:hidden">)</span>
                        </div>
                        <div className="text-xs">
                          <span className="hidden sm:inline">Ground Clearance: </span>
                          <span className="sm:hidden">(</span>
                          {bike.specs?.['Ground Clearance'] || 'N/A'}
                          <span className="sm:hidden">)</span>
                        </div>
                        <div className="text-xs">
                          <span className="hidden sm:inline">Seat Height: </span>
                          <span className="sm:hidden">(</span>
                          {bike.specs?.['Seat Height'] || 'N/A'}
                          <span className="sm:hidden">)</span>
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Fuel & Capacity */}
                <tr className="bg-orange-50">
                  <td className="border p-1 sm:p-2 font-bold text-orange-800">
                    <div className="flex items-center gap-1">
                      <ThunderboltOutlined className="text-orange-600 text-xs" />
                      <span className="text-xs">Fuel & Capacity</span>
                    </div>
                  </td>
                  {selectedBikesData.map(bike => (
                    <td key={bike._id} className="border p-1 sm:p-2 text-center bg-orange-50">
                      <div className="space-y-1">
                        <div className="text-xs">
                          <span className="hidden sm:inline">Fuel Tank: </span>
                          <span className="sm:hidden">(</span>
                          {bike.specs?.['Fuel Tank Capacity'] || bike.specs?.Capacity || 'N/A'}
                          <span className="sm:hidden">)</span>
                        </div>
                        <div className="text-xs">
                          <span className="hidden sm:inline">Reserve: </span>
                          <span className="sm:hidden">(</span>
                          {bike.specs?.['Reserve Fuel Capacity'] || 'N/A'}
                          <span className="sm:hidden">)</span>
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Colors & Features */}
                <tr className="bg-pink-50">
                  <td className="border p-1 sm:p-2 font-bold text-pink-800">
                    <div className="flex items-center gap-1">
                      <ThunderboltOutlined className="text-pink-600 text-xs" />
                      <span className="text-xs">Colors & Features</span>
                    </div>
                  </td>
                  {selectedBikesData.map(bike => (
                    <td key={bike._id} className="border p-1 sm:p-2 text-center bg-pink-50">
                      <div className="space-y-1">
                        <div className="text-xs">
                          <span className="hidden sm:inline">Colors: </span>
                          {bike.colors && bike.colors.length > 0 ? (
                            <div className="flex flex-wrap gap-1 justify-center">
                              {bike.colors.map((color: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                                  style={{ backgroundColor: color.hex }}
                                  title={color.name}
                                />
                              ))}
                            </div>
                          ) : (
                            'N/A'
                          )}
                        </div>
                        <div className="text-xs">
                          <span className="hidden sm:inline">Features: </span>
                          {bike.features && bike.features.length > 0 ? (
                            <div className="text-left">
                              {bike.features.map((feature: string, idx: number) => (
                                <div key={idx} className="mb-1">• {feature}</div>
                              ))}
                            </div>
                          ) : (
                            'Standard Features'
                          )}
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Select Bikes to Compare</h3>
            <p className="text-gray-500">Choose 2 or more bikes to see a detailed comparison</p>
            </div>
        )}
      </Modal>

      {/* Contact Section */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <Title level={3}>Get in Touch</Title>
            <p className="text-gray-600">We're here to help you find the perfect vehicle</p>
          </div>
          <Row gutter={[32, 32]} justify="center">
            <Col xs={24} md={8}>
              <Card className="text-center h-full">
                <PhoneOutlined style={{ fontSize: 32, color: "#22c55e" }} />
                <Title level={5} style={{ margin: "16px 0 8px 0" }}>Call Us</Title>
                <Text>{settings?.phone}</Text>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="text-center h-full">
                <MailOutlined style={{ fontSize: 32, color: "#22c55e" }} />
                <Title level={5} style={{ margin: "16px 0 8px 0" }}>Email Us</Title>
                <Text>{settings?.email}</Text>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="text-center h-full">
                <EnvironmentOutlined style={{ fontSize: 32, color: "#22c55e" }} />
                <Title level={5} style={{ margin: "16px 0 8px 0" }}>Visit Us</Title>
                <Text>{settings?.address}</Text>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      {/* Image Preview Modal */}
      <Image.PreviewGroup
        preview={{
          visible: imagePreviewOpen,
          onVisibleChange: (vis) => setImagePreviewOpen(vis),
        }}
      >
        {previewImages.map((img, idx) => (
          <Image key={idx} src={String(img)} alt="vehicle" style={{ display: 'none' }} />
        ))}
      </Image.PreviewGroup>

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
    </>
  )
} 