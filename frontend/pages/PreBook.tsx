import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  IdCard, 
  Home, 
  Bike, 
  StickyNote, 
  Calendar, 
  Info, 
  ArrowLeft,
  CheckCircle,
  Clock,
  Shield,
  Award
} from 'lucide-react';

const steps = [
  { label: 'Fill Details', icon: User },
  { label: 'Confirm', icon: CheckCircle },
  { label: 'Success', icon: Award },
];

export default function PreBook() {
  const [models, setModels] = useState<string[]>([]);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    nationalId: '',
    address: '',
    vehicleModel: '',
    notes: '',
    agree: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(0);
  const [bookingId, setBookingId] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [settings, setSettings] = useState({ 
    mode: 'online', 
    bannerImage: '', 
    bannerText: '',
    bannerHeading: '',
    bannerSubheading: '',
    email: '',
    phone: '',
    address: '',
    socialLinks: {
      facebook: '',
      instagram: '',
      whatsapp: '',
      twitter: ''
    }
  });

  // Get vehicle model from URL params if available
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const vehicleModel = params.get('vehicle');
    if (vehicleModel) {
      setForm(prev => ({ ...prev, vehicleModel }));
    }
  }, [location]);

  useEffect(() => {
    async function fetchModels() {
      try {
        const vehiclesRes = await fetch(`${import.meta.env.VITE_API_URL}/api/vehicles`);
        const vehiclesData = await vehiclesRes.json();
        if (Array.isArray(vehiclesData)) {
          setModels(vehiclesData.filter((v: any) => v.available !== false).map((v: any) => v.name));
        } else if (Array.isArray(vehiclesData.vehicles)) {
          setModels(vehiclesData.vehicles.filter((v: any) => v.available !== false).map((v: any) => v.name));
        } else {
          setModels([]);
        }
      } catch {
        setModels([]);
      }
    }
    fetchModels();
  }, []);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/settings`)
      .then(res => res.json())
      .then(data => setSettings(data));
  }, []);

  const validate = () => {
    if (!form.fullName || !form.email || !form.phone || !form.nationalId || !form.address || !form.vehicleModel || !form.agree) {
      setError('Please fill all required fields and agree to the terms.');
      return false;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      setError('Please enter a valid email.');
      return false;
    }
    if (!/^\+?\d{9,15}$/.test(form.phone)) {
      setError('Please enter a valid phone number.');
      return false;
    }
    setError('');
    return true;
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) setStep(1);
  };

  const handleConfirm = async () => {
    console.log('Submitting booking...');
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/prebookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      console.log('PreBook API response:', data);
      if (res.ok && data.bookingId) {
        setBookingId(data.bookingId);
        setStep(2);
      } else {
        setError(data.message || 'Failed to create booking. Please try again.');
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const StepsIndicator = () => (
    <div className="flex justify-center mb-8">
      <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto w-full justify-center">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center flex-shrink-0">
            <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 ${
              i <= step ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300 text-gray-500'
            }`}>
              {i < step ? (
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <s.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </div>
            <span className={`ml-1 sm:ml-2 text-xs sm:text-sm font-medium ${
              i <= step ? 'text-green-600' : 'text-gray-500'
            }`}>
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div className={`w-4 sm:w-8 h-0.5 mx-2 sm:mx-4 ${
                i < step ? 'bg-green-600' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  if (step === 2) {
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

        <div className="container mx-auto px-4 sm:px-6 py-12">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Booking Successful!</h1>
                <p className="text-gray-600 mb-6">
                  Thank you for your pre-booking. We'll contact you soon to confirm your order.
                </p>
                <div className="bg-green-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-green-800">
                    <strong>Booking ID:</strong> {bookingId}
                  </p>
                </div>
                <div className="space-y-4">
                  <Button
                    onClick={() => navigate("/akr-sons-bike-store")}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    Continue Shopping
                  </Button>
                  <Button
                    onClick={() => {
                      setStep(0);
                      setForm({
                        fullName: '',
                        email: '',
                        phone: '',
                        nationalId: '',
                        address: '',
                        vehicleModel: '',
                        notes: '',
                        agree: false
                      });
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Book Another Vehicle
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

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

      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <StepsIndicator />
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-sm border border-gray-100">
                <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Calendar className="h-5 w-5 text-green-600" />
                    Pre-Book Your Vehicle
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {step === 0 && (
                    <motion.form
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onSubmit={handleContinue}
                      className="space-y-6"
                    >
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                            Full Name *
                          </Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="fullName"
                              type="text"
                              value={form.fullName}
                              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                              className="pl-10"
                              placeholder="Enter your full name"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                            Email Address *
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="email"
                              type="email"
                              value={form.email}
                              onChange={(e) => setForm({ ...form, email: e.target.value })}
                              className="pl-10"
                              placeholder="Enter your email"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                            Phone Number *
                          </Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="phone"
                              type="tel"
                              value={form.phone}
                              onChange={(e) => setForm({ ...form, phone: e.target.value })}
                              className="pl-10"
                              placeholder="Enter your phone number"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="nationalId" className="text-sm font-medium text-gray-700">
                            National ID *
                          </Label>
                          <div className="relative">
                            <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="nationalId"
                              type="text"
                              value={form.nationalId}
                              onChange={(e) => setForm({ ...form, nationalId: e.target.value })}
                              className="pl-10"
                              placeholder="Enter your national ID"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                          Address *
                        </Label>
                        <div className="relative">
                          <Home className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Textarea
                            id="address"
                            value={form.address}
                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                            className="pl-10 min-h-[80px]"
                            placeholder="Enter your complete address"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="vehicleModel" className="text-sm font-medium text-gray-700">
                          Vehicle Model *
                        </Label>
                        <div className="relative">
                          <Bike className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Select value={form.vehicleModel} onValueChange={(value) => setForm({ ...form, vehicleModel: value })}>
                            <SelectTrigger className="pl-10">
                              <SelectValue placeholder="Select a vehicle model" />
                            </SelectTrigger>
                            <SelectContent>
                              {models.map((model) => (
                                <SelectItem key={model} value={model}>
                                  {model}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                          Additional Notes
                        </Label>
                        <div className="relative">
                          <StickyNote className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Textarea
                            id="notes"
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            className="pl-10 min-h-[80px]"
                            placeholder="Any additional information or special requests"
                          />
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id="agree"
                          checked={form.agree}
                          onChange={(e) => setForm({ ...form, agree: e.target.checked })}
                          className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <Label htmlFor="agree" className="text-sm text-gray-600">
                          I agree to the terms and conditions and consent to being contacted regarding my pre-booking.
                        </Label>
                      </div>

                      {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <p className="text-red-800 text-sm">{error}</p>
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                        disabled={loading}
                      >
                        {loading ? 'Processing...' : 'Continue to Confirm'}
                      </Button>
                    </motion.form>
                  )}

                  {step === 1 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6"
                    >
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Info className="h-5 w-5 text-blue-600" />
                          <h3 className="font-semibold text-blue-900">Confirm Your Details</h3>
                        </div>
                        <p className="text-blue-800 text-sm">
                          Please review your information before submitting your pre-booking.
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Personal Information</h4>
                          <div className="space-y-2 text-sm">
                            <p><span className="font-medium">Name:</span> {form.fullName}</p>
                            <p><span className="font-medium">Email:</span> {form.email}</p>
                            <p><span className="font-medium">Phone:</span> {form.phone}</p>
                            <p><span className="font-medium">National ID:</span> {form.nationalId}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Booking Details</h4>
                          <div className="space-y-2 text-sm">
                            <p><span className="font-medium">Vehicle:</span> {form.vehicleModel}</p>
                            <p><span className="font-medium">Address:</span> {form.address}</p>
                            {form.notes && (
                              <p><span className="font-medium">Notes:</span> {form.notes}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <Button
                          onClick={() => setStep(0)}
                          variant="outline"
                          className="flex-1"
                        >
                          Back to Edit
                        </Button>
                        <Button
                          onClick={handleConfirm}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          disabled={loading}
                        >
                          {loading ? 'Submitting...' : 'Confirm Booking'}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <Card className="shadow-sm border border-gray-100">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Phone className="h-5 w-5 text-blue-600" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Phone</p>
                      <p className="text-gray-600">{settings.phone || 'Contact us'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Email</p>
                      <p className="text-gray-600">{settings.email || 'info@akrsons.com'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Address</p>
                      <p className="text-gray-600">{settings.address || 'Visit our showroom'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Benefits */}
              <Card className="shadow-sm border border-gray-100">
                <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Award className="h-5 w-5 text-green-600" />
                    Why Pre-Book?
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Secure Your Vehicle</p>
                        <p className="text-xs text-gray-600">Reserve your preferred model before it's sold out</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Priority Service</p>
                        <p className="text-xs text-gray-600">Get priority attention and faster processing</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Expert Guidance</p>
                        <p className="text-xs text-gray-600">Our team will guide you through the process</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10 mt-12">
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
} 