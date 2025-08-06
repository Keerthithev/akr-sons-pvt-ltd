import React, { useEffect, useState } from "react";
import { Layout, Menu, Button, Modal, Table, Tag, message, Spin, Descriptions, Drawer, Row, Col, Card, Steps, Switch } from "antd";
import { CarOutlined, BookOutlined, UserOutlined, SettingOutlined, MenuOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const AKR_COMPANY_NAME = "AKR & SONS (PVT) LTD";

// --- Custom Vehicle Input Components ---
// FeatureInput
function FeatureInput({ value = [], onChange }: { value: any[]; onChange: (v: any[]) => void }) {
  const [input, setInput] = React.useState("");
  return (
    <div>
      <label className="block text-sm mb-1 font-medium">Features</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((f, i) => (
          <span key={i} className="bg-emerald-100 px-2 py-1 rounded flex items-center gap-1">
            {f}
            <button type="button" className="ml-1 text-red-500" onClick={() => onChange(value.filter((_, idx) => idx !== i))}>&times;</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          className="border px-3 py-2 rounded w-full"
          placeholder="Add feature"
          onKeyDown={e => {
            if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
              e.preventDefault();
              if (!value.includes(input.trim())) onChange([...value, input.trim()]);
              setInput("");
            }
          }}
        />
        <button type="button" className="bg-emerald-500 text-white px-3 py-2 rounded" onClick={() => {
          if (input.trim() && !value.includes(input.trim())) onChange([...value, input.trim()]);
          setInput("");
        }}>Add</button>
      </div>
    </div>
  );
}

// VariantInput
function VariantInput({ value = [], onChange }: { value: any[]; onChange: (v: any[]) => void }) {
  const [name, setName] = React.useState("");
  const [features, setFeatures] = React.useState("");
  return (
    <div>
      <label className="block text-sm mb-1 font-medium">Variants</label>
      <div className="flex flex-col gap-2 mb-2">
        {value.map((v, i) => (
          <div key={i} className="bg-cyan-50 rounded p-2 flex items-center gap-2">
            <span className="font-semibold">{v.name}</span>
            <span className="text-xs text-gray-500">{v.features?.join(", ")}</span>
            <button type="button" className="ml-2 text-red-500" onClick={() => onChange(value.filter((_, idx) => idx !== i))}>&times;</button>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mb-2">
        <input type="text" value={name} onChange={e => setName(e.target.value)} className="border px-3 py-2 rounded w-1/3" placeholder="Variant name" />
        <input type="text" value={features} onChange={e => setFeatures(e.target.value)} className="border px-3 py-2 rounded w-2/3" placeholder="Features (comma separated)" />
        <button type="button" className="bg-cyan-500 text-white px-3 py-2 rounded" onClick={() => {
          if (name.trim()) {
            onChange([...value, { name: name.trim(), features: features.split(",").map(f => f.trim()).filter(Boolean) }]);
            setName("");
            setFeatures("");
          }
        }}>Add</button>
      </div>
    </div>
  );
}

// GroupedSpecsInput
const VEHICLE_SPEC_GROUPS = [
  {
    group: 'Engine & Performance',
    fields: [
      { key: 'Power', label: 'Power' },
      { key: 'Torque', label: 'Torque' },
      { key: 'Mileage', label: 'Mileage' },
      { key: 'Engine(cc)', label: 'Engine(cc)' },
    ]
  },
  {
    group: 'Transmission & Brakes',
    fields: []
  },
  {
    group: 'Features & Electricals',
    fields: []
  },
  {
    group: 'Dimensions & Comfort',
    fields: []
  }
];
function GroupedSpecsInput({ value = {}, onChange }: { value: Record<string, string>; onChange: (v: Record<string, string>) => void }) {
  const [openGroups, setOpenGroups] = React.useState(VEHICLE_SPEC_GROUPS.map(g => g.group));
  const [newSpecs, setNewSpecs] = React.useState<Record<string, { key: string; value: string }>>({});
  
  const handleInput = (key: string, val: string) => {
    onChange({ ...value, [key]: val });
  };

  const handleAddSpec = (groupName: string) => {
    const newKey = newSpecs[groupName]?.key || '';
    const newValue = newSpecs[groupName]?.value || '';
    if (newKey && newValue) {
      const specKey = `${groupName}_${newKey}`;
      handleInput(specKey, newValue);
      setNewSpecs(prev => ({ ...prev, [groupName]: { key: '', value: '' } }));
    }
  };

  const handleRemoveSpec = (key: string) => {
    const updatedValue = { ...value };
    delete updatedValue[key];
    onChange(updatedValue);
  };

  const getGroupSpecs = (groupName: string) => {
    return Object.entries(value).filter(([key]) => key.startsWith(`${groupName}_`));
  };

  // Function to categorize any uncategorized specs
  const categorizeUncategorizedSpecs = () => {
    const categorizedSpecs = { ...value };
    const uncategorizedKeys = Object.keys(value).filter(key => 
      !key.startsWith('Engine & Performance_') && 
      !key.startsWith('Transmission & Brakes_') && 
      !key.startsWith('Features & Electricals_') && 
      !key.startsWith('Dimensions & Comfort_') &&
      !['Engine(cc)', 'Power', 'Torque', 'Mileage'].includes(key)
    );
    
    // Move uncategorized specs to appropriate categories based on key names
    uncategorizedKeys.forEach(key => {
      const keyLower = key.toLowerCase();
      let newKey = key;
      
      if (keyLower.includes('engine') || keyLower.includes('power') || keyLower.includes('torque') || keyLower.includes('mileage') || keyLower.includes('performance')) {
        newKey = `Engine & Performance_${key}`;
      } else if (keyLower.includes('brake') || keyLower.includes('gear') || keyLower.includes('transmission') || keyLower.includes('tyre')) {
        newKey = `Transmission & Brakes_${key}`;
      } else if (keyLower.includes('electrical') || keyLower.includes('light') || keyLower.includes('instrument') || keyLower.includes('battery') || keyLower.includes('feature')) {
        newKey = `Features & Electricals_${key}`;
      } else if (keyLower.includes('length') || keyLower.includes('width') || keyLower.includes('height') || keyLower.includes('weight') || keyLower.includes('comfort') || keyLower.includes('dimension')) {
        newKey = `Dimensions & Comfort_${key}`;
      } else {
        // Default to Engine & Performance for any remaining specs
        newKey = `Engine & Performance_${key}`;
      }
      
      if (newKey !== key) {
        categorizedSpecs[newKey] = categorizedSpecs[key];
        delete categorizedSpecs[key];
      }
    });
    
    return categorizedSpecs;
  };

  return (
    <div className="space-y-4">
      {VEHICLE_SPEC_GROUPS.map(group => (
        <div key={group.group} className="border rounded-lg bg-gray-50">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-100 rounded-t-lg">
          <div
              className="flex items-center justify-between flex-1 cursor-pointer select-none"
            onClick={() => setOpenGroups(open => open.includes(group.group) ? open.filter(g => g !== group.group) : [...open, group.group])}
          >
            <span className="font-semibold text-gray-800">{group.group}</span>
            <span>{openGroups.includes(group.group) ? '▲' : '▼'}</span>
            </div>
            {group.group === 'Engine & Performance' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const categorized = categorizeUncategorizedSpecs();
                  onChange(categorized);
                }}
                className="ml-2 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                title="Categorize uncategorized specs"
              >
                Auto-Categorize
              </button>
            )}
          </div>
          {openGroups.includes(group.group) && (
            <div className="p-4 space-y-4">
              {/* Pre-defined fields for Engine & Performance */}
              {group.fields.length > 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.fields.map(field => (
                <div key={field.key} className="flex flex-col">
                  <label className="text-xs font-medium text-gray-600 mb-1">{field.label}</label>
                  <input
                    type="text"
                    className="border px-3 py-2 rounded"
                    value={value[field.key] || ''}
                    onChange={e => handleInput(field.key, e.target.value)}
                    placeholder={`Enter ${field.label}`}
                  />
                </div>
              ))}
                  </div>
                  
                  {/* Additional custom specs for Engine & Performance */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Additional Engine & Performance Specs</h4>
                    {/* Existing custom specs in this group */}
                    {getGroupSpecs(group.group).map(([key, val]) => (
                      <div key={key} className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={key.replace(`${group.group}_`, '')}
                          onChange={(e) => {
                            const newKey = `${group.group}_${e.target.value}`;
                            const updatedValue = { ...value };
                            delete updatedValue[key];
                            updatedValue[newKey] = val;
                            onChange(updatedValue);
                          }}
                          className="border px-3 py-2 rounded text-sm flex-1"
                          placeholder="Specification name"
                        />
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => handleInput(key, e.target.value)}
                          className="border px-3 py-2 rounded text-sm flex-1"
                          placeholder="Value"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSpec(key)}
                          className="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    
                    {/* Add new custom spec */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newSpecs[group.group]?.key || ''}
                        onChange={(e) => setNewSpecs(prev => ({ 
                          ...prev, 
                          [group.group]: { 
                            key: e.target.value, 
                            value: prev[group.group]?.value || '' 
                          } 
                        }))}
                        placeholder="Specification name"
                        className="border px-3 py-2 rounded text-sm flex-1"
                      />
                      <input
                        type="text"
                        value={newSpecs[group.group]?.value || ''}
                        onChange={(e) => setNewSpecs(prev => ({ 
                          ...prev, 
                          [group.group]: { 
                            key: prev[group.group]?.key || '', 
                            value: e.target.value 
                          } 
                        }))}
                        placeholder="Value"
                        className="border px-3 py-2 rounded text-sm flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddSpec(group.group)}
                        className="bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600"
                      >
                        Add
                      </button>
                    </div>
                  </div>
            </div>
          )}
              
              {/* Custom specifications for other groups */}
              {group.fields.length === 0 && (
                <div className="space-y-3">
                  {/* Existing specs in this group */}
                  {getGroupSpecs(group.group).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={key.replace(`${group.group}_`, '')}
                        onChange={(e) => {
                          const newKey = `${group.group}_${e.target.value}`;
                          const updatedValue = { ...value };
                          delete updatedValue[key];
                          updatedValue[newKey] = val;
                          onChange(updatedValue);
                        }}
                        className="border px-3 py-2 rounded text-sm flex-1"
                        placeholder="Specification name"
                      />
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => handleInput(key, e.target.value)}
                        className="border px-3 py-2 rounded text-sm flex-1"
                        placeholder="Value"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(key)}
                        className="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  
                  {/* Add new spec */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newSpecs[group.group]?.key || ''}
                      onChange={(e) => setNewSpecs(prev => ({ 
                        ...prev, 
                        [group.group]: { 
                          key: e.target.value, 
                          value: prev[group.group]?.value || '' 
                        } 
                      }))}
                      placeholder="Specification name"
                      className="border px-3 py-2 rounded text-sm flex-1"
                    />
                    <input
                      type="text"
                      value={newSpecs[group.group]?.value || ''}
                      onChange={(e) => setNewSpecs(prev => ({ 
                        ...prev, 
                        [group.group]: { 
                          key: prev[group.group]?.key || '', 
                          value: e.target.value 
                        } 
                      }))}
                      placeholder="Value"
                      className="border px-3 py-2 rounded text-sm flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSpec(group.group)}
                      className="bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// FaqsInput
function FaqsInput({ value = [], onChange }: { value: any[]; onChange: (v: any[]) => void }) {
  const [q, setQ] = React.useState("");
  const [a, setA] = React.useState("");
  return (
    <div>
      <label className="block text-sm mb-1 font-medium">FAQs</label>
      <div className="flex flex-col gap-2 mb-2">
        {value.map((f, i) => (
          <div key={i} className="bg-fuchsia-50 rounded p-2 flex items-center gap-2">
            <span className="font-semibold">Q:</span> {f.question}
            <span className="font-semibold ml-2">A:</span> {f.answer}
            <button type="button" className="ml-2 text-red-500" onClick={() => onChange(value.filter((_, idx) => idx !== i))}>&times;</button>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mb-2">
        <input type="text" value={q} onChange={e => setQ(e.target.value)} className="border px-3 py-2 rounded w-1/2" placeholder="Question" />
        <input type="text" value={a} onChange={e => setA(e.target.value)} className="border px-3 py-2 rounded w-1/2" placeholder="Answer" />
        <button type="button" className="bg-fuchsia-500 text-white px-3 py-2 rounded" onClick={() => {
          if (q.trim() && a.trim()) {
            onChange([...value, { question: q.trim(), answer: a.trim() }]);
            setQ("");
            setA("");
          }
        }}>Add</button>
      </div>
    </div>
  );
}

// ColorInput
const COLOR_PALETTE = [
  { name: "Red", hex: "#E53935" },
  { name: "Black", hex: "#222" },
  { name: "White", hex: "#FFF" },
  { name: "Blue", hex: "#1E88E5" },
  { name: "Silver", hex: "#C0C0C0" },
  { name: "Grey", hex: "#757575" },
  { name: "Green", hex: "#43A047" },
  { name: "Yellow", hex: "#FDD835" },
  { name: "Maroon", hex: "#800000" },
  { name: 'Orange', hex: '#FFA500' },
  { name: 'Purple', hex: '#800080' },
];
function ColorInput({ value = [], onChange }: { value: any[]; onChange: (v: any[]) => void }) {
  const [selectedColor, setSelectedColor] = React.useState(COLOR_PALETTE[0].hex);
  const [images, setImages] = React.useState<any[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const CLOUDINARY_UPLOAD_PRESET = (import.meta as any).env.VITE_CLOUDINARY_UPLOAD_PRESET || "";
  const CLOUDINARY_CLOUD_NAME = (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME || "";
  const handleImageUpload = async (file: File) => {
    if (images.length >= 5) return false;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    setUploading(false);
    if (data.secure_url) setImages(imgs => [...imgs, data.secure_url]);
    return false;
  };
  const selectedColorObj = COLOR_PALETTE.find(c => c.hex === selectedColor);
  React.useEffect(() => { setImages([]); }, [selectedColor]);
  const handleAddColor = () => {
    if (!selectedColor || images.length === 0) return;
    if (value.length >= 5) return;
    if (value.some(c => c.hex === selectedColor)) return;
    onChange([...value, { name: selectedColorObj?.name, hex: selectedColor, images }]);
    setImages([]);
  };
  return (
    <div className="mb-4">
      <label className="block text-sm mb-1 font-medium">Available Colors (max 5)</label>
      <div className="flex gap-3 mb-2">
        {COLOR_PALETTE.map(c => (
          <button
            key={c.hex}
            type="button"
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${selectedColor === c.hex ? 'border-emerald-500 ring-2 ring-emerald-300' : 'border-gray-300'}`}
            style={{ background: c.hex }}
            title={c.name}
            onClick={() => { setSelectedColor(c.hex); }}
            disabled={!!value.find(v => v.hex === c.hex)}
          >
            {selectedColor === c.hex && <span className="w-3 h-3 bg-white rounded-full border border-emerald-500"></span>}
          </button>
        ))}
      </div>
      <div className="flex gap-2 items-center mb-2">
        <span className="text-xs text-gray-600 w-16">{selectedColorObj?.name}</span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={e => {
            if (e.target.files) {
              const files = Array.from(e.target.files);
              files.forEach(file => handleImageUpload(file));
            }
          }}
        />
        <button type="button" className="bg-emerald-500 text-white px-3 py-2 rounded" onClick={handleAddColor} disabled={images.length === 0 || value.length >= 5}>
          Add
        </button>
      </div>
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {images.map((img, idx) => (
            <div key={idx} className="relative group">
              <img src={img} alt={`preview-${idx}`} className="w-16 h-16 object-cover rounded border" />
              <button
                type="button"
                className="absolute top-0 right-0 bg-white bg-opacity-80 text-red-500 rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition"
                onClick={() => setImages(imgs => imgs.filter((_, i) => i !== idx))}
                title="Remove image"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((c, i) => (
          <div key={i} className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded">
            <span className="w-4 h-4 rounded-full border" style={{ background: c.hex }}></span>
            <span>{c.name}</span>
            <div className="flex gap-1">
              {c.images && c.images.map((img, idx) => (
                <img key={idx} src={img} alt={c.name} className="w-8 h-8 object-cover rounded border" />
              ))}
            </div>
            <button type="button" className="ml-1 text-red-500" onClick={() => onChange(value.filter((_, idx) => idx !== i))}>&times;</button>
          </div>
        ))}
      </div>
      {value.length >= 5 && <div className="text-xs text-red-500">Maximum 5 colors allowed.</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  
  // Check authentication on component mount
  React.useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    const token = localStorage.getItem('adminToken');
    
    if (!isAdmin || !token) {
      navigate('/admin-login');
      return;
    }
  }, [navigate]);

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [preBookings, setPreBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [akrTab, setAkrTab] = useState<'vehicles' | 'prebookings' | 'customers' | 'overview' | 'settings'>('overview');
  const [selectedPreBooking, setSelectedPreBooking] = useState<any>(null);
  const [preBookingLoading, setPreBookingLoading] = useState(false);
  const [preBookingError, setPreBookingError] = useState("");
  const [preBookingSearch, setPreBookingSearch] = useState('');
  const [preBookingStatus, setPreBookingStatus] = useState('All');
  const [statusUpdating, setStatusUpdating] = useState(false);
  // --- Add Vehicle Multi-Step Form State ---
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addVehicleLoading, setAddVehicleLoading] = useState(false);
  const [addVehicleError, setAddVehicleError] = useState("");
  const [addStep, setAddStep] = useState(0);
  const ADD_STEPS = ["Basic Info", "Features & Specs", "Colors", "Variants", "FAQs & Gallery"];
  const [galleryImageFiles, setGalleryImageFiles] = useState<File[]>([]);
  const [galleryImagePreviews, setGalleryImagePreviews] = useState<string[]>([]);
  const [galleryImageUploading, setGalleryImageUploading] = useState(false);
  const [vehicleForm, setVehicleForm] = useState<any>({
    vehicleType: "Motorcycle",
    name: "",
    category: "",
    price: "",
    description: "",
    features: [],
    specs: {},
    colors: [],
    variants: [],
    faqs: [],
    images: [],
    galleryImages: [],
    rating: ""
  });
  const [selectedCompany, setSelectedCompany] = React.useState<any>({
    _id: "686e05c8f245342ad54d6eb9",
    name: "AKR & SONS (PVT) LTD"
  });
  const [companies, setCompanies] = useState<any[]>([]);
  // Add state for grid/list view toggle
  const [vehicleView, setVehicleView] = useState<'grid' | 'list'>('grid');
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [detailsVehicle, setDetailsVehicle] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editVehicleData, setEditVehicleData] = useState<any>(null);
  const [editStep, setEditStep] = useState(0);
  const EDIT_STEPS = ["Basic Info", "Features & Specs", "Colors", "Variants", "FAQs & Gallery"];
  // Add state for search
  const [vehicleSearch, setVehicleSearch] = useState('');
  // Add state for gallery image uploads in edit modal
  const [editGalleryImageFiles, setEditGalleryImageFiles] = useState<File[]>([]);
  const [editGalleryImagePreviews, setEditGalleryImagePreviews] = useState<string[]>([]);
  const [editGalleryImageUploading, setEditGalleryImageUploading] = useState(false);
  // Add state for selected vehicle price
  const [selectedVehiclePrice, setSelectedVehiclePrice] = useState<number>(0);
  const [selectedCustomerPurchase, setSelectedCustomerPurchase] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
  const [selectedCustomerPurchases, setSelectedCustomerPurchases] = useState<any[]>([]);
  const [rawCustomerData, setRawCustomerData] = useState<any[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  // Settings state
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
      twitter: string 
    }; 
    openingHours?: string[];
    specialOffers?: Array<{
      title: string;
      description: string;
      condition: string;
      icon: string;
    }>;
  };
  const [settings, setSettings] = useState<SettingsType>({ mode: 'online', bannerImages: [], bannerText: '', bannerHeading: '', bannerSubheading: '', phone: '', email: '', address: '', companyName: '', socialLinks: { facebook: '', instagram: '', whatsapp: '', twitter: '' }, openingHours: [], specialOffers: [] });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [bannerImageFiles, setBannerImageFiles] = useState<File[]>([]);
  // --- Add state for brochure file in add/edit modals ---
  const [brochureFile, setBrochureFile] = useState<File | null>(null);
  const [editBrochureFile, setEditBrochureFile] = useState<File | null>(null);
  // Add state for brochure uploading
  const [brochureUploading, setBrochureUploading] = useState(false);
  const [editBrochureUploading, setEditBrochureUploading] = useState(false);
  // Logout handler
  const handleLogout = () => {
    // Clear all admin-related data
    localStorage.removeItem('adminToken');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminName');
    localStorage.removeItem('adminEmail');
    navigate('/admin-login');
  };

  // Fetch settings on mount or when tab is settings
  useEffect(() => {
    if (akrTab === 'settings') {
      setSettingsLoading(true);
      fetch(`${import.meta.env.VITE_API_URL}/api/settings`)
        .then(res => res.json())
        .then(data => setSettings(data))
        .finally(() => setSettingsLoading(false));
    }
  }, [akrTab]);

  // Banner image upload handler (multiple)
  const handleBannerImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setBannerImageFiles(files);
      // Show previews
      Promise.all(files.map(file => {
        return new Promise<string>(resolve => {
          const reader = new FileReader();
          reader.onload = ev => resolve(ev.target?.result as string);
          reader.readAsDataURL(file);
        });
      })).then(imgs => setSettings(s => ({ ...s, bannerImages: imgs as string[] })));
    }
  };

  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    let bannerImageUrls: string[] = settings.bannerImages || [];
    if (bannerImageFiles.length > 0) {
      // Upload all to Cloudinary
      const urls: string[] = [];
      for (const file of bannerImageFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', (import.meta as any).env.VITE_CLOUDINARY_UPLOAD_PRESET || '');
        const res = await fetch(`https://api.cloudinary.com/v1_1/${(import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME || ''}/image/upload`, {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.secure_url) urls.push(data.secure_url);
      }
      bannerImageUrls = urls;
    }
    
    const requestBody = { 
      ...settings, 
      bannerImages: bannerImageUrls, 
      bannerHeading: settings.bannerHeading, 
      bannerSubheading: settings.bannerSubheading, 
      socialLinks: settings.socialLinks, 
      openingHours: settings.openingHours,
      specialOffers: settings.specialOffers || []
    };
    
    console.log('Saving settings with special offers:', requestBody.specialOffers);
    
    await fetch(`${import.meta.env.VITE_API_URL}/api/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    })
      .then(res => res.json())
      .then(data => { 
        console.log('Settings saved successfully:', data);
        setSettings(data); 
        setBannerImageFiles([]); 
        message.success('Settings saved'); 
      })
      .catch((error) => {
        console.error('Failed to save settings:', error);
        message.error('Failed to save settings');
      })
      .finally(() => setSettingsSaving(false));
  };

  // Handler to open details drawer
  const openDetailsDrawer = (vehicle: any) => {
    setDetailsVehicle(vehicle);
    setDetailsDrawerOpen(true);
  };
  const closeDetailsDrawer = () => {
    setDetailsDrawerOpen(false);
    setDetailsVehicle(null);
  };
  // Handler to open edit modal
  const openEditModal = (vehicle: any) => {
    console.log('Opening edit modal for vehicle:', vehicle);
    console.log('Gallery images:', vehicle.galleryImages);
    setEditVehicleData({ ...vehicle });
    setEditStep(0);
    setEditModalOpen(true);
  };
  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditVehicleData(null);
  };
  // Handler to delete vehicle
  const deleteVehicle = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vehicles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        message.success('Vehicle deleted');
        if (selectedCompany) fetchVehicles(selectedCompany._id);
        closeDetailsDrawer();
      } else {
        message.error('Failed to delete vehicle');
      }
    } catch {
      message.error('Failed to delete vehicle');
    }
  };
  // Handler to save edited vehicle
  const handleEditVehicleSubmit = async () => {
    if (!editVehicleData) return;
    setAddVehicleLoading(true);
    setAddVehicleError("");
    try {
      let galleryImageUrls: string[] = [];
      if (editGalleryImageFiles.length > 0) {
        galleryImageUrls = await uploadEditGalleryImagesToCloudinary();
      }
      console.log('Brochure before submit (edit):', editVehicleData.brochure);
      const payload = {
        ...editVehicleData,
        galleryImages: galleryImageUrls.length > 0 ? galleryImageUrls : editVehicleData.galleryImages || [],
        brochure: editVehicleData.brochure || ""
      };
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vehicles/${editVehicleData._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );
      if (!res.ok) throw new Error("Failed to update vehicle");
      
      // Show success message
      if (galleryImageUrls.length > 0) {
        message.success(`Vehicle updated successfully with ${galleryImageUrls.length} new gallery image(s)!`);
      } else {
        message.success('Vehicle updated successfully!');
      }
      
      setEditModalOpen(false);
      setEditVehicleData(null);
      setEditBrochureFile(null);
      setEditGalleryImageFiles([]);
      setEditGalleryImagePreviews([]);
      // Refresh vehicles
      if (selectedCompany) fetchVehicles(selectedCompany._id);
    } catch (err) {
      setAddVehicleError("Failed to update vehicle. Please check your input.");
    } finally {
      setAddVehicleLoading(false);
    }
  };

  // Handler for gallery image file input in edit modal
  function handleEditGalleryImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setEditGalleryImageFiles(files);
      setEditGalleryImagePreviews(files.map(file => URL.createObjectURL(file)));
    }
  }
  // Upload gallery images to Cloudinary for edit modal
  async function uploadEditGalleryImagesToCloudinary() {
    if (!CLOUDINARY_UPLOAD_PRESET || !CLOUDINARY_CLOUD_NAME) return [];
    setEditGalleryImageUploading(true);
    const urls: string[] = [];
    try {
    for (const file of editGalleryImageFiles) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.secure_url) urls.push(data.secure_url);
    }
    return urls;
    } finally {
      setEditGalleryImageUploading(false);
    }
  }

  // Add fetchVehicles function
  const fetchVehicles = (companyId: string) => {
    fetch(`${import.meta.env.VITE_API_URL}/api/vehicles/company/${companyId}`)
      .then(res => res.json())
      .then(setVehicles)
      .catch(() => setVehicles([]));
  };

  // On mount, fetch companies and set selectedCompany to AKR & SONS, then fetch vehicles
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/companies`)
      .then(res => res.json())
      .then(data => {
        setCompanies(data);
        const akr = data.find((c: any) => c.name === AKR_COMPANY_NAME);
        setSelectedCompany(akr || (data[0] || null));
        if (akr) {
          fetchVehicles(akr._id);
          setAkrTab('vehicles');
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load companies");
        setLoading(false);
      });
  }, []);

  // After adding a vehicle, refresh vehicles
  const handleAddVehicle = async () => {
    setAddVehicleLoading(true);
    setAddVehicleError("");
    if (!vehicleForm.name || !vehicleForm.price) {
      setAddVehicleError("Name and price are required.");
      setAddVehicleLoading(false);
      return;
    }
    try {
      let galleryImageUrls: string[] = [];
      if (galleryImageFiles.length > 0) {
        galleryImageUrls = await uploadGalleryImagesToCloudinary();
      }
      console.log('Brochure before submit:', vehicleForm.brochure);
      console.log('Specs before submit:', vehicleForm.specs);
      console.log('Category before submit:', vehicleForm.category);
      console.log('Full vehicleForm:', vehicleForm);
      const payload = {
        ...vehicleForm,
        price: Number(vehicleForm.price),
        galleryImages: galleryImageUrls.length > 0 ? galleryImageUrls : vehicleForm.galleryImages || [],
        company: selectedCompany?._id,
        brochure: vehicleForm.brochure || ""
      };
      console.log('Full payload:', payload);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vehicles/company/${selectedCompany?._id}`,
        {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
        }
      );
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Server error response:', errorText);
        throw new Error(`Failed to add vehicle: ${res.status} ${res.statusText}`);
      }
      
      // Show success message
      if (galleryImageUrls.length > 0) {
        message.success(`Vehicle added successfully with ${galleryImageUrls.length} gallery image(s)!`);
      } else {
        message.success('Vehicle added successfully!');
      }
      
      setAddModalOpen(false);
      setVehicleForm({ vehicleType: "Motorcycle", name: "", category: "", price: "", description: "", features: [], specs: {}, colors: [], variants: [], faqs: [], images: [], galleryImages: [], rating: "" });
      setGalleryImageFiles([]);
      setGalleryImagePreviews([]);
      setBrochureFile(null);
      setAddStep(0);
      // Refresh vehicles
      if (selectedCompany) fetchVehicles(selectedCompany._id);
    } catch (err) {
      setAddVehicleError("Failed to add vehicle. Please check your input.");
    } finally {
      setAddVehicleLoading(false);
    }
  };

  // Cloudinary config (replace with your env vars or hardcode for now)
  const CLOUDINARY_UPLOAD_PRESET = (import.meta as any).env.VITE_CLOUDINARY_UPLOAD_PRESET || "";
  const CLOUDINARY_CLOUD_NAME = (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME || "";

  const uploadGalleryImagesToCloudinary = async () => {
    if (!CLOUDINARY_UPLOAD_PRESET || !CLOUDINARY_CLOUD_NAME) return [];
    setGalleryImageUploading(true);
    const urls: string[] = [];
    try {
    for (const file of galleryImageFiles) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.secure_url) urls.push(data.secure_url);
    }
    return urls;
    } finally {
      setGalleryImageUploading(false);
    }
  };

  const handleFeatureChange = (features: string[]) => setVehicleForm(f => ({ ...f, features }));
  const handleVariantChange = (variants: any[]) => setVehicleForm(f => ({ ...f, variants }));
  const handleSpecsChange = (specs: any) => setVehicleForm(f => ({ ...f, specs }));
  const handleFaqsChange = (faqs: any[]) => setVehicleForm(f => ({ ...f, faqs }));
  const handleColorsChange = (colors: any[]) => setVehicleForm(f => ({ ...f, colors }));

  const handleAddVehicleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log('Form field change:', name, value);
    setVehicleForm(f => ({ ...f, [name]: value }));
  };

  // Handler for gallery image file input in Add Vehicle modal
  function handleGalleryImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setGalleryImageFiles(files);
      setGalleryImagePreviews(files.map(file => URL.createObjectURL(file)));
    }
  }

  useEffect(() => {
    setPreBookingLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/prebookings`)
      .then(res => {
        if (!res.ok) throw new Error("Status " + res.status + ": " + res.statusText);
        return res.json();
      })
      .then(data => {
        setPreBookings(data);
        setPreBookingLoading(false);
      })
      .catch((err) => {
        setPreBookingError("Failed to load pre-bookings: " + err.message);
        setPreBookingLoading(false);
      });
  }, []);

  // Sidebar
  const renderSidebar = (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Menu
            mode="inline"
        defaultSelectedKeys={[`vehicles`]}
        defaultOpenKeys={['akr-sons', 'prebookings']}
        openKeys={['akr-sons', 'prebookings']}
        style={{ flex: 1, borderRight: 0 }}
        items={[{
          key: 'akr-sons',
          label: AKR_COMPANY_NAME,
                    children: [
                      {
              key: 'overview',
              label: 'Overview',
              icon: <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22 }}><BookOutlined style={{ fontSize: 20 }} /></span>,
              onClick: () => setAkrTab('overview')
            },
            {
              key: `vehicles`,
                        label: 'Vehicles',
                        icon: <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22 }}><CarOutlined style={{ fontSize: 20 }} /></span>,
              onClick: () => setAkrTab('vehicles')
            },
            {
              key: `prebookings`,
                        label: 'Pre-Bookings',
                        icon: <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22 }}><BookOutlined style={{ fontSize: 20 }} /></span>,
              children: [
                { key: 'prebookings-inquiries', label: 'Inquiries', onClick: () => { setAkrTab('prebookings'); setPreBookingStatus('Pending'); } },
                { key: 'prebookings-ordered', label: 'Ordered', onClick: () => { setAkrTab('prebookings'); setPreBookingStatus('Ordered'); } },
                { key: 'prebookings-delivered', label: 'Delivered', onClick: () => { setAkrTab('prebookings'); setPreBookingStatus('Delivered'); } },
                { key: 'prebookings-cancelled', label: 'Cancelled', onClick: () => { setAkrTab('prebookings'); setPreBookingStatus('Cancelled'); } },
                { key: 'prebookings-all', label: 'All', onClick: () => { setAkrTab('prebookings'); setPreBookingStatus('All'); } },
              ]
            },
            {
              key: `customers`,
              label: 'Customers',
              icon: <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22 }}><UserOutlined style={{ fontSize: 20 }} /></span>,
              onClick: () => setAkrTab('customers')
            },
            {
              key: 'settings',
              label: 'Settings',
              icon: <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22 }}><SettingOutlined style={{ fontSize: 20 }} /></span>,
              onClick: () => setAkrTab('settings')
            }
          ]
        }]}
      />
      <div style={{ padding: 24 }}>
        <Button onClick={handleLogout} type="default" danger block>Logout</Button>
        </div>
    </div>
  );

  // Pre-booking columns
  const preBookingColumns = [
    { title: 'Booking ID', dataIndex: 'bookingId', key: 'bookingId' },
    { title: 'Customer', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Vehicle Model', dataIndex: 'vehicleModel', key: 'vehicleModel' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: any) => {
        let options: { value: string, label: string }[] = [];
        let disabled = false;
        if (status === 'Pending') {
          options = [
            { value: 'Ordered', label: 'Ordered' },
            { value: 'Cancelled', label: 'Cancelled' }
          ];
        } else if (status === 'Ordered') {
          options = [
            { value: 'Delivered', label: 'Delivered' },
            { value: 'Cancelled', label: 'Cancelled' }
          ];
        } else {
          disabled = true;
        }
        if (disabled) {
          return <span>{status}</span>;
        }
        return (
          <select
          value={status}
            onChange={async (e) => {
            setStatusUpdating(true);
              const newStatus = e.target.value;
            try {
              const res = await fetch(`${import.meta.env.VITE_API_URL}/api/prebookings/${record._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ status: newStatus })
              });
              if (res.ok) {
                  // Await refetch and update state before showing message
                  const bookingsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/prebookings`);
                  const bookingsData = await bookingsRes.json();
                  setPreBookings(bookingsData);
                  if (preBookingStatus !== 'All' && newStatus !== preBookingStatus) {
                    message.success(`Status updated and moved to ${newStatus}`);
                  } else {
                message.success('Status updated');
                  }
              } else {
                message.error('Failed to update status');
              }
            } catch {
              message.error('Failed to update status');
            }
            setStatusUpdating(false);
          }}
            disabled={statusUpdating}
            style={{ minWidth: 100 }}
          >
            <option value={status} disabled>{status}</option>
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
      }
    },
    { title: 'Created At', dataIndex: 'createdAt', key: 'createdAt', render: (date: string) => new Date(date).toLocaleString() },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Button type="link" onClick={() => setSelectedPreBooking(record)}>View Details</Button>
      )
    }
  ];

  // Filtered bookings
  const filteredPreBookings = preBookings.filter(b =>
    (preBookingStatus === 'All' || b.status === preBookingStatus) &&
    (b.fullName.toLowerCase().includes(preBookingSearch.toLowerCase()) || b.vehicleModel.toLowerCase().includes(preBookingSearch.toLowerCase()))
  );

  // Add export CSV function
  const exportVehiclesToCSV = (vehicles: any[]) => {
    if (!vehicles.length) return;
    const header = [
      'Name', 'Type', 'Category', 'Price', 'Description', 'Features', 'Specs', 'Colors', 'Variants', 'FAQs', 'Created At'
    ];
    const rows = vehicles.map(v => [
      v.name,
      v.vehicleType,
      v.category,
      v.price,
      v.description,
      v.features?.join('; '),
      v.specs && typeof v.specs === 'object' ? Object.entries(v.specs).map(([k, val]) => `${k}: ${val}`).join('; ') : '',
      v.colors?.map((c: any) => `${c.name} (${c.hex})`).join('; '),
      v.variants?.map((v: any) => v.name).join('; '),
      v.faqs?.map((f: any) => `Q:${f.question} A:${f.answer}`).join('; '),
      v.createdAt ? new Date(v.createdAt).toLocaleString() : ''
    ]);
    const csv = [header, ...rows].map(r => r.map(x => '"' + String(x).replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'vehicles.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add export CSV function for pre-bookings
  const exportPreBookingsToCSV = (bookings: any[]) => {
    if (!bookings.length) return;
    const header = [
      'Booking ID', 'Customer', 'Email', 'Phone', 'National ID', 'Address', 'Vehicle Model', 'Status', 'Notes', 'Created At'
    ];
    const rows = bookings.map(b => [
      b.bookingId, b.fullName, b.email, b.phone, b.nationalId, b.address, b.vehicleModel, b.status, b.notes || '', new Date(b.createdAt).toLocaleString()
    ]);
    const csv = [header, ...rows].map(r => r.map(x => '"' + String(x).replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'prebookings.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered vehicles
  const filteredVehicles = vehicles.filter(v =>
    v.name.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
    v.category.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
    v.vehicleType.toLowerCase().includes(vehicleSearch.toLowerCase())
  );

  // Customers state and fetch
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerError, setCustomerError] = useState("");
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [customerForm, setCustomerForm] = useState<any>({
    name: "",
    email: "",
    phone: "",
    address: "",
    vehicle: "",
    vehicleModel: "",
    fullAmountPaid: false,
    downPayment: 0,
    leasing: false,
    leasingProvider: "",
    purchaseDate: "",
    notes: ""
  });
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  // Add state for customer stepper
  const [customerStep, setCustomerStep] = useState(0);
  const CUSTOMER_STEPS = ["Customer Info", "Vehicle Info", "Payment/Leasing Info"];
  // Add state for purchase date error
  const [purchaseDateError, setPurchaseDateError] = useState("");
  // Add state for duplicate customer check
  const [duplicateCustomer, setDuplicateCustomer] = useState<any>(null);
  const [showDuplicatePrompt, setShowDuplicatePrompt] = useState(false);
  const [forceNewCustomer, setForceNewCustomer] = useState(false);

  const fetchCustomers = () => {
    setCustomerLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/customers/raw`)
      .then(res => res.json())
      .then(data => {
        setRawCustomerData(data);
        // Group purchases by customer, show latest in main table, all in expandable
        const groupedCustomers = Array.isArray(data) ? data.map(c => {
          const sortedPurchases = [...(c.purchases || [])].sort((a, b) => {
            const dateA = a && a.purchaseDate ? new Date(a.purchaseDate).getTime() : 0;
            const dateB = b && b.purchaseDate ? new Date(b.purchaseDate).getTime() : 0;
            return dateB - dateA;
          });
          return {
            ...c,
            latestPurchase: sortedPurchases[0] || {},
            allPurchases: sortedPurchases
          };
        }) : [];
        setCustomers(groupedCustomers);
      })
      .catch(() => setCustomers([]))
      .finally(() => setCustomerLoading(false));
  };
  useEffect(() => {
    if (akrTab === 'customers' || akrTab === 'overview') fetchCustomers();
  }, [akrTab]);
  useEffect(() => {
    fetchCustomers();
  }, []);

  // In handleCustomerFormChange, add logic for down payment and duplicate email check
  const handleCustomerFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    if (name === 'downPayment') {
      const down = Number(value);
      if (selectedVehiclePrice > 0 && down >= selectedVehiclePrice) {
        setCustomerForm(f => ({ ...f, downPayment: selectedVehiclePrice, fullAmountPaid: true }));
        return;
      }
      setCustomerForm(f => ({ ...f, downPayment: down, fullAmountPaid: false }));
      return;
    }
    if (name === 'fullAmountPaid') {
      if (checked) {
        setCustomerForm(f => ({ ...f, fullAmountPaid: true, downPayment: selectedVehiclePrice }));
      } else {
        setCustomerForm(f => ({ ...f, fullAmountPaid: false, downPayment: 0 }));
      }
      return;
    }
    if (name === 'purchaseDate') {
      const today = new Date().toISOString().slice(0, 10);
      if (value > today) {
        setPurchaseDateError("Purchase date cannot be in the future.");
        setCustomerForm(f => ({ ...f, purchaseDate: today }));
        return;
      } else {
        setPurchaseDateError("");
      }
    }
    // Check for duplicate email (case-insensitive)
    if (name === 'email') {
      const match = customers.find(c => c.email && c.email.trim().toLowerCase() === value.trim().toLowerCase());
      if (match) {
        setDuplicateCustomer(match);
        setShowDuplicatePrompt(true);
        setForceNewCustomer(false);
      } else {
        setDuplicateCustomer(null);
        setShowDuplicatePrompt(false);
        setForceNewCustomer(false);
      }
    }
    setCustomerForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };
  const handleCustomerVehicleChange = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v._id === vehicleId);
    setCustomerForm(f => ({ ...f, vehicle: vehicleId, vehicleModel: vehicle?.name || "" }));
    setSelectedVehiclePrice(vehicle?.price || 0);
  };
  const handleAddCustomer = async () => {
    if (showDuplicatePrompt) return;
    setCustomerLoading(true);
    try {
      let formToSend = { ...customerForm };
      if (forceNewCustomer) {
        formToSend.email = customerForm.email + "." + Date.now(); // Make email unique
      }
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formToSend)
      });
      if (!res.ok) throw new Error("Failed to add customer");
      setCustomerModalOpen(false);
      setCustomerForm({ name: "", email: "", phone: "", address: "", vehicle: "", vehicleModel: "", fullAmountPaid: false, downPayment: 0, leasing: false, leasingProvider: "", purchaseDate: "", notes: "" });
      setForceNewCustomer(false);
      fetchCustomers();
      message.success("Customer added");
    } catch {
      message.error("Failed to add customer");
    } finally {
      setCustomerLoading(false);
    }
  };
  const handleEditCustomer = (customer: any) => {
    setEditingCustomer(customer);
    setCustomerForm({ ...customer, vehicle: customer.vehicle?._id || customer.vehicle });
    setCustomerStep(0); // Reset step to 0 for editing
    setCustomerModalOpen(true);
  };
  const handleUpdateCustomer = async () => {
    if (showDuplicatePrompt) return;
    setCustomerLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/customers/${editingCustomer._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerForm)
      });
      if (!res.ok) throw new Error("Failed to update customer");
      setCustomerModalOpen(false);
      setEditingCustomer(null);
      setCustomerForm({ name: "", email: "", phone: "", address: "", vehicle: "", vehicleModel: "", fullAmountPaid: false, downPayment: 0, leasing: false, leasingProvider: "", purchaseDate: "", notes: "" });
      fetchCustomers();
      message.success("Customer updated");
    } catch {
      message.error("Failed to update customer");
    } finally {
      setCustomerLoading(false);
    }
  };
  const handleDeleteCustomer = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    setCustomerLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/customers/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      fetchCustomers();
      message.success("Customer deleted");
    } catch {
      message.error("Failed to delete customer");
    } finally {
      setCustomerLoading(false);
    }
  };

  // Add exportCustomersToCSV function after exportPreBookingsToCSV
  const exportCustomersToCSV = (customers: any[]) => {
    if (!customers.length) return;
    const header = [
      'Name', 'Email', 'Phone', 'Address', 'Vehicle', 'Full Paid', 'Down Payment', 'Leasing', 'Leasing Provider', 'Purchase Date', 'Notes'
    ];
    const rows = customers.map(c => [
      c.name,
      c.email,
      c.phone,
      c.address,
      c.vehicleModel || (c.vehicle && c.vehicle.name) || '',
      c.fullAmountPaid ? 'Yes' : 'No',
      c.fullAmountPaid ? (c.vehicle?.price || c.downPayment) : c.downPayment,
      c.leasing ? 'Yes' : 'No',
      c.leasingProvider || '',
      c.purchaseDate ? new Date(c.purchaseDate).toLocaleDateString() : '',
      c.notes || ''
    ]);
    const csv = [header, ...rows].map(r => r.map(x => '"' + String(x).replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'customers.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  console.log("Customers table data:", customers);
  console.log("rawCustomerData (backend):", rawCustomerData);

  // Filter customers by search
  const filteredCustomers = customers.filter(c => {
    const q = customerSearch.trim().toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.toLowerCase().includes(q))
    );
  });

  // Add this helper for PDF upload to Cloudinary
  async function uploadBrochurePdfToCloudinary(file) {
    const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    // Use /raw/upload endpoint for PDFs
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!data.secure_url) throw new Error('Failed to upload PDF');
    return data.secure_url;
  }

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auto-refresh activity every 10 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      // Refresh activity data (customize as needed)
      if (akrTab === 'overview') {
        // Call your fetch functions for activity/overview
        fetchPreBookings();
        fetchCustomers();
        // Add more as needed
      }
    }, 600000); // 10 minutes
    return () => clearInterval(interval);
  }, [akrTab]);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-emerald-50 via-white to-cyan-100">
      {/* Hamburger menu for mobile */}
      <div className="md:hidden">
        <div className="fixed top-4 left-4 z-50">
          <button onClick={() => setSidebarOpen(true)} className="text-2xl p-2 focus:outline-none bg-white rounded-full shadow">
            <MenuOutlined />
          </button>
        </div>
      </div>
      {/* Sidebar */}
      <div className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${sidebarOpen ? 'block' : 'hidden'} md:hidden`} onClick={() => setSidebarOpen(false)} />
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:translate-x-0 md:block`}>
        <button className="md:hidden absolute top-4 left-4 text-2xl z-50" style={{ zIndex: 100 }} onClick={() => setSidebarOpen(false)}>&times;</button>
        {renderSidebar}
      </aside>
      {/* Main content area */}
      <main className="flex-1 p-2 sm:p-4 md:p-8 overflow-x-auto">
        {/* Place all dashboard content here, including header, tables, etc. */}
        <header className="glass-card sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-5 border-b border-white/10 shadow-md">
          <span className="text-2xl font-bold gradient-text">Admin Dashboard</span>
          <Button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-semibold rounded px-4 py-2">Logout</Button>
        </header>
        <Layout.Content className="flex-1 p-4 md:p-8 grid grid-cols-1 xl:grid-cols-3 gap-8">
          {akrTab === 'vehicles' && (
            <div className="col-span-full">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div className="flex gap-2 w-full md:w-auto">
                  <input
                    type="text"
                    placeholder="Search by name, category, or type..."
                    value={vehicleSearch}
                    onChange={e => setVehicleSearch(e.target.value)}
                    className="border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 shadow w-full md:w-64"
                  />
                  <Button onClick={() => exportVehiclesToCSV(filteredVehicles)} type="primary">Export CSV</Button>
            </div>
                <div>
                  <Button type={vehicleView === 'grid' ? 'primary' : 'default'} onClick={() => setVehicleView('grid')}>Grid</Button>
                  <Button type={vehicleView === 'list' ? 'primary' : 'default'} onClick={() => setVehicleView('list')} style={{ marginLeft: 8 }}>List</Button>
                  <Button type="primary" onClick={() => setAddModalOpen(true)} style={{ marginLeft: 16 }}>
                    Add Vehicle
                          </Button>
                        </div>
                      </div>
              {loading ? <Spin /> : error ? <div className="text-red-500">{error}</div> : (
                vehicleView === 'grid' ? (
                  <Row gutter={[16, 16]}>
                    {filteredVehicles.length === 0 ? (
                      <Col span={24}><div className="text-gray-500">No vehicles found.</div></Col>
                    ) : filteredVehicles.map((vehicle: any) => (
                      <Col xs={24} sm={12} md={8} lg={6} key={vehicle._id}>
                        <Card
                          hoverable
                          cover={vehicle.colors && vehicle.colors[0]?.images && vehicle.colors[0].images[0] ? (
                            <img alt={vehicle.name} src={vehicle.colors[0].images[0]} style={{ height: 180, objectFit: 'cover' }} />
                          ) : (
                            <div style={{ height: 180, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Image</div>
                          )}
                          onClick={() => openDetailsDrawer(vehicle)}
                          style={{ marginBottom: 16 }}
                        >
                          <Card.Meta
                            title={<span>{vehicle.name} <span style={{ fontSize: 12, color: '#888' }}>({vehicle.vehicleType})</span></span>}
                            description={<>
                              <div>Category: {vehicle.category}</div>
                              <div>Price: LKR {vehicle.price}</div>
                              <div style={{ fontSize: 12, color: '#666' }}>{vehicle.description?.slice(0, 40)}...</div>
                            </>}
                          />
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Table
                    dataSource={filteredVehicles}
                    columns={[
                      {
                        title: '',
                        key: 'icon',
                        render: () => <CarOutlined style={{ fontSize: 20, color: '#10b981' }} />,
                        width: 40
                      },
                      {
                        title: 'Image',
                        dataIndex: 'colors',
                        key: 'image',
                        render: (colors: any[]) => colors && colors[0]?.images && colors[0].images[0] ? (
                          <img src={colors[0].images[0]} alt="vehicle" style={{ width: 48, height: 32, objectFit: 'cover', borderRadius: 4 }} />
                        ) : <span style={{ color: '#aaa' }}>No Image</span>,
                        width: 60
                      },
                      { title: 'Name', dataIndex: 'name', key: 'name' },
                      { title: 'Type', dataIndex: 'vehicleType', key: 'vehicleType' },
                      { title: 'Category', dataIndex: 'category', key: 'category' },
                      { title: 'Price', dataIndex: 'price', key: 'price' },
                      {
                        title: 'Available',
                        dataIndex: 'available',
                        key: 'available',
                        align: 'center',
                        render: (available: boolean, record: any) => (
                          <Switch
                            checked={available !== false}
                            checkedChildren="Yes"
                            unCheckedChildren="No"
                            onChange={async (checked) => {
                              try {
                                await fetch(`${import.meta.env.VITE_API_URL}/api/vehicles/${record._id}/availability`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ available: checked })
                                });
                                setVehicles(vehicles => vehicles.map(v => v._id === record._id ? { ...v, available: checked } : v));
                                message.success(`Vehicle marked as ${checked ? 'available' : 'not available'}`);
                              } catch {
                                message.error('Failed to update availability');
                              }
                            }}
                            size="small"
                    />
                        ),
                        width: 100
                      },
                      {
                        title: 'View',
                        key: 'actions',
                        render: (_: any, record: any) => (
                          <Button type="link" onClick={() => openDetailsDrawer(record)}>View</Button>
                        ),
                        width: 80
                      }
                    ]}
                    rowKey="_id"
                    pagination={false}
                    className="rounded-xl overflow-hidden shadow-lg bg-white w-full"
                  />
                )
              )}
                  <Modal
                title="Add Vehicle"
                open={addModalOpen}
                onCancel={() => setAddModalOpen(false)}
                    footer={null}
                destroyOnClose
                width={700}
              >
                      <form
                  className="space-y-4"
                  onSubmit={e => {
                          e.preventDefault();
                    handleAddVehicle();
                        }}
                        autoComplete="off"
                      >
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            {ADD_STEPS.map((label, idx) => (
                              <div key={label} className={`flex-1 flex flex-col items-center ${addStep === idx ? 'font-bold text-emerald-700' : 'text-gray-400'}`}> 
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${addStep === idx ? 'bg-emerald-600 text-white' : 'bg-gray-200'}`}>{idx + 1}</div>
                                <span className="text-xs">{label}</span>
                              </div>
                            ))}
                          </div>
                          <div className="h-1 w-full bg-gray-200 rounded-full">
                            <div className="h-1 bg-emerald-600 rounded-full transition-all" style={{ width: `${((addStep + 1) / ADD_STEPS.length) * 100}%` }} />
                          </div>
                        </div>
                        {addStep === 0 && (
                          <>
                            <label className="block font-medium mb-1">Vehicle Type</label>
                            <select
                              className="border px-3 py-2 rounded w-full mb-3"
                        name="vehicleType"
                              value={vehicleForm.vehicleType}
                        onChange={handleAddVehicleChange}
                            >
                              <option value="">Select a vehicle type</option>
                        <option value="Motorcycle">Motorcycle</option>
                        <option value="Car">Car</option>
                        <option value="Three Wheeler">Three Wheeler</option>
                        <option value="Truck">Truck</option>
                        <option value="Bus">Bus</option>
                        <option value="Van">Van</option>
                        <option value="SUV">SUV</option>
                        <option value="Other">Other</option>
                            </select>
                            <label className="block font-medium mb-1">Name</label>
                            <input
                              type="text"
                        name="name"
                              className="border px-3 py-2 rounded w-full mb-3"
                              value={vehicleForm.name}
                        onChange={handleAddVehicleChange}
                            />
                            <label className="block font-medium mb-1">Category</label>
                            <input
                              type="text"
                        name="category"
                              className="border px-3 py-2 rounded w-full mb-3"
                              value={vehicleForm.category}
                        onChange={handleAddVehicleChange}
                            />
                            <label className="block font-medium mb-1">Price (LKR)</label>
                            <input
                              type="number"
                        name="price"
                              className="border px-3 py-2 rounded w-full mb-3"
                              value={vehicleForm.price}
                        onChange={handleAddVehicleChange}
                            />
                            <label className="block font-medium mb-1">Description</label>
                            <textarea
                        name="description"
                              className="border px-3 py-2 rounded w-full mb-3"
                              value={vehicleForm.description}
                        onChange={handleAddVehicleChange}
                            />
                          </>
                        )}
                        {addStep === 1 && (
                          <>
                            <FeatureInput value={vehicleForm.features} onChange={handleFeatureChange} />
                      <GroupedSpecsInput value={vehicleForm.specs} onChange={handleSpecsChange} />
                          </>
                        )}
                        {addStep === 2 && (
                            <ColorInput value={vehicleForm.colors} onChange={handleColorsChange} />
                        )}
                        {addStep === 3 && (
                            <VariantInput value={vehicleForm.variants} onChange={handleVariantChange} />
                        )}
                        {addStep === 4 && (
                          <>
                            <FaqsInput value={vehicleForm.faqs} onChange={handleFaqsChange} />
                            
                            {/* Gallery Images */}
                            <div className="mt-6">
                              <label className="block font-medium mb-2">Gallery Images</label>
                              <div className="space-y-3">
                                {/* Current Gallery Images */}
                                {(vehicleForm.galleryImages && vehicleForm.galleryImages.length > 0) || (galleryImagePreviews && galleryImagePreviews.length > 0) && (
                                  <div className="grid grid-cols-3 gap-2 mb-3">
                                    {/* Show existing gallery images */}
                                    {vehicleForm.galleryImages && vehicleForm.galleryImages.map((img: string, idx: number) => (
                                      <div key={`existing-${idx}`} className="relative">
                                        <img 
                                          src={img} 
                                          alt={`Gallery ${idx + 1}`} 
                                          className="w-full h-20 object-cover rounded border"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newImages = vehicleForm.galleryImages.filter((_: string, i: number) => i !== idx);
                                            setVehicleForm(f => ({ ...f, galleryImages: newImages }));
                                          }}
                                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))}
                                    
                                    {/* Show new preview images */}
                                    {galleryImagePreviews && galleryImagePreviews.map((img: string, idx: number) => (
                                      <div key={`preview-${idx}`} className="relative">
                                        <img 
                                          src={img} 
                                          alt={`New Gallery ${idx + 1}`} 
                                          className="w-full h-20 object-cover rounded border"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newFiles = galleryImageFiles.filter((_: File, i: number) => i !== idx);
                                            const newPreviews = galleryImagePreviews.filter((_: string, i: number) => i !== idx);
                                            setGalleryImageFiles(newFiles);
                                            setGalleryImagePreviews(newPreviews);
                                          }}
                                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                
                                {/* Upload New Gallery Images */}
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                                  <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleGalleryImageChange}
                                    className="hidden"
                                    id="gallery-images"
                                  />
                                  <label htmlFor="gallery-images" className="cursor-pointer">
                                    <div className="text-gray-600 hover:text-gray-800 transition-colors">
                                      <div className="text-lg mb-2">📷</div>
                                      <div className="font-medium">Click to upload gallery images</div>
                                      <div className="text-sm text-gray-500">Hold Ctrl/Cmd to select multiple images</div>
                                    </div>
                                  </label>
                                </div>
                                
                                {(vehicleForm.galleryImages && vehicleForm.galleryImages.length > 0) || (galleryImagePreviews && galleryImagePreviews.length > 0) && (
                                  <div className="text-xs text-gray-600">
                                    {((vehicleForm.galleryImages?.length || 0) + (galleryImagePreviews?.length || 0))} image(s) selected
                                  </div>
                                )}
                                
                                {galleryImageUploading && (
                                  <div className="text-xs text-blue-600 mt-1">
                                    📤 Uploading gallery images...
                                  </div>
                                )}
                              </div>
                            </div>

                            <label className="block font-medium mb-1 mt-4">Brochure (PDF)</label>
                            {vehicleForm.brochure && (
                              <div className="mb-2"><a href={vehicleForm.brochure} target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline">View current brochure</a></div>
                            )}
                            <input type="file" accept="application/pdf" onChange={async e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setBrochureUploading(true);
                                try {
                                  const url = await uploadBrochurePdfToCloudinary(file);
                                  setVehicleForm(f => { console.log('Setting brochure URL:', url); return { ...f, brochure: url }; });
                                  message.success('Brochure uploaded!');
                                } catch {
                                  message.error('Failed to upload brochure PDF');
                                } finally {
                                  setBrochureUploading(false);
                                }
                              }
                            }} />
                            {brochureUploading && <div className="text-xs text-blue-600 mt-1">Uploading brochure...</div>}
                            {vehicleForm.brochure && <div className="text-xs text-gray-600 mt-1">Brochure uploaded</div>}
                          </>
                        )}
                  {addVehicleError && <div className="text-xs text-red-500 mt-2">{addVehicleError}</div>}
                        <div className="flex justify-between mt-6">
                        {addStep > 0 && <Button type="default" onClick={() => setAddStep(addStep - 1)}>Back</Button>}
                        {addStep < ADD_STEPS.length - 1 && <Button type="primary" onClick={() => setAddStep(addStep + 1)}>Next</Button>}
                    {addStep === ADD_STEPS.length - 1 && <Button type="primary" htmlType="submit" loading={addVehicleLoading || brochureUploading} disabled={addVehicleLoading || brochureUploading} block size="large">{addVehicleLoading || brochureUploading ? "Adding..." : "Add Vehicle"}</Button>}
                        </div>
                      </form>
                  </Modal>
      {/* Vehicle Details Drawer */}
      <Drawer
                title={detailsVehicle?.name || 'Vehicle Details'}
                open={detailsDrawerOpen}
                onClose={closeDetailsDrawer}
        width={window.innerWidth < 768 ? '100vw' : 600}
        bodyStyle={{ padding: 24 }}
      >
                {detailsVehicle && (
                  <div>
                    <img src={detailsVehicle.colors && detailsVehicle.colors[0]?.images[0]} alt="vehicle" style={{ width: '100%', maxHeight: 240, objectFit: 'cover', marginBottom: 16 }} />
                    <div><b>Type:</b> {detailsVehicle.vehicleType}</div>
                    <div><b>Category:</b> {detailsVehicle.category}</div>
                    <div><b>Price:</b> {detailsVehicle.price}</div>
                    <div><b>Description:</b> {detailsVehicle.description}</div>
                    <div><b>Features:</b> {detailsVehicle.features?.join(', ')}</div>
                    <div><b>Specs:</b> {detailsVehicle.specs && typeof detailsVehicle.specs === 'object' ? Object.entries(detailsVehicle.specs).map(([k, v]) => `${k}: ${v}`).join(', ') : '-'}</div>
                    <div><b>Colors:</b> {detailsVehicle.colors && detailsVehicle.colors.length > 0 ? (
              <span style={{ display: 'flex', gap: 8 }}>
                        {detailsVehicle.colors.map((c: any, i: number) => (
                  <span key={i} title={c.name} style={{ display: 'inline-block', width: 24, height: 24, borderRadius: '50%', background: c.hex, border: '1px solid #ccc', marginRight: 4 }} />
                ))}
              </span>
            ) : '-'}</div>
                    <div><b>Variants:</b> {detailsVehicle.variants?.map((v: any) => v.name).join(', ')}</div>
                    <div><b>FAQs:</b> {detailsVehicle.faqs?.length ? detailsVehicle.faqs.map((f: any, i: number) => (<div key={i}><b>Q:</b> {f.question} <b>A:</b> {f.answer}</div>)) : '-'}</div>
                    <div><b>Created At:</b> {detailsVehicle.createdAt ? new Date(detailsVehicle.createdAt).toLocaleString() : '-'}</div>
                    <div className="flex items-center gap-4 mt-4">
                      <span><b>Available:</b></span>
                      <Switch
                        checked={detailsVehicle?.available !== false}
                        checkedChildren="Yes"
                        unCheckedChildren="No"
                        onChange={async (checked) => {
                          try {
                            await fetch(`${import.meta.env.VITE_API_URL}/api/vehicles/${detailsVehicle._id}/availability`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ available: checked })
                            });
                            setDetailsVehicle(v => ({ ...v, available: checked }));
                            setVehicles(vehicles => vehicles.map(v => v._id === detailsVehicle._id ? { ...v, available: checked } : v));
                            message.success(`Vehicle marked as ${checked ? 'available' : 'not available'}`);
                          } catch {
                            message.error('Failed to update availability');
                          }
                        }}
                        size="small"
                      />
                    </div>
            <div className="flex gap-2 mt-6 justify-end">
                      <Button type="default" onClick={() => openEditModal(detailsVehicle)}>Edit</Button>
                      <Button type="primary" danger onClick={() => deleteVehicle(detailsVehicle._id)}>Delete</Button>
            </div>
                    {detailsVehicle.galleryImages && detailsVehicle.galleryImages.length > 0 && (
              <div>
                <b>Photo Gallery:</b>
                <div className="flex gap-2 flex-wrap mt-2">
                          {detailsVehicle.galleryImages.map((img: string, idx: number) => (
                    <img key={idx} src={img} alt="gallery" className="w-32 h-24 object-cover rounded border" />
                  ))}
                </div>
              </div>
                  )}
          </div>
        )}
      </Drawer>
              {/* Edit Vehicle Modal (multi-step form) */}
      <Modal
        title={editVehicleData?.name ? `Edit Vehicle: ${editVehicleData.name}` : 'Edit Vehicle'}
        open={editModalOpen}
        onCancel={closeEditModal}
        footer={null}
        width={700}
        centered
      >
        {editVehicleData && (
                    <form
                      className="space-y-4 mt-4"
                      onSubmit={async e => {
                        e.preventDefault();
              await handleEditVehicleSubmit();
                      }}
                      autoComplete="off"
                    >
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                {EDIT_STEPS.map((label, idx) => (
                  <div key={label} className={`flex-1 flex flex-col items-center ${editStep === idx ? 'font-bold text-emerald-700' : 'text-gray-400'}`}> 
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${editStep === idx ? 'bg-emerald-600 text-white' : 'bg-gray-200'}`}>{idx + 1}</div>
                              <span className="text-xs">{label}</span>
                            </div>
                          ))}
                        </div>
                        <div className="h-1 w-full bg-gray-200 rounded-full">
                <div className="h-1 bg-emerald-600 rounded-full transition-all" style={{ width: `${((editStep + 1) / EDIT_STEPS.length) * 100}%` }} />
                        </div>
                      </div>
            {editStep === 0 && (
                        <>
                          <label className="block font-medium mb-1">Vehicle Type</label>
                          <select
                            className="border px-3 py-2 rounded w-full mb-3"
                  value={editVehicleData.vehicleType}
                  onChange={e => setEditVehicleData(f => ({ ...f, vehicleType: e.target.value }))}
                          >
                            <option value="">Select a vehicle type</option>
                          <option value="Motorcycle">Motorcycle</option>
                          <option value="Car">Car</option>
                          <option value="Three Wheeler">Three Wheeler</option>
                          <option value="Truck">Truck</option>
                          <option value="Bus">Bus</option>
                          <option value="Van">Van</option>
                          <option value="SUV">SUV</option>
                          <option value="Other">Other</option>
                          </select>
                          <label className="block font-medium mb-1">Name</label>
                          <input
                            type="text"
                            className="border px-3 py-2 rounded w-full mb-3"
                  value={editVehicleData.name}
                  onChange={e => setEditVehicleData(f => ({ ...f, name: e.target.value }))}
                          />
                          <label className="block font-medium mb-1">Category</label>
                          <input
                            type="text"
                            className="border px-3 py-2 rounded w-full mb-3"
                  value={editVehicleData.category}
                  onChange={e => setEditVehicleData(f => ({ ...f, category: e.target.value }))}
                          />
                          <label className="block font-medium mb-1">Price (LKR)</label>
                          <input
                            type="number"
                            className="border px-3 py-2 rounded w-full mb-3"
                  value={editVehicleData.price}
                  onChange={e => setEditVehicleData(f => ({ ...f, price: e.target.value }))}
                          />
                          <label className="block font-medium mb-1">Description</label>
                          <textarea
                            className="border px-3 py-2 rounded w-full mb-3"
                  value={editVehicleData.description}
                  onChange={e => setEditVehicleData(f => ({ ...f, description: e.target.value }))}
                          />
                        </>
                      )}
            {editStep === 1 && (
                        <>
                        <FeatureInput value={editVehicleData.features} onChange={features => setEditVehicleData(f => ({ ...f, features }))} />
                        <GroupedSpecsInput value={editVehicleData.specs} onChange={specs => setEditVehicleData(f => ({ ...f, specs }))} />
                        </>
                      )}
            {editStep === 2 && (
                      <ColorInput value={editVehicleData.colors} onChange={colors => setEditVehicleData(f => ({ ...f, colors }))} />
                      )}
            {editStep === 3 && (
                      <VariantInput value={editVehicleData.variants} onChange={variants => setEditVehicleData(f => ({ ...f, variants }))} />
                      )}
            {editStep === 4 && (
                        <>
                        <FaqsInput value={editVehicleData.faqs} onChange={faqs => setEditVehicleData(f => ({ ...f, faqs }))} />
                        
                        {/* Gallery Images */}
                        <div className="mt-6">
                          <label className="block font-medium mb-2">Gallery Images</label>
                          <div className="space-y-3">
                            {/* Current Gallery Images */}
                            {(editVehicleData.galleryImages && editVehicleData.galleryImages.length > 0) || (editGalleryImagePreviews && editGalleryImagePreviews.length > 0) ? (
                              <div className="grid grid-cols-3 gap-2 mb-3">
                                {/* Show existing gallery images */}
                                {editVehicleData.galleryImages && editVehicleData.galleryImages.map((img: string, idx: number) => (
                                  <div key={`existing-${idx}`} className="relative">
                                    <img 
                                      src={img} 
                                      alt={`Gallery ${idx + 1}`} 
                                      className="w-full h-20 object-cover rounded border"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newImages = editVehicleData.galleryImages.filter((_: string, i: number) => i !== idx);
                                        setEditVehicleData(f => ({ ...f, galleryImages: newImages }));
                                      }}
                                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                                
                                {/* Show new preview images */}
                                {editGalleryImagePreviews && editGalleryImagePreviews.map((img: string, idx: number) => (
                                  <div key={`preview-${idx}`} className="relative">
                                    <img 
                                      src={img} 
                                      alt={`New Gallery ${idx + 1}`} 
                                      className="w-full h-20 object-cover rounded border"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newFiles = editGalleryImageFiles.filter((_: File, i: number) => i !== idx);
                                        const newPreviews = editGalleryImagePreviews.filter((_: string, i: number) => i !== idx);
                                        setEditGalleryImageFiles(newFiles);
                                        setEditGalleryImagePreviews(newPreviews);
                                      }}
                                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : null}
                            
                            {/* Upload New Gallery Images */}
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleEditGalleryImageChange}
                                className="hidden"
                                id="edit-gallery-images"
                              />
                              <label htmlFor="edit-gallery-images" className="cursor-pointer">
                                <div className="text-gray-600 hover:text-gray-800 transition-colors">
                                  <div className="text-lg mb-2">📷</div>
                                  <div className="font-medium">Click to upload gallery images</div>
                                  <div className="text-sm text-gray-500">Hold Ctrl/Cmd to select multiple images</div>
                                </div>
                              </label>
                            </div>
                            
                            {(editVehicleData.galleryImages && editVehicleData.galleryImages.length > 0) || (editGalleryImagePreviews && editGalleryImagePreviews.length > 0) ? (
                              <div className="text-xs text-gray-600">
                                {((editVehicleData.galleryImages?.length || 0) + (editGalleryImagePreviews?.length || 0))} image(s) selected
                              </div>
                            ) : null}
                            
                            {editGalleryImageUploading && (
                              <div className="text-xs text-blue-600 mt-1">
                                📤 Uploading gallery images...
                              </div>
                            )}
                          </div>
                        </div>

                <label className="block font-medium mb-1 mt-4">Brochure (PDF)</label>
                {editVehicleData.brochure && (
                  <div className="mb-2"><a href={editVehicleData.brochure} target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline">View current brochure</a></div>
                )}
                <input type="file" accept="application/pdf" onChange={async e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setEditBrochureUploading(true);
                    try {
                      const url = await uploadBrochurePdfToCloudinary(file);
                      setEditVehicleData(f => { console.log('Setting brochure URL (edit):', url); return { ...f, brochure: url }; });
                      message.success('Brochure uploaded!');
                    } catch {
                      message.error('Failed to upload brochure PDF');
                    } finally {
                      setEditBrochureUploading(false);
                    }
                  }
                }} />
                {editBrochureUploading && <div className="text-xs text-blue-600 mt-1">Uploading brochure...</div>}
                {editVehicleData.brochure && <div className="text-xs text-gray-600 mt-1">Brochure uploaded</div>}
                        </>
                      )}
                      <div className="flex justify-between mt-6">
                      {editStep > 0 && <Button type="default" onClick={() => setEditStep(editStep - 1)}>Back</Button>}
                      {editStep < EDIT_STEPS.length - 1 && <Button type="primary" onClick={() => setEditStep(editStep + 1)}>Next</Button>}
                      {editStep === EDIT_STEPS.length - 1 && <Button type="primary" htmlType="submit" loading={addVehicleLoading || editBrochureUploading || editGalleryImageUploading} disabled={addVehicleLoading || editBrochureUploading || editGalleryImageUploading} block size="large">{addVehicleLoading || editBrochureUploading || editGalleryImageUploading ? "Saving..." : "Save Changes"}</Button>}
                      </div>
                    </form>
                  )}
      </Modal>
              </div>
              )}
          {akrTab === 'prebookings' && (
            <div className="col-span-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Pre-Bookings</h2>
                <Button onClick={() => exportPreBookingsToCSV(filteredPreBookings)} type="primary">Export CSV</Button>
                  </div>
              {preBookingLoading ? <Spin /> : preBookingError ? <div className="text-red-500">{preBookingError}</div> : (
                  <div className="overflow-x-auto md:overflow-visible">
                  <Table
                    dataSource={filteredPreBookings}
                    columns={preBookingColumns}
                    rowKey="_id"
                    pagination={{ pageSize: 8 }}
                      className="rounded-xl overflow-hidden shadow-lg bg-white w-full min-w-max"
                  />
                  </div>
                )}
              <Modal
                open={!!selectedPreBooking}
                onCancel={() => setSelectedPreBooking(null)}
                footer={null}
                title={selectedPreBooking ? `Booking: ${selectedPreBooking.bookingId}` : ''}
                width={600}
                centered
                bodyStyle={{ padding: 32 }}
              >
                {selectedPreBooking && (
                  <Descriptions bordered column={1} size="middle">
                    <Descriptions.Item label="Customer Name">{selectedPreBooking.fullName}</Descriptions.Item>
                    <Descriptions.Item label="Email">{selectedPreBooking.email}</Descriptions.Item>
                    <Descriptions.Item label="Phone">{selectedPreBooking.phone}</Descriptions.Item>
                    <Descriptions.Item label="National ID">{selectedPreBooking.nationalId}</Descriptions.Item>
                    <Descriptions.Item label="Address">{selectedPreBooking.address}</Descriptions.Item>
                    <Descriptions.Item label="Vehicle Model">{selectedPreBooking.vehicleModel}</Descriptions.Item>
                    <Descriptions.Item label="Status">
                      <Tag color={selectedPreBooking.status === 'Pending' ? 'orange' : selectedPreBooking.status === 'Ordered' ? 'blue' : selectedPreBooking.status === 'Delivered' ? 'green' : 'red'}>{selectedPreBooking.status}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Created At">{new Date(selectedPreBooking.createdAt).toLocaleString()}</Descriptions.Item>
                  </Descriptions>
                )}
              </Modal>
                </div>
          )}
          {akrTab === 'customers' && (
            <div className="col-span-full">
              <h2 className="text-2xl font-bold mb-4">Customers</h2>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={customerSearch}
                  onChange={e => setCustomerSearch(e.target.value)}
                  className="border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 shadow w-full sm:w-64"
                />
                <Button type="primary" onClick={() => setCustomerModalOpen(true)}>
                  Add Customer
                          </Button>
                <Button type="primary" onClick={() => exportCustomersToCSV(customers)}>
                  Export CSV
                          </Button>
              </div>
              <div className="overflow-x-auto md:overflow-visible">
                <Table
                  dataSource={filteredCustomers}
                  loading={customerLoading}
                  columns={[
                    { title: 'Customer', dataIndex: 'name', key: 'name', align: 'center' },
                    { title: 'Vehicle', dataIndex: ['latestPurchase', 'vehicleModel'], key: 'vehicle', align: 'center' },
                    { title: 'Full Paid', dataIndex: ['latestPurchase', 'fullAmountPaid'], key: 'fullAmountPaid', align: 'center', render: v => v ? 'Yes' : 'No' },
                    { title: 'Down Payment', dataIndex: ['latestPurchase', 'downPayment'], key: 'downPayment', align: 'center' },
                    { title: 'Leasing', dataIndex: ['latestPurchase', 'leasing'], key: 'leasing', align: 'center', render: v => v ? 'Yes' : 'No' },
                    { title: 'Leasing Provider', dataIndex: ['latestPurchase', 'leasingProvider'], key: 'leasingProvider', align: 'center' },
                    { title: 'Purchase Date', dataIndex: ['latestPurchase', 'purchaseDate'], key: 'purchaseDate', align: 'center', render: d => d ? new Date(d).toLocaleDateString('en-GB') : '' },
                    { title: 'Notes', dataIndex: ['latestPurchase', 'notes'], key: 'notes', align: 'center' },
                    {
                      title: 'Actions',
                      key: 'actions',
                      align: 'center',
                      render: (_, record) => (
                        <>
                        <Button type="link" onClick={() => {
                          setSelectedCustomer(record);
                          setSelectedPurchase(record.latestPurchase);
                        }}>View</Button>
                          <Button type="link" danger onClick={() => handleDeleteCustomer(record._id)}>Delete</Button>
                        </>
                      )
                    }
                  ]}
                  expandable={{
                    expandedRowRender: record => (
                      <Table
                        dataSource={record.allPurchases}
                        columns={[
                          { title: 'Vehicle', dataIndex: 'vehicleModel', key: 'vehicleModel', align: 'center' },
                          { title: 'Full Paid', dataIndex: 'fullAmountPaid', key: 'fullAmountPaid', align: 'center', render: v => v ? 'Yes' : 'No' },
                          { title: 'Down Payment', dataIndex: 'downPayment', key: 'downPayment', align: 'center' },
                          { title: 'Leasing', dataIndex: 'leasing', key: 'leasing', align: 'center', render: v => v ? 'Yes' : 'No' },
                          { title: 'Leasing Provider', dataIndex: 'leasingProvider', key: 'leasingProvider', align: 'center' },
                          { title: 'Purchase Date', dataIndex: 'purchaseDate', key: 'purchaseDate', align: 'center', render: d => d ? new Date(d).toLocaleDateString('en-GB') : '' },
                          { title: 'Notes', dataIndex: 'notes', key: 'notes', align: 'center' },
                        ]}
                        pagination={false}
                        rowKey={(r, idx) => String(idx)}
                        size="small"
                        scroll={{ x: true }}
                      />
                    ),
                    rowExpandable: record => (record.allPurchases && record.allPurchases.length > 1)
                  }}
                  rowKey="_id"
                  pagination={{ pageSize: 8 }}
                  className="rounded-xl overflow-hidden shadow-lg bg-white w-full min-w-max"
                  scroll={{ x: true }}
                />
                </div>
      <Modal
                title={editingCustomer ? "Edit Customer" : "Add Customer"}
                open={customerModalOpen}
                onCancel={() => { setCustomerModalOpen(false); setEditingCustomer(null); setCustomerStep(0); }}
        footer={null}
                width={600}
        centered
      >
                {/* Show error if duplicate email */}
                {customerError && <div className="text-red-500 text-sm mb-2">{customerError}</div>}
          <form
            className="space-y-4 mt-4"
            onSubmit={async e => {
              e.preventDefault();
                    if (customerStep < CUSTOMER_STEPS.length - 1) {
                      setCustomerStep(customerStep + 1);
                    } else {
                      editingCustomer ? await handleUpdateCustomer() : await handleAddCustomer();
                    }
            }}
            autoComplete="off"
          >
                  <Steps current={customerStep} size="small" style={{ marginBottom: 24 }}>
                    {CUSTOMER_STEPS.map(label => <Steps.Step key={label} title={label} />)}
                  </Steps>
                  {customerStep === 0 && (
                    <>
                <label className="block font-medium mb-1">Name</label>
                      <input type="text" name="name" className="border px-3 py-2 rounded w-full" value={customerForm.name} onChange={handleCustomerFormChange} required />
                      <label className="block font-medium mb-1">Email</label>
                      <input type="email" name="email" className="border px-3 py-2 rounded w-full" value={customerForm.email} onChange={handleCustomerFormChange} />
                      <label className="block font-medium mb-1">Phone</label>
                      <input type="text" name="phone" className="border px-3 py-2 rounded w-full" value={customerForm.phone} onChange={handleCustomerFormChange} />
                      <label className="block font-medium mb-1">Address</label>
                      <input type="text" name="address" className="border px-3 py-2 rounded w-full" value={customerForm.address} onChange={handleCustomerFormChange} />
              </>
            )}
                  {customerStep === 1 && (
              <>
                      <label className="block font-medium mb-1">Vehicle</label>
                      <select name="vehicle" className="border px-3 py-2 rounded w-full" value={customerForm.vehicle} onChange={e => handleCustomerVehicleChange(e.target.value)} required>
                        <option value="">Select vehicle</option>
                        {vehicles.map((v: any) => (
                          <option key={v._id} value={v._id}>{v.name}</option>
                        ))}
                      </select>
                      {selectedVehiclePrice > 0 && (
                        <div className="mt-2 text-sm text-gray-700">Vehicle Price: <b>LKR {selectedVehiclePrice.toLocaleString()}</b></div>
                      )}
                      <label className="block font-medium mb-1">Purchase Date</label>
                      <input type="date" name="purchaseDate" className="border px-3 py-2 rounded w-full" value={customerForm.purchaseDate ? customerForm.purchaseDate.slice(0, 10) : ""} onChange={handleCustomerFormChange} max={new Date().toISOString().slice(0, 10)} />
                      {purchaseDateError && <div className="text-red-500 text-xs mt-1">{purchaseDateError}</div>}
              </>
            )}
                  {customerStep === 2 && (
              <>
                      <label className="block font-medium mb-1">Full Amount Paid</label>
                      <input type="checkbox" name="fullAmountPaid" checked={customerForm.fullAmountPaid} onChange={handleCustomerFormChange} />
                      {!customerForm.fullAmountPaid && (
                        <>
                          <label className="block font-medium mb-1">Down Payment</label>
                          <input type="number" name="downPayment" className="border px-3 py-2 rounded w-full" value={customerForm.downPayment} onChange={handleCustomerFormChange} max={selectedVehiclePrice} />
                          {selectedVehiclePrice > 0 && (
                            <div className="mt-2 text-sm text-gray-700">Leasing Amount: <b>LKR {(selectedVehiclePrice - (Number(customerForm.downPayment) || 0)).toLocaleString()}</b></div>
                          )}
              </>
            )}
                      {customerForm.fullAmountPaid && (
                        <div className="text-green-600 font-semibold mt-2">Full amount paid</div>
                      )}
                      {!customerForm.fullAmountPaid && (
              <>
                          <label className="block font-medium mb-1">Leasing</label>
                          <input type="checkbox" name="leasing" checked={customerForm.leasing} onChange={handleCustomerFormChange} />
                          {customerForm.leasing && (
                            <>
                              <label className="block font-medium mb-1">Leasing Provider</label>
                              <input type="text" name="leasingProvider" className="border px-3 py-2 rounded w-full" value={customerForm.leasingProvider} onChange={handleCustomerFormChange} />
              </>
            )}
                        </>
                      )}
                      <label className="block font-medium mb-1">Notes</label>
                      <textarea name="notes" className="border px-3 py-2 rounded w-full" value={customerForm.notes} onChange={handleCustomerFormChange} />
                    </>
                  )}
                  {showDuplicatePrompt && (
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded mb-4">
                      <div className="mb-2">A customer with this email already exists. Do you want to add a new purchase for this customer or create a new customer?</div>
                      <div className="flex gap-2">
                        <Button type="primary" onClick={() => {
                          setShowDuplicatePrompt(false);
                          setForceNewCustomer(false);
                          if (duplicateCustomer) {
                            setCustomerForm(f => ({
                              ...f,
                              name: duplicateCustomer.name || '',
                              email: duplicateCustomer.email || '',
                              phone: duplicateCustomer.phone || '',
                              address: duplicateCustomer.address || '',
                              vehicle: '',
                              vehicleModel: '',
                              fullAmountPaid: false,
                              downPayment: 0,
                              leasing: false,
                              leasingProvider: '',
                              purchaseDate: '',
                              notes: ''
                            }));
                          }
                        }}>Add Purchase to Existing</Button>
                        <Button onClick={() => { setShowDuplicatePrompt(false); setForceNewCustomer(true); }}>Create New Customer</Button>
                </div>
                      </div>
            )}
            <div className="flex justify-between mt-6">
                    {customerStep > 0 && <Button type="default" onClick={() => setCustomerStep(customerStep - 1)}>Back</Button>}
                    <Button
                      type="primary"
                      htmlType="button"
                      onClick={() => setCustomerStep(customerStep + 1)}
                      disabled={showDuplicatePrompt}
                    >
                      Next
                    </Button>
                    {customerStep === CUSTOMER_STEPS.length - 1 && <Button type="primary" htmlType="submit" loading={customerLoading} block size="large">{editingCustomer ? "Save Changes" : "Add Customer"}</Button>}
              </div>
          </form>
      </Modal>
                <Modal
        open={!!selectedCustomer}
        onCancel={() => setSelectedCustomer(null)}
                  footer={null}
        title={selectedCustomer ? `Customer: ${selectedCustomer.name}` : 'Customer & Purchase Details'}
        width={700}
                  centered
      >
        {selectedCustomer && (
          <>
            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="Name">{selectedCustomer.name}</Descriptions.Item>
              <Descriptions.Item label="Email">{selectedCustomer.email}</Descriptions.Item>
              <Descriptions.Item label="Phone">{selectedCustomer.phone}</Descriptions.Item>
              <Descriptions.Item label="Address">{selectedCustomer.address}</Descriptions.Item>
            </Descriptions>
            <h3 className="mt-6 mb-2 font-bold text-lg">All Purchases</h3>
            <Table
              dataSource={selectedCustomer.allPurchases}
              columns={[
                { title: 'Vehicle', dataIndex: 'vehicleModel', key: 'vehicleModel', align: 'center' },
                { title: 'Full Paid', dataIndex: 'fullAmountPaid', key: 'fullAmountPaid', align: 'center', render: v => v ? 'Yes' : 'No' },
                { title: 'Down Payment', dataIndex: 'downPayment', key: 'downPayment', align: 'center' },
                { title: 'Leasing', dataIndex: 'leasing', key: 'leasing', align: 'center', render: v => v ? 'Yes' : 'No' },
                { title: 'Leasing Provider', dataIndex: 'leasingProvider', key: 'leasingProvider', align: 'center' },
                { title: 'Purchase Date', dataIndex: 'purchaseDate', key: 'purchaseDate', align: 'center', render: d => d ? new Date(d).toLocaleDateString('en-GB') : '' },
                { title: 'Notes', dataIndex: 'notes', key: 'notes', align: 'center' },
              ]}
              pagination={false}
              rowKey={(_, idx) => String(idx)}
              size="small"
              scroll={{ x: true }}
            />
          </>
        )}
      </Modal>
              </div>
          )}
          {akrTab === 'overview' && (
            <div className="col-span-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-blue-700">{preBookings.length}</span>
                  <span className="text-gray-500 mt-2">Total Bookings</span>
                </div>
                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-green-700">{vehicles.filter(v => v.available !== false).length}</span>
                  <span className="text-gray-500 mt-2">Available Vehicles</span>
              </div>
                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-orange-600">{preBookings.filter(b => b.status === 'Pending').length}</span>
                  <span className="text-gray-500 mt-2">Recent Inquiries</span>
                </div>
                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-emerald-700">{customers.length}</span>
                  <span className="text-gray-500 mt-2">Total Customers</span>
              </div>
                      </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow p-6">
                  <h3 className="text-lg font-bold mb-4">Booking Status Breakdown</h3>
                  <ul className="flex flex-wrap gap-6">
                    <li><span className="font-bold text-orange-600">{preBookings.filter(b => b.status === 'Pending').length}</span> Pending</li>
                    <li><span className="font-bold text-blue-600">{preBookings.filter(b => b.status === 'Ordered').length}</span> Ordered</li>
                    <li><span className="font-bold text-green-600">{preBookings.filter(b => b.status === 'Delivered').length}</span> Delivered</li>
                    <li><span className="font-bold text-red-600">{preBookings.filter(b => b.status === 'Cancelled').length}</span> Cancelled</li>
                  </ul>
                      </div>
                <div></div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow p-6">
                  <h3 className="text-lg font-bold mb-4">Recent Activities</h3>
                  <ul className="divide-y divide-gray-100">
                    {preBookings.slice(0, 5).map(b => (
                      <li key={b._id} className="py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <span><b>{b.fullName}</b> booked <b>{b.vehicleModel}</b></span>
                        <span className="text-xs text-gray-500">{new Date(b.createdAt).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                        </div>
                <div className="bg-white rounded-xl shadow p-6">
                  <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button type="primary" onClick={() => setAkrTab('vehicles')}>Manage Vehicles</Button>
                    <Button type="primary" onClick={() => setAkrTab('prebookings')}>Manage Bookings</Button>
                    <Button type="primary" onClick={() => setAkrTab('customers')}>Manage Customers</Button>
                    <Button onClick={() => { setAkrTab('vehicles'); setTimeout(() => setAddModalOpen(true), 0); }}>Add Vehicle</Button>
                    <Button onClick={() => { setAkrTab('customers'); setTimeout(() => setCustomerModalOpen(true), 0); }}>Add Customer</Button>
                      </div>
                </div>
              </div>
              </div>
            )}
          {akrTab === 'settings' && (
            <div className="col-span-full max-w-2xl mx-auto bg-white rounded-xl shadow p-8">
              <h2 className="text-2xl font-bold mb-6">Platform Settings</h2>
              {settingsLoading ? <Spin /> : <>
              <div className="mb-6 flex items-center gap-4">
                <span className="font-semibold">Platform Mode:</span>
                <Switch checkedChildren="Online" unCheckedChildren="Maintenance" checked={settings.mode === 'online'} onChange={checked => setSettings(s => ({ ...s, mode: checked ? 'online' : 'maintenance' }))} />
                <span className="ml-2 text-gray-500">(Toggle to enable/disable booking form)</span>
            </div>
              <div className="mb-6">
                <label className="block font-medium mb-2">Banner Images</label>
                <input type="file" accept="image/*" className="mb-2" multiple onChange={handleBannerImageChange} />
                <div className="flex gap-2 flex-wrap">
                  {(settings.bannerImages || []).map((img: string, idx: number) => (
                    <div key={idx} className="relative group">
                      <img src={img} alt="banner" className="w-32 h-20 object-contain rounded mb-2 border" />
                      <button type="button" className="absolute top-1 right-1 bg-white bg-opacity-80 text-red-500 rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition" onClick={() => {
                        setSettings(s => ({ ...s, bannerImages: s.bannerImages.filter((_, i) => i !== idx) }));
                      }} title="Remove image">&times;</button>
            </div>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <label className="block font-medium mb-2">Banner Text</label>
                <input type="text" className="border px-3 py-2 rounded w-full" placeholder="Enter banner message..." value={settings.bannerText} onChange={e => setSettings(s => ({ ...s, bannerText: e.target.value }))} />
          </div>
              <div className="mb-6">
                <label className="block font-medium mb-2">Banner Heading</label>
                <input type="text" className="border px-3 py-2 rounded w-full" placeholder="Enter banner heading..." value={settings.bannerHeading} onChange={e => setSettings(s => ({ ...s, bannerHeading: e.target.value }))} />
                  </div>
              <div className="mb-6">
                <label className="block font-medium mb-2">Banner Subheading</label>
                <input type="text" className="border px-3 py-2 rounded w-full" placeholder="Enter banner subheading..." value={settings.bannerSubheading} onChange={e => setSettings(s => ({ ...s, bannerSubheading: e.target.value }))} />
              </div>
              <div className="mb-6">
                <label className="block font-medium mb-2">Phone</label>
                <input type="text" className="border px-3 py-2 rounded w-full" placeholder="Enter phone number..." value={settings.phone || ''} onChange={e => setSettings(s => ({ ...s, phone: e.target.value }))} />
              </div>
              <div className="mb-6">
                <label className="block font-medium mb-2">Email</label>
                <input type="email" className="border px-3 py-2 rounded w-full" placeholder="Enter email address..." value={settings.email || ''} onChange={e => setSettings(s => ({ ...s, email: e.target.value }))} />
            </div>
              <div className="mb-6">
                <label className="block font-medium mb-2">Address</label>
                <input type="text" className="border px-3 py-2 rounded w-full" placeholder="Enter address..." value={settings.address || ''} onChange={e => setSettings(s => ({ ...s, address: e.target.value }))} />
              </div>
              <div className="mb-6">
                <label className="block font-medium mb-2">Opening Hours</label>
                <textarea
                  className="border px-3 py-2 rounded w-full"
                  placeholder="e.g. Mon - Fri: 8:00 AM - 6:00 PM\nSat: 8:00 AM - 4:00 PM\nSun: Closed"
                  rows={3}
                  value={Array.isArray(settings.openingHours) ? settings.openingHours.join('\n') : (settings.openingHours || '')}
                  onChange={e => setSettings(s => ({ ...s, openingHours: e.target.value.split('\n').map(line => line.trim()).filter(Boolean) }))}
                />
                    </div>
              {/* Social Media Links */}
              <div className="mb-6">
                <label className="block font-medium mb-2">Facebook</label>
                <input type="text" className="border px-3 py-2 rounded w-full" placeholder="Facebook URL" value={settings.socialLinks?.facebook || ''} onChange={e => setSettings(s => ({ ...s, socialLinks: { facebook: e.target.value, instagram: s.socialLinks?.instagram || '', whatsapp: s.socialLinks?.whatsapp || '', twitter: s.socialLinks?.twitter || '' } }))} />
                    </div>
              <div className="mb-6">
                <label className="block font-medium mb-2">Instagram</label>
                <input type="text" className="border px-3 py-2 rounded w-full" placeholder="Instagram URL" value={settings.socialLinks?.instagram || ''} onChange={e => setSettings(s => ({ ...s, socialLinks: { facebook: s.socialLinks?.facebook || '', instagram: e.target.value, whatsapp: s.socialLinks?.whatsapp || '', twitter: s.socialLinks?.twitter || '' } }))} />
                </div>
              <div className="mb-6">
                <label className="block font-medium mb-2">WhatsApp</label>
                <input type="text" className="border px-3 py-2 rounded w-full" placeholder="WhatsApp Link or Number" value={settings.socialLinks?.whatsapp || ''} onChange={e => setSettings(s => ({ ...s, socialLinks: { facebook: s.socialLinks?.facebook || '', instagram: s.socialLinks?.instagram || '', whatsapp: e.target.value, twitter: s.socialLinks?.twitter || '' } }))} />
            </div>
              <div className="mb-6">
                <label className="block font-medium mb-2">Twitter</label>
                <input type="text" className="border px-3 py-2 rounded w-full" placeholder="Twitter URL" value={settings.socialLinks?.twitter || ''} onChange={e => setSettings(s => ({ ...s, socialLinks: { facebook: s.socialLinks?.facebook || '', instagram: s.socialLinks?.instagram || '', whatsapp: s.socialLinks?.whatsapp || '', twitter: e.target.value } }))} />
              </div>
              <div className="mb-6">
                <label className="block font-medium mb-2">Company Name</label>
                <input type="text" className="border px-3 py-2 rounded w-full" placeholder="Enter company name..." value={settings.companyName || ''} onChange={e => setSettings(s => ({ ...s, companyName: e.target.value }))} />
              </div>

              {/* Special Offers Management */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="block font-medium">Bike Store Special Offers</label>
                  <Button 
                    type="primary" 
                    size="small"
                    onClick={() => {
                      const newOffer = {
                        title: '',
                        description: '',
                        condition: 'Only for Ready Cash Payments',
                        icon: 'GiftOutlined'
                      };
                      setSettings(s => ({ 
                        ...s, 
                        specialOffers: [...(s.specialOffers || []), newOffer] 
                      }));
                    }}
                  >
                    Add Bike Offer
                  </Button>
                </div>
                
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Bike Store Special Offers:</strong> These offers will be displayed on the AKR & SONS Bike Store page. 
                    They appear in the hero section to attract customers with exclusive deals.
                  </p>
                </div>
                
                <div className="space-y-4">
                  {(settings.specialOffers || []).map((offer, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Bike Offer {index + 1}</h4>
                        <Button 
                          type="text" 
                          danger 
                          size="small"
                          onClick={() => {
                            setSettings(s => ({
                              ...s,
                              specialOffers: s.specialOffers?.filter((_, i) => i !== index) || []
                            }));
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Offer Title</label>
                          <input 
                            type="text" 
                            className="border px-3 py-2 rounded w-full" 
                            placeholder="e.g., 15,000 LKR Discount, Free Helmet, Registration Fee Waived"
                            value={offer.title}
                            onChange={e => {
                              const newOffers = [...(settings.specialOffers || [])];
                              newOffers[index] = { ...newOffers[index], title: e.target.value };
                              setSettings(s => ({ ...s, specialOffers: newOffers }));
                            }}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Icon</label>
                          <select 
                            className="border px-3 py-2 rounded w-full"
                            value={offer.icon}
                            onChange={e => {
                              const newOffers = [...(settings.specialOffers || [])];
                              newOffers[index] = { ...newOffers[index], icon: e.target.value };
                              setSettings(s => ({ ...s, specialOffers: newOffers }));
                            }}
                          >
                            <option value="GiftOutlined">🎁 Gift Icon</option>
                            <option value="DollarOutlined">💰 Dollar Icon</option>
                            <option value="CarOutlined">🚗 Car Icon</option>
                            <option value="ThunderboltOutlined">⚡ Lightning Icon</option>
                            <option value="StarOutlined">⭐ Star Icon</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea 
                          className="border px-3 py-2 rounded w-full" 
                          rows={2}
                          placeholder="e.g., Enjoy an instant discount of 15,000 LKR on your purchase. Get a full tank of petrol, a stylish jacket, and a helmet with your new ride."
                          value={offer.description}
                          onChange={e => {
                            const newOffers = [...(settings.specialOffers || [])];
                            newOffers[index] = { ...newOffers[index], description: e.target.value };
                            setSettings(s => ({ ...s, specialOffers: newOffers }));
                          }}
                        />
                      </div>
                      
                      <div className="mt-3">
                        <label className="block text-sm font-medium mb-1">Condition</label>
                        <input 
                          type="text" 
                          className="border px-3 py-2 rounded w-full" 
                          placeholder="e.g., Only for Ready Cash Payments, Valid until December 2024"
                          value={offer.condition}
                          onChange={e => {
                            const newOffers = [...(settings.specialOffers || [])];
                            newOffers[index] = { ...newOffers[index], condition: e.target.value };
                            setSettings(s => ({ ...s, specialOffers: newOffers }));
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  
                  {(settings.specialOffers || []).length === 0 && (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                      <p>No bike store special offers configured</p>
                      <p className="text-sm">Click "Add Bike Offer" to create your first special offer for the bike store</p>
                    </div>
                  )}
                </div>
              </div>

              <Button type="primary" loading={settingsSaving} onClick={handleSaveSettings}>Save Settings</Button>
              </>}
            </div>
          )}
        </Layout.Content>
      </main>
    </div>
  );
} 