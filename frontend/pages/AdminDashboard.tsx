import React, { useEffect, useState } from "react";
import { Layout, Menu, Button, Modal, Table, Tag, message, Spin, Descriptions, Drawer, Row, Col, Card, Steps, Switch } from "antd";
import { CarOutlined, BookOutlined, UserOutlined, SettingOutlined, MenuOutlined, BankOutlined, ShoppingCartOutlined, CreditCardOutlined, TeamOutlined, ToolOutlined, InfoCircleOutlined, FileTextOutlined, ClockCircleOutlined, HistoryOutlined } from "@ant-design/icons";
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
  const [akrTab, setAkrTab] = useState<'vehicles' | 'prebookings' | 'customers' | 'overview' | 'settings' | 'accountData' | 'bankDeposits' | 'bikeInventory' | 'salesTransactions' | 'installmentPlans' | 'suppliers' | 'serviceWarranty' | 'additionalInfo' | 'vehicleAllocationCoupons' | 'nextDueInstallments' | 'recentActivity' | 'commissionerLetter' | 'chequeReleaseReminders'>('overview');
  const [installmentPlans, setInstallmentPlans] = useState([]);
  const [installmentStats, setInstallmentStats] = useState({});
  const [installmentSearch, setInstallmentSearch] = useState('');
  const [installmentStatusFilter, setInstallmentStatusFilter] = useState('');
  const [installmentMonthFilter, setInstallmentMonthFilter] = useState('');
  const [installmentLoading, setInstallmentLoading] = useState(false);
  const [installmentPagination, setInstallmentPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [installmentPlansModalOpen, setInstallmentPlansModalOpen] = useState(false);
  const [viewInstallmentPlanModalOpen, setViewInstallmentPlanModalOpen] = useState(false);
  const [viewingInstallmentPlan, setViewingInstallmentPlan] = useState<any>(null);
  const [editingInstallmentPlan, setEditingInstallmentPlan] = useState<any>(null);

  // Suppliers state
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [suppliersError, setSuppliersError] = useState("");
  const [suppliersSearch, setSuppliersSearch] = useState('');
  const [suppliersPagination, setSuppliersPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [suppliersStats, setSuppliersStats] = useState<any>({
    totalSuppliers: 0,
    activeSuppliers: 0,
    inactiveSuppliers: 0,
    suspendedSuppliers: 0,
    totalBikesSupplied: 0
  });
  const [suppliersModalOpen, setSuppliersModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [supplierForm, setSupplierForm] = useState({
    supplierName: '',
    contactPerson: '',
    phoneNo: '',
    email: '',
    address: '',
    lastPurchaseDate: '',
    totalSuppliedBikes: '',
    status: 'Active',
    notes: ''
  });

  // Service & Warranty state
  const [serviceWarranty, setServiceWarranty] = useState<any[]>([]);
  const [serviceWarrantyLoading, setServiceWarrantyLoading] = useState(false);
  const [serviceWarrantyError, setServiceWarrantyError] = useState("");
  const [serviceWarrantySearch, setServiceWarrantySearch] = useState('');
  const [serviceWarrantyPagination, setServiceWarrantyPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [serviceWarrantyStats, setServiceWarrantyStats] = useState<any>({
    totalServices: 0,
    pendingServices: 0,
    inProgressServices: 0,
    completedServices: 0,
    cancelledServices: 0,
    totalServiceCost: 0,
    warrantyServices: 0,
    regularServices: 0
  });
  const [serviceWarrantyModalOpen, setServiceWarrantyModalOpen] = useState(false);
  const [editingServiceWarranty, setEditingServiceWarranty] = useState<any>(null);
  const [serviceWarrantyForm, setServiceWarrantyForm] = useState({
    bikeId: '',
    customerId: '',
    serviceDate: '',
    typeOfService: 'Regular Service',
    description: '',
    serviceCost: '',
    technicianName: '',
    status: 'Pending',
    warrantyExpiryDate: '',
    warrantyType: 'Standard',
    notes: ''
  });

  // Additional Info state
  const [additionalInfo, setAdditionalInfo] = useState<any[]>([]);
  const [additionalInfoLoading, setAdditionalInfoLoading] = useState(false);
  const [additionalInfoError, setAdditionalInfoError] = useState("");
  const [additionalInfoSearch, setAdditionalInfoSearch] = useState('');
  const [additionalInfoPagination, setAdditionalInfoPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [additionalInfoStats, setAdditionalInfoStats] = useState<any>({
    totalRecords: 0,
    registeredBikes: 0,
    pendingRegistration: 0,
    expiredRegistration: 0,
    deliveredBikes: 0,
    pendingDelivery: 0,
    inTransit: 0,
    averageRating: 0,
    expiringInsurance: 0
  });
  const [additionalInfoModalOpen, setAdditionalInfoModalOpen] = useState(false);
  const [editingAdditionalInfo, setEditingAdditionalInfo] = useState<any>(null);
  const [additionalInfoForm, setAdditionalInfoForm] = useState({
    bikeId: '',
    customerId: '',
    insuranceProvider: '',
    insuranceExpiryDate: '',
    registrationStatus: 'Pending',
    bikeDeliveryStatus: 'Pending',
    customerFeedback: '',
    customerRating: '',
    remarks: '',
    notes: '',
    specialRequirements: '',
    followUpDate: '',
    followUpNotes: ''
  });

  // Vehicle Allocation Coupon state
  const [vehicleAllocationCoupons, setVehicleAllocationCoupons] = useState<any[]>([]);
  const [vehicleAllocationCouponsLoading, setVehicleAllocationCouponsLoading] = useState(false);
  const [vehicleAllocationCouponsError, setVehicleAllocationCouponsError] = useState("");
  const [vehicleAllocationCouponsSearch, setVehicleAllocationCouponsSearch] = useState('');
  const [vehicleAllocationCouponsPagination, setVehicleAllocationCouponsPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [vehicleAllocationCouponsStats, setVehicleAllocationCouponsStats] = useState<any>({
    totalCoupons: 0,
    pendingCoupons: 0,
    approvedCoupons: 0,
    completedCoupons: 0,
    cancelledCoupons: 0,
    totalAmount: 0,
    totalBalance: 0,
    totalDownPayment: 0
  });
  const [vehicleAllocationCouponsModalOpen, setVehicleAllocationCouponsModalOpen] = useState(false);
  const [editingVehicleAllocationCoupon, setEditingVehicleAllocationCoupon] = useState<any>(null);
  const [viewVehicleAllocationCouponModalOpen, setViewVehicleAllocationCouponModalOpen] = useState(false);
  const [viewingVehicleAllocationCoupon, setViewingVehicleAllocationCoupon] = useState<any>(null);
  const [vehicleAllocationCouponDropdownData, setVehicleAllocationCouponDropdownData] = useState<any>({
    nextWorkshopNo: '1',
    vehicles: [],
    paymentMethods: [],
    paymentTypes: []
  });
  const [vehicleAllocationCouponForm, setVehicleAllocationCouponForm] = useState({
    workshopNo: '',
    branch: '',
    date: '',
    fullName: '',
    address: '',
    nicNo: '',
    contactNo: '',
    occupation: '',
    dateOfBirth: '',
    vehicleType: '',
    engineNo: '',
    chassisNo: '',
    dateOfPurchase: '',
    leasingCompany: '',
    officerName: '',
    officerContactNo: '',
    commissionPercentage: '',
    totalAmount: '',
    balance: '',
    downPayment: '',
    regFee: '',
    docCharge: '',
    insuranceCo: '',
    firstInstallmentAmount: '',
    firstInstallmentDate: '',
    secondInstallmentAmount: '',
    secondInstallmentDate: '',
    thirdInstallmentAmount: '',
    thirdInstallmentDate: '',
    chequeNo: '',
    chequeAmount: '',
    paymentType: 'Cash',
    paymentMethod: 'Full Payment',
    vehicleIssueDate: '',
    vehicleIssueTime: '',
    status: 'Pending',
    notes: '',
            discountApplied: false,
        discountAmount: '',
                leaseAmount: '',
        interestAmount: '' // New field for interest amount
  });

  // Commissioner Letter state
  const [commissionerLetterForm, setCommissionerLetterForm] = useState({
    customerName: '',
    vehicleNumber: '',
    crNumber: '',
    nicNumber: '',
    address: '',
    settledDate: ''
  });

  const [installmentPlanForm, setInstallmentPlanForm] = useState({
    installmentId: '',
    customerName: '',
    totalAmount: '',
    downPayment: '',
    monthlyInstallment: '',
    numberOfMonths: '',
    startDate: '',
    endDate: '',
    remainingBalance: '',
    paymentStatus: 'Active',
    month: '',
    vehicleModel: '',
    phoneNumber: '',
    email: '',
    address: '',
    notes: ''
  });
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
    rating: "",
    stockQuantity: 0
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
  const [customerHistoryModalOpen, setCustomerHistoryModalOpen] = useState(false);
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState<any>(null);
  const [customerHistoryData, setCustomerHistoryData] = useState<any[]>([]);
  const [customerHistoryLoading, setCustomerHistoryLoading] = useState(false);
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
  
  // Account Data state
  const [accountData, setAccountData] = useState<any[]>([]);
  const [accountDataLoading, setAccountDataLoading] = useState(false);
  const [accountDataError, setAccountDataError] = useState("");
  const [accountDataSearch, setAccountDataSearch] = useState('');
  const [accountDataPagination, setAccountDataPagination] = useState({ current: 1, pageSize: 50, total: 0 });
  const [accountDataStats, setAccountDataStats] = useState<any>({});
  const [accountDataModalOpen, setAccountDataModalOpen] = useState(false);
  const [accountDataForm, setAccountDataForm] = useState<any>({
    date: new Date().toISOString().split('T')[0],
    name: '',
    details: '',
    amount: 0,
    model: '',
    color: '',
    credit: 0,
    cost: 0,
    balance: 0,
    chequeReceivedDate: '',
    chequeReleaseDate: '',
    paymentMode: '',
    remarks: '',
    leasing: ''
  });
  const [editingAccountData, setEditingAccountData] = useState<any>(null);
  
  // Bank Deposits state
  const [bankDeposits, setBankDeposits] = useState<any[]>([]);
  const [bankDepositsLoading, setBankDepositsLoading] = useState(false);
  const [bankDepositsError, setBankDepositsError] = useState("");
  const [bankDepositsSearch, setBankDepositsSearch] = useState('');
  const [bankDepositsPagination, setBankDepositsPagination] = useState({ current: 1, pageSize: 50, total: 0 });
  const [bankDepositsStats, setBankDepositsStats] = useState<any>({});
  const [bankDepositsModalOpen, setBankDepositsModalOpen] = useState(false);
  const [bankDepositsForm, setBankDepositsForm] = useState<any>({
    date: '',
    depositerName: '',
    accountNumber: '',
    accountName: '',
    purpose: '',
    quantity: 0,
    payment: 0
  });
  const [editingBankDeposit, setEditingBankDeposit] = useState<any>(null);

  // Bike Inventory State
  const [bikeInventory, setBikeInventory] = useState<any[]>([]);
  const [bikeInventoryLoading, setBikeInventoryLoading] = useState(false);
  const [bikeInventoryError, setBikeInventoryError] = useState("");
  const [bikeInventorySearch, setBikeInventorySearch] = useState('');
  const [bikeInventoryDateFilter, setBikeInventoryDateFilter] = useState('');
  const [bikeInventoryPagination, setBikeInventoryPagination] = useState({ current: 1, pageSize: 50, total: 0 });
  const [bikeInventoryStats, setBikeInventoryStats] = useState<any>({
    totalBikes: 0,
    totalStockQuantity: 0,
    totalCostValue: 0,
    totalSellingValue: 0,
    averageCostPrice: 0,
    averageSellingPrice: 0
  });
  const [bikeInventoryModalOpen, setBikeInventoryModalOpen] = useState(false);
  const [bikeInventoryForm, setBikeInventoryForm] = useState<any>({
    date: '',
    bikeId: '',
    branch: '',
    brand: '',
    category: '',
    model: '',
    color: '',
    engineNo: '',
    chassisNumber: '',
    workshopNo: ''
  });
  const [editingBikeInventory, setEditingBikeInventory] = useState<any>(null);
  const [viewBikeInventoryModalOpen, setViewBikeInventoryModalOpen] = useState(false);
  const [viewingBikeInventory, setViewingBikeInventory] = useState<any>(null);
  const [bikeInventoryDropdownData, setBikeInventoryDropdownData] = useState<any>({
    categories: [],
    vehiclesByCategory: {},
    allColors: [],
    nextBikeId: '1',
    vehicles: []
  });
  
  // Stock update state
  const [stockUpdateModalOpen, setStockUpdateModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [newStockQuantity, setNewStockQuantity] = useState(0);
  
  // Sidebar collapsible state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Cheque Release Reminders state
  const [chequeReleaseReminders, setChequeReleaseReminders] = useState<any[]>([]);
  const [chequeReleaseRemindersLoading, setChequeReleaseRemindersLoading] = useState(false);

  // Detailed Stock Information state
  const [detailedStockInfo, setDetailedStockInfo] = useState<any[]>([]);
  const [detailedStockInfoLoading, setDetailedStockInfoLoading] = useState(false);
  
  // Keyboard shortcut for toggling sidebar
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'b') {
        event.preventDefault();
        setSidebarCollapsed(!sidebarCollapsed);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [sidebarCollapsed]);
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
          // Keep the default tab as 'overview' instead of changing to 'vehicles'
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

  // Handle stock quantity update
  const handleUpdateStock = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setNewStockQuantity(vehicle.stockQuantity || 0);
    setStockUpdateModalOpen(true);
  };

  const handleStockUpdateSubmit = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const res = await fetch(`${apiUrl}/api/vehicles/${selectedVehicle._id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockQuantity: newStockQuantity })
      });
      
      if (!res.ok) throw new Error('Failed to update stock quantity');
      
      // Update the vehicle in the local state
      setVehicles(vehicles => vehicles.map(v => 
        v._id === selectedVehicle._id ? { ...v, stockQuantity: newStockQuantity } : v
      ));
      
      message.success(`Stock quantity updated to ${newStockQuantity}`);
      setStockUpdateModalOpen(false);
      setSelectedVehicle(null);
      setNewStockQuantity(0);
    } catch (error) {
      message.error('Failed to update stock quantity');
    }
  };

  // Handler for gallery image file input in Add Vehicle modal
  function handleGalleryImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setGalleryImageFiles(files);
      setGalleryImagePreviews(files.map(file => URL.createObjectURL(file)));
    }
  }

  // Fetch pre-bookings
  const fetchPreBookings = async () => {
    setPreBookingLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/prebookings`);
        if (!res.ok) throw new Error("Status " + res.status + ": " + res.statusText);
      const data = await res.json();
        setPreBookings(data);
        setPreBookingLoading(false);
    } catch (err: any) {
        setPreBookingError("Failed to load pre-bookings: " + err.message);
        setPreBookingLoading(false);
    }
  };

  useEffect(() => {
    fetchPreBookings();
  }, []);

  // Fetch account data
  const fetchAccountData = async (page = 1, search = '') => {
    setAccountDataLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: accountDataPagination.pageSize.toString(),
        search: search
      });
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const res = await fetch(`${apiUrl}/api/account-data?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error("Status " + res.status + ": " + res.statusText);
      const data = await res.json();
      
      setAccountData(data.data);
      setAccountDataPagination(data.pagination);
      setAccountDataLoading(false);
    } catch (err: any) {
      setAccountDataError("Failed to load account data: " + err.message);
      setAccountDataLoading(false);
    }
  };

  // Fetch account data stats
  const fetchAccountDataStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const res = await fetch(`${apiUrl}/api/account-data/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error("Status " + res.status + ": " + res.statusText);
      const stats = await res.json();
      setAccountDataStats(stats);
    } catch (err: any) {
      console.error("Failed to load account data stats:", err.message);
    }
  };

  // Load account data when tab is selected
  useEffect(() => {
    if (akrTab === 'accountData') {
      fetchAccountData();
      fetchAccountDataStats();
    }
  }, [akrTab]);

  // Fetch installment plans from Vehicle Allocation Coupons
  const fetchInstallmentPlans = async (page = 1, search = '', status = '', month = '') => {
    setInstallmentLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: installmentPagination.pageSize.toString(),
        search: search
      });
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      // Fetch from Vehicle Allocation Coupons instead of separate Installment Plans
      const res = await fetch(`${apiUrl}/api/vehicle-allocation-coupons?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error("Status " + res.status + ": " + res.statusText);
      const response = await res.json();
      
      // Filter coupons that have balance and are "Leasing via AKR" only
      const couponsWithBalance = response.vehicleAllocationCoupons.filter((coupon: any) => 
        coupon.balance > 0 && 
        coupon.paymentMethod === 'Leasing via AKR' &&
        (status === '' || coupon.status === status) &&
        (month === '' || new Date(coupon.dateOfPurchase).getMonth() === parseInt(month))
      );
      
      // Transform Vehicle Allocation Coupons to Installment Plan format with full details
      const transformedData = couponsWithBalance.map((coupon: any) => ({
        _id: coupon._id,
        installmentId: `IP-${coupon.couponId}`,
        customerName: coupon.fullName,
        customerPhone: coupon.contactNo,
        customerAddress: coupon.address,
        vehicleModel: coupon.vehicleType,
        engineNumber: coupon.engineNo,
        chassisNumber: coupon.chassisNo,
        totalAmount: coupon.totalAmount,
        downPayment: coupon.downPayment,
        balanceAmount: coupon.balance,
        installmentAmount: coupon.balance / 3, // Default to 3 installments
        numberOfInstallments: 3,
        startDate: coupon.dateOfPurchase,
        firstInstallmentDate: coupon.firstInstallment?.date,
        secondInstallmentDate: coupon.secondInstallment?.date,
        thirdInstallmentDate: coupon.thirdInstallment?.date,
        firstInstallmentAmount: coupon.firstInstallment?.amount,
        secondInstallmentAmount: coupon.secondInstallment?.amount,
        thirdInstallmentAmount: coupon.thirdInstallment?.amount,
        firstInstallmentPaidAmount: coupon.firstInstallment?.paidAmount || 0,
        secondInstallmentPaidAmount: coupon.secondInstallment?.paidAmount || 0,
        thirdInstallmentPaidAmount: coupon.thirdInstallment?.paidAmount || 0,
        firstInstallmentPaidDate: coupon.firstInstallment?.paidDate,
        secondInstallmentPaidDate: coupon.secondInstallment?.paidDate,
        thirdInstallmentPaidDate: coupon.thirdInstallment?.paidDate,
        firstInstallment: coupon.firstInstallment,
        secondInstallment: coupon.secondInstallment,
        thirdInstallment: coupon.thirdInstallment,
        paymentMethod: coupon.paymentMethod,
        leasingCompany: coupon.leasingCompany,
        officerName: coupon.officerName,
        officerContactNo: coupon.officerContactNo,
        commissionPercentage: coupon.commissionPercentage,
        status: coupon.status,
        notes: coupon.notes,
        relatedCouponId: coupon.couponId
      }));
      
      setInstallmentPlans(transformedData);
      setInstallmentPagination({
        current: parseInt(page),
        pageSize: installmentPagination.pageSize,
        total: transformedData.length
      });
      setInstallmentLoading(false);
    } catch (err: any) {
      console.error("Failed to load installment plans:", err.message);
      setInstallmentLoading(false);
    }
  };

  // Fetch installment plans stats from Vehicle Allocation Coupons
  const fetchInstallmentPlansStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      
      // Fetch from Vehicle Allocation Coupons instead of separate Installment Plans
      const res = await fetch(`${apiUrl}/api/vehicle-allocation-coupons?limit=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error("Status " + res.status + ": " + res.statusText);
      const response = await res.json();
      
      // Calculate stats from Vehicle Allocation Coupons with balance
      const couponsWithBalance = response.vehicleAllocationCoupons.filter((coupon: any) => coupon.balance > 0);
      const stats = {
        totalInstallmentPlans: couponsWithBalance.length,
        totalBalanceAmount: couponsWithBalance.reduce((sum: number, coupon: any) => sum + (coupon.balance || 0), 0),
        totalDownPayment: couponsWithBalance.reduce((sum: number, coupon: any) => sum + (coupon.downPayment || 0), 0),
        totalInstallmentAmount: couponsWithBalance.reduce((sum: number, coupon: any) => sum + ((coupon.balance || 0) / 3), 0)
      };
      
      setInstallmentPlansStats(stats);
    } catch (err: any) {
      console.error("Failed to load installment plans stats:", err.message);
    }
  };

  // Handle installment plan form changes
  const handleInstallmentPlanFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInstallmentPlanForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle installment plan number changes
  const handleInstallmentPlanNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;
    setInstallmentPlanForm(prev => ({ ...prev, [name]: numValue }));
  };

  // Create or update installment plan
  const handleInstallmentPlanSubmit = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const url = editingInstallmentPlan 
        ? `${import.meta.env.VITE_API_URL}/api/installment-plans/${editingInstallmentPlan._id}`
        : `${import.meta.env.VITE_API_URL}/api/installment-plans`;
      
      const method = editingInstallmentPlan ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(installmentPlanForm)
      });
      
      if (!res.ok) throw new Error("Failed to save installment plan");
      
      message.success(editingInstallmentPlan ? 'Installment plan updated successfully' : 'Installment plan created successfully');
      setInstallmentPlansModalOpen(false);
      setEditingInstallmentPlan(null);
      setInstallmentPlanForm({
        installmentId: '',
        customerName: '',
        totalAmount: '',
        downPayment: '',
        monthlyInstallment: '',
        numberOfMonths: '',
        startDate: '',
        endDate: '',
        remainingBalance: '',
        paymentStatus: 'Active',
        month: '',
        vehicleModel: '',
        phoneNumber: '',
        email: '',
        address: '',
        notes: ''
      });
      fetchInstallmentPlans();
      fetchInstallmentPlansStats();
    } catch (err: any) {
      message.error("Failed to save installment plan: " + err.message);
    }
  };

  // Delete installment plan
  const handleDeleteInstallmentPlan = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this installment plan?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/installment-plans/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        }
      });
      
      if (!res.ok) throw new Error("Failed to delete installment plan");
      
      message.success('Installment plan deleted successfully');
      fetchInstallmentPlans();
      fetchInstallmentPlansStats();
    } catch (error) {
      console.error('Error deleting installment plan:', error);
      message.error('Failed to delete installment plan');
    }
  };

  // Handle installment payment toggle (mark as paid/unpaid)
  const handleInstallmentPaymentToggle = async (couponId: string, installmentType: string, isPaid: boolean, amount: number) => {
    try {
      const token = localStorage.getItem('adminToken');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      
      // First, get the current coupon data to preserve existing fields
      const getRes = await fetch(`${apiUrl}/api/vehicle-allocation-coupons/${couponId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!getRes.ok) throw new Error("Failed to fetch current coupon data");
      const currentCoupon = await getRes.json();
      
      // Get the current installment data
      const currentInstallment = currentCoupon[installmentType] || {};
      
      const updateData = {
        [installmentType]: {
          amount: amount,
          date: currentInstallment.date, // Preserve the existing date
          paidAmount: isPaid ? amount : 0,
          paidDate: isPaid ? new Date().toISOString() : null
        }
      };

      const res = await fetch(`${apiUrl}/api/vehicle-allocation-coupons/${couponId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!res.ok) throw new Error("Failed to update installment payment");
      
      message.success(`Installment marked as ${isPaid ? 'paid' : 'unpaid'}`);
      
      // Refresh the installment plans data
      fetchInstallmentPlans();
      fetchInstallmentPlansStats();
    } catch (err: any) {
      message.error("Failed to update installment payment: " + err.message);
    }
  };

  // Edit installment plan
  const handleEditInstallmentPlan = (record: any) => {
    setEditingInstallmentPlan(record);
    setInstallmentPlanForm({
      installmentId: record.installmentId || '',
      customerName: record.customerName || '',
      totalAmount: record.totalAmount || '',
      downPayment: record.downPayment || '',
      monthlyInstallment: record.monthlyInstallment || '',
      numberOfMonths: record.numberOfMonths || '',
      startDate: record.startDate ? new Date(record.startDate).toISOString().split('T')[0] : '',
      endDate: record.endDate ? new Date(record.endDate).toISOString().split('T')[0] : '',
      remainingBalance: record.remainingBalance || '',
      paymentStatus: record.paymentStatus || 'Active',
      month: record.month || '',
      vehicleModel: record.vehicleModel || '',
      phoneNumber: record.phoneNumber || '',
      email: record.email || '',
      address: record.address || '',
      notes: record.notes || ''
    });
    setInstallmentPlansModalOpen(true);
  };

  // View installment plan
  const handleViewInstallmentPlan = (record: any) => {
    setViewingInstallmentPlan(record);
    setViewInstallmentPlanModalOpen(true);
  };

  // Fetch suppliers
  const fetchSuppliers = async (page = 1, search = '') => {
    setSuppliersLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: suppliersPagination.pageSize.toString(),
        search: search
      });
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const res = await fetch(`${apiUrl}/api/suppliers?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error("Status " + res.status + ": " + res.statusText);
      const data = await res.json();
      
      setSuppliers(data.suppliers);
      setSuppliersPagination({
        current: parseInt(page),
        pageSize: suppliersPagination.pageSize,
        total: data.total
      });
      setSuppliersLoading(false);
    } catch (err: any) {
      console.error("Failed to load suppliers:", err.message);
      setSuppliersLoading(false);
    }
  };

  // Fetch suppliers stats
  const fetchSuppliersStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/suppliers/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error("Status " + res.status + ": " + res.statusText);
      const response = await res.json();
      setSuppliersStats(response.overall);
    } catch (err: any) {
      console.error("Failed to load supplier stats:", err.message);
    }
  };

  // Load suppliers when tab is selected
  useEffect(() => {
    if (akrTab === 'suppliers') {
      fetchSuppliers();
      fetchSuppliersStats();
    }
  }, [akrTab]);

  // Handle supplier form changes
  const handleSupplierFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSupplierForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle supplier number changes
  const handleSupplierNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;
    setSupplierForm(prev => ({ ...prev, [name]: numValue }));
  };

  // Create or update supplier
  const handleSupplierSubmit = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const url = editingSupplier 
        ? `${import.meta.env.VITE_API_URL}/api/suppliers/${editingSupplier._id}`
        : `${import.meta.env.VITE_API_URL}/api/suppliers`;
      
      const method = editingSupplier ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(supplierForm)
      });
      
      if (!res.ok) throw new Error("Failed to save supplier");
      
      message.success(editingSupplier ? 'Supplier updated successfully' : 'Supplier created successfully');
      setSuppliersModalOpen(false);
      setEditingSupplier(null);
      setSupplierForm({
        supplierName: '',
        contactPerson: '',
        phoneNo: '',
        email: '',
        address: '',
        lastPurchaseDate: '',
        totalSuppliedBikes: '',
        status: 'Active',
        notes: ''
      });
      fetchSuppliers();
      fetchSuppliersStats();
    } catch (err: any) {
      message.error("Failed to save supplier: " + err.message);
    }
  };

  // Delete supplier
  const handleDeleteSupplier = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/suppliers/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        }
      });
      
      if (!res.ok) throw new Error("Failed to delete supplier");
      
      message.success('Supplier deleted successfully');
      fetchSuppliers();
      fetchSuppliersStats();
    } catch (error) {
      console.error('Error deleting supplier:', error);
      message.error('Failed to delete supplier');
    }
  };

  // Edit supplier
  const handleEditSupplier = (record: any) => {
    setEditingSupplier(record);
    setSupplierForm({
      supplierName: record.supplierName || '',
      contactPerson: record.contactPerson || '',
      phoneNo: record.phoneNo || '',
      email: record.email || '',
      address: record.address || '',
      lastPurchaseDate: record.lastPurchaseDate ? new Date(record.lastPurchaseDate).toISOString().split('T')[0] : '',
      totalSuppliedBikes: record.totalSuppliedBikes || '',
      status: record.status || 'Active',
      notes: record.notes || ''
    });
    setSuppliersModalOpen(true);
  };

  // Export suppliers to PDF
  const exportSuppliersToPDF = async () => {
    try {
      // Fetch all records for complete report
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        limit: '1000', // Get all records
        search: suppliersSearch
      });
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/suppliers?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      const allRecords = data.suppliers || data.data || [];
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const currentDate = new Date().toLocaleDateString('en-GB');
      const currentTime = new Date().toLocaleTimeString('en-GB');
      const searchTerm = suppliersSearch ? ` (Filtered by: "${suppliersSearch}")` : '';
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Suppliers Report - ${currentDate}</title>
            <style>
              * { box-sizing: border-box; }
              body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 20px; 
                line-height: 1.4;
              }
              .header { 
                text-align: center !important; 
                margin-bottom: 30px; 
                border-bottom: 2px solid #333; 
                padding-bottom: 15px;
                width: 100%;
              }
              .company-name { 
                font-size: 28px; 
                font-weight: bold; 
                color: #333; 
                margin: 0 0 10px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .report-title { 
                font-size: 20px; 
                color: #666; 
                margin: 10px 0 5px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .report-info { 
                font-size: 14px; 
                color: #666; 
                margin: 5px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .stats { 
                display: flex; 
                justify-content: space-around; 
                margin: 20px 0; 
                padding: 15px; 
                background: #f5f5f5; 
                border-radius: 5px;
                width: 100%;
              }
              .stat-item { 
                text-align: center;
                flex: 1;
                margin: 0 10px;
              }
              .stat-value { 
                font-size: 18px; 
                font-weight: bold; 
                color: #333;
                margin-bottom: 5px;
              }
              .stat-label { 
                font-size: 12px; 
                color: #666;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 20px;
                font-size: 12px;
              }
              th, td { 
                border: 1px solid #ddd; 
                padding: 8px; 
                text-align: left;
                vertical-align: top;
              }
              th { 
                background-color: #f2f2f2; 
                font-weight: bold;
                text-align: center;
              }
              tr:nth-child(even) { background-color: #f9f9f9; }
              .status-active { color: #28a745; font-weight: bold; }
              .status-inactive { color: #6c757d; font-weight: bold; }
              .status-suspended { color: #dc3545; font-weight: bold; }
              @media print {
                body { margin: 0; padding: 10px; }
                .no-print { display: none; }
                table { font-size: 10px; }
                th, td { padding: 4px; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="company-name">AKR & SONS (PVT) LTD</div>
              <div class="report-title">Suppliers Information Report</div>
              <div class="report-info">Generated on: ${currentDate} at ${currentTime}</div>
              <div class="report-info">${searchTerm}</div>
            </div>

            <div class="stats">
              <div class="stat-item">
                <div class="stat-value">${suppliersStats?.totalSuppliers?.toLocaleString() || '0'}</div>
                <div class="stat-label">Total Suppliers</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${suppliersStats?.activeSuppliers?.toLocaleString() || '0'}</div>
                <div class="stat-label">Active Suppliers</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${suppliersStats?.totalBikesSupplied?.toLocaleString() || '0'}</div>
                <div class="stat-label">Total Bikes Supplied</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${suppliersStats?.inactiveSuppliers?.toLocaleString() || '0'}</div>
                <div class="stat-label">Inactive Suppliers</div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Supplier ID</th>
                  <th>Supplier Name</th>
                  <th>Contact Person</th>
                  <th>Phone No</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Last Purchase Date</th>
                  <th>Total Supplied Bikes</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${allRecords.map((record: any) => `
                  <tr>
                    <td>${record.supplierId || '-'}</td>
                    <td>${record.supplierName || '-'}</td>
                    <td>${record.contactPerson || '-'}</td>
                    <td>${record.phoneNo || '-'}</td>
                    <td>${record.email || '-'}</td>
                    <td>${record.address || '-'}</td>
                    <td>${record.lastPurchaseDate ? new Date(record.lastPurchaseDate).toLocaleDateString('en-GB') : '-'}</td>
                    <td>${record.totalSuppliedBikes?.toLocaleString() || '0'}</td>
                    <td class="status-${record.status?.toLowerCase() || 'unknown'}">${record.status || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
      
    } catch (error) {
      console.error('Error generating print report:', error);
      message.error('Failed to generate print report');
    }
  };

  // Fetch service warranty records
  const fetchServiceWarranty = async (page = 1, search = '', typeOfService = '', status = '') => {
    setServiceWarrantyLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: serviceWarrantyPagination.pageSize.toString(),
        search: search,
        typeOfService: typeOfService,
        status: status
      });
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const res = await fetch(`${apiUrl}/api/service-warranty?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error("Status " + res.status + ": " + res.statusText);
      const data = await res.json();
      
      setServiceWarranty(data.serviceWarranty);
      setServiceWarrantyPagination({
        current: parseInt(page),
        pageSize: serviceWarrantyPagination.pageSize,
        total: data.total
      });
      setServiceWarrantyLoading(false);
    } catch (err: any) {
      console.error("Failed to load service warranty records:", err.message);
      setServiceWarrantyLoading(false);
    }
  };

  // Fetch service warranty stats
  const fetchServiceWarrantyStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/service-warranty/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error("Status " + res.status + ": " + res.statusText);
      const response = await res.json();
      setServiceWarrantyStats(response.overall);
    } catch (err: any) {
      console.error("Failed to load service warranty stats:", err.message);
    }
  };

  // Handle service warranty form changes
  const handleServiceWarrantyFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setServiceWarrantyForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle service warranty number changes
  const handleServiceWarrantyNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;
    setServiceWarrantyForm(prev => ({ ...prev, [name]: numValue }));
  };

  // Create or update service warranty
  const handleServiceWarrantySubmit = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const url = editingServiceWarranty 
        ? `${import.meta.env.VITE_API_URL}/api/service-warranty/${editingServiceWarranty._id}`
        : `${import.meta.env.VITE_API_URL}/api/service-warranty`;
      
      const method = editingServiceWarranty ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(serviceWarrantyForm)
      });
      
      if (!res.ok) throw new Error("Failed to save service warranty record");
      
      message.success(editingServiceWarranty ? 'Service warranty record updated successfully' : 'Service warranty record created successfully');
      setServiceWarrantyModalOpen(false);
      setEditingServiceWarranty(null);
      setServiceWarrantyForm({
        bikeId: '',
        customerId: '',
        serviceDate: '',
        typeOfService: 'Regular Service',
        description: '',
        serviceCost: '',
        technicianName: '',
        status: 'Pending',
        warrantyExpiryDate: '',
        warrantyType: 'Standard',
        notes: ''
      });
      fetchServiceWarranty();
      fetchServiceWarrantyStats();
    } catch (err: any) {
      message.error("Failed to save service warranty record: " + err.message);
    }
  };

  // Delete service warranty
  const handleDeleteServiceWarranty = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this service warranty record?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/service-warranty/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        }
      });
      
      if (!res.ok) throw new Error("Failed to delete service warranty record");
      
      message.success('Service warranty record deleted successfully');
      fetchServiceWarranty();
      fetchServiceWarrantyStats();
    } catch (error) {
      console.error('Error deleting service warranty record:', error);
      message.error('Failed to delete service warranty record');
    }
  };

  // Edit service warranty
  const handleEditServiceWarranty = (record: any) => {
    setEditingServiceWarranty(record);
    setServiceWarrantyForm({
      bikeId: record.bikeId || '',
      customerId: record.customerId || '',
      serviceDate: record.serviceDate ? new Date(record.serviceDate).toISOString().split('T')[0] : '',
      typeOfService: record.typeOfService || 'Regular Service',
      description: record.description || '',
      serviceCost: record.serviceCost || '',
      technicianName: record.technicianName || '',
      status: record.status || 'Pending',
      warrantyExpiryDate: record.warrantyExpiryDate ? new Date(record.warrantyExpiryDate).toISOString().split('T')[0] : '',
      warrantyType: record.warrantyType || 'Standard',
      notes: record.notes || ''
    });
    setServiceWarrantyModalOpen(true);
  };

  // Export service warranty to PDF
  const exportServiceWarrantyToPDF = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        limit: '1000',
        search: serviceWarrantySearch
      });
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/service-warranty?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      const allRecords = data.serviceWarranty || data.data || [];
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const currentDate = new Date().toLocaleDateString('en-GB');
      const currentTime = new Date().toLocaleTimeString('en-GB');
      const searchTerm = serviceWarrantySearch ? ` (Filtered by: "${serviceWarrantySearch}")` : '';
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Service & Warranty Report - ${currentDate}</title>
            <style>
              * { box-sizing: border-box; }
              body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 20px; 
                line-height: 1.4;
              }
              .header { 
                text-align: center !important; 
                margin-bottom: 30px; 
                border-bottom: 2px solid #333; 
                padding-bottom: 15px;
                width: 100%;
              }
              .company-name { 
                font-size: 28px; 
                font-weight: bold; 
                color: #333; 
                margin: 0 0 10px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .report-title { 
                font-size: 20px; 
                color: #666; 
                margin: 10px 0 5px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .report-info { 
                font-size: 14px; 
                color: #666; 
                margin: 5px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .stats { 
                display: flex; 
                justify-content: space-around; 
                margin: 20px 0; 
                padding: 15px; 
                background: #f5f5f5; 
                border-radius: 5px;
                width: 100%;
              }
              .stat-item { 
                text-align: center;
                flex: 1;
                margin: 0 10px;
              }
              .stat-value { 
                font-size: 18px; 
                font-weight: bold; 
                color: #333;
                margin-bottom: 5px;
              }
              .stat-label { 
                font-size: 12px; 
                color: #666;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 20px;
                font-size: 12px;
              }
              th, td { 
                border: 1px solid #ddd; 
                padding: 8px; 
                text-align: left;
                vertical-align: top;
              }
              th { 
                background-color: #f2f2f2; 
                font-weight: bold;
                text-align: center;
              }
              tr:nth-child(even) { background-color: #f9f9f9; }
              .status-pending { color: #ffa500; font-weight: bold; }
              .status-in-progress { color: #0066cc; font-weight: bold; }
              .status-completed { color: #28a745; font-weight: bold; }
              .status-cancelled { color: #dc3545; font-weight: bold; }
              @media print {
                body { margin: 0; padding: 10px; }
                .no-print { display: none; }
                table { font-size: 10px; }
                th, td { padding: 4px; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="company-name">AKR & SONS (PVT) LTD</div>
              <div class="report-title">Service & Warranty Report</div>
              <div class="report-info">Generated on: ${currentDate} at ${currentTime}</div>
              <div class="report-info">${searchTerm}</div>
            </div>

            <div class="stats">
              <div class="stat-item">
                <div class="stat-value">${serviceWarrantyStats?.totalServices?.toLocaleString() || '0'}</div>
                <div class="stat-label">Total Services</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${serviceWarrantyStats?.completedServices?.toLocaleString() || '0'}</div>
                <div class="stat-label">Completed</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">LKR ${serviceWarrantyStats?.totalServiceCost?.toLocaleString() || '0'}</div>
                <div class="stat-label">Total Cost</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${serviceWarrantyStats?.warrantyServices?.toLocaleString() || '0'}</div>
                <div class="stat-label">Warranty Services</div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Service ID</th>
                  <th>Bike ID</th>
                  <th>Customer ID</th>
                  <th>Service Date</th>
                  <th>Type of Service</th>
                  <th>Description</th>
                  <th>Service Cost</th>
                  <th>Technician Name</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${allRecords.map((record: any) => `
                  <tr>
                    <td>${record.serviceId || '-'}</td>
                    <td>${record.bikeId || '-'}</td>
                    <td>${record.customerId || '-'}</td>
                    <td>${record.serviceDate ? new Date(record.serviceDate).toLocaleDateString('en-GB') : '-'}</td>
                    <td>${record.typeOfService || '-'}</td>
                    <td>${record.description || '-'}</td>
                    <td>LKR ${record.serviceCost?.toLocaleString() || '0'}</td>
                    <td>${record.technicianName || '-'}</td>
                    <td class="status-${record.status?.toLowerCase().replace(' ', '-') || 'unknown'}">${record.status || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
      
    } catch (error) {
      console.error('Error generating print report:', error);
      message.error('Failed to generate print report');
    }
  };

  // Fetch additional info records
  const fetchAdditionalInfo = async (page = 1, search = '', registrationStatus = '', bikeDeliveryStatus = '') => {
    setAdditionalInfoLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: additionalInfoPagination.pageSize.toString(),
        search: search,
        registrationStatus: registrationStatus,
        bikeDeliveryStatus: bikeDeliveryStatus
      });
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const res = await fetch(`${apiUrl}/api/additional-info?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error("Status " + res.status + ": " + res.statusText);
      const data = await res.json();
      
      setAdditionalInfo(data.additionalInfo);
      setAdditionalInfoPagination({
        current: parseInt(page),
        pageSize: additionalInfoPagination.pageSize,
        total: data.total
      });
      setAdditionalInfoLoading(false);
    } catch (err: any) {
      console.error("Failed to load additional info records:", err.message);
      setAdditionalInfoLoading(false);
    }
  };

  // Fetch additional info stats
  const fetchAdditionalInfoStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/additional-info/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error("Status " + res.status + ": " + res.statusText);
      const response = await res.json();
      setAdditionalInfoStats(response.overall);
    } catch (err: any) {
      console.error("Failed to load additional info stats:", err.message);
    }
  };

  // Handle additional info form changes
  const handleAdditionalInfoFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAdditionalInfoForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle additional info number changes
  const handleAdditionalInfoNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;
    setAdditionalInfoForm(prev => ({ ...prev, [name]: numValue }));
  };

  // Create or update additional info
  const handleAdditionalInfoSubmit = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const url = editingAdditionalInfo 
        ? `${import.meta.env.VITE_API_URL}/api/additional-info/${editingAdditionalInfo._id}`
        : `${import.meta.env.VITE_API_URL}/api/additional-info`;
      
      const method = editingAdditionalInfo ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(additionalInfoForm)
      });
      
      if (!res.ok) throw new Error("Failed to save additional info record");
      
      message.success(editingAdditionalInfo ? 'Additional info record updated successfully' : 'Additional info record created successfully');
      setAdditionalInfoModalOpen(false);
      setEditingAdditionalInfo(null);
      setAdditionalInfoForm({
        bikeId: '',
        customerId: '',
        insuranceProvider: '',
        insuranceExpiryDate: '',
        registrationStatus: 'Pending',
        bikeDeliveryStatus: 'Pending',
        customerFeedback: '',
        customerRating: '',
        remarks: '',
        notes: '',
        specialRequirements: '',
        followUpDate: '',
        followUpNotes: ''
      });
      fetchAdditionalInfo();
      fetchAdditionalInfoStats();
    } catch (err: any) {
      message.error("Failed to save additional info record: " + err.message);
    }
  };

  // Delete additional info
  const handleDeleteAdditionalInfo = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this additional info record?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/additional-info/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        }
      });
      
      if (!res.ok) throw new Error("Failed to delete additional info record");
      
      message.success('Additional info record deleted successfully');
      fetchAdditionalInfo();
      fetchAdditionalInfoStats();
    } catch (error) {
      console.error('Error deleting additional info record:', error);
      message.error('Failed to delete additional info record');
    }
  };

  // Edit additional info
  const handleEditAdditionalInfo = (record: any) => {
    setEditingAdditionalInfo(record);
    setAdditionalInfoForm({
      bikeId: record.bikeId || '',
      customerId: record.customerId || '',
      insuranceProvider: record.insuranceProvider || '',
      insuranceExpiryDate: record.insuranceExpiryDate ? new Date(record.insuranceExpiryDate).toISOString().split('T')[0] : '',
      registrationStatus: record.registrationStatus || 'Pending',
      bikeDeliveryStatus: record.bikeDeliveryStatus || 'Pending',
      customerFeedback: record.customerFeedback || '',
      customerRating: record.customerRating || '',
      remarks: record.remarks || '',
      notes: record.notes || '',
      specialRequirements: record.specialRequirements || '',
      followUpDate: record.followUpDate ? new Date(record.followUpDate).toISOString().split('T')[0] : '',
      followUpNotes: record.followUpNotes || ''
    });
    setAdditionalInfoModalOpen(true);
  };

  // Export additional info to PDF
  const exportAdditionalInfoToPDF = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        limit: '1000',
        search: additionalInfoSearch
      });
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/additional-info?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      const allRecords = data.additionalInfo || data.data || [];
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const currentDate = new Date().toLocaleDateString('en-GB');
      const currentTime = new Date().toLocaleTimeString('en-GB');
      const searchTerm = additionalInfoSearch ? ` (Filtered by: "${additionalInfoSearch}")` : '';
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Additional Info Report - ${currentDate}</title>
            <style>
              * { box-sizing: border-box; }
              body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 20px; 
                line-height: 1.4;
              }
              .header { 
                text-align: center !important; 
                margin-bottom: 30px; 
                border-bottom: 2px solid #333; 
                padding-bottom: 15px;
                width: 100%;
              }
              .company-name { 
                font-size: 28px; 
                font-weight: bold; 
                color: #333; 
                margin: 0 0 10px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .report-title { 
                font-size: 20px; 
                color: #666; 
                margin: 10px 0 5px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .report-info { 
                font-size: 14px; 
                color: #666; 
                margin: 5px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .stats { 
                display: flex; 
                justify-content: space-around; 
                margin: 20px 0; 
                padding: 15px; 
                background: #f5f5f5; 
                border-radius: 5px;
                width: 100%;
              }
              .stat-item { 
                text-align: center;
                flex: 1;
                margin: 0 10px;
              }
              .stat-value { 
                font-size: 18px; 
                font-weight: bold; 
                color: #333;
                margin-bottom: 5px;
              }
              .stat-label { 
                font-size: 12px; 
                color: #666;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 20px;
                font-size: 12px;
              }
              th, td { 
                border: 1px solid #ddd; 
                padding: 8px; 
                text-align: left;
                vertical-align: top;
              }
              th { 
                background-color: #f2f2f2; 
                font-weight: bold;
                text-align: center;
              }
              tr:nth-child(even) { background-color: #f9f9f9; }
              .status-registered { color: #28a745; font-weight: bold; }
              .status-pending { color: #ffa500; font-weight: bold; }
              .status-expired { color: #dc3545; font-weight: bold; }
              .status-delivered { color: #28a745; font-weight: bold; }
              .status-in-transit { color: #0066cc; font-weight: bold; }
              @media print {
                body { margin: 0; padding: 10px; }
                .no-print { display: none; }
                table { font-size: 10px; }
                th, td { padding: 4px; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="company-name">AKR & SONS (PVT) LTD</div>
              <div class="report-title">Additional Info Report</div>
              <div class="report-info">Generated on: ${currentDate} at ${currentTime}</div>
              <div class="report-info">${searchTerm}</div>
            </div>

            <div class="stats">
              <div class="stat-item">
                <div class="stat-value">${additionalInfoStats?.totalRecords?.toLocaleString() || '0'}</div>
                <div class="stat-label">Total Records</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${additionalInfoStats?.registeredBikes?.toLocaleString() || '0'}</div>
                <div class="stat-label">Registered Bikes</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${additionalInfoStats?.deliveredBikes?.toLocaleString() || '0'}</div>
                <div class="stat-label">Delivered Bikes</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${additionalInfoStats?.averageRating?.toFixed(1) || '0'}</div>
                <div class="stat-label">Avg Rating</div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Bike ID</th>
                  <th>Customer ID</th>
                  <th>Insurance Provider</th>
                  <th>Insurance Expiry Date</th>
                  <th>Registration Status</th>
                  <th>Bike Delivery Status</th>
                  <th>Customer Feedback</th>
                  <th>Customer Rating</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                ${allRecords.map((record: any) => `
                  <tr>
                    <td>${record.bikeId || '-'}</td>
                    <td>${record.customerId || '-'}</td>
                    <td>${record.insuranceProvider || '-'}</td>
                    <td>${record.insuranceExpiryDate ? new Date(record.insuranceExpiryDate).toLocaleDateString('en-GB') : '-'}</td>
                    <td class="status-${record.registrationStatus?.toLowerCase().replace(' ', '-') || 'unknown'}">${record.registrationStatus || '-'}</td>
                    <td class="status-${record.bikeDeliveryStatus?.toLowerCase().replace(' ', '-') || 'unknown'}">${record.bikeDeliveryStatus || '-'}</td>
                    <td>${record.customerFeedback || '-'}</td>
                    <td>${record.customerRating || '-'}</td>
                    <td>${record.remarks || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
      
    } catch (error) {
      console.error('Error generating print report:', error);
      message.error('Failed to generate print report');
    }
  };

  // Load data when tabs are selected
  useEffect(() => {
    if (akrTab === 'serviceWarranty') {
      fetchServiceWarranty();
      fetchServiceWarrantyStats();
    }
    if (akrTab === 'additionalInfo') {
      fetchAdditionalInfo();
      fetchAdditionalInfoStats();
    }
    if (akrTab === 'vehicleAllocationCoupons') {
      fetchVehicleAllocationCoupons();
      fetchVehicleAllocationCouponsStats();
      fetchVehicleAllocationCouponDropdownData();
    }
    if (akrTab === 'overview') {
      // Load data needed for overview dashboard
      fetchVehicleAllocationCoupons(1, '', '', '', 1000); // Load all records for overview
      fetchVehicleAllocationCouponsStats();
      fetchCustomers(); // Load customers for overview
      fetchPreBookings(); // Load pre-bookings for overview
      fetchChequeReleaseReminders(); // Load cheque release reminders
      fetchDetailedStockInfo(); // Load detailed stock information for overview
    }
    if (akrTab === 'chequeReleaseReminders') {
      fetchChequeReleaseReminders(true); // Load cheque release reminders including released ones
    }
    if (akrTab === 'bikeInventory') {
      fetchDetailedStockInfo(); // Load detailed stock information
    }
  }, [akrTab]);

  // Load overview data on component mount
  useEffect(() => {
    // Load data needed for overview dashboard on initial load
    fetchVehicleAllocationCoupons(1, '', '', '', 1000);
    fetchVehicleAllocationCouponsStats();
  }, []);

  // Auto-generate workshop number when modal opens
  useEffect(() => {
    if (vehicleAllocationCouponsModalOpen && !editingVehicleAllocationCoupon) {
      setVehicleAllocationCouponForm(prev => ({
        ...prev,
        workshopNo: vehicleAllocationCouponDropdownData.nextWorkshopNo || '1',
        date: new Date().toISOString().split('T')[0]
      }));
    }
  }, [vehicleAllocationCouponsModalOpen, editingVehicleAllocationCoupon, vehicleAllocationCouponDropdownData.nextWorkshopNo]);

  // Fetch vehicle allocation coupons
  const fetchVehicleAllocationCoupons = async (page = 1, search = '', status = '', paymentType = '', limit?: number) => {
    setVehicleAllocationCouponsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: (limit || vehicleAllocationCouponsPagination.pageSize).toString(),
        search: search,
        status: status,
        paymentType: paymentType
      });
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const res = await fetch(`${apiUrl}/api/vehicle-allocation-coupons?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error("Status " + res.status + ": " + res.statusText);
      const data = await res.json();
      
      setVehicleAllocationCoupons(data.vehicleAllocationCoupons);
      setVehicleAllocationCouponsPagination({
        current: parseInt(page),
        pageSize: vehicleAllocationCouponsPagination.pageSize,
        total: data.total
      });
      setVehicleAllocationCouponsLoading(false);
    } catch (err: any) {
      console.error("Failed to load vehicle allocation coupons:", err.message);
      setVehicleAllocationCouponsLoading(false);
    }
  };

  // Fetch vehicle allocation coupons stats
  const fetchVehicleAllocationCouponsStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vehicle-allocation-coupons/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error("Status " + res.status + ": " + res.statusText);
      const response = await res.json();
      setVehicleAllocationCouponsStats(response.overall);
    } catch (err: any) {
      console.error("Failed to load vehicle allocation coupons stats:", err.message);
    }
  };

  // Fetch cheque release reminders
  const fetchChequeReleaseReminders = async (includeReleased = false) => {
    setChequeReleaseRemindersLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        includeReleased: includeReleased.toString()
      });
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vehicle-allocation-coupons/cheque-reminders?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) throw new Error("Status " + res.status + ": " + res.statusText);
      const data = await res.json();
      setChequeReleaseReminders(data.reminders);
      setChequeReleaseRemindersLoading(false);
    } catch (err: any) {
      console.error("Failed to load cheque release reminders:", err.message);
      setChequeReleaseRemindersLoading(false);
    }
  };

  // Fetch detailed stock information
  const fetchDetailedStockInfo = async () => {
    setDetailedStockInfoLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bike-inventory/stock-info`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) throw new Error("Status " + res.status + ": " + res.statusText);
      const data = await res.json();
      setDetailedStockInfo(data.stockInfo);
      setDetailedStockInfoLoading(false);
    } catch (err: any) {
      console.error("Failed to load detailed stock info:", err.message);
      setDetailedStockInfoLoading(false);
    }
  };

  // Clean up bike inventory colors
  const cleanupBikeInventoryColors = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bike-inventory/cleanup-colors`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) throw new Error("Status " + res.status + ": " + res.statusText);
      const data = await res.json();
      
      message.success(`Cleaned up ${data.updatedCount} color entries`);
      
      // Refresh the data
      fetchBikeInventory();
      fetchDetailedStockInfo();
    } catch (err: any) {
      console.error("Failed to cleanup colors:", err.message);
      message.error('Failed to cleanup colors');
    }
  };

  // Mark cheque as released
  const markChequeAsReleased = async (couponId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vehicle-allocation-coupons/cheque-reminders/${couponId}/mark-released`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) throw new Error("Status " + res.status + ": " + res.statusText);
      
      message.success('Cheque marked as released successfully');
      // Refresh the reminders
      fetchChequeReleaseReminders(akrTab === 'chequeReleaseReminders');
    } catch (err: any) {
      console.error("Failed to mark cheque as released:", err.message);
      message.error('Failed to mark cheque as released');
    }
  };

  // Export cheque release reminders to PDF
  const exportChequeReleaseRemindersToPDF = () => {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const currentDate = new Date().toLocaleDateString('en-GB');
      const currentTime = new Date().toLocaleTimeString('en-GB');
      
      const pendingReminders = chequeReleaseReminders.filter((r: any) => r.status === 'pending');
      const releasedReminders = chequeReleaseReminders.filter((r: any) => r.status === 'released');
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Cheque Release Reminders - ${currentDate}</title>
            <style>
              * { box-sizing: border-box; }
              body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 20px; 
                line-height: 1.4;
              }
              .header { 
                text-align: center !important; 
                margin-bottom: 30px; 
                border-bottom: 2px solid #333; 
                padding-bottom: 15px;
                width: 100%;
              }
              .company-name { 
                font-size: 28px; 
                font-weight: bold; 
                color: #333; 
                margin: 0 0 10px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .report-title { 
                font-size: 20px; 
                color: #666; 
                margin: 10px 0 5px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .report-info { 
                font-size: 14px; 
                color: #666; 
                margin: 5px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .section-title { 
                font-size: 18px; 
                font-weight: bold; 
                color: #333; 
                margin: 20px 0 10px 0;
                border-bottom: 2px solid #333;
                padding-bottom: 5px;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin: 20px 0;
                font-size: 12px;
              }
              th, td { 
                border: 1px solid #ddd; 
                padding: 8px; 
                text-align: left;
              }
              th { 
                background-color: #f5f5f5; 
                font-weight: bold;
              }
              .status-pending { color: #e67e22; font-weight: bold; }
              .status-released { color: #27ae60; font-weight: bold; }
              .status-overdue { color: #e74c3c; font-weight: bold; }
              .footer { 
                margin-top: 40px; 
                text-align: center; 
                font-size: 12px; 
                color: #666;
                border-top: 1px solid #ddd;
                padding-top: 20px;
              }
              @media print {
                body { margin: 0; padding: 15px; }
                .header { page-break-inside: avoid; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="company-name">AKR & SON'S (PVT) LTD</div>
              <div class="report-title">Cheque Release Reminders Report</div>
              <div class="report-info">Generated on: ${currentDate} at ${currentTime}</div>
            </div>

            <div class="section-title">Pending Cheque Releases (${pendingReminders.length})</div>
            ${pendingReminders.length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th>Coupon ID</th>
                    <th>Customer Name</th>
                    <th>Vehicle</th>
                    <th>Contact</th>
                    <th>Down Payment</th>
                    <th>Days Since Payment</th>
                    <th>Release Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${pendingReminders.map((reminder: any) => `
                    <tr>
                      <td>${reminder.couponId}</td>
                      <td>${reminder.fullName}</td>
                      <td>${reminder.vehicleType}</td>
                      <td>${reminder.contactNo || 'N/A'}</td>
                      <td>LKR ${parseFloat(reminder.downPayment).toLocaleString()}</td>
                      <td>${reminder.daysSinceDownPayment} days</td>
                      <td>${new Date(reminder.chequeReleaseDate).toLocaleDateString('en-GB')}</td>
                      <td class="${reminder.isOverdue ? 'status-overdue' : 'status-pending'}">
                        ${reminder.isOverdue ? `${reminder.daysOverdue} days overdue` : 
                          reminder.daysUntilRelease === 0 ? 'Due today' : 
                          reminder.daysUntilRelease === 1 ? 'Due tomorrow' : 
                          `Due in ${reminder.daysUntilRelease} days`}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p>No pending cheque releases</p>'}

            ${releasedReminders.length > 0 ? `
              <div class="section-title">Released Cheques (${releasedReminders.length})</div>
              <table>
                <thead>
                  <tr>
                    <th>Coupon ID</th>
                    <th>Customer Name</th>
                    <th>Vehicle</th>
                    <th>Contact</th>
                    <th>Down Payment</th>
                    <th>Release Date</th>
                    <th>Days Since Release</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${releasedReminders.map((reminder: any) => `
                    <tr>
                      <td>${reminder.couponId}</td>
                      <td>${reminder.fullName}</td>
                      <td>${reminder.vehicleType}</td>
                      <td>${reminder.contactNo || 'N/A'}</td>
                      <td>LKR ${parseFloat(reminder.downPayment).toLocaleString()}</td>
                      <td>${new Date(reminder.chequeReleasedDate).toLocaleDateString('en-GB')}</td>
                      <td>${reminder.daysSinceReleased} days</td>
                      <td class="status-released">Released</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : ''}

            <div class="footer">
              <div>Contact: akrfuture@gmail.com</div>
              <div>Phone: 0232231222, 0773111266</div>
              <div>Address: Silavathurai road, Murunkan, Mannar</div>
            </div>
          </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
      
    } catch (error) {
      console.error('Error generating cheque release reminders PDF:', error);
      message.error('Failed to generate PDF');
    }
  };

  // Fetch vehicle allocation coupon dropdown data
  const fetchVehicleAllocationCouponDropdownData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vehicle-allocation-coupons/dropdown-data`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error("Status " + res.status + ": " + res.statusText);
      const response = await res.json();
      setVehicleAllocationCouponDropdownData(response);
    } catch (err: any) {
      console.error("Failed to load vehicle allocation coupon dropdown data:", err.message);
    }
  };

  // Handle vehicle allocation coupon form changes
  const handleVehicleAllocationCouponFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setVehicleAllocationCouponForm(prev => {
        const updated = { ...prev, [name]: checked };
        
        // Handle discount checkbox
        if (name === 'discountApplied') {
          if (!checked) {
            updated.discountAmount = '0';
          }
          // Don't auto-fill discount amount when checkbox is checked
        }
        
        return updated;
      });
    } else {
      setVehicleAllocationCouponForm(prev => {
        const updated = { ...prev, [name]: value };
        
        // Handle payment method changes
        if (name === 'paymentMethod') {
          if (value === 'Full Payment') {
            // For full payment, calculate total and set balance to 0
            const selectedVehicle = vehicleAllocationCouponDropdownData.vehicles?.find(v => v.name === updated.vehicleType);
            const basePrice = selectedVehicle?.price || 0;
            const regFee = parseFloat(updated.regFee) || 0;
            const docCharge = parseFloat(updated.docCharge) || 0;
            const insuranceCo = parseFloat(updated.insuranceCo) || 0;
            const discountAmount = parseFloat(updated.discountAmount) || 0;
            
            // Calculate total amount as: bike price + reg fee + doc fee + insurance - discount
            const calculatedTotalAmount = basePrice + regFee + docCharge + insuranceCo - discountAmount;
            updated.totalAmount = Math.max(0, calculatedTotalAmount).toString();
            updated.downPayment = updated.totalAmount; // Down payment equals total amount (fully paid)
            updated.balance = '0'; // Balance is always 0 for full payment
            // Clear installment amounts
            updated.firstInstallmentAmount = '0';
            updated.secondInstallmentAmount = '0';
            updated.thirdInstallmentAmount = '0';
          } else if (value === 'Leasing via AKR') {
            // Pre-fill leasing company details for AKR
            updated.leasingCompany = 'AKR Easy Credit';
            updated.officerName = 'Anton Rojar Stalin';
            updated.officerContactNo = '0773111266';
            updated.commissionPercentage = '3';
            // Reset down payment for leasing
            updated.downPayment = '0';
          } else if (value === 'Leasing via Other Company') {
            // Reset lease amount and down payment for other leasing
            updated.leaseAmount = '';
            updated.downPayment = '0';
            // Clear installment amounts (no installments for other company)
            updated.firstInstallmentAmount = '0';
            updated.secondInstallmentAmount = '0';
            updated.thirdInstallmentAmount = '0';
          }
        }
        
        // Auto-calculate balance when vehicle selection, down payment, reg fee, doc charge, insurance, discount, or interest changes
        if (['vehicleType', 'downPayment', 'regFee', 'docCharge', 'insuranceCo', 'discountAmount', 'interestAmount'].includes(name)) {
          // Get the base price from selected vehicle
          const selectedVehicle = vehicleAllocationCouponDropdownData.vehicles?.find(v => v.name === updated.vehicleType);
          const basePrice = selectedVehicle?.price || 0;
          
          const downPayment = parseFloat(updated.downPayment) || 0;
          const regFee = parseFloat(updated.regFee) || 0;
          const docCharge = parseFloat(updated.docCharge) || 0;
          const insuranceCo = parseFloat(updated.insuranceCo) || 0;
          const discountAmount = parseFloat(updated.discountAmount) || 0;
          
          if (updated.paymentMethod === 'Full Payment') {
            // For Full Payment: total = bike price + reg fee + doc fee + insurance - discount
            const calculatedTotalAmount = basePrice + regFee + docCharge + insuranceCo - discountAmount;
            updated.totalAmount = Math.max(0, calculatedTotalAmount).toString();
            updated.downPayment = updated.totalAmount; // Down payment equals total amount
            updated.balance = '0'; // Balance is always 0 for full payment
            // Clear installment amounts
            updated.firstInstallmentAmount = '0';
            updated.secondInstallmentAmount = '0';
            updated.thirdInstallmentAmount = '0';
          } else if (updated.paymentMethod === 'Leasing via Other Company') {
            // For Leasing via Other Company: 
            // Total amount = (Bike amount + doc charge + insurance + reg fee) - discount
            const calculatedTotalAmount = basePrice + regFee + docCharge + insuranceCo - discountAmount;
            updated.totalAmount = Math.max(0, calculatedTotalAmount).toString();
            
            // Down payment is manually entered by user (not auto-calculated)
            // Balance = Total amount - down payment
            const balance = Math.max(0, calculatedTotalAmount - downPayment);
            updated.balance = balance.toString();
            
            // Clear installment amounts (no installments for other company)
            updated.firstInstallmentAmount = '0';
            updated.secondInstallmentAmount = '0';
            updated.thirdInstallmentAmount = '0';
          } else {
            // For Leasing via AKR: total = bike price + reg fee + doc charge + insurance + interest
            const interestAmount = parseFloat(updated.interestAmount) || 0;
            const calculatedTotalAmount = basePrice + regFee + docCharge + insuranceCo + interestAmount;
            updated.totalAmount = calculatedTotalAmount.toString();
            
            // Calculate balance as total amount - down payment - discount amount
            const balance = calculatedTotalAmount - downPayment - discountAmount;
            updated.balance = Math.max(0, balance).toString();
          
            // Auto-calculate installment amounts for "Leasing via AKR" if balance > 0
            if (updated.paymentMethod === 'Leasing via AKR' && balance > 0) {
            const installmentAmount = balance / 3;
            updated.firstInstallmentAmount = installmentAmount.toFixed(2);
            updated.secondInstallmentAmount = installmentAmount.toFixed(2);
            updated.thirdInstallmentAmount = installmentAmount.toFixed(2);
          } else {
              // Clear installment amounts for other payment methods
            updated.firstInstallmentAmount = '0';
            updated.secondInstallmentAmount = '0';
            updated.thirdInstallmentAmount = '0';
            }
          }
        }
        
        // Auto-calculate installment dates when date of purchase changes
        if (name === 'dateOfPurchase' && value) {
          const purchaseDate = new Date(value);
          const firstDate = new Date(purchaseDate.getFullYear(), purchaseDate.getMonth() + 1, purchaseDate.getDate());
          const secondDate = new Date(purchaseDate.getFullYear(), purchaseDate.getMonth() + 2, purchaseDate.getDate());
          const thirdDate = new Date(purchaseDate.getFullYear(), purchaseDate.getMonth() + 3, purchaseDate.getDate());
          
          updated.firstInstallmentDate = firstDate.toISOString().split('T')[0];
          updated.secondInstallmentDate = secondDate.toISOString().split('T')[0];
          updated.thirdInstallmentDate = thirdDate.toISOString().split('T')[0];
        }
        
        return updated;
      });
    }
  };

  // Handle vehicle selection from dropdown
  const handleVehicleSelection = (vehicleName: string) => {
    const selectedVehicle = vehicleAllocationCouponDropdownData.vehicles.find(v => v.name === vehicleName);
    if (selectedVehicle) {
      // Auto-fill first available engine and chassis numbers from the mapping
      const firstMapping = selectedVehicle.engineChassisMap?.[0];
      const firstEngine = firstMapping?.engineNo || '';
      const firstChassis = firstMapping?.chassisNo || '';
      
      setVehicleAllocationCouponForm(prev => ({
        ...prev,
        vehicleType: vehicleName,
        engineNo: firstEngine,
        chassisNo: firstChassis,
        totalAmount: selectedVehicle.price?.toString() || '0'
      }));
    }
  };

  // Handle engine number selection
  const handleEngineNumberSelection = (engineNo: string) => {
    // Find the corresponding chassis number for this engine number
    const selectedVehicle = vehicleAllocationCouponDropdownData.vehicles?.find(v => v.name === vehicleAllocationCouponForm.vehicleType);
    const engineChassisMapping = selectedVehicle?.engineChassisMap?.find((mapping: any) => mapping.engineNo === engineNo);
    const chassisNo = engineChassisMapping?.chassisNo || '';
    
    setVehicleAllocationCouponForm(prev => ({ 
      ...prev, 
      engineNo,
      chassisNo 
    }));
  };

  // Handle chassis number selection
  const handleChassisNumberSelection = (chassisNo: string) => {
    // Find the corresponding engine number for this chassis number
    const selectedVehicle = vehicleAllocationCouponDropdownData.vehicles?.find(v => v.name === vehicleAllocationCouponForm.vehicleType);
    const engineChassisMapping = selectedVehicle?.engineChassisMap?.find((mapping: any) => mapping.chassisNo === chassisNo);
    const engineNo = engineChassisMapping?.engineNo || '';
    
    setVehicleAllocationCouponForm(prev => ({ 
      ...prev, 
      chassisNo,
      engineNo 
    }));
  };

  // Handle vehicle allocation coupon number changes
  const handleVehicleAllocationCouponNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Store the raw string value to allow empty fields
          setVehicleAllocationCouponForm(prev => {
        const updated = { ...prev, [name]: value };
        
        // Handle manual installment amount changes for AKR leasing
        if (['firstInstallmentAmount', 'secondInstallmentAmount'].includes(name) && updated.paymentMethod === 'Leasing via AKR') {
          const balance = parseFloat(updated.balance) || 0;
          
          if (name === 'firstInstallmentAmount') {
            // Always allow user to type freely
            updated.firstInstallmentAmount = value;
            
            // Only auto-calculate other installments if user entered a valid amount
            const firstAmount = parseFloat(value) || 0;
            if (firstAmount > 0 && firstAmount <= balance) {
              const remainingBalance = balance - firstAmount;
              const equalAmount = remainingBalance / 2;
              updated.secondInstallmentAmount = equalAmount.toFixed(2);
              updated.thirdInstallmentAmount = equalAmount.toFixed(2);
            }
          } else if (name === 'secondInstallmentAmount') {
            // Always allow user to type freely
            updated.secondInstallmentAmount = value;
            
            // Only auto-calculate third installment if user entered a valid amount
            const secondAmount = parseFloat(value) || 0;
            const firstAmount = parseFloat(updated.firstInstallmentAmount) || 0;
            if (secondAmount > 0 && (firstAmount + secondAmount) <= balance) {
              const remainingBalance = balance - firstAmount - secondAmount;
              updated.thirdInstallmentAmount = remainingBalance.toFixed(2);
            }
          }
        }
        
        // Trigger calculation when these fields change
      if (['regFee', 'docCharge', 'insuranceCo', 'downPayment', 'discountAmount', 'interestAmount'].includes(name)) {
        // Get the base price from selected vehicle
        const selectedVehicle = vehicleAllocationCouponDropdownData.vehicles?.find(v => v.name === updated.vehicleType);
        const basePrice = selectedVehicle?.price || 0;
        
        const downPayment = parseFloat(updated.downPayment) || 0;
        const regFee = parseFloat(updated.regFee) || 0;
        const docCharge = parseFloat(updated.docCharge) || 0;
        const insuranceCo = parseFloat(updated.insuranceCo) || 0;
        const discountAmount = parseFloat(updated.discountAmount) || 0;
        
        if (updated.paymentMethod === 'Full Payment') {
          // For Full Payment: total = bike price + reg fee + doc fee + insurance - discount
          const calculatedTotalAmount = basePrice + regFee + docCharge + insuranceCo - discountAmount;
          updated.totalAmount = Math.max(0, calculatedTotalAmount).toString();
          updated.downPayment = updated.totalAmount; // Down payment equals total amount
          updated.balance = '0'; // Balance is always 0 for full payment
          // Clear installment amounts
          updated.firstInstallmentAmount = '0';
          updated.secondInstallmentAmount = '0';
          updated.thirdInstallmentAmount = '0';
        } else {
          // For Leasing: total = bike price + reg fee + doc charge + insurance + interest (for AKR)
          const interestAmount = updated.paymentMethod === 'Leasing via AKR' ? (parseFloat(updated.interestAmount) || 0) : 0;
          const calculatedTotalAmount = basePrice + regFee + docCharge + insuranceCo + interestAmount;
          updated.totalAmount = calculatedTotalAmount.toString();
          
          // Calculate balance as total amount - down payment - discount amount
          const balance = calculatedTotalAmount - downPayment - discountAmount;
          updated.balance = Math.max(0, balance).toString();
          
          // Auto-calculate installment amounts for "Leasing via AKR" if balance > 0
          if (updated.paymentMethod === 'Leasing via AKR' && balance > 0) {
            const installmentAmount = balance / 3;
            updated.firstInstallmentAmount = installmentAmount.toFixed(2);
            updated.secondInstallmentAmount = installmentAmount.toFixed(2);
            updated.thirdInstallmentAmount = installmentAmount.toFixed(2);
          } else {
            // Clear installment amounts for other payment methods
            updated.firstInstallmentAmount = '0';
            updated.secondInstallmentAmount = '0';
            updated.thirdInstallmentAmount = '0';
          }
        }
      }
      
      return updated;
    });
  };

  // Create or update vehicle allocation coupon
  const handleVehicleAllocationCouponSubmit = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const url = editingVehicleAllocationCoupon 
        ? `${import.meta.env.VITE_API_URL}/api/vehicle-allocation-coupons/${editingVehicleAllocationCoupon._id}`
        : `${import.meta.env.VITE_API_URL}/api/vehicle-allocation-coupons`;
      
      const method = editingVehicleAllocationCoupon ? 'PUT' : 'POST';
      
      // Prepare the data for submission
      const submitData = {
        ...vehicleAllocationCouponForm,
        // Convert string values to numbers for submission
        totalAmount: parseFloat(vehicleAllocationCouponForm.totalAmount) || 0,
        balance: parseFloat(vehicleAllocationCouponForm.balance) || 0,
        downPayment: parseFloat(vehicleAllocationCouponForm.downPayment) || 0,
        regFee: parseFloat(vehicleAllocationCouponForm.regFee) || 0,
        docCharge: parseFloat(vehicleAllocationCouponForm.docCharge) || 0,
        insuranceCo: parseFloat(vehicleAllocationCouponForm.insuranceCo) || 0,
        discountAmount: parseFloat(vehicleAllocationCouponForm.discountAmount) || 0,
        interestAmount: parseFloat(vehicleAllocationCouponForm.interestAmount) || 0,
        firstInstallment: {
          amount: parseFloat(vehicleAllocationCouponForm.firstInstallmentAmount) || 0,
          date: vehicleAllocationCouponForm.firstInstallmentDate || null
        },
        secondInstallment: {
          amount: parseFloat(vehicleAllocationCouponForm.secondInstallmentAmount) || 0,
          date: vehicleAllocationCouponForm.secondInstallmentDate || null
        },
        thirdInstallment: {
          amount: parseFloat(vehicleAllocationCouponForm.thirdInstallmentAmount) || 0,
          date: vehicleAllocationCouponForm.thirdInstallmentDate || null
        }
      };
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(submitData)
      });
      
      if (!res.ok) throw new Error("Failed to save vehicle allocation coupon");
      
      const response = await res.json();
      
      // Show success message with integration details
      if (editingVehicleAllocationCoupon) {
        message.success(`Vehicle allocation coupon updated successfully! 
          Sales Transaction: ${response.salesTransaction} | 
          Installment Plan: ${response.installmentPlan}`);
      } else {
        message.success(`Vehicle allocation coupon created successfully! 
          Sales Transaction: Created | 
          Installment Plan: ${response.installmentPlan}`);
      }
      
      setVehicleAllocationCouponsModalOpen(false);
      setEditingVehicleAllocationCoupon(null);
      setVehicleAllocationCouponForm({
        workshopNo: '',
        branch: '',
        date: '',
        fullName: '',
        address: '',
        nicNo: '',
        contactNo: '',
        occupation: '',
        dateOfBirth: '',
        vehicleType: '',
        engineNo: '',
        chassisNo: '',
        dateOfPurchase: '',
        leasingCompany: '',
        officerName: '',
        officerContactNo: '',
        commissionPercentage: '',
        totalAmount: '',
        balance: '',
        downPayment: '',
        regFee: '',
        docCharge: '',
        insuranceCo: '',
        firstInstallmentAmount: '',
        firstInstallmentDate: '',
        secondInstallmentAmount: '',
        secondInstallmentDate: '',
        thirdInstallmentAmount: '',
        thirdInstallmentDate: '',
        chequeNo: '',
        chequeAmount: '',
        paymentType: 'Cash',
        paymentMethod: 'Full Payment',
        vehicleIssueDate: '',
        vehicleIssueTime: '',
        status: 'Pending',
        notes: '',
        discountApplied: false,
        discountAmount: ''
      });
      fetchVehicleAllocationCoupons();
      fetchVehicleAllocationCouponsStats();
      // Refresh vehicles data to update stock quantities
      if (selectedCompany) {
        fetchVehicles(selectedCompany._id);
      }
    } catch (err: any) {
      message.error("Failed to save vehicle allocation coupon: " + err.message);
    }
  };

  // Delete vehicle allocation coupon
  const handleDeleteVehicleAllocationCoupon = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this vehicle allocation coupon?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vehicle-allocation-coupons/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        }
      });
      
      if (!res.ok) throw new Error("Failed to delete vehicle allocation coupon");
      
      message.success('Vehicle allocation coupon deleted successfully');
      fetchVehicleAllocationCoupons();
      fetchVehicleAllocationCouponsStats();
      // Refresh vehicles data to update stock quantities
      if (selectedCompany) {
        fetchVehicles(selectedCompany._id);
      }
    } catch (error) {
      console.error('Error deleting vehicle allocation coupon:', error);
      message.error('Failed to delete vehicle allocation coupon');
    }
  };

  // Edit vehicle allocation coupon
  const handleEditVehicleAllocationCoupon = (record: any) => {
    setEditingVehicleAllocationCoupon(record);
    setVehicleAllocationCouponForm({
      workshopNo: record.workshopNo || '',
      branch: record.branch || '',
      date: record.date ? new Date(record.date).toISOString().split('T')[0] : '',
      fullName: record.fullName || '',
      address: record.address || '',
      nicNo: record.nicNo || '',
      contactNo: record.contactNo || '',
      occupation: record.occupation || '',
      dateOfBirth: record.dateOfBirth ? new Date(record.dateOfBirth).toISOString().split('T')[0] : '',
      vehicleType: record.vehicleType || '',
      engineNo: record.engineNo || '',
      chassisNo: record.chassisNo || '',
      dateOfPurchase: record.dateOfPurchase ? new Date(record.dateOfPurchase).toISOString().split('T')[0] : '',
      leasingCompany: record.leasingCompany || '',
      officerName: record.officerName || '',
      officerContactNo: record.officerContactNo || '',
      commissionPercentage: record.commissionPercentage || '',
      totalAmount: record.totalAmount || '',
      balance: record.balance || '',
      downPayment: record.downPayment || '',
      regFee: record.regFee || '',
      docCharge: record.docCharge || '',
      insuranceCo: record.insuranceCo || '',
      firstInstallmentAmount: record.firstInstallment?.amount || '',
      firstInstallmentDate: record.firstInstallment?.date ? new Date(record.firstInstallment.date).toISOString().split('T')[0] : '',
      secondInstallmentAmount: record.secondInstallment?.amount || '',
      secondInstallmentDate: record.secondInstallment?.date ? new Date(record.secondInstallment.date).toISOString().split('T')[0] : '',
      thirdInstallmentAmount: record.thirdInstallment?.amount || '',
      thirdInstallmentDate: record.thirdInstallment?.date ? new Date(record.thirdInstallment.date).toISOString().split('T')[0] : '',
      chequeNo: record.chequeNo || '',
      chequeAmount: record.chequeAmount || '',
      paymentType: record.paymentType || 'Cash',
      vehicleIssueDate: record.vehicleIssueDate ? new Date(record.vehicleIssueDate).toISOString().split('T')[0] : '',
      vehicleIssueTime: record.vehicleIssueTime || '',
      status: record.status || 'Pending',
      notes: record.notes || '',
      discountApplied: record.discountApplied || false,
      discountAmount: record.discountAmount || '',
      leaseAmount: record.leaseAmount || '',
      interestAmount: record.interestAmount || ''
    });
    setVehicleAllocationCouponsModalOpen(true);
  };

  // View vehicle allocation coupon
  const handleViewVehicleAllocationCoupon = (record: any) => {
    setViewingVehicleAllocationCoupon(record);
    setViewVehicleAllocationCouponModalOpen(true);
  };

  // Export vehicle allocation coupons to PDF
  const exportVehicleAllocationCouponsToPDF = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        limit: '1000',
        search: vehicleAllocationCouponsSearch
      });
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vehicle-allocation-coupons?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      const allRecords = data.vehicleAllocationCoupons || data.data || [];
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const currentDate = new Date().toLocaleDateString('en-GB');
      const currentTime = new Date().toLocaleTimeString('en-GB');
      const searchTerm = vehicleAllocationCouponsSearch ? ` (Filtered by: "${vehicleAllocationCouponsSearch}")` : '';
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Vehicle Allocation Coupons Report - ${currentDate}</title>
            <style>
              * { box-sizing: border-box; }
              body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 20px; 
                line-height: 1.4;
              }
              .header { 
                text-align: center !important; 
                margin-bottom: 30px; 
                border-bottom: 2px solid #333; 
                padding-bottom: 15px;
                width: 100%;
              }
              .company-name { 
                font-size: 28px; 
                font-weight: bold; 
                color: #333; 
                margin: 0 0 10px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .report-title { 
                font-size: 20px; 
                color: #666; 
                margin: 10px 0 5px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .report-info { 
                font-size: 14px; 
                color: #666; 
                margin: 5px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .stats { 
                display: flex; 
                justify-content: space-around; 
                margin: 20px 0; 
                padding: 15px; 
                background: #f5f5f5; 
                border-radius: 5px;
                width: 100%;
              }
              .stat-item { 
                text-align: center;
                flex: 1;
                margin: 0 10px;
              }
              .stat-value { 
                font-size: 18px; 
                font-weight: bold; 
                color: #333;
                margin-bottom: 5px;
              }
              .stat-label { 
                font-size: 12px; 
                color: #666;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 20px;
                font-size: 12px;
              }
              th, td { 
                border: 1px solid #ddd; 
                padding: 8px; 
                text-align: left;
                vertical-align: top;
              }
              th { 
                background-color: #f2f2f2; 
                font-weight: bold;
                text-align: center;
              }
              tr:nth-child(even) { background-color: #f9f9f9; }
              .status-pending { color: #ffa500; font-weight: bold; }
              .status-approved { color: #0066cc; font-weight: bold; }
              .status-completed { color: #28a745; font-weight: bold; }
              .status-cancelled { color: #dc3545; font-weight: bold; }
              @media print {
                body { margin: 0; padding: 10px; }
                .no-print { display: none; }
                table { font-size: 10px; }
                th, td { padding: 4px; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="company-name">AKR & SONS (PVT) LTD</div>
              <div class="report-title">Vehicle Allocation Coupons Report</div>
              <div class="report-info">Generated on: ${currentDate} at ${currentTime}</div>
              <div class="report-info">${searchTerm}</div>
            </div>



            <table>
              <thead>
                <tr>
                  <th>Coupon ID</th>
                  <th>Customer Name</th>
                  <th>Vehicle Type</th>
                  <th>Total Amount</th>
                  <th>Down Payment</th>
                  <th>Balance</th>
                  <th>Payment Type</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                ${allRecords.map((record: any) => `
                  <tr>
                    <td>${record.couponId || '-'}</td>
                    <td>${record.fullName || '-'}</td>
                    <td>${record.vehicleType || '-'}</td>
                    <td>LKR ${record.totalAmount?.toLocaleString() || '0'}</td>
                    <td>LKR ${record.downPayment?.toLocaleString() || '0'}</td>
                    <td>LKR ${record.balance?.toLocaleString() || '0'}</td>
                    <td>${record.paymentType || '-'}</td>
                    <td class="status-${record.status?.toLowerCase() || 'unknown'}">${record.status || '-'}</td>
                    <td>${record.date ? new Date(record.date).toLocaleDateString('en-GB') : '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
      
    } catch (error) {
      console.error('Error generating print report:', error);
      message.error('Failed to generate print report');
    }
  };

  // Export individual vehicle allocation coupon to PDF
  const exportIndividualVehicleAllocationCouponToPDF = (record: any) => {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const currentDate = new Date().toLocaleDateString('en-GB');
      const currentTime = new Date().toLocaleTimeString('en-GB');
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Vehicle Allocation Coupon - ${record.fullName} - ${currentDate}</title>
            <style>
              * { box-sizing: border-box; }
              body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 20px; 
                line-height: 1.4;
              }
              .header { 
                text-align: center !important; 
                margin-bottom: 30px; 
                border-bottom: 2px solid #333; 
                padding-bottom: 15px;
                width: 100%;
              }

              .company-name { 
                font-size: 28px; 
                font-weight: bold; 
                color: #333; 
                margin: 0 0 10px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .report-title { 
                font-size: 20px; 
                color: #666; 
                margin: 10px 0 5px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .report-info { 
                font-size: 14px; 
                color: #666; 
                margin: 5px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .customer-details { 
                margin: 20px 0; 
                padding: 15px; 
                background: #f5f5f5; 
                border-radius: 5px;
                width: 100%;
              }
              .detail-row { 
                display: flex; 
                justify-content: space-between; 
                margin: 8px 0;
                border-bottom: 1px solid #ddd;
                padding-bottom: 5px;
              }
              .detail-label { 
                font-weight: bold; 
                color: #333;
                min-width: 150px;
              }
              .detail-value { 
                color: #666;
                text-align: right;
              }
              .section-title { 
                font-size: 18px; 
                font-weight: bold; 
                color: #333; 
                margin: 20px 0 10px 0;
                border-bottom: 2px solid #333;
                padding-bottom: 5px;
              }
              .footer { 
                margin-top: 40px; 
                text-align: center; 
                font-size: 12px; 
                color: #666;
                border-top: 1px solid #ddd;
                padding-top: 20px;
              }
              @media print {
                body { margin: 0; padding: 15px; }
                .header { page-break-inside: avoid; }
                .customer-details { page-break-inside: avoid; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="company-name">AKR & SON'S (PVT) LTD</div>
              <div class="report-title">Vehicle Allocation Coupon</div>
              <div class="report-info">Generated on: ${currentDate} at ${currentTime}</div>
            </div>

            <div class="customer-details">
              <div class="section-title">Customer Information</div>
              <div class="detail-row">
                <span class="detail-label">Coupon ID:</span>
                <span class="detail-value">${record.couponId || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Customer Name:</span>
                <span class="detail-value">${record.fullName || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">NIC Number:</span>
                <span class="detail-value">${record.nicNo || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Contact Number:</span>
                <span class="detail-value">${record.contactNo || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Address:</span>
                <span class="detail-value">${record.address || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Occupation:</span>
                <span class="detail-value">${record.occupation || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date of Birth:</span>
                <span class="detail-value">${record.dateOfBirth ? new Date(record.dateOfBirth).toLocaleDateString('en-GB') : 'N/A'}</span>
              </div>
            </div>

            <div class="customer-details">
              <div class="section-title">Vehicle Information</div>
              <div class="detail-row">
                <span class="detail-label">Vehicle Type:</span>
                <span class="detail-value">${record.vehicleType || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Engine Number:</span>
                <span class="detail-value">${record.engineNo || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Chassis Number:</span>
                <span class="detail-value">${record.chassisNo || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date of Purchase:</span>
                <span class="detail-value">${record.dateOfPurchase ? new Date(record.dateOfPurchase).toLocaleDateString('en-GB') : 'N/A'}</span>
              </div>
            </div>

            <div class="customer-details">
              <div class="section-title">Payment Information</div>
              <div class="detail-row">
                <span class="detail-label">Payment Method:</span>
                <span class="detail-value">${record.paymentMethod || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment Type:</span>
                <span class="detail-value">${record.paymentType || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Total Amount:</span>
                <span class="detail-value">LKR ${record.totalAmount ? parseFloat(record.totalAmount).toLocaleString() : '0'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Down Payment:</span>
                <span class="detail-value">LKR ${record.downPayment ? parseFloat(record.downPayment).toLocaleString() : '0'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Balance:</span>
                <span class="detail-value">LKR ${record.balance ? parseFloat(record.balance).toLocaleString() : '0'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Registration Fee:</span>
                <span class="detail-value">LKR ${record.regFee ? parseFloat(record.regFee).toLocaleString() : '0'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Document Charge:</span>
                <span class="detail-value">LKR ${record.docCharge ? parseFloat(record.docCharge).toLocaleString() : '0'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Insurance:</span>
                <span class="detail-value">LKR ${record.insuranceCo ? parseFloat(record.insuranceCo).toLocaleString() : '0'}</span>
              </div>
              ${record.discountApplied ? `
              <div class="detail-row">
                <span class="detail-label">Discount Applied:</span>
                <span class="detail-value">Yes</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Discount Amount:</span>
                <span class="detail-value">LKR ${record.discountAmount ? parseFloat(record.discountAmount).toLocaleString() : '0'}</span>
              </div>
              ` : ''}
            </div>

            ${record.paymentMethod === 'Leasing via AKR' || record.paymentMethod === 'Leasing via Other Company' ? `
            <div class="customer-details">
              <div class="section-title">Leasing Company Information</div>
              <div class="detail-row">
                <span class="detail-label">Leasing Company:</span>
                <span class="detail-value">${record.leasingCompany || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Officer Name:</span>
                <span class="detail-value">${record.officerName || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Contact Number:</span>
                <span class="detail-value">${record.officerContactNo || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Commission:</span>
                <span class="detail-value">${record.commissionPercentage ? record.commissionPercentage + '%' : 'N/A'}</span>
              </div>
            </div>
            ` : ''}

            ${record.paymentMethod === 'Leasing via AKR' ? `
            <div class="customer-details">
              <div class="section-title">Installment Details</div>
              <div class="detail-row">
                <span class="detail-label">1st Installment Amount:</span>
                <span class="detail-value">LKR ${record.firstInstallment?.amount ? parseFloat(record.firstInstallment.amount).toLocaleString() : '0'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">1st Installment Date:</span>
                <span class="detail-value">${record.firstInstallment?.date ? new Date(record.firstInstallment.date).toLocaleDateString('en-GB') : 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">2nd Installment Amount:</span>
                <span class="detail-value">LKR ${record.secondInstallment?.amount ? parseFloat(record.secondInstallment.amount).toLocaleString() : '0'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">2nd Installment Date:</span>
                <span class="detail-value">${record.secondInstallment?.date ? new Date(record.secondInstallment.date).toLocaleDateString('en-GB') : 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">3rd Installment Amount:</span>
                <span class="detail-value">LKR ${record.thirdInstallment?.amount ? parseFloat(record.thirdInstallment.amount).toLocaleString() : '0'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">3rd Installment Date:</span>
                <span class="detail-value">${record.thirdInstallment?.date ? new Date(record.thirdInstallment.date).toLocaleDateString('en-GB') : 'N/A'}</span>
              </div>
            </div>
            ` : ''}

            <div class="customer-details">
              <div class="section-title">Additional Information</div>
              <div class="detail-row">
                <span class="detail-label">Workshop No:</span>
                <span class="detail-value">${record.workshopNo || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Branch:</span>
                <span class="detail-value">${record.branch || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${record.date ? new Date(record.date).toLocaleDateString('en-GB') : 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value">${record.status || 'N/A'}</span>
              </div>
              ${record.notes ? `
              <div class="detail-row">
                <span class="detail-label">Notes:</span>
                <span class="detail-value">${record.notes}</span>
              </div>
              ` : ''}
            </div>

            <div class="footer">
              <div>Contact: akrfuture@gmail.com</div>
              <div>Phone: 0232231222, 0773111266</div>
              <div>Address: Silavathurai road, Murunkan, Mannar</div>
            </div>
          </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
      
    } catch (error) {
      console.error('Error generating individual coupon PDF:', error);
      message.error('Failed to generate PDF');
    }
  };

  // Export installment plans to PDF
  const exportInstallmentPlansToPDF = async () => {
    try {
      // Fetch all records for complete report
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        limit: '1000', // Get all records
        search: installmentSearch
      });
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      // Fetch from Vehicle Allocation Coupons instead of separate Installment Plans
      const res = await fetch(`${apiUrl}/api/vehicle-allocation-coupons?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) throw new Error("Failed to fetch data");
      const response = await res.json();
      
      // Filter coupons that have balance and are "Leasing via AKR" only
      const couponsWithBalance = response.vehicleAllocationCoupons.filter((coupon: any) => 
        coupon.balance > 0 && 
        coupon.paymentMethod === 'Leasing via AKR' &&
        (installmentStatusFilter === '' || coupon.status === installmentStatusFilter) &&
        (installmentMonthFilter === '' || new Date(coupon.dateOfPurchase).getMonth() === parseInt(installmentMonthFilter))
      );
      
      // Transform Vehicle Allocation Coupons to Installment Plan format with full details
      const allRecords = couponsWithBalance.map((coupon: any) => ({
        _id: coupon._id,
        installmentId: `IP-${coupon.couponId}`,
        customerName: coupon.fullName,
        customerPhone: coupon.contactNo,
        customerAddress: coupon.address,
        vehicleModel: coupon.vehicleType,
        engineNumber: coupon.engineNo,
        chassisNumber: coupon.chassisNo,
        totalAmount: coupon.totalAmount,
        downPayment: coupon.downPayment,
        balanceAmount: coupon.balance,
        installmentAmount: coupon.balance / 3, // Default to 3 installments
        numberOfInstallments: 3,
        startDate: coupon.dateOfPurchase,
        firstInstallmentDate: coupon.firstInstallment?.date,
        secondInstallmentDate: coupon.secondInstallment?.date,
        thirdInstallmentDate: coupon.thirdInstallment?.date,
        firstInstallmentAmount: coupon.firstInstallment?.amount,
        secondInstallmentAmount: coupon.secondInstallment?.amount,
        thirdInstallmentAmount: coupon.thirdInstallment?.amount,
        firstInstallmentPaidAmount: coupon.firstInstallment?.paidAmount || 0,
        secondInstallmentPaidAmount: coupon.secondInstallment?.paidAmount || 0,
        thirdInstallmentPaidAmount: coupon.thirdInstallment?.paidAmount || 0,
        firstInstallmentPaidDate: coupon.firstInstallment?.paidDate,
        secondInstallmentPaidDate: coupon.secondInstallment?.paidDate,
        thirdInstallmentPaidDate: coupon.thirdInstallment?.paidDate,
        firstInstallment: coupon.firstInstallment,
        secondInstallment: coupon.secondInstallment,
        thirdInstallment: coupon.thirdInstallment,
        paymentMethod: coupon.paymentMethod,
        leasingCompany: coupon.leasingCompany,
        officerName: coupon.officerName,
        officerContactNo: coupon.officerContactNo,
        commissionPercentage: coupon.commissionPercentage,
        status: coupon.status,
        notes: coupon.notes,
        relatedCouponId: coupon.couponId
      }));
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const currentDate = new Date().toLocaleDateString('en-GB');
      const currentTime = new Date().toLocaleTimeString('en-GB');
      const searchTerm = installmentSearch ? ` (Filtered by: "${installmentSearch}")` : '';
      const statusFilter = installmentStatusFilter ? ` (Status: ${installmentStatusFilter})` : '';
      const monthFilter = installmentMonthFilter ? ` (Month: ${installmentMonthFilter})` : '';
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Installment Plans Report - ${currentDate}</title>
            <style>
              * { box-sizing: border-box; }
              body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 20px; 
                line-height: 1.4;
              }
              .header { 
                text-align: center !important; 
                margin-bottom: 30px; 
                border-bottom: 2px solid #333; 
                padding-bottom: 15px;
                width: 100%;
              }
              .company-name { 
                font-size: 28px; 
                font-weight: bold; 
                color: #333; 
                margin: 0 0 10px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .report-title { 
                font-size: 20px; 
                color: #666; 
                margin: 10px 0 5px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .report-info { 
                font-size: 14px; 
                color: #666; 
                margin: 5px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .stats { 
                display: flex; 
                justify-content: space-around; 
                margin: 20px 0; 
                padding: 15px; 
                background: #f5f5f5; 
                border-radius: 5px;
                width: 100%;
              }
              .stat-item { 
                text-align: center;
                flex: 1;
                margin: 0 10px;
              }
              .stat-value { 
                font-size: 18px; 
                font-weight: bold; 
                color: #333;
                margin-bottom: 5px;
              }
              .stat-label { 
                font-size: 12px; 
                color: #666;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 20px;
                font-size: 12px;
              }
              th, td { 
                border: 1px solid #ddd; 
                padding: 8px; 
                text-align: left;
                vertical-align: top;
              }
              th { 
                background-color: #f2f2f2; 
                font-weight: bold;
                text-align: center;
              }
              tr:nth-child(even) { background-color: #f9f9f9; }
              .status-active { color: #28a745; font-weight: bold; }
              .status-completed { color: #17a2b8; font-weight: bold; }
              .status-overdue { color: #ffc107; font-weight: bold; }
              .status-defaulted { color: #dc3545; font-weight: bold; }
              @media print {
                body { margin: 0; padding: 10px; }
                .no-print { display: none; }
                table { font-size: 10px; }
                th, td { padding: 4px; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="company-name">AKR & SONS (PVT) LTD</div>
              <div class="report-title">Installment Plans Report</div>
              <div class="report-info">Generated on: ${currentDate} at ${currentTime}</div>
              <div class="report-info">${searchTerm}${statusFilter}${monthFilter}</div>
            </div>



            <table>
              <thead>
                <tr>
                  <th>Coupon ID</th>
                  <th>Customer Details</th>
                  <th>Vehicle Details</th>
                  <th>Payment Summary</th>
                  <th>Installment Schedule</th>
                  <th>Installment Payments</th>
                  <th>Leasing Details</th>
                </tr>
              </thead>
              <tbody>
                ${allRecords.map((record: any) => {
                  // Calculate payment status
                  const totalPaid = (record.firstInstallmentPaidAmount || 0) + (record.secondInstallmentPaidAmount || 0) + (record.thirdInstallmentPaidAmount || 0);
                  const remainingBalance = record.balanceAmount - totalPaid;
                  const isFullyPaid = totalPaid >= record.balanceAmount;
                  
                  // Format installment schedule
                  const firstDate = record.firstInstallmentDate ? new Date(record.firstInstallmentDate).toLocaleDateString('en-GB') : '-';
                  const secondDate = record.secondInstallmentDate ? new Date(record.secondInstallmentDate).toLocaleDateString('en-GB') : '-';
                  const thirdDate = record.thirdInstallmentDate ? new Date(record.thirdInstallmentDate).toLocaleDateString('en-GB') : '-';
                  
                  const firstPaid = record.firstInstallmentPaidAmount > 0 ? '✓' : '';
                  const secondPaid = record.secondInstallmentPaidAmount > 0 ? '✓' : '';
                  const thirdPaid = record.thirdInstallmentPaidAmount > 0 ? '✓' : '';
                  
                  const scheduleText = isFullyPaid ? 
                    `1st: ${firstDate} (${firstPaid}), 2nd: ${secondDate} (${secondPaid}), 3rd: ${thirdDate} (${thirdPaid}), All Paid ✓` :
                    `1st: ${firstDate} (${firstPaid}), 2nd: ${secondDate} (${secondPaid}), 3rd: ${thirdDate} (${thirdPaid}), Check payments above`;
                  
                  // Format installment payments
                  const firstAmount = record.firstInstallmentAmount ? parseFloat(record.firstInstallmentAmount).toLocaleString() : '0';
                  const secondAmount = record.secondInstallmentAmount ? parseFloat(record.secondInstallmentAmount).toLocaleString() : '0';
                  const thirdAmount = record.thirdInstallmentAmount ? parseFloat(record.thirdInstallmentAmount).toLocaleString() : '0';
                  
                  const paymentsText = `1st: LKR ${firstAmount} (${record.firstInstallmentPaidAmount > 0 ? 'Paid ✓' : 'Pending'}), 2nd: LKR ${secondAmount} (${record.secondInstallmentPaidAmount > 0 ? 'Paid ✓' : 'Pending'}), 3rd: LKR ${thirdAmount} (${record.thirdInstallmentPaidAmount > 0 ? 'Paid ✓' : 'Pending'})`;
                  
                  return `
                  <tr>
                    <td>${record.installmentId || '-'}</td>
                      <td>
                        <strong>${record.customerName || '-'}</strong><br>
                        ${record.customerPhone || '-'}<br>
                        ${record.customerAddress || '-'}
                      </td>
                      <td>
                        <strong>${record.vehicleModel || '-'}</strong><br>
                        Engine: ${record.engineNumber || '-'}<br>
                        Chassis: ${record.chassisNumber || '-'}
                      </td>
                      <td>
                        <strong>LKR ${record.totalAmount ? parseFloat(record.totalAmount).toLocaleString() : '0'}</strong> (Total)<br>
                        Down: LKR ${record.downPayment ? parseFloat(record.downPayment).toLocaleString() : '0'}<br>
                        Balance: LKR ${record.balanceAmount ? parseFloat(record.balanceAmount).toLocaleString() : '0'}<br>
                        Paid: LKR ${totalPaid.toLocaleString()}<br>
                        Remaining: LKR ${remainingBalance.toLocaleString()}<br>
                        <strong>${record.paymentMethod || '-'}</strong>
                      </td>
                      <td>${scheduleText}</td>
                      <td>${paymentsText}</td>
                      <td>
                        ${record.leasingCompany || '-'}<br>
                        ${record.officerName || '-'}<br>
                        ${record.officerContactNo || '-'}<br>
                        ${record.commissionPercentage ? record.commissionPercentage + '% Commission' : '-'}
                      </td>
                  </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
      
    } catch (error) {
      console.error('Error generating print report:', error);
      message.error('Failed to generate print report');
    }
  };

  // Export individual installment plan to PDF
  const exportIndividualInstallmentPlanToPDF = (record: any) => {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const currentDate = new Date().toLocaleDateString('en-GB');
      const currentTime = new Date().toLocaleTimeString('en-GB');
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Installment Plan - ${record.customerName} - ${currentDate}</title>
            <style>
              * { box-sizing: border-box; }
              body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 20px; 
                line-height: 1.4;
              }
              .header { 
                text-align: center !important; 
                margin-bottom: 30px; 
                border-bottom: 2px solid #333; 
                padding-bottom: 15px;
                width: 100%;
              }
              .company-name { 
                font-size: 28px; 
                font-weight: bold; 
                color: #333; 
                margin: 0 0 10px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .report-title { 
                font-size: 20px; 
                color: #666; 
                margin: 10px 0 5px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .report-info { 
                font-size: 14px; 
                color: #666; 
                margin: 5px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .customer-details { 
                margin: 20px 0; 
                padding: 15px; 
                background: #f5f5f5; 
                border-radius: 5px;
                width: 100%;
              }
              .detail-row { 
                display: flex; 
                justify-content: space-between; 
                margin: 8px 0;
                border-bottom: 1px solid #ddd;
                padding-bottom: 5px;
              }
              .detail-label { 
                font-weight: bold; 
                color: #333;
                min-width: 150px;
              }
              .detail-value { 
                color: #666;
                text-align: right;
              }
              .section-title { 
                font-size: 18px; 
                font-weight: bold; 
                color: #333; 
                margin: 20px 0 10px 0;
                border-bottom: 2px solid #333;
                padding-bottom: 5px;
              }
              .footer { 
                margin-top: 40px; 
                text-align: center; 
                font-size: 12px; 
                color: #666;
                border-top: 1px solid #ddd;
                padding-top: 20px;
              }
              @media print {
                body { margin: 0; padding: 15px; }
                .header { page-break-inside: avoid; }
                .customer-details { page-break-inside: avoid; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="company-name">AKR & SON'S (PVT) LTD</div>
              <div class="report-title">Installment Plan</div>
              <div class="report-info">Generated on: ${currentDate} at ${currentTime}</div>
            </div>

            <div class="customer-details">
              <div class="section-title">Plan Information</div>
              <div class="detail-row">
                <span class="detail-label">Installment ID:</span>
                <span class="detail-value">${record.installmentId || '-'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Customer Name:</span>
                <span class="detail-value">${record.customerName || '-'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Phone Number:</span>
                <span class="detail-value">${record.customerPhone || '-'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Address:</span>
                <span class="detail-value">${record.customerAddress || '-'}</span>
              </div>
            </div>

            <div class="customer-details">
              <div class="section-title">Vehicle Information</div>
              <div class="detail-row">
                <span class="detail-label">Vehicle Model:</span>
                <span class="detail-value">${record.vehicleModel || '-'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Engine Number:</span>
                <span class="detail-value">${record.engineNumber || '-'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Chassis Number:</span>
                <span class="detail-value">${record.chassisNumber || '-'}</span>
              </div>
            </div>

            <div class="customer-details">
              <div class="section-title">Payment Information</div>
              <div class="detail-row">
                <span class="detail-label">Payment Method:</span>
                <span class="detail-value">${record.paymentMethod || '-'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Total Amount:</span>
                <span class="detail-value">LKR ${record.totalAmount ? parseFloat(record.totalAmount).toLocaleString() : '0'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Down Payment:</span>
                <span class="detail-value">LKR ${record.downPayment ? parseFloat(record.downPayment).toLocaleString() : '0'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Balance Amount:</span>
                <span class="detail-value">LKR ${record.balanceAmount ? parseFloat(record.balanceAmount).toLocaleString() : '0'}</span>
              </div>
            </div>

            <div class="customer-details">
              <div class="section-title">Installment Details</div>
              <div class="detail-row">
                <span class="detail-label">1st Installment Amount:</span>
                <span class="detail-value">LKR ${record.firstInstallmentAmount ? parseFloat(record.firstInstallmentAmount).toLocaleString() : '0'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">1st Installment Date:</span>
                <span class="detail-value">${record.firstInstallment?.date ? new Date(record.firstInstallment.date).toLocaleDateString('en-GB') : '-'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">1st Installment Status:</span>
                <span class="detail-value">${record.firstInstallmentPaidAmount > 0 ? 'Paid' : 'Pending'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">2nd Installment Amount:</span>
                <span class="detail-value">LKR ${record.secondInstallmentAmount ? parseFloat(record.secondInstallmentAmount).toLocaleString() : '0'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">2nd Installment Date:</span>
                <span class="detail-value">${record.secondInstallment?.date ? new Date(record.secondInstallment.date).toLocaleDateString('en-GB') : '-'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">2nd Installment Status:</span>
                <span class="detail-value">${record.secondInstallmentPaidAmount > 0 ? 'Paid' : 'Pending'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">3rd Installment Amount:</span>
                <span class="detail-value">LKR ${record.thirdInstallmentAmount ? parseFloat(record.thirdInstallmentAmount).toLocaleString() : '0'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">3rd Installment Date:</span>
                <span class="detail-value">${record.thirdInstallment?.date ? new Date(record.thirdInstallment.date).toLocaleDateString('en-GB') : '-'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">3rd Installment Status:</span>
                <span class="detail-value">${record.thirdInstallmentPaidAmount > 0 ? 'Paid' : 'Pending'}</span>
              </div>
            </div>

            ${record.leasingCompany ? `
            <div class="customer-details">
              <div class="section-title">Leasing Information</div>
              <div class="detail-row">
                <span class="detail-label">Leasing Company:</span>
                <span class="detail-value">${record.leasingCompany || '-'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Officer Name:</span>
                <span class="detail-value">${record.officerName || '-'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Contact Number:</span>
                <span class="detail-value">${record.officerContactNo || '-'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Commission:</span>
                <span class="detail-value">${record.commissionPercentage ? record.commissionPercentage + '%' : '-'}</span>
              </div>
            </div>
            ` : ''}

            <div class="customer-details">
              <div class="section-title">Payment Summary</div>
              <div class="detail-row">
                <span class="detail-label">Total Paid:</span>
                <span class="detail-value">LKR ${((record.firstInstallmentPaidAmount || 0) + (record.secondInstallmentPaidAmount || 0) + (record.thirdInstallmentPaidAmount || 0)).toLocaleString()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Remaining Balance:</span>
                <span class="detail-value">LKR ${(record.balanceAmount - ((record.firstInstallmentPaidAmount || 0) + (record.secondInstallmentPaidAmount || 0) + (record.thirdInstallmentPaidAmount || 0))).toLocaleString()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment Status:</span>
                <span class="detail-value">${((record.firstInstallmentPaidAmount || 0) + (record.secondInstallmentPaidAmount || 0) + (record.thirdInstallmentPaidAmount || 0)) >= record.balanceAmount ? 'Fully Paid' : 'Partially Paid'}</span>
              </div>
            </div>

            <div class="footer">
              <div>Contact: akrfuture@gmail.com</div>
              <div>Phone: 0232231222, 0773111266</div>
              <div>Address: Silavathurai road, Murunkan, Mannar</div>
            </div>
          </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
      
    } catch (error) {
      console.error('Error generating individual installment plan PDF:', error);
      message.error('Failed to generate PDF');
    }
  };

  // Export individual sales transaction to PDF
  const exportIndividualSalesTransactionToPDF = (record: any) => {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const currentDate = new Date().toLocaleDateString('en-GB');
      const currentTime = new Date().toLocaleTimeString('en-GB');
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Sales Transaction - ${record.customerName} - ${currentDate}</title>
            <style>
              * { box-sizing: border-box; }
              body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 20px; 
                line-height: 1.4;
              }
              .header { 
                text-align: center !important; 
                margin-bottom: 30px; 
                border-bottom: 2px solid #333; 
                padding-bottom: 15px;
                width: 100%;
              }
              .company-name { 
                font-size: 28px; 
                font-weight: bold; 
                color: #333; 
                margin: 0 0 10px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .report-title { 
                font-size: 20px; 
                color: #666; 
                margin: 10px 0 5px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .report-info { 
                font-size: 14px; 
                color: #666; 
                margin: 5px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .customer-details { 
                margin: 20px 0; 
                padding: 15px; 
                background: #f5f5f5; 
                border-radius: 5px;
                width: 100%;
              }
              .detail-row { 
                display: flex; 
                justify-content: space-between; 
                margin: 8px 0;
                border-bottom: 1px solid #ddd;
                padding-bottom: 5px;
              }
              .detail-label { 
                font-weight: bold; 
                color: #333;
                min-width: 150px;
              }
              .detail-value { 
                color: #666;
                text-align: right;
              }
              .section-title { 
                font-size: 18px; 
                font-weight: bold; 
                color: #333; 
                margin: 20px 0 10px 0;
                border-bottom: 2px solid #333;
                padding-bottom: 5px;
              }
              .footer { 
                margin-top: 40px; 
                text-align: center; 
                font-size: 12px; 
                color: #666;
                border-top: 1px solid #ddd;
                padding-top: 20px;
              }
              @media print {
                body { margin: 0; padding: 15px; }
                .header { page-break-inside: avoid; }
                .customer-details { page-break-inside: avoid; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="company-name">AKR & SON'S (PVT) LTD</div>
              <div class="report-title">Sales Transaction</div>
              <div class="report-info">Generated on: ${currentDate} at ${currentTime}</div>
            </div>

            <div class="customer-details">
              <div class="section-title">Transaction Information</div>
              <div class="detail-row">
                <span class="detail-label">Invoice No:</span>
                <span class="detail-value">${record.invoiceNo || 'N/A'}</span>
              </div>
                              <div class="detail-row">
                  <span class="detail-label">Bike ID:</span>
                  <span class="detail-value">${record.bikeId || '-'}</span>
                </div>
              <div class="detail-row">
                <span class="detail-label">Sales Date:</span>
                <span class="detail-value">${record.salesDate ? new Date(record.salesDate).toLocaleDateString('en-GB') : 'N/A'}</span>
              </div>
                              <div class="detail-row">
                  <span class="detail-label">Salesperson:</span>
                  <span class="detail-value">${record.salespersonName || '-'}</span>
                </div>
              <div class="detail-row">
                <span class="detail-label">Payment Status:</span>
                <span class="detail-value">${record.paymentStatus || 'N/A'}</span>
              </div>
            </div>

            <div class="customer-details">
              <div class="section-title">Customer Information</div>
              <div class="detail-row">
                <span class="detail-label">Customer Name:</span>
                <span class="detail-value">${record.customerName || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Phone Number:</span>
                <span class="detail-value">${record.customerPhone || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Address:</span>
                <span class="detail-value">${record.customerAddress || 'N/A'}</span>
              </div>
            </div>

            <div class="customer-details">
              <div class="section-title">Vehicle Information</div>
              <div class="detail-row">
                <span class="detail-label">Vehicle Model:</span>
                <span class="detail-value">${record.vehicleModel || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Engine Number:</span>
                <span class="detail-value">${record.engineNumber || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Chassis Number:</span>
                <span class="detail-value">${record.chassisNumber || 'N/A'}</span>
              </div>
                              <div class="detail-row">
                  <span class="detail-label">Color:</span>
                  <span class="detail-value">${record.bikeColor || '-'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Category:</span>
                  <span class="detail-value">${record.bikeCategory || '-'}</span>
                </div>
              <div class="detail-row">
                <span class="detail-label">Insurance:</span>
                <span class="detail-value">${record.insuranceCo || 'N/A'}</span>
              </div>
            </div>

            <div class="customer-details">
              <div class="section-title">Payment Information</div>
              <div class="detail-row">
                <span class="detail-label">Payment Method:</span>
                <span class="detail-value">${record.paymentMethod || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Selling Price:</span>
                <span class="detail-value">LKR ${record.sellingPrice ? parseFloat(record.sellingPrice).toLocaleString() : '0'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Down Payment:</span>
                <span class="detail-value">LKR ${record.downPayment ? parseFloat(record.downPayment).toLocaleString() : '0'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Balance Amount:</span>
                <span class="detail-value">LKR ${record.balanceAmount ? parseFloat(record.balanceAmount).toLocaleString() : '0'}</span>
              </div>
              ${record.discountApplied ? `
              <div class="detail-row">
                <span class="detail-label">Discount Applied:</span>
                <span class="detail-value">Yes</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Discount Amount:</span>
                <span class="detail-value">LKR ${record.discountAmount ? parseFloat(record.discountAmount).toLocaleString() : '0'}</span>
              </div>
              ` : ''}
              ${record.regFee > 0 ? `
              <div class="detail-row">
                <span class="detail-label">Registration Fee:</span>
                <span class="detail-value">LKR ${record.regFee ? parseFloat(record.regFee).toLocaleString() : '0'}</span>
              </div>
              ` : ''}
              ${record.docCharge > 0 ? `
              <div class="detail-row">
                <span class="detail-label">Document Charge:</span>
                <span class="detail-value">LKR ${record.docCharge ? parseFloat(record.docCharge).toLocaleString() : '0'}</span>
              </div>
              ` : ''}
            </div>

            ${record.leasingCompany && record.leasingCompany.trim() !== '' ? `
            <div class="customer-details">
              <div class="section-title">Leasing Information</div>
              <div class="detail-row">
                <span class="detail-label">Leasing Company:</span>
                <span class="detail-value">${record.leasingCompany || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Officer Name:</span>
                <span class="detail-value">${record.officerName || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Contact Number:</span>
                <span class="detail-value">${record.officerContactNo || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Commission:</span>
                <span class="detail-value">${record.commissionPercentage ? record.commissionPercentage + '%' : 'N/A'}</span>
              </div>
            </div>
            ` : ''}

            <div class="customer-details">
              <div class="section-title">Additional Information</div>
              <div class="detail-row">
                <span class="detail-label">Branch:</span>
                <span class="detail-value">${record.branch || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Issue Time:</span>
                <span class="detail-value">${record.vehicleIssueTime || 'N/A'}</span>
              </div>
              ${record.warrantyPeriod ? `
              <div class="detail-row">
                <span class="detail-label">Warranty Period:</span>
                <span class="detail-value">${record.warrantyPeriod}</span>
              </div>
              ` : ''}
              ${record.freeServiceDetails ? `
              <div class="detail-row">
                <span class="detail-label">Free Service Details:</span>
                <span class="detail-value">${record.freeServiceDetails}</span>
              </div>
              ` : ''}
            </div>

            <div class="footer">
              <div>Contact: akrfuture@gmail.com</div>
              <div>Phone: 0232231222, 0773111266</div>
              <div>Address: Silavathurai road, Murunkan, Mannar</div>
            </div>
          </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
      
    } catch (error) {
      console.error('Error generating individual sales transaction PDF:', error);
      message.error('Failed to generate PDF');
    }
  };

  // Fetch installment plans stats
  const fetchInstallmentStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const res = await fetch(`${apiUrl}/api/installment-plans/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error("Status " + res.status + ": " + res.statusText);
      const stats = await res.json();
      setInstallmentStats(stats);
    } catch (err: any) {
      console.error("Failed to load installment plans stats:", err.message);
    }
  };

  // Load installment plans when tab is selected
  useEffect(() => {
    if (akrTab === 'installmentPlans') {
      fetchInstallmentPlans();
      fetchInstallmentStats();
    }
  }, [akrTab]);

  // Fetch bank deposits
  const fetchBankDeposits = async (page = 1, search = '') => {
    setBankDepositsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: bankDepositsPagination.pageSize.toString(),
        search: search
      });
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bank-deposits?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error("Status " + res.status + ": " + res.statusText);
      const response = await res.json();
      
      setBankDeposits(response.data);
      setBankDepositsPagination(response.pagination);
      setBankDepositsLoading(false);
    } catch (err: any) {
      setBankDepositsError("Failed to load bank deposits: " + err.message);
      setBankDepositsLoading(false);
    }
  };

  // Fetch bank deposits stats
  const fetchBankDepositsStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bank-deposits/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error("Status " + res.status + ": " + res.statusText);
      const response = await res.json();
      setBankDepositsStats(response.data);
    } catch (err: any) {
      console.error("Failed to load bank deposits stats:", err.message);
    }
  };

  // Load bank deposits when tab is selected
  useEffect(() => {
    if (akrTab === 'bankDeposits') {
      fetchBankDeposits();
      fetchBankDepositsStats();
    }
  }, [akrTab]);

  // Fetch bike inventory
  const fetchBikeInventory = async (page = 1, search = '') => {
    setBikeInventoryLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: bikeInventoryPagination.pageSize.toString(),
        search: search
      });
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bike-inventory?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error("Status " + res.status + ": " + res.statusText);
      const response = await res.json();
      
      setBikeInventory(response.data);
      setBikeInventoryPagination(response.pagination);
      setBikeInventoryLoading(false);
    } catch (err: any) {
      setBikeInventoryError("Failed to load bike inventory: " + err.message);
      setBikeInventoryLoading(false);
    }
  };

  // Fetch bike inventory stats
  const fetchBikeInventoryStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bike-inventory/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error("Status " + res.status + ": " + res.statusText);
      const response = await res.json();
      setBikeInventoryStats(response);
    } catch (err: any) {
      console.error("Failed to load bike inventory stats:", err.message);
    }
  };

  // Fetch bike inventory dropdown data
  const fetchBikeInventoryDropdownData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bike-inventory/dropdown-data`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error("Status " + res.status + ": " + res.statusText);
      const response = await res.json();
      setBikeInventoryDropdownData(response);
    } catch (err: any) {
      console.error("Failed to load bike inventory dropdown data:", err.message);
    }
  };

  // Load bike inventory when tab is selected
  useEffect(() => {
    if (akrTab === 'bikeInventory') {
      fetchBikeInventory(1, bikeInventorySearch, bikeInventoryDateFilter);
      fetchBikeInventoryDropdownData();
    }
  }, [akrTab]);

  // Handle account data form changes
  const handleAccountDataFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAccountDataForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle account data form number changes
  const handleAccountDataNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAccountDataForm(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  // Handle bank deposit form changes
  const handleBankDepositFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBankDepositsForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle bank deposit form number changes
  const handleBankDepositNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBankDepositsForm(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  // Handle bike inventory form changes
  const handleBikeInventoryFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBikeInventoryForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle bike inventory form number changes
  const handleBikeInventoryNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBikeInventoryForm(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  // Create or update account data
  const handleAccountDataSubmit = async () => {
    try {
      const token = localStorage.getItem('adminToken');
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5050';
    const url = editingAccountData
      ? `${apiUrl}/api/account-data/${editingAccountData._id}`
      : `${apiUrl}/api/account-data`;
      
      const method = editingAccountData ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(accountDataForm)
      });
      
      if (!res.ok) throw new Error("Failed to save account data");
      
      message.success(editingAccountData ? 'Account data updated successfully' : 'Account data created successfully');
      setAccountDataModalOpen(false);
      setEditingAccountData(null);
      setAccountDataForm({
        date: new Date().toISOString().split('T')[0],
        name: '',
        details: '',
        amount: 0,
        model: '',
        color: '',
        credit: 0,
        cost: 0,
        balance: 0,
        chequeReceivedDate: '',
        chequeReleaseDate: '',
        paymentMode: '',
        remarks: '',
        leasing: ''
      });
      fetchAccountData();
      fetchAccountDataStats();
    } catch (err: any) {
      message.error("Failed to save account data: " + err.message);
    }
  };

  // Delete account data
  const handleDeleteAccountData = async (id: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const res = await fetch(`${apiUrl}/api/account-data/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) throw new Error("Failed to delete account data");
      
      message.success('Account data deleted successfully');
      fetchAccountData();
      fetchAccountDataStats();
    } catch (err: any) {
      message.error("Failed to delete account data: " + err.message);
    }
  };

  // Edit account data
  const handleEditAccountData = (record: any) => {
    setEditingAccountData(record);
    setAccountDataForm({
      date: record.date ? new Date(record.date).toISOString().split('T')[0] : '',
      name: record.name || '',
      details: record.details || '',
      amount: record.amount || 0,
      model: record.model || '',
      color: record.color || '',
      credit: record.credit || 0,
      cost: record.cost || 0,
      balance: record.balance || 0,
      chequeReceivedDate: record.chequeReceivedDate ? new Date(record.chequeReceivedDate).toISOString().split('T')[0] : '',
      chequeReleaseDate: record.chequeReleaseDate ? new Date(record.chequeReleaseDate).toISOString().split('T')[0] : '',
      paymentMode: record.paymentMode || '',
      remarks: record.remarks || '',
      leasing: record.leasing || ''
    });
    setAccountDataModalOpen(true);
  };

  // Create or update bank deposit
  const handleBankDepositSubmit = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const url = editingBankDeposit 
        ? `${import.meta.env.VITE_API_URL}/api/bank-deposits/${editingBankDeposit._id}`
        : `${import.meta.env.VITE_API_URL}/api/bank-deposits`;
      
      const method = editingBankDeposit ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(bankDepositsForm)
      });
      
      if (!res.ok) throw new Error("Failed to save bank deposit");
      
      message.success(editingBankDeposit ? 'Bank deposit updated successfully' : 'Bank deposit created successfully');
      setBankDepositsModalOpen(false);
      setEditingBankDeposit(null);
      setBankDepositsForm({
        date: new Date().toISOString().split('T')[0],
        depositerName: '',
        accountNumber: '',
        accountName: '',
        purpose: '',
        quantity: 0,
        payment: 0
      });
      fetchBankDeposits();
      fetchBankDepositsStats();
    } catch (error) {
      console.error('Error saving bank deposit:', error);
      message.error('Failed to save bank deposit');
    }
  };

  // Delete bank deposit
  const handleDeleteBankDeposit = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bank-deposits/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        }
      });
      
      if (!res.ok) throw new Error("Failed to delete bank deposit");
      
      message.success('Bank deposit deleted successfully');
      fetchBankDeposits();
      fetchBankDepositsStats();
    } catch (error) {
      console.error('Error deleting bank deposit:', error);
      message.error('Failed to delete bank deposit');
    }
  };

  // Edit bank deposit
  const handleEditBankDeposit = (record: any) => {
    setEditingBankDeposit(record);
    setBankDepositsForm({
      date: record.date ? new Date(record.date).toISOString().split('T')[0] : '',
      depositerName: record.depositerName || '',
      accountNumber: record.accountNumber || '',
      accountName: record.accountName || '',
      purpose: record.purpose || '',
      quantity: record.quantity || 0,
      payment: record.payment || 0
    });
    setBankDepositsModalOpen(true);
  };

  // Create or update bike inventory
  const handleBikeInventorySubmit = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const url = editingBikeInventory 
        ? `${import.meta.env.VITE_API_URL}/api/bike-inventory/${editingBikeInventory._id}`
        : `${import.meta.env.VITE_API_URL}/api/bike-inventory`;
      
      const method = editingBikeInventory ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(bikeInventoryForm)
      });
      
      if (!res.ok) throw new Error("Failed to save bike inventory");
      
      message.success(editingBikeInventory ? 'Bike inventory updated successfully' : 'Bike inventory created successfully');
      setBikeInventoryModalOpen(false);
      setEditingBikeInventory(null);
      setBikeInventoryForm({
        date: new Date().toISOString().split('T')[0],
        bikeId: '',
        branch: '',
        brand: '',
        category: '',
        model: '',
        color: '',
        engineNo: '',
        chassisNumber: ''
      });
      fetchBikeInventory();
      fetchBikeInventoryStats();
      fetchDetailedStockInfo(); // Refresh detailed stock information
    } catch (error) {
      console.error('Error saving bike inventory:', error);
      message.error('Failed to save bike inventory');
    }
  };

  // Delete bike inventory
  const handleDeleteBikeInventory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bike-inventory/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        }
      });
      
      if (!res.ok) throw new Error("Failed to delete bike inventory");
      
      message.success('Bike inventory deleted successfully');
      fetchBikeInventory();
      fetchBikeInventoryStats();
      fetchDetailedStockInfo(); // Refresh detailed stock information
    } catch (error) {
      console.error('Error deleting bike inventory:', error);
      message.error('Failed to delete bike inventory');
    }
  };

  // Edit bike inventory
  const handleEditBikeInventory = (record: any) => {
    setEditingBikeInventory(record);
    setBikeInventoryForm({
      date: record.date ? new Date(record.date).toISOString().split('T')[0] : '',
      bikeId: record.bikeId || '',
      branch: record.branch || '',
      brand: record.brand || '',
      category: record.category || '',
      model: record.model || '',
      color: record.color || '',
      engineNo: record.engineNo || '',
      chassisNumber: record.chassisNumber || '',
      workshopNo: record.workshopNo || ''
    });
    setBikeInventoryModalOpen(true);
  };

  // View bike inventory
  const handleViewBikeInventory = (record: any) => {
    setViewingBikeInventory(record);
    setViewBikeInventoryModalOpen(true);
  };

  // Export account data to PDF
  const exportAccountDataToPDF = async () => {
    try {
      // Fetch all records for complete report
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        limit: '1000', // Get all records
        search: accountDataSearch
      });
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/account-data?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      const allRecords = data.data;
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const currentDate = new Date().toLocaleDateString('en-GB');
      const currentTime = new Date().toLocaleTimeString('en-GB');
      const searchTerm = accountDataSearch ? ` (Filtered by: "${accountDataSearch}")` : '';
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Account Data Report - ${currentDate}</title>
            <style>
              * { box-sizing: border-box; }
              body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 20px; 
                line-height: 1.4;
              }
              .header { 
                text-align: center !important; 
                margin-bottom: 30px; 
                border-bottom: 2px solid #333; 
                padding-bottom: 15px;
                width: 100%;
              }
              .company-name { 
                font-size: 28px; 
                font-weight: bold; 
                color: #333; 
                margin: 0 0 10px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .report-title { 
                font-size: 20px; 
                color: #666; 
                margin: 10px 0 5px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .report-info { 
                font-size: 14px; 
                color: #666; 
                margin: 5px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .stats { 
                display: flex; 
                justify-content: space-around; 
                margin: 20px 0; 
                padding: 15px; 
                background: #f5f5f5; 
                border-radius: 5px;
                width: 100%;
              }
              .stat-item { 
                text-align: center;
                flex: 1;
                margin: 0 10px;
              }
              .stat-value { 
                font-size: 18px; 
                font-weight: bold; 
                color: #333;
                margin-bottom: 5px;
              }
              .stat-label { 
                font-size: 12px; 
                color: #666;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 20px; 
                font-size: 10px;
              }
              th, td { 
                border: 1px solid #ddd; 
                padding: 6px; 
                text-align: left;
                vertical-align: top;
              }
              th { 
                background-color: #f2f2f2; 
                font-weight: bold;
                text-align: center;
              }
              .amount { 
                text-align: right; 
              }
              .date { 
                text-align: center; 
              }
              .footer { 
                margin-top: 30px; 
                text-align: center; 
                font-size: 12px; 
                color: #666;
                width: 100%;
              }
              @media print {
                body { 
                  margin: 0; 
                  padding: 15px;
                }
                .no-print { 
                  display: none; 
                }
                table { 
                  page-break-inside: auto; 
                }
                tr { 
                  page-break-inside: avoid; 
                  page-break-after: auto; 
                }
                .header {
                  text-align: center !important;
                }
                .company-name {
                  text-align: center !important;
                }
                .report-title {
                  text-align: center !important;
                }
                .report-info {
                  text-align: center !important;
                }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="company-name">AKR & SONS (PVT) LTD</div>
              <div class="report-title">Complete Account Data Report${searchTerm}</div>
              <div class="report-info">Generated on: ${currentDate} at ${currentTime}</div>
              <div class="report-info">Report Type: Complete Account Data Report</div>
            </div>
            
            <div class="stats">
              <div class="stat-item">
                <div class="stat-value">LKR ${accountDataStats.totalAmount?.toLocaleString() || '0'}</div>
                <div class="stat-label">Total Amount</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">LKR ${accountDataStats.totalCredit?.toLocaleString() || '0'}</div>
                <div class="stat-label">Total Credit</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">LKR ${accountDataStats.totalCost?.toLocaleString() || '0'}</div>
                <div class="stat-label">Total Cost</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${allRecords.length}</div>
                <div class="stat-label">Total Records</div>
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Details</th>
                  <th>Amount (LKR)</th>
                  <th>Model</th>
                  <th>Color</th>
                  <th>Credit (LKR)</th>
                  <th>Cost (LKR)</th>
                  <th>Balance</th>
                  <th>Cheque Received</th>
                  <th>Cheque Release</th>
                  <th>Payment Mode</th>
                  <th>Leasing</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                ${allRecords.map(record => `
                  <tr>
                    <td class="date">${record.date ? new Date(record.date).toLocaleDateString('en-GB') : '-'}</td>
                    <td>${record.name || '-'}</td>
                    <td>${record.details || '-'}</td>
                    <td class="amount">LKR ${record.amount?.toLocaleString() || '0'}</td>
                    <td>${record.model || '-'}</td>
                    <td>${record.color || '-'}</td>
                    <td class="amount">${record.credit > 0 ? `LKR ${record.credit.toLocaleString()}` : '-'}</td>
                    <td class="amount">${record.cost > 0 ? `LKR ${record.cost.toLocaleString()}` : '-'}</td>
                    <td class="amount">${record.balance > 0 ? `LKR ${record.balance.toLocaleString()}` : '-'}</td>
                    <td class="date">${record.chequeReceivedDate ? new Date(record.chequeReceivedDate).toLocaleDateString('en-GB') : '-'}</td>
                    <td class="date">${record.chequeReleaseDate ? new Date(record.chequeReleaseDate).toLocaleDateString('en-GB') : '-'}</td>
                    <td>${record.paymentMode || '-'}</td>
                    <td>${record.leasing || '-'}</td>
                    <td>${record.remarks || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="footer">
              <p>This report was generated from the AKR & SONS Admin Dashboard</p>
              <p>Total Records: ${allRecords.length} | Complete Report</p>
            </div>
            
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 500);
              };
            </script>
          </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } catch (error) {
      console.error('Error generating PDF:', error);
      message.error('Failed to generate PDF report');
    }
  };

  // Export bank deposits to PDF
  const exportBankDepositsToPDF = async () => {
    try {
      // Fetch all records for complete report
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        limit: '1000', // Get all records
        search: bankDepositsSearch
      });
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bank-deposits?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      const allRecords = data.data;
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const currentDate = new Date().toLocaleDateString('en-GB');
      const currentTime = new Date().toLocaleTimeString('en-GB');
      const searchTerm = bankDepositsSearch ? ` (Filtered by: "${bankDepositsSearch}")` : '';
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Bank Deposits Report - ${currentDate}</title>
            <style>
              * { box-sizing: border-box; }
              body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 20px; 
                line-height: 1.4;
              }
              .header { 
                text-align: center !important; 
                margin-bottom: 30px; 
                border-bottom: 2px solid #333; 
                padding-bottom: 15px;
                width: 100%;
              }
              .company-name { 
                font-size: 28px; 
                font-weight: bold; 
                color: #333; 
                margin: 0 0 10px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .report-title { 
                font-size: 20px; 
                color: #666; 
                margin: 10px 0 5px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .report-info { 
                font-size: 14px; 
                color: #666; 
                margin: 5px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .stats { 
                display: flex; 
                justify-content: space-around; 
                margin: 20px 0; 
                padding: 15px; 
                background: #f5f5f5; 
                border-radius: 5px;
                width: 100%;
              }
              .stat-item { 
                text-align: center;
                flex: 1;
                margin: 0 10px;
              }
              .stat-value { 
                font-size: 18px; 
                font-weight: bold; 
                color: #333;
                margin-bottom: 5px;
              }
              .stat-label { 
                font-size: 12px; 
                color: #666;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 20px; 
                font-size: 10px;
              }
              th, td { 
                border: 1px solid #ddd; 
                padding: 6px; 
                text-align: left;
                vertical-align: top;
              }
              th { 
                background-color: #f2f2f2; 
                font-weight: bold;
                text-align: center;
              }
              .amount { 
                text-align: right; 
              }
              .date { 
                text-align: center; 
              }
              .footer { 
                margin-top: 30px; 
                text-align: center; 
                font-size: 12px; 
                color: #666;
                width: 100%;
              }
              @media print {
                body { 
                  margin: 0; 
                  padding: 15px;
                }
                .no-print { 
                  display: none; 
                }
                table { 
                  page-break-inside: auto; 
                }
                tr { 
                  page-break-inside: avoid; 
                  page-break-after: auto; 
                }
                .header {
                  text-align: center !important;
                }
                .company-name {
                  text-align: center !important;
                }
                .report-title {
                  text-align: center !important;
                }
                .report-info {
                  text-align: center !important;
                }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="company-name">AKR & SONS (PVT) LTD</div>
              <div class="report-title">Complete Bank Deposits Report${searchTerm}</div>
              <div class="report-info">Generated on: ${currentDate} at ${currentTime}</div>
              <div class="report-info">Report Type: Complete Bank Deposits Report</div>
            </div>
            
            <div class="stats">
              <div class="stat-item">
                <div class="stat-value">LKR ${bankDepositsStats.totalPayment?.toLocaleString() || '0'}</div>
                <div class="stat-label">Total Payment</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${bankDepositsStats.totalQuantity || '0'}</div>
                <div class="stat-label">Total Quantity</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${allRecords.length}</div>
                <div class="stat-label">Total Records</div>
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Depositer Name</th>
                  <th>Account Number</th>
                  <th>Account Name</th>
                  <th>Purpose</th>
                  <th>Quantity</th>
                  <th>Payment (LKR)</th>
                </tr>
              </thead>
              <tbody>
                ${allRecords.map(record => `
                  <tr>
                    <td class="date">${record.date ? new Date(record.date).toLocaleDateString('en-GB') : '-'}</td>
                    <td>${record.depositerName || '-'}</td>
                    <td>${record.accountNumber || '-'}</td>
                    <td>${record.accountName || '-'}</td>
                    <td>${record.purpose || '-'}</td>
                    <td>${record.quantity > 0 ? record.quantity : '-'}</td>
                    <td class="amount">LKR ${record.payment?.toLocaleString() || '0'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="footer">
              <p>This report was generated from the AKR & SONS Admin Dashboard</p>
              <p>Total Records: ${allRecords.length} | Complete Report</p>
            </div>
            
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 500);
              };
            </script>
          </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } catch (error) {
      console.error('Error generating PDF:', error);
      message.error('Failed to generate PDF report');
    }
  };

  // Export bike inventory to PDF
  const exportBikeInventoryToPDF = async () => {
    try {
      // Fetch all records for complete report
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        limit: '1000', // Get all records
        search: bikeInventorySearch
      });
      
      if (bikeInventoryDateFilter) {
        params.append('dateFilter', bikeInventoryDateFilter);
      }
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bike-inventory?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      const allRecords = data.data;
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const currentDate = new Date().toLocaleDateString('en-GB');
      const currentTime = new Date().toLocaleTimeString('en-GB');
      const searchTerm = bikeInventorySearch ? ` (Filtered by: "${bikeInventorySearch}")` : '';
      const dateFilterTerm = bikeInventoryDateFilter ? ` (Date: ${bikeInventoryDateFilter})` : '';
      const filterTerm = searchTerm + dateFilterTerm;
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Bike Inventory Report - ${currentDate}</title>
            <style>
              * { box-sizing: border-box; }
              body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 20px; 
                line-height: 1.4;
              }
              .header { 
                text-align: center !important; 
                margin-bottom: 30px; 
                border-bottom: 2px solid #333; 
                padding-bottom: 15px;
                width: 100%;
              }
              .company-name { 
                font-size: 28px; 
                font-weight: bold; 
                color: #333; 
                margin: 0 0 10px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .report-title { 
                font-size: 20px; 
                color: #666; 
                margin: 10px 0 5px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .report-info { 
                font-size: 14px; 
                color: #666; 
                margin: 5px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .stats { 
                display: flex; 
                justify-content: space-around; 
                margin: 20px 0; 
                padding: 15px; 
                background: #f5f5f5; 
                border-radius: 5px;
                width: 100%;
              }
              .stat-item { 
                text-align: center;
                flex: 1;
                margin: 0 10px;
              }
              .stat-value { 
                font-size: 18px; 
                font-weight: bold; 
                color: #333;
                margin-bottom: 5px;
              }
              .stat-label { 
                font-size: 12px; 
                color: #666;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 20px; 
                font-size: 10px; 
              }
              th, td { 
                border: 1px solid #ddd; 
                padding: 6px; 
                text-align: left; 
              }
              th { 
                background-color: #f2f2f2; 
                font-weight: bold; 
              }
              .amount { text-align: right; }
              .date { text-align: center; }
              .footer { 
                margin-top: 30px; 
                text-align: center; 
                font-size: 12px; 
                color: #666; 
              }
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
                table { page-break-inside: auto; }
                tr { page-break-inside: avoid; page-break-after: auto; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="company-name">AKR & SONS (PVT) LTD</div>
              <div class="report-title">Complete Bike Inventory Report${filterTerm}</div>
              <div class="report-info">Generated on: ${currentDate} at ${currentTime}</div>
              <div class="report-info">Report Type: Complete Bike Inventory Report</div>
            </div>
            
            <div class="stats">
              <div class="stat-item">
                <div class="stat-value">${allRecords.filter(bike => new Date(bike.date) >= new Date(new Date().setDate(new Date().getDate() - 30))).length}</div>
                <div class="stat-label">New Bikes (Last 30 Days)</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${allRecords.filter(bike => new Date(bike.date) >= new Date(new Date().setDate(new Date().getDate() - 7))).length}</div>
                <div class="stat-label">New Bikes (Last 7 Days)</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${allRecords.filter(bike => new Date(bike.date).toDateString() === new Date().toDateString()).length}</div>
                <div class="stat-label">New Bikes (Today)</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${allRecords.length}</div>
                <div class="stat-label">Total Bikes in Inventory</div>
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Date</th>
                  <th>Bike ID</th>
                  <th>Branch</th>
                  <th>Category</th>
                  <th>Model</th>
                  <th>Color</th>
                  <th>Engine No</th>
                  <th>Chassis Number</th>
                </tr>
              </thead>
              <tbody>
                ${allRecords.map((record: any, index: number) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td class="date">${record.date ? new Date(record.date).toLocaleDateString('en-GB') : ''}</td>
                    <td>${record.bikeId || ''}</td>
                    <td>${record.branch || ''}</td>
                    <td>${record.category || ''}</td>
                    <td>${record.model || ''}</td>
                    <td>${record.color || ''}</td>
                    <td>${record.engineNo || ''}</td>
                    <td>${record.chassisNumber || ''}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="footer">
              <p>Total Records: ${allRecords.length} | Complete Report</p>
            </div>
            
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 500);
              };
            </script>
          </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } catch (error) {
      console.error('Error generating PDF:', error);
      message.error('Failed to generate PDF report');
    }
  };

  // Export individual bike inventory to PDF
  const exportIndividualBikeInventoryToPDF = (record: any) => {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const currentDate = new Date().toLocaleDateString('en-GB');
      const currentTime = new Date().toLocaleTimeString('en-GB');
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Bike Inventory - ${record.bikeId} - ${currentDate}</title>
            <style>
              * { box-sizing: border-box; }
              body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 20px; 
                line-height: 1.4;
              }
              .header { 
                text-align: center !important; 
                margin-bottom: 30px; 
                border-bottom: 2px solid #333; 
                padding-bottom: 15px;
                width: 100%;
              }
              .company-name { 
                font-size: 28px; 
                font-weight: bold; 
                color: #333; 
                margin: 0 0 10px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .report-title { 
                font-size: 20px; 
                color: #666; 
                margin: 10px 0 5px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .report-info { 
                font-size: 14px; 
                color: #666; 
                margin: 5px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .customer-details { 
                margin: 20px 0; 
                padding: 15px; 
                background: #f5f5f5; 
                border-radius: 5px;
                width: 100%;
              }
              .detail-row { 
                display: flex; 
                justify-content: space-between; 
                margin: 8px 0;
                border-bottom: 1px solid #ddd;
                padding-bottom: 5px;
              }
              .detail-label { 
                font-weight: bold; 
                color: #333;
                min-width: 150px;
              }
              .detail-value { 
                color: #666;
                text-align: right;
              }
              .section-title { 
                font-size: 18px; 
                font-weight: bold; 
                color: #333; 
                margin: 20px 0 10px 0;
                border-bottom: 2px solid #333;
                padding-bottom: 5px;
              }
              .footer { 
                margin-top: 40px; 
                text-align: center; 
                font-size: 12px; 
                color: #666;
                border-top: 1px solid #ddd;
                padding-top: 20px;
              }
              @media print {
                body { margin: 0; padding: 15px; }
                .header { page-break-inside: avoid; }
                .customer-details { page-break-inside: avoid; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="company-name">AKR & SON'S (PVT) LTD</div>
              <div class="report-title">Bike Inventory Details</div>
              <div class="report-info">Generated on: ${currentDate} at ${currentTime}</div>
            </div>

            <div class="customer-details">
              <div class="section-title">Bike Information</div>
              <div class="detail-row">
                <span class="detail-label">Bike ID:</span>
                <span class="detail-value">${record.bikeId || '-'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${record.date ? new Date(record.date).toLocaleDateString('en-GB') : '-'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Branch:</span>
                <span class="detail-value">${record.branch || '-'}</span>
              </div>
            </div>

            <div class="customer-details">
              <div class="section-title">Vehicle Details</div>
              <div class="detail-row">
                <span class="detail-label">Category:</span>
                <span class="detail-value">${record.category || '-'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Model:</span>
                <span class="detail-value">${record.model || '-'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Color:</span>
                <span class="detail-value">${record.color || '-'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Engine Number:</span>
                <span class="detail-value">${record.engineNo || '-'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Chassis Number:</span>
                <span class="detail-value">${record.chassisNumber || '-'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Workshop No:</span>
                <span class="detail-value">${record.workshopNo || '-'}</span>
              </div>
            </div>

            <div class="footer">
              <div>Contact: akrfuture@gmail.com</div>
              <div>Phone: 0232231222, 0773111266</div>
              <div>Address: Silavathurai road, Murunkan, Mannar</div>
            </div>
          </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
      
    } catch (error) {
      console.error('Error generating individual bike inventory PDF:', error);
      message.error('Failed to generate PDF');
    }
  };

  // Print account data
  const printAccountData = async () => {
    try {
      // Fetch all records for complete report
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        limit: '1000', // Get all records
        search: accountDataSearch
      });
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const res = await fetch(`${apiUrl}/api/account-data?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      const allRecords = data.data;
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const currentDate = new Date().toLocaleDateString('en-GB');
      const currentTime = new Date().toLocaleTimeString('en-GB');
      const searchTerm = accountDataSearch ? ` (Filtered by: "${accountDataSearch}")` : '';
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Account Data - ${currentDate}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
              .company-name { font-size: 24px; font-weight: bold; color: #333; }
              .report-title { font-size: 18px; color: #666; margin-top: 5px; }
              .report-info { font-size: 14px; color: #666; margin-top: 5px; }
              .stats { display: flex; justify-content: space-around; margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px; }
              .stat-item { text-align: center; }
              .stat-value { font-size: 18px; font-weight: bold; color: #333; }
              .stat-label { font-size: 12px; color: #666; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 10px; }
              th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
              .amount { text-align: right; }
              .date { text-align: center; }
              .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
                table { page-break-inside: auto; }
                tr { page-break-inside: avoid; page-break-after: auto; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="company-name">AKR & SONS (PVT) LTD</div>
              <div class="report-title">Complete Account Data Report${searchTerm}</div>
              <div class="report-info">Generated on: ${currentDate} at ${currentTime}</div>
              <div class="report-info">Report Type: Complete Account Data Report</div>
            </div>
            
            <div class="stats">
              <div class="stat-item">
                <div class="stat-value">LKR ${accountDataStats.totalAmount?.toLocaleString() || '0'}</div>
                <div class="stat-label">Total Amount</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">LKR ${accountDataStats.totalCredit?.toLocaleString() || '0'}</div>
                <div class="stat-label">Total Credit</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">LKR ${accountDataStats.totalCost?.toLocaleString() || '0'}</div>
                <div class="stat-label">Total Cost</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${allRecords.length}</div>
                <div class="stat-label">Total Records</div>
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Details</th>
                  <th>Amount (LKR)</th>
                  <th>Model</th>
                  <th>Color</th>
                  <th>Credit (LKR)</th>
                  <th>Cost (LKR)</th>
                  <th>Balance</th>
                  <th>Cheque Received</th>
                  <th>Cheque Release</th>
                  <th>Payment Mode</th>
                  <th>Leasing</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                ${allRecords.map(record => `
                  <tr>
                    <td class="date">${record.date ? new Date(record.date).toLocaleDateString('en-GB') : '-'}</td>
                    <td>${record.name || '-'}</td>
                    <td>${record.details || '-'}</td>
                    <td class="amount">LKR ${record.amount?.toLocaleString() || '0'}</td>
                    <td>${record.model || '-'}</td>
                    <td>${record.color || '-'}</td>
                    <td class="amount">${record.credit > 0 ? `LKR ${record.credit.toLocaleString()}` : '-'}</td>
                    <td class="amount">${record.cost > 0 ? `LKR ${record.cost.toLocaleString()}` : '-'}</td>
                    <td class="amount">${record.balance > 0 ? `LKR ${record.balance.toLocaleString()}` : '-'}</td>
                    <td class="date">${record.chequeReceivedDate ? new Date(record.chequeReceivedDate).toLocaleDateString('en-GB') : '-'}</td>
                    <td class="date">${record.chequeReleaseDate ? new Date(record.chequeReleaseDate).toLocaleDateString('en-GB') : '-'}</td>
                    <td>${record.paymentMode || '-'}</td>
                    <td>${record.leasing || '-'}</td>
                    <td>${record.remarks || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="footer">
              <p>This report was generated from the AKR & SONS Admin Dashboard</p>
              <p>Total Records: ${allRecords.length} | Complete Report</p>
            </div>
          </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } catch (error) {
      console.error('Error generating print report:', error);
      message.error('Failed to generate print report');
    }
  };

  // Sidebar
  const renderSidebar = (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Sidebar Header with Toggle Button */}
      <div className={`flex items-center justify-between border-b border-gray-200 ${sidebarCollapsed ? 'p-2' : 'p-4'}`}>
        <div className={`transition-all duration-300 ${sidebarCollapsed ? 'hidden' : 'block'}`}>
          <h2 className="text-lg font-semibold text-gray-800 truncate">{AKR_COMPANY_NAME}</h2>
        </div>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={`rounded-lg hover:bg-gray-100 transition-colors ${sidebarCollapsed ? 'p-1' : 'p-2'}`}
          title={`${sidebarCollapsed ? 'Expand' : 'Collapse'} Sidebar (Ctrl+B)`}
        >
          {sidebarCollapsed ? (
            <MenuOutlined style={{ fontSize: 14 }} />
          ) : (
            <MenuOutlined style={{ fontSize: 16, transform: 'rotate(180deg)' }} />
          )}
        </button>
      </div>
      
      {sidebarCollapsed ? (
        // Collapsed sidebar with individual menu items
        <div className="flex flex-col flex-1 py-2">
          <div 
            className={`flex items-center justify-center p-3 mb-2 cursor-pointer rounded-lg transition-colors ${akrTab === 'overview' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            onClick={() => setAkrTab('overview')}
            title="Overview"
          >
            <BookOutlined style={{ fontSize: 18 }} />
          </div>
          
          <div 
            className={`flex items-center justify-center p-3 mb-2 cursor-pointer rounded-lg transition-colors ${akrTab === 'vehicles' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            onClick={() => setAkrTab('vehicles')}
            title="Vehicles"
          >
            <CarOutlined style={{ fontSize: 18 }} />
          </div>
          
          <div 
            className={`flex items-center justify-center p-3 mb-2 cursor-pointer rounded-lg transition-colors ${akrTab === 'prebookings' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            onClick={() => setAkrTab('prebookings')}
            title="Pre-Bookings"
          >
            <BookOutlined style={{ fontSize: 18 }} />
          </div>
          
          <div 
            className={`flex items-center justify-center p-3 mb-2 cursor-pointer rounded-lg transition-colors ${akrTab === 'nextDueInstallments' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            onClick={() => setAkrTab('nextDueInstallments')}
            title="Next Due Installments"
          >
            <ClockCircleOutlined style={{ fontSize: 18 }} />
          </div>
          
          <div 
            className={`flex items-center justify-center p-3 mb-2 cursor-pointer rounded-lg transition-colors ${akrTab === 'recentActivity' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            onClick={() => setAkrTab('recentActivity')}
            title="Recent Activity"
          >
            <HistoryOutlined style={{ fontSize: 18 }} />
          </div>
          
          <div 
            className={`flex items-center justify-center p-3 mb-2 cursor-pointer rounded-lg transition-colors ${akrTab === 'vehicleAllocationCoupons' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            onClick={() => setAkrTab('vehicleAllocationCoupons')}
            title="Vehicle Allocation Coupons"
          >
            <FileTextOutlined style={{ fontSize: 18 }} />
          </div>
          
          <div 
            className={`flex items-center justify-center p-3 mb-2 cursor-pointer rounded-lg transition-colors ${akrTab === 'customers' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            onClick={() => setAkrTab('customers')}
            title="Customers"
          >
            <UserOutlined style={{ fontSize: 18 }} />
          </div>
          
          <div 
            className={`flex items-center justify-center p-3 mb-2 cursor-pointer rounded-lg transition-colors ${akrTab === 'salesTransactions' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            onClick={() => setAkrTab('salesTransactions')}
            title="Sales Transactions"
          >
            <ShoppingCartOutlined style={{ fontSize: 18 }} />
          </div>
          
          <div 
            className={`flex items-center justify-center p-3 mb-2 cursor-pointer rounded-lg transition-colors ${akrTab === 'accountData' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            onClick={() => setAkrTab('accountData')}
            title="Account Data"
          >
            <BookOutlined style={{ fontSize: 18 }} />
          </div>
          
          <div 
            className={`flex items-center justify-center p-3 mb-2 cursor-pointer rounded-lg transition-colors ${akrTab === 'installmentPlans' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            onClick={() => setAkrTab('installmentPlans')}
            title="Installment Plans"
          >
            <CreditCardOutlined style={{ fontSize: 18 }} />
          </div>
          
          <div 
            className={`flex items-center justify-center p-3 mb-2 cursor-pointer rounded-lg transition-colors ${akrTab === 'suppliers' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            onClick={() => setAkrTab('suppliers')}
            title="Suppliers"
          >
            <TeamOutlined style={{ fontSize: 18 }} />
          </div>
          
          <div 
            className={`flex items-center justify-center p-3 mb-2 cursor-pointer rounded-lg transition-colors ${akrTab === 'serviceWarranty' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            onClick={() => setAkrTab('serviceWarranty')}
            title="Service & Warranty"
          >
            <ToolOutlined style={{ fontSize: 18 }} />
          </div>
          
          <div 
            className={`flex items-center justify-center p-3 mb-2 cursor-pointer rounded-lg transition-colors ${akrTab === 'additionalInfo' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            onClick={() => setAkrTab('additionalInfo')}
            title="Additional Info"
          >
            <InfoCircleOutlined style={{ fontSize: 18 }} />
          </div>
          
          <div 
            className={`flex items-center justify-center p-3 mb-2 cursor-pointer rounded-lg transition-colors ${akrTab === 'settings' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            onClick={() => setAkrTab('settings')}
            title="Settings"
          >
            <SettingOutlined style={{ fontSize: 18 }} />
          </div>
        </div>
      ) : (
        // Expanded sidebar with full menu
          <Menu
            mode="inline"
        defaultSelectedKeys={[`vehicles`]}
        defaultOpenKeys={['akr-sons', 'prebookings']}
        openKeys={['akr-sons', 'prebookings']}
        style={{ flex: 1, borderRight: 0 }}
        items={[{
          key: 'akr-sons',
          label: AKR_COMPANY_NAME,
            icon: <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22 }}><BookOutlined style={{ fontSize: 20 }} /></span>,
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
                { key: 'prebookings-confirm', label: 'Confirm', onClick: () => { setAkrTab('prebookings'); setPreBookingStatus('Confirmed'); } },
                { key: 'prebookings-cancelled', label: 'Cancelled', onClick: () => { setAkrTab('prebookings'); setPreBookingStatus('Cancelled'); } },
                { key: 'prebookings-all', label: 'All', onClick: () => { setAkrTab('prebookings'); setPreBookingStatus('All'); } },
              ]
            },
            {
              key: 'nextDueInstallments',
              label: 'Next Due Installments',
              icon: <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22 }}><ClockCircleOutlined style={{ fontSize: 20 }} /></span>,
              onClick: () => setAkrTab('nextDueInstallments')
            },
            {
              key: 'chequeReleaseReminders',
              label: 'Cheque Release Reminders',
              icon: <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22 }}><FileTextOutlined style={{ fontSize: 20 }} /></span>,
              onClick: () => setAkrTab('chequeReleaseReminders')
            },
            {
              key: 'recentActivity',
              label: 'Recent Activity',
              icon: <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22 }}><HistoryOutlined style={{ fontSize: 20 }} /></span>,
              onClick: () => setAkrTab('recentActivity')
            },
            {
              key: 'vehicleAllocationCoupons',
              label: 'Vehicle Allocation Coupons',
              icon: <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22 }}><FileTextOutlined style={{ fontSize: 20 }} /></span>,
              onClick: () => setAkrTab('vehicleAllocationCoupons')
            },
            {
              key: `customers`,
              label: 'Customers',
              icon: <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22 }}><UserOutlined style={{ fontSize: 20 }} /></span>,
              onClick: () => setAkrTab('customers')
            },
            {
              key: 'commissionerLetter',
              label: 'Commissioner Letter',
              icon: <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22 }}><FileTextOutlined style={{ fontSize: 20 }} /></span>,
              onClick: () => setAkrTab('commissionerLetter')
            },
            {
              key: `salesTransactions`,
              label: 'Sales Transactions',
              icon: <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22 }}><ShoppingCartOutlined style={{ fontSize: 20 }} /></span>,
              onClick: () => setAkrTab('salesTransactions')
            },
              {
                key: 'accountData',
                label: 'Account Data',
                icon: <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22 }}><BookOutlined style={{ fontSize: 20 }} /></span>,
                onClick: () => setAkrTab('accountData')
              },
              {
                key: 'bankDeposits',
                label: 'Bank Deposits',
                icon: <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22 }}><BankOutlined style={{ fontSize: 20 }} /></span>,
                onClick: () => setAkrTab('bankDeposits')
              },
              {
                key: 'bikeInventory',
                label: 'Bike Inventory',
                icon: <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22 }}><CarOutlined style={{ fontSize: 20 }} /></span>,
                onClick: () => setAkrTab('bikeInventory')
            },
            {
              key: 'installmentPlans',
              label: 'Installment Plans',
              icon: <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22 }}><CreditCardOutlined style={{ fontSize: 20 }} /></span>,
              onClick: () => setAkrTab('installmentPlans')
            },
            {
              key: 'suppliers',
              label: 'Suppliers',
              icon: <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22 }}><TeamOutlined style={{ fontSize: 20 }} /></span>,
              onClick: () => setAkrTab('suppliers')
            },
            {
              key: 'serviceWarranty',
              label: 'Service & Warranty',
              icon: <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22 }}><ToolOutlined style={{ fontSize: 20 }} /></span>,
              onClick: () => setAkrTab('serviceWarranty')
            },
            {
              key: 'additionalInfo',
              label: 'Additional Info',
              icon: <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22 }}><InfoCircleOutlined style={{ fontSize: 20 }} /></span>,
              onClick: () => setAkrTab('additionalInfo')
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
      )}
      <div style={{ padding: sidebarCollapsed ? 8 : 24 }}>
        {sidebarCollapsed ? (
          <button
            onClick={handleLogout}
            className="w-full p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center"
            title="Logout"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        ) : (
          <Button 
            onClick={handleLogout} 
            type="default" 
            danger 
            block
          >
            Logout
          </Button>
        )}
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
            { value: 'Confirmed', label: 'Confirm' },
            { value: 'Cancelled', label: 'Cancelled' }
          ];
        } else if (status === 'Confirmed') {
          options = [
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

  // Account data columns
  const accountDataColumns = [
    { 
      title: 'Date', 
      dataIndex: 'date', 
      key: 'date', 
      render: (date: string) => new Date(date).toLocaleDateString('en-GB'),
      sorter: (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
    },
    { 
      title: 'Name', 
      dataIndex: 'name', 
      key: 'name',
      render: (name: string) => name || '-'
    },
    { 
      title: 'Details', 
      dataIndex: 'details', 
      key: 'details' 
    },
    { 
      title: 'Amount (LKR)', 
      dataIndex: 'amount', 
      key: 'amount',
      render: (amount: number) => `LKR ${amount.toLocaleString()}`,
      sorter: (a: any, b: any) => a.amount - b.amount
    },
    { 
      title: 'Model', 
      dataIndex: 'model', 
      key: 'model',
      render: (model: string) => model || '-'
    },
    { 
      title: 'Color', 
      dataIndex: 'color', 
      key: 'color',
      render: (color: string) => color || '-'
    },
    { 
      title: 'Credit (LKR)', 
      dataIndex: 'credit', 
      key: 'credit',
      render: (credit: number) => credit > 0 ? `LKR ${credit.toLocaleString()}` : '-'
    },
    { 
      title: 'Cost (LKR)', 
      dataIndex: 'cost', 
      key: 'cost',
      render: (cost: number) => cost > 0 ? `LKR ${cost.toLocaleString()}` : '-'
    },
    { 
      title: 'Balance', 
      dataIndex: 'balance', 
      key: 'balance',
      render: (balance: number) => balance > 0 ? `LKR ${balance.toLocaleString()}` : '-'
    },
    { 
      title: 'Cheque Received', 
      dataIndex: 'chequeReceivedDate', 
      key: 'chequeReceivedDate',
      render: (date: string) => date ? new Date(date).toLocaleDateString('en-GB') : '-'
    },
    { 
      title: 'Cheque Release', 
      dataIndex: 'chequeReleaseDate', 
      key: 'chequeReleaseDate',
      render: (date: string) => date ? new Date(date).toLocaleDateString('en-GB') : '-'
    },
    { 
      title: 'Payment Mode', 
      dataIndex: 'paymentMode', 
      key: 'paymentMode',
      render: (mode: string) => mode || '-'
    },
    { 
      title: 'Remarks', 
      dataIndex: 'remarks', 
      key: 'remarks',
      render: (remarks: string) => remarks || '-'
    },
    { 
      title: 'Leasing', 
      dataIndex: 'leasing', 
      key: 'leasing',
      render: (leasing: string) => leasing || '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <div className="flex gap-2">
          <Button type="link" size="small" onClick={() => handleEditAccountData(record)}>
            Edit
          </Button>
          <Button type="link" size="small" danger onClick={() => handleDeleteAccountData(record._id)}>
            Delete
          </Button>
        </div>
      )
    }
  ];

  // Bank deposit columns
  const bankDepositColumns = [
    { 
      title: 'Date', 
      dataIndex: 'date', 
      key: 'date', 
      render: (date: string) => new Date(date).toLocaleDateString('en-GB'),
      sorter: (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
    },
    { 
      title: 'Depositer Name', 
      dataIndex: 'depositerName', 
      key: 'depositerName',
      render: (name: string) => name || '-'
    },
    { 
      title: 'Account Number', 
      dataIndex: 'accountNumber', 
      key: 'accountNumber',
      render: (number: string) => number || '-'
    },
    { 
      title: 'Account Name', 
      dataIndex: 'accountName', 
      key: 'accountName',
      render: (name: string) => name || '-'
    },
    { 
      title: 'Purpose', 
      dataIndex: 'purpose', 
      key: 'purpose',
      render: (purpose: string) => purpose || '-'
    },
    { 
      title: 'Quantity', 
      dataIndex: 'quantity', 
      key: 'quantity',
      render: (quantity: number) => quantity > 0 ? quantity : '-',
      sorter: (a: any, b: any) => a.quantity - b.quantity
    },
    { 
      title: 'Payment (LKR)', 
      dataIndex: 'payment', 
      key: 'payment',
      render: (payment: number) => `LKR ${payment.toLocaleString()}`,
      sorter: (a: any, b: any) => a.payment - b.payment
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <div className="flex gap-2">
          <Button type="link" size="small" onClick={() => handleEditBankDeposit(record)}>
            Edit
          </Button>
          <Button type="link" size="small" danger onClick={() => handleDeleteBankDeposit(record._id)}>
            Delete
          </Button>
        </div>
      )
    }
  ];

  // Bike inventory columns
  const bikeInventoryColumns = [
    { 
      title: 'Date', 
      dataIndex: 'date', 
      key: 'date', 
      render: (date: string) => new Date(date).toLocaleDateString('en-GB'),
      sorter: (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
    },
    { 
      title: 'Bike ID', 
      dataIndex: 'bikeId', 
      key: 'bikeId',
      render: (id: string) => id || '-'
    },
    { 
      title: 'Branch', 
      dataIndex: 'branch', 
      key: 'branch',
      render: (branch: string) => branch || '-'
    },
    { 
      title: 'Category', 
      dataIndex: 'category', 
      key: 'category',
      render: (category: string) => category || '-'
    },
    { 
      title: 'Model', 
      dataIndex: 'model', 
      key: 'model',
      render: (model: string) => model || '-'
    },
    { 
      title: 'Color', 
      dataIndex: 'color', 
      key: 'color',
      render: (color: string) => color || '-'
    },
    { 
      title: 'Engine No', 
      dataIndex: 'engineNo', 
      key: 'engineNo',
      render: (engineNo: string) => engineNo || '-'
    },
    { 
      title: 'Chassis Number', 
      dataIndex: 'chassisNumber', 
      key: 'chassisNumber',
      render: (chassisNumber: string) => chassisNumber || '-'
    },
    { 
      title: 'Workshop No', 
      dataIndex: 'workshopNo', 
      key: 'workshopNo',
      render: (workshopNo: string) => workshopNo || '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center' as const,
      render: (_: any, record: any) => (
        <div className="flex gap-2 justify-center">
          <Button size="small" type="primary" onClick={() => handleViewBikeInventory(record)}>
            View
          </Button>
          <Button type="link" size="small" onClick={() => handleEditBikeInventory(record)}>
            Edit
          </Button>
          <Button type="link" size="small" danger onClick={() => handleDeleteBikeInventory(record._id)}>
            Delete
          </Button>
        </div>
      )
    }
  ];

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

  // Customer state
  const [customers, setCustomers] = useState<any[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersError, setCustomersError] = useState("");
  const [customersSearch, setCustomersSearch] = useState('');
  const [customersPagination, setCustomersPagination] = useState({ current: 1, pageSize: 50, total: 0 });
  const [customersStats, setCustomersStats] = useState<any>({
    totalCustomers: 0,
    totalWithPhone: 0,
    totalWithNIC: 0
  });
  const [customersModalOpen, setCustomersModalOpen] = useState(false);
  const [customersForm, setCustomersForm] = useState<any>({
    fullName: '',
    nicDrivingLicense: '',
    phoneNo: '',
    address: '',
    language: '',
    occupation: '',
    dateOfPurchase: ''
  });
  const [editingCustomer, setEditingCustomer] = useState<any>(null);

  // Sales Transactions state
  const [salesTransactions, setSalesTransactions] = useState<any[]>([]);
  const [salesTransactionsLoading, setSalesTransactionsLoading] = useState(false);
  const [salesTransactionsError, setSalesTransactionsError] = useState("");
  const [salesTransactionsSearch, setSalesTransactionsSearch] = useState('');
  const [salesTransactionsPagination, setSalesTransactionsPagination] = useState({ current: 1, pageSize: 50, total: 0 });
  const [salesTransactionsStats, setSalesTransactionsStats] = useState<any>({
    totalTransactions: 0,
    totalSellingPrice: 0,
    totalDiscountApplied: 0,
    totalFinalAmount: 0,
    averageSellingPrice: 0,
    averageDiscount: 0,
    averageFinalAmount: 0
  });
  const [salesTransactionsModalOpen, setSalesTransactionsModalOpen] = useState(false);
  const [viewSalesTransactionModalOpen, setViewSalesTransactionModalOpen] = useState(false);
  const [viewingSalesTransaction, setViewingSalesTransaction] = useState<any>(null);
  const [salesTransactionsForm, setSalesTransactionsForm] = useState<any>({
    invoiceNo: '',
    bikeId: '',
    customerName: '',
    salesDate: new Date().toISOString().split('T')[0],
    salespersonName: '',
    sellingPrice: 0,
    discountApplied: 0,
    finalAmount: 0,
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    warrantyPeriod: '',
    freeServiceDetails: ''
  });
  const [editingSalesTransaction, setEditingSalesTransaction] = useState<any>(null);

  const fetchCustomers = async (page = 1, search = '') => {
    setCustomersLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: customersPagination.pageSize.toString(),
        search: search
      });
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/customers?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error("Status " + res.status + ": " + res.statusText);
      const response = await res.json();
      
      setCustomers(response.data);
      setCustomersPagination(response.pagination);
      setCustomersLoading(false);
    } catch (err: any) {
      setCustomersError("Failed to load customers: " + err.message);
      setCustomersLoading(false);
    }
  };

  const fetchCustomersStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/customers/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error("Status " + res.status + ": " + res.statusText);
      const response = await res.json();
      setCustomersStats(response);
    } catch (err: any) {
      console.error("Failed to load customer stats:", err.message);
    }
  };

  const fetchCustomerHistory = async (customerName: string) => {
    setCustomerHistoryLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vehicle-allocation-coupons?search=${encodeURIComponent(customerName)}&limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error("Status " + res.status + ": " + res.statusText);
      const response = await res.json();
      
      // Filter coupons for this specific customer
      const customerCoupons = response.vehicleAllocationCoupons.filter((coupon: any) => 
        coupon.fullName === customerName
      );
      
      setCustomerHistoryData(customerCoupons);
      setCustomerHistoryLoading(false);
    } catch (err: any) {
      console.error("Failed to load customer history:", err.message);
      setCustomerHistoryLoading(false);
    }
  };
  // Load data when tabs are selected
  useEffect(() => {
    if (akrTab === 'customers') {
      fetchCustomers();
      fetchCustomersStats();
    } else if (akrTab === 'salesTransactions') {
      fetchSalesTransactions();
      fetchSalesTransactionsStats();
    } else if (akrTab === 'installmentPlans') {
      fetchInstallmentPlans();
      fetchInstallmentPlansStats();
    }
  }, [akrTab]);

  const fetchSalesTransactions = async (page = 1, search = '') => {
    setSalesTransactionsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: salesTransactionsPagination.pageSize.toString(),
        search: search
      });
      
      // Fetch from Vehicle Allocation Coupons instead of separate Sales Transactions
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vehicle-allocation-coupons?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error("Status " + res.status + ": " + res.statusText);
      const response = await res.json();
      
      // Transform Vehicle Allocation Coupons to Sales Transaction format with full details
      const transformedData = response.vehicleAllocationCoupons.map((coupon: any) => ({
        _id: coupon._id,
        invoiceNo: coupon.couponId,
        customerName: coupon.fullName,
        customerPhone: coupon.contactNo,
        customerAddress: coupon.address,
        vehicleModel: coupon.vehicleType,
        engineNumber: coupon.engineNo || '',
        chassisNumber: coupon.chassisNo || '',
        salesDate: coupon.dateOfPurchase,
        vehicleIssueTime: coupon.vehicleIssueTime || '',
        branch: coupon.branch || '',
        sellingPrice: coupon.totalAmount || 0,
        downPayment: coupon.downPayment || 0,
        balanceAmount: coupon.balance || 0,
        paymentMethod: coupon.paymentType || '',
        paymentStatus: coupon.balance > 0 ? 'Partial' : 'Paid',
        leasingCompany: coupon.leasingCompany || '',
        officerName: coupon.officerName || '',
        officerContactNo: coupon.officerContactNo || '',
        commissionPercentage: coupon.commissionPercentage || 0,
        discountApplied: coupon.discountApplied || false,
        discountAmount: coupon.discountAmount || 0,
        finalAmount: (coupon.totalAmount || 0) - (coupon.discountAmount || 0),
        regFee: coupon.regFee || 0,
        docCharge: coupon.docCharge || 0,
        insuranceCo: coupon.insuranceCo || '',
        bikeColor: coupon.bikeColor || '',
        bikeCategory: coupon.bikeCategory || '',
        bikeBrand: coupon.bikeBrand || '',
        bikeModel: coupon.bikeModel || '',
        bikeCondition: coupon.bikeCondition || '',
        yearOfManufacture: coupon.yearOfManufacture || '',
        fuelType: coupon.fuelType || '',
        transmission: coupon.transmission || '',
        engineCapacity: coupon.engineCapacity || '',
        registrationNo: coupon.registrationNo || '',
        status: coupon.status || '',
        notes: coupon.notes || '',
        relatedCouponId: coupon.couponId
      }));
      
      setSalesTransactions(transformedData);
      setSalesTransactionsPagination(response.pagination);
      setSalesTransactionsLoading(false);
    } catch (err: any) {
      setSalesTransactionsError("Failed to load sales transactions: " + err.message);
      setSalesTransactionsLoading(false);
    }
  };

  const fetchSalesTransactionsStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      // Fetch from Vehicle Allocation Coupons instead of separate Sales Transactions
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vehicle-allocation-coupons?limit=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error("Status " + res.status + ": " + res.statusText);
      const response = await res.json();
      
      // Calculate stats from Vehicle Allocation Coupons
      const coupons = response.vehicleAllocationCoupons;
      const stats = {
        totalTransactions: coupons.length,
        totalSellingPrice: coupons.reduce((sum: number, coupon: any) => sum + (coupon.totalAmount || 0), 0),
        totalDiscountApplied: coupons.reduce((sum: number, coupon: any) => sum + (coupon.discountAmount || 0), 0),
        totalFinalAmount: coupons.reduce((sum: number, coupon: any) => sum + (coupon.totalAmount - (coupon.discountAmount || 0)), 0)
      };
      
      setSalesTransactionsStats(stats);
    } catch (err: any) {
      console.error("Failed to load sales transaction stats:", err.message);
    }
  };

  // Load sales transactions when tab is selected
  useEffect(() => {
    if (akrTab === 'salesTransactions') {
      fetchSalesTransactions();
      fetchSalesTransactionsStats();
    }
  }, [akrTab]);

  // Handle customer form changes
  const handleCustomerFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCustomersForm(prev => ({ ...prev, [name]: value }));
  };

  // Create or update customer
  const handleCustomerSubmit = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const url = editingCustomer 
        ? `${import.meta.env.VITE_API_URL}/api/customers/${editingCustomer._id}`
        : `${import.meta.env.VITE_API_URL}/api/customers`;
      
      const method = editingCustomer ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(customersForm)
      });
      
      if (!res.ok) throw new Error("Failed to save customer");
      
      message.success(editingCustomer ? 'Customer updated successfully' : 'Customer created successfully');
      setCustomersModalOpen(false);
      setEditingCustomer(null);
      setCustomersForm({
        fullName: '',
        nicDrivingLicense: '',
        phoneNo: '',
        address: '',
        language: '',
        occupation: '',
        dateOfPurchase: ''
      });
      fetchCustomers();
      fetchCustomersStats();
    } catch (err: any) {
      message.error("Failed to save customer: " + err.message);
    }
  };

  // Delete customer
  const handleDeleteCustomer = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/customers/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        }
      });
      
      if (!res.ok) throw new Error("Failed to delete customer");
      
      message.success('Customer deleted successfully');
      fetchCustomers();
      fetchCustomersStats();
    } catch (error) {
      console.error('Error deleting customer:', error);
      message.error('Failed to delete customer');
    }
  };

  // Handle sales transaction form changes
  const handleSalesTransactionFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSalesTransactionsForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle sales transaction number changes
  const handleSalesTransactionNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;
    setSalesTransactionsForm(prev => ({ ...prev, [name]: numValue }));
  };

  // Create or update sales transaction
  const handleSalesTransactionSubmit = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const url = editingSalesTransaction 
        ? `${import.meta.env.VITE_API_URL}/api/sales-transactions/${editingSalesTransaction._id}`
        : `${import.meta.env.VITE_API_URL}/api/sales-transactions`;
      
      const method = editingSalesTransaction ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(salesTransactionsForm)
      });
      
      if (!res.ok) throw new Error("Failed to save sales transaction");
      
      message.success(editingSalesTransaction ? 'Sales transaction updated successfully' : 'Sales transaction created successfully');
      setSalesTransactionsModalOpen(false);
      setEditingSalesTransaction(null);
      setSalesTransactionsForm({
        invoiceNo: '',
        bikeId: '',
        customerName: '',
        salesDate: new Date().toISOString().split('T')[0],
        salespersonName: '',
        sellingPrice: 0,
        discountApplied: 0,
        finalAmount: 0,
        paymentMethod: 'Cash',
        paymentStatus: 'Paid',
        warrantyPeriod: '',
        freeServiceDetails: ''
      });
      fetchSalesTransactions();
      fetchSalesTransactionsStats();
    } catch (err: any) {
      message.error("Failed to save sales transaction: " + err.message);
    }
  };

  // Delete sales transaction
  const handleDeleteSalesTransaction = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this sales transaction?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/sales-transactions/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        }
      });
      
      if (!res.ok) throw new Error("Failed to delete sales transaction");
      
      message.success('Sales transaction deleted successfully');
      fetchSalesTransactions();
      fetchSalesTransactionsStats();
    } catch (error) {
      console.error('Error deleting sales transaction:', error);
      message.error('Failed to delete sales transaction');
    }
  };

  // Edit sales transaction
  const handleEditSalesTransaction = (record: any) => {
    setEditingSalesTransaction(record);
    setSalesTransactionsForm({
      invoiceNo: record.invoiceNo || '',
      bikeId: record.bikeId || '',
      customerName: record.customerName || '',
      salesDate: record.salesDate ? new Date(record.salesDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      salespersonName: record.salespersonName || '',
      sellingPrice: record.sellingPrice || 0,
      discountApplied: record.discountApplied || 0,
      finalAmount: record.finalAmount || 0,
      paymentMethod: record.paymentMethod || 'Cash',
      paymentStatus: record.paymentStatus || 'Paid',
      warrantyPeriod: record.warrantyPeriod || '',
      freeServiceDetails: record.freeServiceDetails || ''
    });
    setSalesTransactionsModalOpen(true);
  };

  // View sales transaction
  const handleViewSalesTransaction = (record: any) => {
    setViewingSalesTransaction(record);
    setViewSalesTransactionModalOpen(true);
  };

  // Export sales transactions to PDF
  const exportSalesTransactionsToPDF = async () => {
    try {
      // Fetch all records for complete report
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        limit: '1000', // Get all records
        search: salesTransactionsSearch
      });
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/sales-transactions?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      const allRecords = data.data;
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const currentDate = new Date().toLocaleDateString('en-GB');
      const currentTime = new Date().toLocaleTimeString('en-GB');
      const searchTerm = salesTransactionsSearch ? ` (Filtered by: "${salesTransactionsSearch}")` : '';
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Sales Transactions Report - ${currentDate}</title>
            <style>
              * { box-sizing: border-box; }
              body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 20px; 
                line-height: 1.4;
              }
              .header { 
                text-align: center !important; 
                margin-bottom: 30px; 
                border-bottom: 2px solid #333; 
                padding-bottom: 15px;
                width: 100%;
              }
              .company-name { 
                font-size: 28px; 
                font-weight: bold; 
                color: #333; 
                margin: 0 0 10px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .report-title { 
                font-size: 20px; 
                color: #666; 
                margin: 10px 0 5px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .report-info { 
                font-size: 14px; 
                color: #666; 
                margin: 5px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .stats { 
                display: flex; 
                justify-content: space-around; 
                margin: 20px 0; 
                padding: 15px; 
                background: #f5f5f5; 
                border-radius: 5px;
                width: 100%;
              }
              .stat-item { 
                text-align: center;
                flex: 1;
                margin: 0 10px;
              }
              .stat-value { 
                font-size: 18px; 
                font-weight: bold; 
                color: #333;
                margin-bottom: 5px;
              }
              .stat-label { 
                font-size: 12px; 
                color: #666;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 20px; 
                font-size: 10px; 
              }
              th, td { 
                border: 1px solid #ddd; 
                padding: 6px; 
                text-align: left; 
              }
              th { 
                background-color: #f2f2f2; 
                font-weight: bold; 
              }
              .date { text-align: center; }
              .amount { text-align: right; }
              .footer { 
                margin-top: 30px; 
                text-align: center; 
                font-size: 12px; 
                color: #666; 
              }
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
                table { page-break-inside: auto; }
                tr { page-break-inside: avoid; page-break-after: auto; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="company-name">AKR & SONS (PVT) LTD</div>
              <div class="report-title">Complete Sales Transactions Report with Leasing Details${searchTerm}</div>
              <div class="report-info">Generated on: ${currentDate} at ${currentTime}</div>
              <div class="report-info">Report Type: Complete Sales Transactions with Full Details</div>
            </div>
            

            
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Coupon ID</th>
                  <th>Customer Name</th>
                  <th>Customer Phone</th>
                  <th>Vehicle Model</th>
                  <th>Color</th>
                  <th>Category</th>
                  <th>Engine No</th>
                  <th>Chassis No</th>
                  <th>Insurance</th>
                  <th>Purchase Date</th>
                  <th>Branch</th>
                  <th>Total Amount</th>
                  <th>Discount</th>
                  <th>Down Payment</th>
                  <th>Balance</th>
                  <th>Payment Method</th>
                  <th>Reg Fee</th>
                  <th>Doc Charge</th>
                  <th>Leasing Company</th>
                  <th>Officer Name</th>
                  <th>Officer Contact</th>
                  <th>Commission %</th>
                </tr>
              </thead>
              <tbody>
                ${allRecords.map((record: any, index: number) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${record.invoiceNo || ''}</td>
                    <td>${record.customerName || ''}</td>
                    <td>${record.customerPhone || ''}</td>
                    <td>${record.vehicleModel || ''}</td>
                    <td>${record.bikeColor || '-'}</td>
                    <td>${record.bikeCategory || '-'}</td>
                    <td>${record.engineNumber || ''}</td>
                    <td>${record.chassisNumber || ''}</td>
                    <td>${record.insuranceCo || '-'}</td>
                    <td class="date">${record.salesDate ? new Date(record.salesDate).toLocaleDateString('en-GB') : ''}</td>
                    <td>${record.branch || ''}</td>
                    <td class="amount">LKR ${record.sellingPrice?.toLocaleString() || '0'}</td>
                    <td class="amount">LKR ${record.discountAmount?.toLocaleString() || '0'}</td>
                    <td class="amount">LKR ${record.downPayment?.toLocaleString() || '0'}</td>
                    <td class="amount">LKR ${record.balanceAmount?.toLocaleString() || '0'}</td>
                    <td>${record.paymentMethod || ''}</td>
                    <td class="amount">LKR ${record.regFee?.toLocaleString() || '0'}</td>
                    <td class="amount">LKR ${record.docCharge?.toLocaleString() || '0'}</td>
                    <td>${record.leasingCompany || '-'}</td>
                    <td>${record.officerName || '-'}</td>
                    <td>${record.officerContactNo || '-'}</td>
                    <td>${record.commissionPercentage || 0}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="footer">
              <p>Total Records: ${allRecords.length} | Complete Report</p>
            </div>
            
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 500);
              };
            </script>
          </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } catch (error) {
      console.error('Error generating PDF:', error);
      message.error('Failed to generate PDF report');
    }
  };

  // Edit customer
  const handleEditCustomer = (record: any) => {
    setEditingCustomer(record);
    setCustomersForm({
      fullName: record.fullName || '',
      nicDrivingLicense: record.nicDrivingLicense || '',
      phoneNo: record.phoneNo || '',
      address: record.address || '',
      language: record.language || '',
      occupation: record.occupation || '',
      dateOfPurchase: record.dateOfPurchase ? new Date(record.dateOfPurchase).toISOString().split('T')[0] : ''
    });
    setCustomersModalOpen(true);
  };

  // Generate Commissioner Letter
  const generateCommissionerLetter = async () => {
    if (!commissionerLetterForm.customerName || !commissionerLetterForm.vehicleNumber || !commissionerLetterForm.crNumber || !commissionerLetterForm.nicNumber || !commissionerLetterForm.address || !commissionerLetterForm.settledDate) {
      message.error('Please fill in all required fields');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const currentDate = new Date().toLocaleDateString('en-GB');
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Commissioner Letter - ${commissionerLetterForm.customerName}</title>
          <style>
            * { box-sizing: border-box; }
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 40px; 
              line-height: 1.6;
              color: #333;
            }
            .letterhead {
              text-align: center;
              margin-bottom: 40px;
              border-bottom: 3px solid #000;
              padding-bottom: 20px;
            }

            .company-name {
              font-size: 24px;
              font-weight: bold;
              color: #000;
              margin: 0;
            }
            .company-subtitle {
              font-size: 14px;
              color: #666;
              margin: 5px 0;
            }
            .letter-content {
              margin: 30px 0;
            }
            .date {
              text-align: right;
              margin-bottom: 30px;
              font-weight: bold;
            }
            .subject {
              font-weight: bold;
              margin: 20px 0 15px 0;
              color: #000;
            }
            .greeting {
              margin: 20px 0;
            }
            .body-text {
              margin: 15px 0;
              text-align: justify;
            }
            .highlight {
              font-weight: bold;
              color: #000;
            }
            .signature-section {
              margin-top: 50px;
              text-align: right;
            }
            .signature-line {
              border-top: 1px dotted #333;
              width: 200px;
              margin: 30px 0 5px 0;
              display: inline-block;
            }
            .signature-name {
              font-weight: bold;
              margin-bottom: 5px;
            }
            .signature-title {
              font-size: 12px;
              color: #666;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #eee;
              padding-top: 20px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="letterhead">
            <div class="company-name">AKR & SONS (PVT) LTD</div>
            <div class="company-subtitle">Vehicle Dealership & Services</div>
            <div class="company-subtitle">Main street, Murunkan</div>
            <div class="company-subtitle">Contact: akrfuture@gmail.com | 0232231222, 0773111266</div>
          </div>

          <div class="date">
            Date: ${currentDate}
          </div>

          <div class="subject">
            Subject: Vehicle Settlement Confirmation Letter
          </div>

          <div class="greeting">
            To Whom It May Concern,
          </div>

          <div class="body-text">
            This letter is to confirm that <span class="highlight">${commissionerLetterForm.customerName}</span> has successfully settled all outstanding payments for the vehicle with the following details:
          </div>

          <div class="body-text">
            <strong>Vehicle Details:</strong><br>
            • Vehicle Number: <span class="highlight">${commissionerLetterForm.vehicleNumber}</span><br>
            • CR Number: <span class="highlight">${commissionerLetterForm.crNumber}</span><br>
            • Customer NIC: <span class="highlight">${commissionerLetterForm.nicNumber}</span><br>
            • Customer Address: <span class="highlight">${commissionerLetterForm.address}</span><br>
            • Settlement Date: <span class="highlight">${commissionerLetterForm.settledDate}</span>
          </div>

          <div class="body-text">
            All financial obligations related to this vehicle have been fully satisfied, and there are no outstanding balances or pending payments.
          </div>

          <div class="body-text">
            This letter serves as official confirmation of the complete settlement of the vehicle purchase agreement.
          </div>

          <div class="signature-section">
            <div class="signature-line"></div>
            <div class="signature-name">Anton Rojar Stalin</div>
            <div class="signature-title">Managing Director</div>
            <div class="signature-title">AKR & SONS (PVT) LTD</div>
          </div>

          <div class="footer">
            <p>This is a computer-generated document. For verification, please contact us at akrfuture@gmail.com or call 0232231222, 0773111266</p>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Export customer history to PDF
  const exportCustomerHistoryToPDF = async (customer: any, historyData: any[]) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const currentDate = new Date().toLocaleDateString('en-GB');
    const currentTime = new Date().toLocaleTimeString('en-GB');
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Customer History Report - ${customer.fullName}</title>
          <style>
            * { box-sizing: border-box; }
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              line-height: 1.4;
            }
            .header { 
              text-align: center !important; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #333; 
              padding-bottom: 15px;
              width: 100%;
            }
            .company-name { 
              font-size: 28px; 
              font-weight: bold; 
              color: #333; 
              margin: 0 0 10px 0;
              text-align: center !important;
              width: 100%;
              display: block;
            }
            .report-title { 
              font-size: 20px; 
              color: #666; 
              margin: 10px 0 5px 0;
              text-align: center !important;
              width: 100%;
              display: block;
            }
            .report-info { 
              font-size: 14px; 
              color: #666; 
              margin: 5px 0;
              text-align: center !important;
              width: 100%;
              display: block;
            }
            .customer-info {
              background: #f5f5f5;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .customer-info h3 {
              margin: 0 0 10px 0;
              color: #333;
            }
            .customer-info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
            }
            .info-item {
              display: flex;
              justify-content: space-between;
            }
            .info-label {
              font-weight: bold;
              color: #666;
            }
            .purchase-item {
              border: 1px solid #ddd;
              margin: 15px 0;
              padding: 15px;
              border-radius: 5px;
            }
            .purchase-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 1px solid #eee;
            }
            .purchase-title {
              font-size: 18px;
              font-weight: bold;
              color: #333;
            }
            .purchase-amount {
              font-size: 20px;
              font-weight: bold;
              color: #28a745;
            }
            .purchase-status {
              background: #007bff;
              color: white;
              padding: 4px 8px;
              border-radius: 3px;
              font-size: 12px;
            }
            .details-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin: 15px 0;
            }
            .detail-section {
              background: #f8f9fa;
              padding: 10px;
              border-radius: 3px;
            }
            .detail-section h4 {
              margin: 0 0 8px 0;
              color: #495057;
              font-size: 14px;
            }
            .detail-item {
              display: flex;
              justify-content: space-between;
              margin: 3px 0;
              font-size: 12px;
            }
            .detail-label {
              color: #6c757d;
            }
            .detail-value {
              font-weight: 500;
            }
            .installment-details {
              background: #fff3cd;
              padding: 10px;
              border-radius: 3px;
              margin-top: 10px;
            }
            .installment-grid {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 10px;
            }
            .footer { 
              margin-top: 30px; 
              text-align: center; 
              font-size: 12px; 
              color: #666; 
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">AKR & SONS (PVT) LTD</div>
            <div class="report-title">Customer Purchase History Report</div>
            <div class="report-info">Generated on: ${currentDate} at ${currentTime}</div>
            <div class="report-info">Customer: ${customer.fullName}</div>
          </div>
          
          <div class="customer-info">
            <h3>Customer Information</h3>
            <div class="customer-info-grid">
              <div class="info-item">
                <span class="info-label">Full Name:</span>
                <span>${customer.fullName}</span>
              </div>
              <div class="info-item">
                <span class="info-label">NIC/Driving License:</span>
                <span>${customer.nicDrivingLicense || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Phone Number:</span>
                <span>${customer.phoneNo || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Address:</span>
                <span>${customer.address || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Occupation:</span>
                <span>${customer.occupation || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Date of Purchase:</span>
                <span>${customer.dateOfPurchase ? new Date(customer.dateOfPurchase).toLocaleDateString('en-GB') : 'N/A'}</span>
              </div>
            </div>
          </div>

          <h3>Purchase History (${historyData.length} records)</h3>
          
          ${historyData.map((coupon, index) => `
            <div class="purchase-item">
              <div class="purchase-header">
                <div>
                  <div class="purchase-title">${coupon.couponId}</div>
                  <div style="color: #666; font-size: 14px;">${coupon.vehicleType}</div>
                  <div style="color: #999; font-size: 12px;">Purchase Date: ${new Date(coupon.dateOfPurchase).toLocaleDateString('en-GB')}</div>
                </div>
                <div style="text-align: right;">
                  <div class="purchase-amount">LKR ${coupon.totalAmount?.toLocaleString()}</div>
                  <div style="color: #666; font-size: 14px;">${coupon.paymentMethod}</div>
                  <div class="purchase-status">${coupon.status}</div>
                </div>
              </div>
              
              <div class="details-grid">
                <div class="detail-section">
                  <h4>Customer Details</h4>
                  <div class="detail-item">
                    <span class="detail-label">Full Name:</span>
                    <span class="detail-value">${coupon.fullName}</span>
                  </div>
                                     <div class="detail-item">
                     <span class="detail-label">NIC/Driving License:</span>
                     <span class="detail-value">${coupon.nicDrivingLicense || coupon.nicNo || 'N/A'}</span>
                   </div>
                  <div class="detail-item">
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">${coupon.contactNo || 'N/A'}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Address:</span>
                    <span class="detail-value">${coupon.address || 'N/A'}</span>
                  </div>
                </div>
                
                <div class="detail-section">
                  <h4>Vehicle Details</h4>
                  <div class="detail-item">
                    <span class="detail-label">Vehicle Type:</span>
                    <span class="detail-value">${coupon.vehicleType}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Engine No:</span>
                    <span class="detail-value">${coupon.engineNo}</span>
                  </div>
                                     <div class="detail-item">
                     <span class="detail-label">Chassis No:</span>
                     <span class="detail-value">${coupon.chassisNo}</span>
                   </div>
                </div>
              </div>
              
              <div class="detail-section">
                <h4>Payment Details</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px;">
                  <div class="detail-item">
                    <span class="detail-label">Base Price:</span>
                    <span class="detail-value">LKR ${coupon.basePrice?.toLocaleString() || '0'}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Reg Fee:</span>
                    <span class="detail-value">LKR ${coupon.regFee?.toLocaleString() || '0'}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Doc Charge:</span>
                    <span class="detail-value">LKR ${coupon.docCharge?.toLocaleString() || '0'}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Insurance:</span>
                    <span class="detail-value">LKR ${coupon.insuranceCo?.toLocaleString() || '0'}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Total Amount:</span>
                    <span class="detail-value">LKR ${coupon.totalAmount?.toLocaleString()}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Down Payment:</span>
                    <span class="detail-value">LKR ${coupon.downPayment?.toLocaleString()}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Discount:</span>
                    <span class="detail-value">LKR ${coupon.discountAmount?.toLocaleString() || '0'}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Balance:</span>
                    <span class="detail-value">LKR ${coupon.balance?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
                             ${coupon.paymentMethod === 'Leasing via AKR' ? `
                 <div style="background: #dbeafe; padding: 10px; border-radius: 3px; margin-top: 10px;">
                   <h4 style="margin: 0 0 8px 0; color: #1d4ed8; font-size: 14px;">Leasing Company Details</h4>
                   <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                     <div class="detail-item">
                       <span class="detail-label">Company:</span>
                       <span class="detail-value">${coupon.leasingCompany || 'AKR Easy Credit'}</span>
                     </div>
                     <div class="detail-item">
                       <span class="detail-label">Officer:</span>
                       <span class="detail-value">${coupon.officerName || 'Anton Rojar Stalin'}</span>
                     </div>
                     <div class="detail-item">
                       <span class="detail-label">Contact:</span>
                       <span class="detail-value">${coupon.officerContactNo || '0773111266'}</span>
                     </div>
                     <div class="detail-item">
                       <span class="detail-label">Commission:</span>
                       <span class="detail-value">${coupon.commissionPercentage || '3'}%</span>
                     </div>
                   </div>
                 </div>
               ` : ''}

               ${coupon.paymentMethod === 'Leasing via AKR' && coupon.balance > 0 ? `
                 <div class="installment-details">
                   <h4>Installment Details</h4>
                   <div class="installment-grid">
                     <div>
                       <div class="detail-item">
                         <span class="detail-label">1st Installment:</span>
                         <span class="detail-value">LKR ${(() => {
                           const amount = coupon.firstInstallmentAmount || 
                                        coupon.firstInstallment?.amount || 
                                        (coupon.balance / 3);
                           return amount ? amount.toLocaleString() : 'N/A';
                         })()}</span>
                       </div>
                       <div style="font-size: 11px; color: #666;">
                         ${(() => {
                           const date = coupon.firstInstallmentDate || 
                                      coupon.firstInstallment?.date;
                           return date ? new Date(date).toLocaleDateString('en-GB') : 'N/A';
                         })()}
                       </div>
                       <div style="font-size: 10px; margin-top: 2px;">
                         <span style="background: ${(() => {
                           // Check multiple sources for payment status
                           const isPaid = coupon.firstInstallmentPaid || 
                                        coupon.firstInstallment?.paid || 
                                        coupon.firstInstallmentPaidStatus ||
                                        String(coupon.firstInstallment?.date || '').includes('✓') ||
                                        String(coupon.firstInstallment?.status || '').toLowerCase().includes('paid') ||
                                        String(coupon.firstInstallmentDate || '').includes('✓') ||
                                        String(coupon.firstInstallmentAmount || '').includes('✓') ||
                                        coupon.firstInstallment?.paidAmount > 0 ||
                                        coupon.firstInstallment?.status === 'Paid';
                           return isPaid ? '#10b981' : '#ef4444';
                         })()}; color: white; padding: 2px 6px; border-radius: 3px;">
                           ${(() => {
                             // Check multiple sources for payment status
                             const isPaid = coupon.firstInstallmentPaid || 
                                          coupon.firstInstallment?.paid || 
                                          coupon.firstInstallmentPaidStatus ||
                                          String(coupon.firstInstallment?.date || '').includes('✓') ||
                                          String(coupon.firstInstallment?.status || '').toLowerCase().includes('paid') ||
                                          String(coupon.firstInstallmentDate || '').includes('✓') ||
                                          String(coupon.firstInstallmentAmount || '').includes('✓') ||
                                          coupon.firstInstallment?.paidAmount > 0 ||
                                          coupon.firstInstallment?.status === 'Paid';
                             return isPaid ? '✓ Paid' : '❌ Unpaid';
                           })()}
                         </span>
                       </div>
                     </div>
                     <div>
                       <div class="detail-item">
                         <span class="detail-label">2nd Installment:</span>
                         <span class="detail-value">LKR ${(() => {
                           const amount = coupon.secondInstallmentAmount || 
                                        coupon.secondInstallment?.amount || 
                                        (coupon.balance / 3);
                           return amount ? amount.toLocaleString() : 'N/A';
                         })()}</span>
                       </div>
                       <div style="font-size: 11px; color: #666;">
                         ${(() => {
                           const date = coupon.secondInstallmentDate || 
                                      coupon.secondInstallment?.date;
                           return date ? new Date(date).toLocaleDateString('en-GB') : 'N/A';
                         })()}
                       </div>
                       <div style="font-size: 10px; margin-top: 2px;">
                         <span style="background: ${(() => {
                           // Check multiple sources for payment status
                           const isPaid = coupon.secondInstallmentPaid || 
                                        coupon.secondInstallment?.paid || 
                                        coupon.secondInstallmentPaidStatus ||
                                        String(coupon.secondInstallment?.date || '').includes('✓') ||
                                        String(coupon.secondInstallment?.status || '').toLowerCase().includes('paid') ||
                                        String(coupon.secondInstallmentDate || '').includes('✓') ||
                                        String(coupon.secondInstallmentAmount || '').includes('✓') ||
                                        coupon.secondInstallment?.paidAmount > 0 ||
                                        coupon.secondInstallment?.status === 'Paid';
                           return isPaid ? '#10b981' : '#ef4444';
                         })()}; color: white; padding: 2px 6px; border-radius: 3px;">
                           ${(() => {
                             // Check multiple sources for payment status
                             const isPaid = coupon.secondInstallmentPaid || 
                                          coupon.secondInstallment?.paid || 
                                          coupon.secondInstallmentPaidStatus ||
                                          String(coupon.secondInstallment?.date || '').includes('✓') ||
                                          String(coupon.secondInstallment?.status || '').toLowerCase().includes('paid') ||
                                          String(coupon.secondInstallmentDate || '').includes('✓') ||
                                          String(coupon.secondInstallmentAmount || '').includes('✓') ||
                                          coupon.secondInstallment?.paidAmount > 0 ||
                                          coupon.secondInstallment?.status === 'Paid';
                             return isPaid ? '✓ Paid' : '❌ Unpaid';
                           })()}
                         </span>
                       </div>
                     </div>
                     <div>
                       <div class="detail-item">
                         <span class="detail-label">3rd Installment:</span>
                         <span class="detail-value">LKR ${(() => {
                           const amount = coupon.thirdInstallmentAmount || 
                                        coupon.thirdInstallment?.amount || 
                                        (coupon.balance / 3);
                           return amount ? amount.toLocaleString() : 'N/A';
                         })()}</span>
                       </div>
                       <div style="font-size: 11px; color: #666;">
                         ${(() => {
                           const date = coupon.thirdInstallmentDate || 
                                      coupon.thirdInstallment?.date;
                           return date ? new Date(date).toLocaleDateString('en-GB') : 'N/A';
                         })()}
                       </div>
                       <div style="font-size: 10px; margin-top: 2px;">
                         <span style="background: ${(() => {
                           // Check multiple sources for payment status
                           const isPaid = coupon.thirdInstallmentPaid || 
                                        coupon.thirdInstallment?.paid || 
                                        coupon.thirdInstallmentPaidStatus ||
                                        String(coupon.thirdInstallment?.date || '').includes('✓') ||
                                        String(coupon.thirdInstallment?.status || '').toLowerCase().includes('paid') ||
                                        String(coupon.thirdInstallmentDate || '').includes('✓') ||
                                        String(coupon.thirdInstallmentAmount || '').includes('✓') ||
                                        coupon.thirdInstallment?.paidAmount > 0 ||
                                        coupon.thirdInstallment?.status === 'Paid';
                           return isPaid ? '#10b981' : '#ef4444';
                         })()}; color: white; padding: 2px 6px; border-radius: 3px;">
                           ${(() => {
                             // Check multiple sources for payment status
                             const isPaid = coupon.thirdInstallmentPaid || 
                                          coupon.thirdInstallment?.paid || 
                                          coupon.thirdInstallmentPaidStatus ||
                                          String(coupon.thirdInstallment?.date || '').includes('✓') ||
                                          String(coupon.thirdInstallment?.status || '').toLowerCase().includes('paid') ||
                                          String(coupon.thirdInstallmentDate || '').includes('✓') ||
                                          String(coupon.thirdInstallmentAmount || '').includes('✓') ||
                                          coupon.thirdInstallment?.paidAmount > 0 ||
                                          coupon.thirdInstallment?.status === 'Paid';
                             return isPaid ? '✓ Paid' : '❌ Unpaid';
                           })()}
                         </span>
                       </div>
                     </div>
                   </div>
                 </div>
               ` : ''}

               ${coupon.paymentMethod === 'Leasing via Other Company' ? `
                 <div style="background: #f3e8ff; padding: 10px; border-radius: 3px; margin-top: 10px;">
                   <h4 style="margin: 0 0 8px 0; color: #7c3aed; font-size: 14px;">Leasing Company Details</h4>
                   <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                     <div class="detail-item">
                       <span class="detail-label">Company:</span>
                       <span class="detail-value">${coupon.leasingCompany || 'N/A'}</span>
                     </div>
                     <div class="detail-item">
                       <span class="detail-label">Officer:</span>
                       <span class="detail-value">${coupon.officerName || 'N/A'}</span>
                     </div>
                     <div class="detail-item">
                       <span class="detail-label">Contact:</span>
                       <span class="detail-value">${coupon.officerContactNo || 'N/A'}</span>
                     </div>
                     <div class="detail-item">
                       <span class="detail-label">Commission:</span>
                       <span class="detail-value">${coupon.commissionPercentage || '0'}%</span>
                     </div>
                   </div>
                 </div>
               ` : ''}
              
              ${coupon.notes ? `
                <div style="background: #f8f9fa; padding: 8px; border-radius: 3px; margin-top: 10px;">
                  <div style="font-weight: bold; color: #495057; margin-bottom: 5px;">Notes:</div>
                  <div style="font-size: 12px; color: #6c757d;">${coupon.notes}</div>
                </div>
              ` : ''}
            </div>
          `).join('')}
          
          <div class="footer">
            <p>Total Records: ${historyData.length} | Customer: ${customer.fullName}</p>
            <p>Contact: akrfuture@gmail.com | 0232231222, 0773111266</p>
            <p>Silavathurai road, Murunkan, Mannar</p>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Export customers to PDF
  const exportCustomersToPDF = async () => {
    try {
      // Fetch all records for complete report
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        limit: '1000', // Get all records
        search: customersSearch
      });
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/customers?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      const allRecords = data.data;
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const currentDate = new Date().toLocaleDateString('en-GB');
      const currentTime = new Date().toLocaleTimeString('en-GB');
      const searchTerm = customersSearch ? ` (Filtered by: "${customersSearch}")` : '';
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Customer Details Report - ${currentDate}</title>
            <style>
              * { box-sizing: border-box; }
              body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 20px; 
                line-height: 1.4;
              }
              .header { 
                text-align: center !important; 
                margin-bottom: 30px; 
                border-bottom: 2px solid #333; 
                padding-bottom: 15px;
                width: 100%;
              }
              .company-name { 
                font-size: 28px; 
                font-weight: bold; 
                color: #333; 
                margin: 0 0 10px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .report-title { 
                font-size: 20px; 
                color: #666; 
                margin: 10px 0 5px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .report-info { 
                font-size: 14px; 
                color: #666; 
                margin: 5px 0;
                text-align: center !important;
                width: 100%;
                display: block;
              }
              .stats { 
                display: flex; 
                justify-content: space-around; 
                margin: 20px 0; 
                padding: 15px; 
                background: #f5f5f5; 
                border-radius: 5px;
                width: 100%;
              }
              .stat-item { 
                text-align: center;
                flex: 1;
                margin: 0 10px;
              }
              .stat-value { 
                font-size: 18px; 
                font-weight: bold; 
                color: #333;
                margin-bottom: 5px;
              }
              .stat-label { 
                font-size: 12px; 
                color: #666;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 20px; 
                font-size: 10px; 
              }
              th, td { 
                border: 1px solid #ddd; 
                padding: 6px; 
                text-align: left; 
              }
              th { 
                background-color: #f2f2f2; 
                font-weight: bold; 
              }
              .date { text-align: center; }
              .footer { 
                margin-top: 30px; 
                text-align: center; 
                font-size: 12px; 
                color: #666; 
              }
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
                table { page-break-inside: auto; }
                tr { page-break-inside: avoid; page-break-after: auto; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="company-name">AKR & SONS (PVT) LTD</div>
              <div class="report-title">Complete Customer Details Report${searchTerm}</div>
              <div class="report-info">Generated on: ${currentDate} at ${currentTime}</div>
              <div class="report-info">Report Type: Complete Customer Details Report</div>
            </div>
            

            
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Full Name</th>
                  <th>NIC/Driving License</th>
                  <th>Phone No</th>
                  <th>Address</th>
                  <th>Occupation</th>
                  <th>Date of Purchase</th>
                </tr>
              </thead>
              <tbody>
                ${allRecords.map((record: any, index: number) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${record.fullName || ''}</td>
                    <td>${record.nicDrivingLicense || ''}</td>
                    <td>${record.phoneNo || ''}</td>
                    <td>${record.address || ''}</td>
                    <td>${record.occupation || ''}</td>
                    <td class="date">${record.dateOfPurchase ? new Date(record.dateOfPurchase).toLocaleDateString('en-GB') : ''}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="footer">
              <p>Total Records: ${allRecords.length} | Complete Report</p>
            </div>
            
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 500);
              };
            </script>
          </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } catch (error) {
      console.error('Error generating PDF:', error);
      message.error('Failed to generate PDF report');
    }
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
    <div className="h-screen flex bg-gradient-to-br from-emerald-50 via-white to-cyan-100">
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
      <aside className={`fixed top-0 left-0 h-screen bg-white shadow-lg z-50 transform transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:translate-x-0 md:block ${sidebarCollapsed ? 'w-12' : 'w-64'}`}>
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
                              <div>Price: LKR {vehicle.price?.toLocaleString()}</div>
                              <div>Stock: <span className={vehicle.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}>{vehicle.stockQuantity || 0}</span></div>
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
                      { 
                        title: 'Price', 
                        dataIndex: 'price', 
                        key: 'price',
                        render: (price: number) => `LKR ${price?.toLocaleString() || '0'}`
                      },
                      {
                        title: 'Stock',
                        dataIndex: 'stockQuantity',
                        key: 'stockQuantity',
                        align: 'center',
                        render: (stockQuantity: number, record: any) => (
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {stockQuantity || 0}
                            </span>
                            <Button 
                              type="link" 
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStock(record);
                              }}
                            >
                              Edit
                            </Button>
                          </div>
                        ),
                        width: 100
                      },
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
                                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5050';
                                await fetch(`${apiUrl}/api/vehicles/${record._id}/availability`, {
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
                            <label className="block font-medium mb-1">Stock Quantity</label>
                            <input
                              type="number"
                        name="stockQuantity"
                              min="0"
                              className="border px-3 py-2 rounded w-full mb-3"
                              value={vehicleForm.stockQuantity}
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
          {akrTab === 'accountData' && (
            <div className="col-span-full">
              <h2 className="text-2xl font-bold mb-4">Account Data Management</h2>
              
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="text-center">
                  <div className="text-2xl font-bold text-green-600">LKR {accountDataStats.totalAmount?.toLocaleString() || '0'}</div>
                  <div className="text-sm text-gray-600">Total Amount</div>
                </Card>
                <Card className="text-center">
                  <div className="text-2xl font-bold text-blue-600">LKR {accountDataStats.totalCredit?.toLocaleString() || '0'}</div>
                  <div className="text-sm text-gray-600">Total Credit</div>
                </Card>
                <Card className="text-center">
                  <div className="text-2xl font-bold text-red-600">LKR {accountDataStats.totalCost?.toLocaleString() || '0'}</div>
                  <div className="text-sm text-gray-600">Total Cost</div>
                </Card>
                <Card className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{accountDataStats.count || '0'}</div>
                  <div className="text-sm text-gray-600">Total Records</div>
                </Card>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Search by name, details, model, or remarks..."
                  value={accountDataSearch}
                  onChange={e => {
                    setAccountDataSearch(e.target.value);
                    // Auto-search as user types
                    fetchAccountData(1, e.target.value);
                  }}
                  className="border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 shadow w-full sm:w-64"
                />
                <div className="flex gap-2">
                  <Button type="primary" onClick={() => {
                    setEditingAccountData(null);
                    setAccountDataForm({
                      date: new Date().toISOString().split('T')[0],
                      name: '',
                      details: '',
                      amount: 0,
                      model: '',
                      color: '',
                      credit: 0,
                      cost: 0,
                      balance: 0,
                      chequeReceivedDate: '',
                      chequeReleaseDate: '',
                      paymentMode: '',
                      remarks: '',
                      leasing: ''
                    });
                    setAccountDataModalOpen(true);
                  }}>
                    Add Record
                  </Button>
                  <Button type="default" onClick={exportAccountDataToPDF}>
                    Export PDF
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table
                  dataSource={accountData}
                  loading={accountDataLoading}
                  columns={accountDataColumns}
                  rowKey="_id"
                  pagination={{
                    current: accountDataPagination.current,
                    pageSize: accountDataPagination.pageSize,
                    total: accountDataPagination.total,
                    onChange: (page) => fetchAccountData(page, accountDataSearch),
                    showSizeChanger: false
                  }}
                  className="rounded-xl overflow-hidden shadow-lg bg-white"
                  scroll={{ x: 1500 }}
                />
              </div>

              {/* Add/Edit Account Data Modal */}
              <Modal
                title={editingAccountData ? "Edit Account Data" : "Add Account Data"}
                open={accountDataModalOpen}
                onCancel={() => {
                  setAccountDataModalOpen(false);
                  setEditingAccountData(null);
                }}
                footer={null}
                width={800}
                centered
              >
                <form onSubmit={(e) => { e.preventDefault(); handleAccountDataSubmit(); }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Date *</label>
                      <input
                        type="date"
                        name="date"
                        value={accountDataForm.date}
                        onChange={handleAccountDataFormChange}
                        required
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={accountDataForm.name}
                        onChange={handleAccountDataFormChange}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Details *</label>
                      <input
                        type="text"
                        name="details"
                        value={accountDataForm.details}
                        onChange={handleAccountDataFormChange}
                        required
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Amount (LKR) *</label>
                      <input
                        type="number"
                        name="amount"
                        value={accountDataForm.amount}
                        onChange={handleAccountDataNumberChange}
                        required
                        min="0"
                        step="0.01"
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Model</label>
                      <input
                        type="text"
                        name="model"
                        value={accountDataForm.model}
                        onChange={handleAccountDataFormChange}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Color</label>
                      <input
                        type="text"
                        name="color"
                        value={accountDataForm.color}
                        onChange={handleAccountDataFormChange}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Credit (LKR)</label>
                      <input
                        type="number"
                        name="credit"
                        value={accountDataForm.credit}
                        onChange={handleAccountDataNumberChange}
                        min="0"
                        step="0.01"
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Cost (LKR)</label>
                      <input
                        type="number"
                        name="cost"
                        value={accountDataForm.cost}
                        onChange={handleAccountDataNumberChange}
                        min="0"
                        step="0.01"
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Balance</label>
                      <input
                        type="number"
                        name="balance"
                        value={accountDataForm.balance}
                        onChange={handleAccountDataNumberChange}
                        min="0"
                        step="0.01"
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Cheque Received Date</label>
                      <input
                        type="date"
                        name="chequeReceivedDate"
                        value={accountDataForm.chequeReceivedDate}
                        onChange={handleAccountDataFormChange}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Cheque Release Date</label>
                      <input
                        type="date"
                        name="chequeReleaseDate"
                        value={accountDataForm.chequeReleaseDate}
                        onChange={handleAccountDataFormChange}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Payment Mode</label>
                      <input
                        type="text"
                        name="paymentMode"
                        value={accountDataForm.paymentMode}
                        onChange={handleAccountDataFormChange}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Leasing</label>
                      <input
                        type="text"
                        name="leasing"
                        value={accountDataForm.leasing}
                        onChange={handleAccountDataFormChange}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Remarks</label>
                      <textarea
                        name="remarks"
                        value={accountDataForm.remarks}
                        onChange={handleAccountDataFormChange}
                        rows={3}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="default" onClick={() => {
                      setAccountDataModalOpen(false);
                      setEditingAccountData(null);
                    }}>
                      Cancel
                    </Button>
                    <Button type="primary" htmlType="submit">
                      {editingAccountData ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>
              </Modal>
            </div>
          )}
          {akrTab === 'bikeInventory' && (
            <div className="col-span-full">
              <h2 className="text-2xl font-bold mb-4">Bike Inventory Management</h2>
              
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="text-center">
                  <div className="text-2xl font-bold text-green-600">{bikeInventory.filter(bike => new Date(bike.date) >= new Date(new Date().setDate(new Date().getDate() - 30))).length}</div>
                  <div className="text-sm text-gray-600">New Bikes (Last 30 Days)</div>
                </Card>
                <Card className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{bikeInventory.filter(bike => new Date(bike.date) >= new Date(new Date().setDate(new Date().getDate() - 7))).length}</div>
                  <div className="text-sm text-gray-600">New Bikes (Last 7 Days)</div>
                </Card>
                <Card className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{bikeInventory.filter(bike => new Date(bike.date).toDateString() === new Date().toDateString()).length}</div>
                  <div className="text-sm text-gray-600">New Bikes (Today)</div>
                </Card>
                <Card className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{bikeInventory.length}</div>
                  <div className="text-sm text-gray-600">Total Bikes in Inventory</div>
                </Card>
              </div>



              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <div className="flex gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Search by bike ID, branch, model, color, engine no, chassis number, workshop no..."
                    value={bikeInventorySearch}
                    onChange={e => {
                      setBikeInventorySearch(e.target.value);
                      // Auto-search as user types
                      fetchBikeInventory(1, e.target.value, bikeInventoryDateFilter);
                    }}
                    className="border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 shadow flex-1"
                  />
                  <select
                    value={bikeInventoryDateFilter}
                    onChange={e => {
                      setBikeInventoryDateFilter(e.target.value);
                      fetchBikeInventory(1, bikeInventorySearch, e.target.value);
                    }}
                    className="border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 shadow"
                  >
                    <option value="">All Dates</option>
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="last7days">Last 7 Days</option>
                    <option value="last30days">Last 30 Days</option>
                    <option value="thisMonth">This Month</option>
                    <option value="lastMonth">Last Month</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button type="primary" onClick={() => {
                    setEditingBikeInventory(null);
                    setBikeInventoryForm({
                      date: new Date().toISOString().split('T')[0],
                      bikeId: bikeInventoryDropdownData.nextBikeId || '',
                      branch: '',
                      brand: '',
                      category: '',
                      model: '',
                      color: '',
                      engineNo: '',
                      chassisNumber: '',
                      workshopNo: ''
                    });
                    setBikeInventoryModalOpen(true);
                  }}>
                    Add Record
                  </Button>
                  <Button type="default" onClick={exportBikeInventoryToPDF}>
                    Export PDF
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table
                  dataSource={bikeInventory}
                  loading={bikeInventoryLoading}
                  columns={bikeInventoryColumns}
                  rowKey="_id"
                  pagination={{
                    current: bikeInventoryPagination.current,
                    pageSize: bikeInventoryPagination.pageSize,
                    total: bikeInventoryPagination.total,
                    onChange: (page) => fetchBikeInventory(page, bikeInventorySearch, bikeInventoryDateFilter),
                    showSizeChanger: false
                  }}
                  className="rounded-xl overflow-hidden shadow-lg bg-white"
                  scroll={{ x: 1500 }}
                />
              </div>

              {/* Add/Edit Bike Inventory Modal */}
              <Modal
                title={editingBikeInventory ? "Edit Bike Inventory" : "Add Bike Inventory"}
                open={bikeInventoryModalOpen}
                onCancel={() => {
                  setBikeInventoryModalOpen(false);
                  setEditingBikeInventory(null);
                }}
                footer={null}
                width={1000}
                centered
              >
                <form onSubmit={(e) => { e.preventDefault(); handleBikeInventorySubmit(); }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Date *</label>
                      <input
                        type="date"
                        name="date"
                        value={bikeInventoryForm.date}
                        onChange={handleBikeInventoryFormChange}
                        required
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Bike ID (Auto-generated)</label>
                      <input
                        type="text"
                        name="bikeId"
                        value={bikeInventoryForm.bikeId}
                        readOnly
                        className="w-full border px-3 py-2 rounded bg-gray-50 focus:ring-2 focus:ring-blue-200"
                        placeholder="Bike ID will be auto-generated"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Branch</label>
                      <input
                        type="text"
                        name="branch"
                        value={bikeInventoryForm.branch}
                        onChange={handleBikeInventoryFormChange}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Bike Model</label>
                      <select
                        name="model"
                        value={bikeInventoryForm.model || ''}
                        onChange={(e) => {
                          const model = e.target.value;
                          const selectedVehicle = bikeInventoryDropdownData.vehicles.find((v: any) => v.name === model);
                          setBikeInventoryForm(prev => ({ 
                            ...prev, 
                            model,
                            category: selectedVehicle ? selectedVehicle.category : '', // Auto-fill category
                            brand: 'Bajaj', // Auto-fill brand
                            unitCostPrice: selectedVehicle ? Math.round(selectedVehicle.price * 0.8) : 0,
                            sellingPrice: selectedVehicle ? selectedVehicle.price : 0
                          }));
                        }}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                      >
                        <option value="">Select Bike Model</option>
                        {bikeInventoryDropdownData.vehicles.map((vehicle: any) => (
                          <option key={vehicle.name} value={vehicle.name}>
                            {vehicle.name} - LKR {vehicle.price?.toLocaleString()}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Category (Auto-filled)</label>
                      <input
                        type="text"
                        name="category"
                        value={bikeInventoryForm.category || ''}
                        readOnly
                        className="w-full border px-3 py-2 rounded bg-gray-50 focus:ring-2 focus:ring-blue-200"
                        placeholder="Category will be auto-filled when you select a bike model"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Color</label>
                      <select
                        name="color"
                        value={bikeInventoryForm.color || ''}
                        onChange={handleBikeInventoryFormChange}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                      >
                        <option value="">Select Color</option>
                        {bikeInventoryDropdownData.allColors.map((color: string) => (
                          <option key={color} value={color}>{color}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Engine No</label>
                      <input
                        type="text"
                        name="engineNo"
                        value={bikeInventoryForm.engineNo}
                        onChange={handleBikeInventoryFormChange}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Chassis Number</label>
                      <input
                        type="text"
                        name="chassisNumber"
                        value={bikeInventoryForm.chassisNumber}
                        onChange={handleBikeInventoryFormChange}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Workshop No</label>
                      <input
                        type="text"
                        name="workshopNo"
                        value={bikeInventoryForm.workshopNo}
                        onChange={handleBikeInventoryFormChange}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="default" onClick={() => {
                      setBikeInventoryModalOpen(false);
                      setEditingBikeInventory(null);
                    }}>
                      Cancel
                    </Button>
                    <Button type="primary" htmlType="submit">
                      {editingBikeInventory ? 'Update' : 'Add'} Bike
                    </Button>
                  </div>
                </form>
              </Modal>
            </div>
          )}
          {akrTab === 'bankDeposits' && (
            <div className="col-span-full">
              <h2 className="text-2xl font-bold mb-4">Bank Deposits Management</h2>
              
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="text-center">
                  <div className="text-2xl font-bold text-green-600">LKR {bankDepositsStats.totalPayment?.toLocaleString() || '0'}</div>
                  <div className="text-sm text-gray-600">Total Payment</div>
                </Card>
                <Card className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{bankDepositsStats.totalQuantity || '0'}</div>
                  <div className="text-sm text-gray-600">Total Quantity</div>
                </Card>
                <Card className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{bankDepositsStats.count || '0'}</div>
                  <div className="text-sm text-gray-600">Total Records</div>
                </Card>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Search by depositer name, account name, purpose, or account number..."
                  value={bankDepositsSearch}
                  onChange={e => {
                    setBankDepositsSearch(e.target.value);
                    // Auto-search as user types
                    fetchBankDeposits(1, e.target.value);
                  }}
                  className="border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 shadow w-full sm:w-64"
                />
                <div className="flex gap-2">
                  <Button type="primary" onClick={() => {
                    setEditingBankDeposit(null);
                    setBankDepositsForm({
                      date: new Date().toISOString().split('T')[0],
                      depositerName: '',
                      accountNumber: '',
                      accountName: '',
                      purpose: '',
                      quantity: 0,
                      payment: 0
                    });
                    setBankDepositsModalOpen(true);
                  }}>
                    Add Record
                  </Button>
                  <Button type="default" onClick={exportBankDepositsToPDF}>
                    Export PDF
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table
                  dataSource={bankDeposits}
                  loading={bankDepositsLoading}
                  columns={bankDepositColumns}
                  rowKey="_id"
                  pagination={{
                    current: bankDepositsPagination.current,
                    pageSize: bankDepositsPagination.pageSize,
                    total: bankDepositsPagination.total,
                    onChange: (page) => fetchBankDeposits(page, bankDepositsSearch),
                    showSizeChanger: false
                  }}
                  className="rounded-xl overflow-hidden shadow-lg bg-white"
                  scroll={{ x: 1200 }}
                />
              </div>

              {/* Add/Edit Bank Deposit Modal */}
              <Modal
                title={editingBankDeposit ? "Edit Bank Deposit" : "Add Bank Deposit"}
                open={bankDepositsModalOpen}
                onCancel={() => {
                  setBankDepositsModalOpen(false);
                  setEditingBankDeposit(null);
                }}
                footer={null}
                width={800}
                centered
              >
                <form onSubmit={(e) => { e.preventDefault(); handleBankDepositSubmit(); }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Date *</label>
                      <input
                        type="date"
                        name="date"
                        value={bankDepositsForm.date}
                        onChange={handleBankDepositFormChange}
                        required
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Depositer Name</label>
                      <input
                        type="text"
                        name="depositerName"
                        value={bankDepositsForm.depositerName}
                        onChange={handleBankDepositFormChange}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Account Number</label>
                      <input
                        type="text"
                        name="accountNumber"
                        value={bankDepositsForm.accountNumber}
                        onChange={handleBankDepositFormChange}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Account Name</label>
                      <input
                        type="text"
                        name="accountName"
                        value={bankDepositsForm.accountName}
                        onChange={handleBankDepositFormChange}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Purpose</label>
                      <input
                        type="text"
                        name="purpose"
                        value={bankDepositsForm.purpose}
                        onChange={handleBankDepositFormChange}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Quantity</label>
                      <input
                        type="number"
                        name="quantity"
                        value={bankDepositsForm.quantity}
                        onChange={handleBankDepositNumberChange}
                        min="0"
                        step="1"
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Payment (LKR) *</label>
                      <input
                        type="number"
                        name="payment"
                        value={bankDepositsForm.payment}
                        onChange={handleBankDepositNumberChange}
                        required
                        min="0"
                        step="0.01"
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="default" onClick={() => {
                      setBankDepositsModalOpen(false);
                      setEditingBankDeposit(null);
                    }}>
                      Cancel
                    </Button>
                    <Button type="primary" htmlType="submit">
                      {editingBankDeposit ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>
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
                      <Tag color={selectedPreBooking.status === 'Pending' ? 'orange' : selectedPreBooking.status === 'Confirmed' ? 'blue' : selectedPreBooking.status === 'Cancelled' ? 'red' : 'default'}>{selectedPreBooking.status}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Created At">{new Date(selectedPreBooking.createdAt).toLocaleString()}</Descriptions.Item>
                  </Descriptions>
                )}
              </Modal>
                </div>
          )}
          {akrTab === 'customers' && (
            <div className="col-span-full">
              <h2 className="text-2xl font-bold mb-4">Customer Details Management</h2>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Search by full name, NIC, phone, address, occupation..."
                  value={customersSearch}
                  onChange={e => {
                    setCustomersSearch(e.target.value);
                    // Auto-search as user types
                    fetchCustomers(1, e.target.value);
                  }}
                  className="border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 shadow w-full sm:w-64"
                />
                <div className="flex gap-2">
                  <Button type="default" onClick={exportCustomersToPDF}>
                    Export PDF
                          </Button>
              </div>
              </div>

              <div className="overflow-x-auto">
                <Table
                  dataSource={customers}
                  loading={customersLoading}
                  columns={[
                    { 
                      title: 'Full Name', 
                      dataIndex: 'fullName', 
                      key: 'fullName',
                      render: (name: string) => name || '-'
                    },
                    { 
                      title: 'NIC/Driving License', 
                      dataIndex: 'nicDrivingLicense', 
                      key: 'nicDrivingLicense',
                      render: (nic: string) => nic || '-'
                    },
                    { 
                      title: 'Phone No', 
                      dataIndex: 'phoneNo', 
                      key: 'phoneNo',
                      render: (phone: string) => phone || '-'
                    },
                    { 
                      title: 'Address', 
                      dataIndex: 'address', 
                      key: 'address',
                      render: (address: string) => address || '-'
                    },
                    { 
                      title: 'Occupation', 
                      dataIndex: 'occupation', 
                      key: 'occupation',
                      render: (occupation: string) => occupation || '-'
                    },
                    { 
                      title: 'Date of Purchase', 
                      dataIndex: 'dateOfPurchase', 
                      key: 'dateOfPurchase',
                      render: (date: string) => date ? new Date(date).toLocaleDateString('en-GB') : '-',
                      sorter: (a: any, b: any) => new Date(a.dateOfPurchase).getTime() - new Date(b.dateOfPurchase).getTime()
                    },
                    {
                      title: 'Actions',
                      key: 'actions',
                      render: (_: any, record: any) => (
                        <div className="flex gap-2">
                          <Button type="link" size="small" onClick={() => {
                            setSelectedCustomerForHistory(record);
                            fetchCustomerHistory(record.fullName);
                            setCustomerHistoryModalOpen(true);
                          }}>
                            View History
                          </Button>
                          <Button type="link" size="small" onClick={() => handleEditCustomer(record)}>
                            Edit
                          </Button>
                          <Button type="link" size="small" danger onClick={() => handleDeleteCustomer(record._id)}>
                            Delete
                          </Button>
                        </div>
                      )
                    }
                  ]}
                  rowKey="_id"
                  pagination={{
                    current: customersPagination.current,
                    pageSize: customersPagination.pageSize,
                    total: customersPagination.total,
                    onChange: (page) => fetchCustomers(page, customersSearch),
                    showSizeChanger: false
                  }}
                  className="rounded-xl overflow-hidden shadow-lg bg-white"
                  scroll={{ x: 1200 }}
                />
                </div>

              {/* Add/Edit Customer Modal */}
      <Modal
                title={editingCustomer ? "Edit Customer" : "Add Customer"}
                open={customersModalOpen}
                onCancel={() => {
                  setCustomersModalOpen(false);
                  setEditingCustomer(null);
                }}
        footer={null}
                width={800}
        centered
      >
                <form onSubmit={(e) => { e.preventDefault(); handleCustomerSubmit(); }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={customersForm.fullName}
                        onChange={handleCustomerFormChange}
                        required
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                      />
                </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">NIC/Driving License</label>
                      <input
                        type="text"
                        name="nicDrivingLicense"
                        value={customersForm.nicDrivingLicense}
                        onChange={handleCustomerFormChange}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                      />
                      </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Phone No</label>
                      <input
                        type="text"
                        name="phoneNo"
                        value={customersForm.phoneNo}
                        onChange={handleCustomerFormChange}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Address</label>
                      <input
                        type="text"
                        name="address"
                        value={customersForm.address}
                        onChange={handleCustomerFormChange}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Occupation</label>
                      <input
                        type="text"
                        name="occupation"
                        value={customersForm.occupation}
                        onChange={handleCustomerFormChange}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Date of Purchase</label>
                      <input
                        type="date"
                        name="dateOfPurchase"
                        value={customersForm.dateOfPurchase}
                        onChange={handleCustomerFormChange}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="default" onClick={() => {
                      setCustomersModalOpen(false);
                      setEditingCustomer(null);
                    }}>
                      Cancel
                    </Button>
                    <Button type="primary" htmlType="submit">
                      {editingCustomer ? 'Update' : 'Add'} Customer
                    </Button>
              </div>
          </form>
      </Modal>
              </div>
          )}
          {akrTab === 'commissionerLetter' && (
            <div className="col-span-full">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Commissioner Letter Generator</h2>
                
                <div className="max-w-2xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Customer Name *
                      </label>
                      <input
                        type="text"
                        value={commissionerLetterForm.customerName}
                        onChange={(e) => setCommissionerLetterForm(prev => ({ ...prev, customerName: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black"
                        placeholder="Enter customer full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vehicle Number *
                      </label>
                      <input
                        type="text"
                        value={commissionerLetterForm.vehicleNumber}
                        onChange={(e) => setCommissionerLetterForm(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black"
                        placeholder="Enter vehicle number"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CR Number *
                      </label>
                      <input
                        type="text"
                        value={commissionerLetterForm.crNumber}
                        onChange={(e) => setCommissionerLetterForm(prev => ({ ...prev, crNumber: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter CR number"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        NIC Number *
                      </label>
                      <input
                        type="text"
                        value={commissionerLetterForm.nicNumber}
                        onChange={(e) => setCommissionerLetterForm(prev => ({ ...prev, nicNumber: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter NIC number"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address *
                      </label>
                      <textarea
                        value={commissionerLetterForm.address}
                        onChange={(e) => setCommissionerLetterForm(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter customer address"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Settled Date *
                      </label>
                      <input
                        type="date"
                        value={commissionerLetterForm.settledDate}
                        onChange={(e) => setCommissionerLetterForm(prev => ({ ...prev, settledDate: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-8 text-center">
                    <Button 
                      type="primary" 
                      size="large"
                      onClick={generateCommissionerLetter}
                      className="bg-black hover:bg-gray-800 border-black hover:border-gray-800 px-8 py-3 text-lg"
                    >
                      Generate Commissioner Letter
                    </Button>
                  </div>
                  
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">About Commissioner Letter</h3>
                    <p className="text-green-700 text-sm">
                      This letter confirms that a customer has successfully settled all outstanding payments for their vehicle. 
                      It includes all relevant vehicle and customer details and serves as an official confirmation document.
                    </p>
                  </div>
                </div>
              </div>
              </div>
          )}
          {akrTab === 'salesTransactions' && (
            <div className="col-span-full">
              {/* Search and Actions */}
              <div className="bg-white rounded-xl shadow p-6 mb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="flex-1 max-w-md">
                    <input
                      type="text"
                      placeholder="Search sales transactions..."
                      value={salesTransactionsSearch}
                      onChange={(e) => {
                        setSalesTransactionsSearch(e.target.value);
                        fetchSalesTransactions(1, e.target.value);
                      }}
                      className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={exportSalesTransactionsToPDF}>
                      Export PDF
                    </Button>
                  </div>
                </div>
              </div>

              {/* Sales Transactions Table */}
              <div className="bg-white rounded-xl shadow overflow-hidden">
                      <Table
                  dataSource={salesTransactions}
                        columns={[
                    {
                      title: 'Transaction ID',
                      dataIndex: 'invoiceNo',
                      key: 'invoiceNo',
                      align: 'center' as const,
                      render: (text: string) => <span className="font-medium">{text}</span>
                    },
                    {
                      title: 'Customer Details',
                      key: 'customerDetails',
                      align: 'center' as const,
                      render: (_, record: any) => (
                        <div className="text-left">
                          <div className="font-medium">{record.customerName}</div>
                          <div className="text-sm text-gray-600">{record.customerPhone}</div>
                          <div className="text-sm text-gray-600">{record.customerAddress}</div>
                        </div>
                      )
                    },
                    {
                      title: 'Vehicle Details',
                      key: 'vehicleDetails',
                      align: 'center' as const,
                      render: (_, record: any) => (
                        <div className="text-left">
                          <div className="font-medium">{record.vehicleModel}</div>
                          <div className="text-sm text-gray-600">Engine: {record.engineNumber || '-'}</div>
                          <div className="text-sm text-gray-600">Chassis: {record.chassisNumber || '-'}</div>
                          {record.bikeColor && record.bikeColor !== 'N/A' && (
                            <div className="text-sm text-purple-600">Color: {record.bikeColor}</div>
                          )}
                          {record.bikeCategory && record.bikeCategory !== 'N/A' && (
                            <div className="text-sm text-gray-500">Category: {record.bikeCategory}</div>
                          )}
                          {record.insuranceCo && record.insuranceCo !== '0' && (
                            <div className="text-sm text-blue-600">Insurance: {record.insuranceCo}</div>
                          )}
                        </div>
                      )
                    },
                    {
                      title: 'Purchase Details',
                      key: 'purchaseDetails',
                      align: 'center' as const,
                      render: (_, record: any) => (
                        <div className="text-left">
                          <div className="text-sm">Date: {record.salesDate ? new Date(record.salesDate).toLocaleDateString('en-GB') : '-'}</div>
                          <div className="text-sm">Time: {record.vehicleIssueTime || '-'}</div>
                          <div className="text-sm">Branch: {record.branch || '-'}</div>
                        </div>
                      )
                    },
                    {
                      title: 'Payment Details',
                      key: 'paymentDetails',
                      align: 'center' as const,
                      render: (_, record: any) => (
                        <div className="text-left">
                          <div className="font-medium">Total: LKR {record.sellingPrice?.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">Down: LKR {record.downPayment?.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">Balance: LKR {record.balanceAmount?.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">Method: {record.paymentMethod}</div>
                          {record.discountApplied && (
                            <div className="text-sm text-green-600">Discount: LKR {record.discountAmount?.toLocaleString()}</div>
                          )}
                          {record.regFee > 0 && (
                            <div className="text-sm text-gray-500">Reg Fee: LKR {record.regFee?.toLocaleString()}</div>
                          )}
                          {record.docCharge > 0 && (
                            <div className="text-sm text-gray-500">Doc Charge: LKR {record.docCharge?.toLocaleString()}</div>
                          )}
                        </div>
                      )
                    },

                    {
                      title: 'Leasing Details',
                      key: 'leasingDetails',
                      align: 'center' as const,
                      render: (_, record: any) => (
                        <div className="text-left">
                          {record.leasingCompany && record.leasingCompany.trim() !== '' ? (
                            <>
                              <div className="text-sm font-medium text-blue-600">{record.leasingCompany}</div>
                              <div className="text-sm text-gray-600">Officer: {record.officerName || '-'}</div>
                              <div className="text-sm text-gray-600">Contact: {record.officerContactNo || '-'}</div>
                              <div className="text-sm text-gray-600">Commission: {record.commissionPercentage || 0}%</div>
                            </>
                          ) : (
                            <span className="text-gray-500">No Leasing</span>
                          )}
                        </div>
                      )
                    },
                    {
                      title: 'Actions',
                      key: 'actions',
                      align: 'center' as const,
                      render: (_, record: any) => (
                        <div className="flex gap-2 justify-center">
                          <Button size="small" type="primary" onClick={() => handleViewSalesTransaction(record)}>
                            View
                          </Button>
                        </div>
                      )
                    },

                  ]}
                  pagination={{
                    current: salesTransactionsPagination?.current || 1,
                    pageSize: salesTransactionsPagination?.pageSize || 50,
                    total: salesTransactionsPagination?.total || 0,
                    onChange: (page) => fetchSalesTransactions(page, salesTransactionsSearch),
                    showSizeChanger: false
                  }}
                  rowKey="_id"
                  loading={salesTransactionsLoading}
                  scroll={{ x: true }}
                />
                </div>
              </div>
          )}

          {/* Sales Transactions Modal */}
      <Modal
            open={salesTransactionsModalOpen}
            onCancel={() => {
              setSalesTransactionsModalOpen(false);
              setEditingSalesTransaction(null);
            }}
        footer={null}
            title={editingSalesTransaction ? 'Edit Sales Transaction' : 'Add Sales Transaction'}
            width={800}
        centered
      >
            <form onSubmit={(e) => { e.preventDefault(); handleSalesTransactionSubmit(); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Invoice No *</label>
                  <input
                    type="text"
                    name="invoiceNo"
                    value={salesTransactionsForm.invoiceNo}
                    onChange={handleSalesTransactionFormChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bike ID *</label>
                  <input
                    type="text"
                    name="bikeId"
                    value={salesTransactionsForm.bikeId}
                    onChange={handleSalesTransactionFormChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Customer Name *</label>
                  <input
                    type="text"
                    name="customerName"
                    value={salesTransactionsForm.customerName}
                    onChange={handleSalesTransactionFormChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sales Date *</label>
                  <input
                    type="date"
                    name="salesDate"
                    value={salesTransactionsForm.salesDate}
                    onChange={handleSalesTransactionFormChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Salesperson Name *</label>
                  <input
                    type="text"
                    name="salespersonName"
                    value={salesTransactionsForm.salespersonName}
                    onChange={handleSalesTransactionFormChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Selling Price (LKR) *</label>
                  <input
                    type="number"
                    name="sellingPrice"
                    value={salesTransactionsForm.sellingPrice}
                    onChange={handleSalesTransactionNumberChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Discount Applied (LKR)</label>
                  <input
                    type="number"
                    name="discountApplied"
                    value={salesTransactionsForm.discountApplied}
                    onChange={handleSalesTransactionNumberChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Final Amount (LKR) *</label>
                  <input
                    type="number"
                    name="finalAmount"
                    value={salesTransactionsForm.finalAmount}
                    onChange={handleSalesTransactionNumberChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Payment Method *</label>
                  <select
                    name="paymentMethod"
                    value={salesTransactionsForm.paymentMethod}
                    onChange={handleSalesTransactionFormChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                    required
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Other">Other</option>
                      </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Payment Status *</label>
                  <select
                    name="paymentStatus"
                    value={salesTransactionsForm.paymentStatus}
                    onChange={handleSalesTransactionFormChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                    required
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Partial">Partial</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Warranty Period</label>
                  <input
                    type="text"
                    name="warrantyPeriod"
                    value={salesTransactionsForm.warrantyPeriod}
                    onChange={handleSalesTransactionFormChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                    placeholder="e.g., 2 Years"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Free Service Details</label>
                  <input
                    type="text"
                    name="freeServiceDetails"
                    value={salesTransactionsForm.freeServiceDetails}
                    onChange={handleSalesTransactionFormChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                    placeholder="e.g., 3 Free Services"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="default" onClick={() => {
                  setSalesTransactionsModalOpen(false);
                  setEditingSalesTransaction(null);
                }}>
                  Cancel
                    </Button>
                <Button type="primary" htmlType="submit">
                  {editingSalesTransaction ? 'Update' : 'Add'} Sales Transaction
                </Button>
              </div>
          </form>
      </Modal>

      {/* Installment Plans Modal */}
      <Modal
        open={installmentPlansModalOpen}
        onCancel={() => {
          setInstallmentPlansModalOpen(false);
          setEditingInstallmentPlan(null);
        }}
        footer={null}
        title={editingInstallmentPlan ? 'Edit Installment Plan' : 'Add Installment Plan'}
        width={800}
        centered
      >
        <form onSubmit={(e) => { e.preventDefault(); handleInstallmentPlanSubmit(); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Installment ID *</label>
              <input
                type="text"
                name="installmentId"
                value={installmentPlanForm.installmentId}
                onChange={handleInstallmentPlanFormChange}
                className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Customer Name *</label>
              <input
                type="text"
                name="customerName"
                value={installmentPlanForm.customerName}
                onChange={handleInstallmentPlanFormChange}
                className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total Amount (LKR) *</label>
              <input
                type="number"
                name="totalAmount"
                value={installmentPlanForm.totalAmount}
                onChange={handleInstallmentPlanNumberChange}
                className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Down Payment (LKR) *</label>
              <input
                type="number"
                name="downPayment"
                value={installmentPlanForm.downPayment}
                onChange={handleInstallmentPlanNumberChange}
                className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Monthly Installment (LKR) *</label>
              <input
                type="number"
                name="monthlyInstallment"
                value={installmentPlanForm.monthlyInstallment}
                onChange={handleInstallmentPlanNumberChange}
                className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Number of Months *</label>
              <input
                type="number"
                name="numberOfMonths"
                value={installmentPlanForm.numberOfMonths}
                onChange={handleInstallmentPlanNumberChange}
                className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={installmentPlanForm.startDate}
                onChange={handleInstallmentPlanFormChange}
                className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date *</label>
              <input
                type="date"
                name="endDate"
                value={installmentPlanForm.endDate}
                onChange={handleInstallmentPlanFormChange}
                className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Remaining Balance (LKR) *</label>
              <input
                type="number"
                name="remainingBalance"
                value={installmentPlanForm.remainingBalance}
                onChange={handleInstallmentPlanNumberChange}
                className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Payment Status *</label>
              <select
                name="paymentStatus"
                value={installmentPlanForm.paymentStatus}
                onChange={handleInstallmentPlanFormChange}
                className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                required
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Overdue">Overdue</option>
                <option value="Defaulted">Defaulted</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Month *</label>
              <select
                name="month"
                value={installmentPlanForm.month}
                onChange={handleInstallmentPlanFormChange}
                className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                required
              >
                <option value="">Select Month</option>
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="March">March</option>
                <option value="April">April</option>
                <option value="May">May</option>
                <option value="June">June</option>
                <option value="July">July</option>
                <option value="August">August</option>
                <option value="September">September</option>
                <option value="October">October</option>
                <option value="November">November</option>
                <option value="December">December</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Vehicle Model</label>
              <input
                type="text"
                name="vehicleModel"
                value={installmentPlanForm.vehicleModel}
                onChange={handleInstallmentPlanFormChange}
                className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                placeholder="e.g., Honda CD 70"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={installmentPlanForm.phoneNumber}
                onChange={handleInstallmentPlanFormChange}
                className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                placeholder="e.g., +94 77 123 4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={installmentPlanForm.email}
                onChange={handleInstallmentPlanFormChange}
                className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                placeholder="e.g., customer@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <textarea
                name="address"
                value={installmentPlanForm.address}
                onChange={handleInstallmentPlanFormChange}
                className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                rows={2}
                placeholder="Customer address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                name="notes"
                value={installmentPlanForm.notes}
                onChange={handleInstallmentPlanFormChange}
                className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                rows={2}
                placeholder="Additional notes"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-6">
            <Button type="default" onClick={() => {
              setInstallmentPlansModalOpen(false);
              setEditingInstallmentPlan(null);
            }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              {editingInstallmentPlan ? 'Update' : 'Add'} Installment Plan
            </Button>
          </div>
        </form>
      </Modal>
          
          {/* Installment Plans Tab */}
          {akrTab === 'installmentPlans' && (
            <div className="col-span-full">
              {/* Search and Export */}
              <div className="bg-white rounded-xl shadow p-6 mb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="flex-1 max-w-md">
                    <input
                      type="text"
                      placeholder="Search installment plans..."
                      value={installmentSearch}
                      onChange={(e) => {
                        setInstallmentSearch(e.target.value);
                        fetchInstallmentPlans(1, e.target.value, installmentStatusFilter, installmentMonthFilter);
                      }}
                      className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={exportInstallmentPlansToPDF}>
                      Export PDF
                    </Button>
                  </div>
                </div>
              </div>

              {/* Installment Plans Table */}
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <Table
                  dataSource={installmentPlans}
                  loading={installmentLoading}
              columns={[
                    {
                      title: 'Coupon ID',
                      dataIndex: 'installmentId',
                      key: 'installmentId',
                      align: 'center' as const,
                      render: (text: string) => <span className="font-medium">{text}</span>
                    },
                    {
                      title: 'Customer Details',
                      key: 'customerDetails',
                      align: 'center' as const,
                      render: (_, record: any) => (
                        <div className="text-left">
                          <div className="font-medium">{record.customerName}</div>
                          <div className="text-sm text-gray-600">{record.customerPhone}</div>
                          <div className="text-sm text-gray-600">{record.customerAddress}</div>
                        </div>
                      )
                    },
                    {
                      title: 'Vehicle Details',
                      key: 'vehicleDetails',
                      align: 'center' as const,
                      render: (_, record: any) => (
                        <div className="text-left">
                          <div className="font-medium">{record.vehicleModel}</div>
                          <div className="text-sm text-gray-600">Engine: {record.engineNumber}</div>
                          <div className="text-sm text-gray-600">Chassis: {record.chassisNumber}</div>
                        </div>
                      )
                    },
                    {
                      title: 'Payment Summary',
                      key: 'paymentSummary',
                      align: 'center' as const,
                      render: (_, record: any) => {
                        const totalPaid = (record.firstInstallmentPaidAmount || 0) + 
                                        (record.secondInstallmentPaidAmount || 0) + 
                                        (record.thirdInstallmentPaidAmount || 0);
                        const remainingBalance = record.balanceAmount - totalPaid;
                        
                        return (
                          <div className="text-left">
                            <div className="font-medium">LKR {record.totalAmount?.toLocaleString()}</div>
                            <div className="text-sm text-gray-600">Down: LKR {record.downPayment?.toLocaleString()}</div>
                            <div className="text-sm text-gray-600">Balance: LKR {record.balanceAmount?.toLocaleString()}</div>
                            <div className="text-sm text-green-600">Paid: LKR {totalPaid.toLocaleString()}</div>
                            <div className="text-sm text-red-600">Remaining: LKR {remainingBalance.toLocaleString()}</div>
                            <div className="text-sm text-gray-600">{record.paymentMethod}</div>
                          </div>
                        );
                      }
                    },
                    {
                      title: 'Installment Schedule',
                      key: 'installmentSchedule',
                      align: 'center' as const,
                      render: (_, record: any) => {
                        const today = new Date();
                        const firstDate = record.firstInstallment?.date ? new Date(record.firstInstallment.date) : null;
                        const secondDate = record.secondInstallment?.date ? new Date(record.secondInstallment.date) : null;
                        const thirdDate = record.thirdInstallment?.date ? new Date(record.thirdInstallment.date) : null;
                        
                        // Check which installments are actually paid (based on admin marking)
                        const firstPaid = record.firstInstallmentPaidAmount > 0;
                        const secondPaid = record.secondInstallmentPaidAmount > 0;
                        const thirdPaid = record.thirdInstallmentPaidAmount > 0;
                        
                        return (
                          <div className="text-left space-y-1">
                            {/* 1st Installment */}
                            <div className={`text-xs ${firstPaid ? 'text-green-600' : 'text-gray-600'}`}>
                              <span className="font-medium">1st:</span> 
                              {firstDate ? firstDate.toLocaleDateString('en-GB') : 'No date'} 
                              {firstPaid ? ' ✓' : firstDate && firstDate < today ? ' (Overdue)' : ''}
                            </div>
                            
                            {/* 2nd Installment */}
                            <div className={`text-xs ${secondPaid ? 'text-green-600' : 'text-gray-600'}`}>
                              <span className="font-medium">2nd:</span> 
                              {secondDate ? secondDate.toLocaleDateString('en-GB') : 'No date'} 
                              {secondPaid ? ' ✓' : secondDate && secondDate < today ? ' (Overdue)' : ''}
                            </div>
                            
                            {/* 3rd Installment */}
                            <div className={`text-xs ${thirdPaid ? 'text-green-600' : 'text-gray-600'}`}>
                              <span className="font-medium">3rd:</span> 
                              {thirdDate ? thirdDate.toLocaleDateString('en-GB') : 'No date'} 
                              {thirdPaid ? ' ✓' : thirdDate && thirdDate < today ? ' (Overdue)' : ''}
                            </div>
                            
                            {/* Summary */}
                            <div className="text-xs text-gray-500 mt-2 pt-1 border-t border-gray-200">
                              {firstPaid && secondPaid && thirdPaid ? (
                                <span className="text-green-600 font-medium">All Paid ✓</span>
                              ) : (
                                <span className="text-blue-600">Check payments above</span>
                              )}
                            </div>
                          </div>
                        );
                      }
                    },
                    {
                      title: 'Installment Payments',
                      key: 'installmentPayments',
                      align: 'center' as const,
                      render: (_, record: any) => (
                        <div className="text-left space-y-2">
                          {/* 1st Installment */}
                          <div className={`flex items-center justify-between p-1 rounded ${record.firstInstallmentPaidAmount > 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                            <span className="text-xs font-medium">1st:</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs ${record.firstInstallmentPaidAmount > 0 ? 'text-green-700' : 'text-gray-600'}`}>
                                LKR {record.firstInstallmentAmount?.toLocaleString() || 0}
                              </span>
                              <input
                                type="checkbox"
                                checked={record.firstInstallmentPaidAmount > 0}
                                onChange={(e) => handleInstallmentPaymentToggle(record._id, 'firstInstallment', e.target.checked, record.firstInstallmentAmount)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                              />
                              {record.firstInstallmentPaidAmount > 0 && (
                                <span className="text-xs text-green-600 font-medium">✓ Paid</span>
                              )}
                            </div>
                          </div>
                          
                          {/* 2nd Installment */}
                          <div className={`flex items-center justify-between p-1 rounded ${record.secondInstallmentPaidAmount > 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                            <span className="text-xs font-medium">2nd:</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs ${record.secondInstallmentPaidAmount > 0 ? 'text-green-700' : 'text-gray-600'}`}>
                                LKR {record.secondInstallmentAmount?.toLocaleString() || 0}
                              </span>
                              <input
                                type="checkbox"
                                checked={record.secondInstallmentPaidAmount > 0}
                                onChange={(e) => handleInstallmentPaymentToggle(record._id, 'secondInstallment', e.target.checked, record.secondInstallmentAmount)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                              />
                              {record.secondInstallmentPaidAmount > 0 && (
                                <span className="text-xs text-green-600 font-medium">✓ Paid</span>
                              )}
                            </div>
                          </div>
                          
                          {/* 3rd Installment */}
                          <div className={`flex items-center justify-between p-1 rounded ${record.thirdInstallmentPaidAmount > 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                            <span className="text-xs font-medium">3rd:</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs ${record.thirdInstallmentPaidAmount > 0 ? 'text-green-700' : 'text-gray-600'}`}>
                                LKR {record.thirdInstallmentAmount?.toLocaleString() || 0}
                              </span>
                              <input
                                type="checkbox"
                                checked={record.thirdInstallmentPaidAmount > 0}
                                onChange={(e) => handleInstallmentPaymentToggle(record._id, 'thirdInstallment', e.target.checked, record.thirdInstallmentAmount)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                              />
                              {record.thirdInstallmentPaidAmount > 0 && (
                                <span className="text-xs text-green-600 font-medium">✓ Paid</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    },
                    {
                      title: 'Leasing Details',
                      key: 'leasingDetails',
                      align: 'center' as const,
                      render: (_, record: any) => (
                        <div className="text-left">
                          {record.leasingCompany ? (
                            <>
                              <div className="text-sm font-medium">{record.leasingCompany}</div>
                              <div className="text-sm text-gray-600">{record.officerName}</div>
                              <div className="text-sm text-gray-600">{record.officerContactNo}</div>
                              <div className="text-sm text-gray-600">{record.commissionPercentage}% Commission</div>
                            </>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </div>
                      )
                    },
                    {
                      title: 'Actions',
                      key: 'actions',
                      align: 'center' as const,
                      render: (_, record: any) => (
                        <div className="flex gap-2 justify-center">
                          <Button size="small" type="primary" onClick={() => handleViewInstallmentPlan(record)}>
                            View
                          </Button>
                        </div>
                      )
                    },

                  ]}
                  pagination={{
                    current: installmentPagination?.current || 1,
                    pageSize: installmentPagination?.pageSize || 50,
                    total: installmentPagination?.total || 0,
                    onChange: (page) => fetchInstallmentPlans(page, installmentSearch, installmentStatusFilter, installmentMonthFilter),
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                  }}
                />
              </div>
              </div>
          )}

          {/* Suppliers Tab */}
          {akrTab === 'suppliers' && (
            <div className="col-span-full">
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-blue-700">{suppliersStats?.totalSuppliers?.toLocaleString() || '0'}</span>
                  <span className="text-gray-500 mt-2">Total Suppliers</span>
                </div>
                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-green-700">{suppliersStats?.activeSuppliers?.toLocaleString() || '0'}</span>
                  <span className="text-gray-500 mt-2">Active Suppliers</span>
                </div>
                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-orange-600">{suppliersStats?.totalBikesSupplied?.toLocaleString() || '0'}</span>
                  <span className="text-gray-500 mt-2">Total Bikes Supplied</span>
                </div>
                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-emerald-700">{suppliersStats?.inactiveSuppliers?.toLocaleString() || '0'}</span>
                  <span className="text-gray-500 mt-2">Inactive Suppliers</span>
                </div>
              </div>

              {/* Search and Actions */}
              <div className="bg-white rounded-xl shadow p-6 mb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="flex-1 max-w-md">
                    <input
                      type="text"
                      placeholder="Search suppliers..."
                      value={suppliersSearch}
                      onChange={(e) => {
                        setSuppliersSearch(e.target.value);
                        fetchSuppliers(1, e.target.value);
                      }}
                      className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="primary" onClick={() => setSuppliersModalOpen(true)}>
                      Add Supplier
                    </Button>
                    <Button onClick={exportSuppliersToPDF}>
                      Export PDF
                    </Button>
                  </div>
                </div>
              </div>

              {/* Suppliers Table */}
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <Table
                  dataSource={suppliers}
                  loading={suppliersLoading}
                  columns={[
                    {
                      title: 'Supplier ID',
                      dataIndex: 'supplierId',
                      key: 'supplierId',
                      align: 'center' as const,
                      render: (text: string) => <span className="font-medium">{text}</span>
                    },
                    {
                      title: 'Supplier Name',
                      dataIndex: 'supplierName',
                      key: 'supplierName',
                      align: 'center' as const
                    },
                    {
                      title: 'Contact Person',
                      dataIndex: 'contactPerson',
                      key: 'contactPerson',
                      align: 'center' as const
                    },
                    {
                      title: 'Phone No',
                      dataIndex: 'phoneNo',
                      key: 'phoneNo',
                      align: 'center' as const
                    },
                    {
                      title: 'Email',
                      dataIndex: 'email',
                      key: 'email',
                      align: 'center' as const
                    },
                    {
                      title: 'Address',
                      dataIndex: 'address',
                      key: 'address',
                      align: 'center' as const,
                      render: (text: string) => text || '-'
                    },
                    {
                      title: 'Last Purchase Date',
                      dataIndex: 'lastPurchaseDate',
                      key: 'lastPurchaseDate',
                      align: 'center' as const,
                      render: (date: string) => date ? new Date(date).toLocaleDateString('en-GB') : '-'
                    },
                    {
                      title: 'Total Supplied Bikes',
                      dataIndex: 'totalSuppliedBikes',
                      key: 'totalSuppliedBikes',
                      align: 'center' as const,
                      render: (count: number) => count?.toLocaleString() || '0'
                    },
                    {
                      title: 'Status',
                      dataIndex: 'status',
                      key: 'status',
                      align: 'center' as const,
                      render: (status: string) => {
                        const statusColors = {
                          'Active': 'green',
                          'Inactive': 'orange',
                          'Suspended': 'red'
                        };
                        return (
                          <Tag color={statusColors[status as keyof typeof statusColors] || 'default'}>
                            {status}
                          </Tag>
                        );
                      }
                    },
                    {
                      title: 'Actions',
                      key: 'actions',
                      align: 'center' as const,
                      render: (_, record: any) => (
                        <div className="flex gap-2 justify-center">
                          <Button size="small" onClick={() => handleEditSupplier(record)}>
                            Edit
                          </Button>
                          <Button size="small" danger onClick={() => handleDeleteSupplier(record._id)}>
                            Delete
                          </Button>
                        </div>
                      )
                    }
                  ]}
                  pagination={{
                    current: suppliersPagination.current,
                    pageSize: suppliersPagination.pageSize,
                    total: suppliersPagination.total,
                    onChange: (page) => fetchSuppliers(page, suppliersSearch),
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                  }}
                />
              </div>
            </div>
          )}

          {/* Supplier Modal */}
          <Modal
            title={editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
            open={suppliersModalOpen}
            onCancel={() => {
              setSuppliersModalOpen(false);
              setEditingSupplier(null);
            }}
            footer={null}
            width={800}
          >
            <form onSubmit={(e) => { e.preventDefault(); handleSupplierSubmit(); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Supplier Name *</label>
                  <input
                    type="text"
                    name="supplierName"
                    value={supplierForm.supplierName}
                    onChange={handleSupplierFormChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contact Person *</label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={supplierForm.contactPerson}
                    onChange={handleSupplierFormChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    name="phoneNo"
                    value={supplierForm.phoneNo}
                    onChange={handleSupplierFormChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={supplierForm.email}
                    onChange={handleSupplierFormChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Address *</label>
                  <textarea
                    name="address"
                    value={supplierForm.address}
                    onChange={handleSupplierFormChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                    rows={2}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Purchase Date</label>
                  <input
                    type="date"
                    name="lastPurchaseDate"
                    value={supplierForm.lastPurchaseDate}
                    onChange={handleSupplierFormChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Total Supplied Bikes</label>
                  <input
                    type="number"
                    name="totalSuppliedBikes"
                    value={supplierForm.totalSuppliedBikes}
                    onChange={handleSupplierNumberChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    name="status"
                    value={supplierForm.status}
                    onChange={handleSupplierFormChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    name="notes"
                    value={supplierForm.notes}
                    onChange={handleSupplierFormChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                    rows={2}
                    placeholder="Additional notes about the supplier"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button type="default" onClick={() => {
                  setSuppliersModalOpen(false);
                  setEditingSupplier(null);
                }}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  {editingSupplier ? 'Update' : 'Add'} Supplier
                </Button>
              </div>
            </form>
          </Modal>

          {/* Service & Warranty Tab */}
          {akrTab === 'serviceWarranty' && (
            <div className="col-span-full">
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-blue-700">{serviceWarrantyStats?.totalServices?.toLocaleString() || '0'}</span>
                  <span className="text-gray-500 mt-2">Total Services</span>
                </div>
                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-green-700">{serviceWarrantyStats?.completedServices?.toLocaleString() || '0'}</span>
                  <span className="text-gray-500 mt-2">Completed</span>
                </div>
                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-orange-600">LKR {serviceWarrantyStats?.totalServiceCost?.toLocaleString() || '0'}</span>
                  <span className="text-gray-500 mt-2">Total Cost</span>
                </div>
                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-emerald-700">{serviceWarrantyStats?.warrantyServices?.toLocaleString() || '0'}</span>
                  <span className="text-gray-500 mt-2">Warranty Services</span>
                </div>
              </div>

              {/* Search and Actions */}
              <div className="bg-white rounded-xl shadow p-6 mb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="flex-1 max-w-md">
                    <input
                      type="text"
                      placeholder="Search service records..."
                      value={serviceWarrantySearch}
                      onChange={(e) => {
                        setServiceWarrantySearch(e.target.value);
                        fetchServiceWarranty(1, e.target.value);
                      }}
                      className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="primary" onClick={() => setServiceWarrantyModalOpen(true)}>
                      Add Service Record
                    </Button>
                    <Button onClick={exportServiceWarrantyToPDF}>
                      Export PDF
                    </Button>
                  </div>
                </div>
              </div>

              {/* Service & Warranty Table */}
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <Table
                  dataSource={serviceWarranty}
                  loading={serviceWarrantyLoading}
                  columns={[
                    {
                      title: 'Service ID',
                      dataIndex: 'serviceId',
                      key: 'serviceId',
                      align: 'center' as const,
                      render: (text: string) => <span className="font-medium">{text}</span>
                    },
                    {
                      title: 'Bike ID',
                      dataIndex: 'bikeId',
                      key: 'bikeId',
                      align: 'center' as const
                    },
                    {
                      title: 'Customer ID',
                      dataIndex: 'customerId',
                      key: 'customerId',
                      align: 'center' as const
                    },
                    {
                      title: 'Service Date',
                      dataIndex: 'serviceDate',
                      key: 'serviceDate',
                      align: 'center' as const,
                      render: (date: string) => date ? new Date(date).toLocaleDateString('en-GB') : '-'
                    },
                    {
                      title: 'Type of Service',
                      dataIndex: 'typeOfService',
                      key: 'typeOfService',
                      align: 'center' as const
                    },
                    {
                      title: 'Description',
                      dataIndex: 'description',
                      key: 'description',
                      align: 'center' as const,
                      render: (text: string) => text || '-'
                    },
                    {
                      title: 'Service Cost',
                      dataIndex: 'serviceCost',
                      key: 'serviceCost',
                      align: 'center' as const,
                      render: (cost: number) => cost ? `LKR ${cost.toLocaleString()}` : '-'
                    },
                    {
                      title: 'Technician Name',
                      dataIndex: 'technicianName',
                      key: 'technicianName',
                      align: 'center' as const
                    },
                    {
                      title: 'Status',
                      dataIndex: 'status',
                      key: 'status',
                      align: 'center' as const,
                      render: (status: string) => {
                        const statusColors = {
                          'Pending': 'orange',
                          'In Progress': 'blue',
                          'Completed': 'green',
                          'Cancelled': 'red'
                        };
                        return (
                          <Tag color={statusColors[status as keyof typeof statusColors] || 'default'}>
                            {status}
                          </Tag>
                        );
                      }
                    },
                    {
                      title: 'Actions',
                      key: 'actions',
                      align: 'center' as const,
                      render: (_, record: any) => (
                        <div className="flex gap-2 justify-center">
                          <Button size="small" onClick={() => handleEditServiceWarranty(record)}>
                            Edit
                          </Button>
                          <Button size="small" danger onClick={() => handleDeleteServiceWarranty(record._id)}>
                            Delete
                          </Button>
                        </div>
                      )
                    }
                  ]}
                  pagination={{
                    current: serviceWarrantyPagination.current,
                    pageSize: serviceWarrantyPagination.pageSize,
                    total: serviceWarrantyPagination.total,
                    onChange: (page) => fetchServiceWarranty(page, serviceWarrantySearch),
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                  }}
                />
              </div>
            </div>
          )}

          {/* Service & Warranty Modal */}
          <Modal
            title={editingServiceWarranty ? 'Edit Service Record' : 'Add New Service Record'}
            open={serviceWarrantyModalOpen}
            onCancel={() => {
              setServiceWarrantyModalOpen(false);
              setEditingServiceWarranty(null);
            }}
            footer={null}
            width={800}
          >
            <form onSubmit={(e) => { e.preventDefault(); handleServiceWarrantySubmit(); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Bike ID *</label>
                  <input
                    type="text"
                    name="bikeId"
                    value={serviceWarrantyForm.bikeId}
                    onChange={handleServiceWarrantyFormChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Customer ID *</label>
                  <input
                    type="text"
                    name="customerId"
                    value={serviceWarrantyForm.customerId}
                    onChange={handleServiceWarrantyFormChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Service Date *</label>
                  <input
                    type="date"
                    name="serviceDate"
                    value={serviceWarrantyForm.serviceDate}
                    onChange={handleServiceWarrantyFormChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type of Service *</label>
                  <select
                    name="typeOfService"
                    value={serviceWarrantyForm.typeOfService}
                    onChange={handleServiceWarrantyFormChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                    required
                  >
                    <option value="Regular Service">Regular Service</option>
                    <option value="Warranty Service">Warranty Service</option>
                    <option value="Emergency Service">Emergency Service</option>
                    <option value="Preventive Maintenance">Preventive Maintenance</option>
                    <option value="Repair">Repair</option>
                    <option value="Inspection">Inspection</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Description *</label>
                  <textarea
                    name="description"
                    value={serviceWarrantyForm.description}
                    onChange={handleServiceWarrantyFormChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Service Cost (LKR) *</label>
                  <input
                    type="number"
                    name="serviceCost"
                    value={serviceWarrantyForm.serviceCost}
                    onChange={handleServiceWarrantyNumberChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Technician Name *</label>
                  <input
                    type="text"
                    name="technicianName"
                    value={serviceWarrantyForm.technicianName}
                    onChange={handleServiceWarrantyFormChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    name="status"
                    value={serviceWarrantyForm.status}
                    onChange={handleServiceWarrantyFormChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Warranty Type</label>
                  <select
                    name="warrantyType"
                    value={serviceWarrantyForm.warrantyType}
                    onChange={handleServiceWarrantyFormChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Extended">Extended</option>
                    <option value="Premium">Premium</option>
                    <option value="None">None</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Warranty Expiry Date</label>
                  <input
                    type="date"
                    name="warrantyExpiryDate"
                    value={serviceWarrantyForm.warrantyExpiryDate}
                    onChange={handleServiceWarrantyFormChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    name="notes"
                    value={serviceWarrantyForm.notes}
                    onChange={handleServiceWarrantyFormChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                    rows={2}
                    placeholder="Additional notes about the service"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button type="default" onClick={() => {
                  setServiceWarrantyModalOpen(false);
                  setEditingServiceWarranty(null);
                }}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  {editingServiceWarranty ? 'Update' : 'Add'} Service Record
                </Button>
              </div>
            </form>
          </Modal>

          {/* Additional Info Tab */}
          {akrTab === 'additionalInfo' && (
            <div className="col-span-full">
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-blue-700">{additionalInfoStats?.totalRecords?.toLocaleString() || '0'}</span>
                  <span className="text-gray-500 mt-2">Total Records</span>
                </div>
                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-green-700">{additionalInfoStats?.registeredBikes?.toLocaleString() || '0'}</span>
                  <span className="text-gray-500 mt-2">Registered Bikes</span>
                </div>
                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-orange-600">{additionalInfoStats?.deliveredBikes?.toLocaleString() || '0'}</span>
                  <span className="text-gray-500 mt-2">Delivered Bikes</span>
                </div>
                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-emerald-700">{additionalInfoStats?.averageRating?.toFixed(1) || '0'}</span>
                  <span className="text-gray-500 mt-2">Avg Rating</span>
                </div>
              </div>

              {/* Search and Actions */}
              <div className="bg-white rounded-xl shadow p-6 mb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="flex-1 max-w-md">
                    <input
                      type="text"
                      placeholder="Search additional info..."
                      value={additionalInfoSearch}
                      onChange={(e) => {
                        setAdditionalInfoSearch(e.target.value);
                        fetchAdditionalInfo(1, e.target.value);
                      }}
                      className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="primary" onClick={() => setAdditionalInfoModalOpen(true)}>
                      Add Additional Info
                    </Button>
                    <Button onClick={exportAdditionalInfoToPDF}>
                      Export PDF
                    </Button>
                  </div>
                </div>
              </div>

              {/* Additional Info Table */}
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <Table
                  dataSource={additionalInfo}
                  loading={additionalInfoLoading}
                  columns={[
                    {
                      title: 'Bike ID',
                      dataIndex: 'bikeId',
                      key: 'bikeId',
                      align: 'center' as const
                    },
                    {
                      title: 'Customer ID',
                      dataIndex: 'customerId',
                      key: 'customerId',
                      align: 'center' as const
                    },
                    {
                      title: 'Insurance Provider',
                      dataIndex: 'insuranceProvider',
                      key: 'insuranceProvider',
                      align: 'center' as const,
                      render: (text: string) => text || '-'
                    },
                    {
                      title: 'Insurance Expiry Date',
                      dataIndex: 'insuranceExpiryDate',
                      key: 'insuranceExpiryDate',
                      align: 'center' as const,
                      render: (date: string) => date ? new Date(date).toLocaleDateString('en-GB') : '-'
                    },
                    {
                      title: 'Registration Status',
                      dataIndex: 'registrationStatus',
                      key: 'registrationStatus',
                      align: 'center' as const,
                      render: (status: string) => {
                        const statusColors = {
                          'Registered': 'green',
                          'Pending': 'orange',
                          'Expired': 'red',
                          'Not Required': 'gray'
                        };
                        return (
                          <Tag color={statusColors[status as keyof typeof statusColors] || 'default'}>
                            {status}
                          </Tag>
                        );
                      }
                    },
                    {
                      title: 'Bike Delivery Status',
                      dataIndex: 'bikeDeliveryStatus',
                      key: 'bikeDeliveryStatus',
                      align: 'center' as const,
                      render: (status: string) => {
                        const statusColors = {
                          'Delivered': 'green',
                          'Pending': 'orange',
                          'In Transit': 'blue',
                          'Ready for Pickup': 'purple',
                          'Cancelled': 'red'
                        };
                        return (
                          <Tag color={statusColors[status as keyof typeof statusColors] || 'default'}>
                            {status}
                          </Tag>
                        );
                      }
                    },
                    {
                      title: 'Customer Feedback',
                      dataIndex: 'customerFeedback',
                      key: 'customerFeedback',
                      align: 'center' as const,
                      render: (text: string) => text || '-'
                    },
                    {
                      title: 'Customer Rating',
                      dataIndex: 'customerRating',
                      key: 'customerRating',
                      align: 'center' as const,
                      render: (rating: number) => rating ? `${rating}/5` : '-'
                    },
                    {
                      title: 'Remarks',
                      dataIndex: 'remarks',
                      key: 'remarks',
                      align: 'center' as const,
                      render: (text: string) => text || '-'
                    },
                    {
                      title: 'Actions',
                      key: 'actions',
                      align: 'center' as const,
                      render: (_, record: any) => (
                        <div className="flex gap-2 justify-center">
                          <Button size="small" onClick={() => handleEditAdditionalInfo(record)}>
                            Edit
                          </Button>
                          <Button size="small" danger onClick={() => handleDeleteAdditionalInfo(record._id)}>
                            Delete
                          </Button>
                        </div>
                      )
                    }
                  ]}
                  pagination={{
                    current: additionalInfoPagination.current,
                    pageSize: additionalInfoPagination.pageSize,
                    total: additionalInfoPagination.total,
                    onChange: (page) => fetchAdditionalInfo(page, additionalInfoSearch),
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                  }}
                />
              </div>
            </div>
          )}

          {/* Additional Info Modal */}
          <Modal
            title={editingAdditionalInfo ? 'Edit Additional Info' : 'Add New Additional Info'}
            open={additionalInfoModalOpen}
            onCancel={() => {
              setAdditionalInfoModalOpen(false);
              setEditingAdditionalInfo(null);
            }}
            footer={null}
            width={800}
          >
            <form onSubmit={(e) => { e.preventDefault(); handleAdditionalInfoSubmit(); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Bike ID *</label>
                  <input
                    type="text"
                    name="bikeId"
                    value={additionalInfoForm.bikeId}
                    onChange={handleAdditionalInfoFormChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Customer ID *</label>
                  <input
                    type="text"
                    name="customerId"
                    value={additionalInfoForm.customerId}
                    onChange={handleAdditionalInfoFormChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Insurance Provider</label>
                  <input
                    type="text"
                    name="insuranceProvider"
                    value={additionalInfoForm.insuranceProvider}
                    onChange={handleAdditionalInfoFormChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                    placeholder="e.g., Ceylinco Insurance"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Insurance Expiry Date</label>
                  <input
                    type="date"
                    name="insuranceExpiryDate"
                    value={additionalInfoForm.insuranceExpiryDate}
                    onChange={handleAdditionalInfoFormChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Registration Status</label>
                  <select
                    name="registrationStatus"
                    value={additionalInfoForm.registrationStatus}
                    onChange={handleAdditionalInfoFormChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Registered">Registered</option>
                    <option value="Expired">Expired</option>
                    <option value="Not Required">Not Required</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bike Delivery Status</label>
                  <select
                    name="bikeDeliveryStatus"
                    value={additionalInfoForm.bikeDeliveryStatus}
                    onChange={handleAdditionalInfoFormChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Delivered">Delivered</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Ready for Pickup">Ready for Pickup</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Customer Feedback</label>
                  <textarea
                    name="customerFeedback"
                    value={additionalInfoForm.customerFeedback}
                    onChange={handleAdditionalInfoFormChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                    rows={2}
                    placeholder="Customer feedback about the service"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Customer Rating</label>
                  <select
                    name="customerRating"
                    value={additionalInfoForm.customerRating}
                    onChange={handleAdditionalInfoFormChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">No Rating</option>
                    <option value="1">1 Star</option>
                    <option value="2">2 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="5">5 Stars</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Follow-up Date</label>
                  <input
                    type="date"
                    name="followUpDate"
                    value={additionalInfoForm.followUpDate}
                    onChange={handleAdditionalInfoFormChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Remarks</label>
                  <textarea
                    name="remarks"
                    value={additionalInfoForm.remarks}
                    onChange={handleAdditionalInfoFormChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                    rows={2}
                    placeholder="General remarks"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Special Requirements</label>
                  <textarea
                    name="specialRequirements"
                    value={additionalInfoForm.specialRequirements}
                    onChange={handleAdditionalInfoFormChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                    rows={2}
                    placeholder="Any special requirements or notes"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Follow-up Notes</label>
                  <textarea
                    name="followUpNotes"
                    value={additionalInfoForm.followUpNotes}
                    onChange={handleAdditionalInfoFormChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                    rows={2}
                    placeholder="Notes for follow-up actions"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    name="notes"
                    value={additionalInfoForm.notes}
                    onChange={handleAdditionalInfoFormChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                    rows={2}
                    placeholder="Additional notes"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button type="default" onClick={() => {
                  setAdditionalInfoModalOpen(false);
                  setEditingAdditionalInfo(null);
                }}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  {editingAdditionalInfo ? 'Update' : 'Add'} Additional Info
                </Button>
              </div>
            </form>
          </Modal>

          {/* Vehicle Allocation Coupons Tab */}
          {akrTab === 'vehicleAllocationCoupons' && (
            <div className="col-span-full">
              {/* Search and Actions */}
              <div className="bg-white rounded-xl shadow p-6 mb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="flex-1 max-w-md">
                    <input
                      type="text"
                      placeholder="Search coupons..."
                      value={vehicleAllocationCouponsSearch}
                      onChange={(e) => {
                        setVehicleAllocationCouponsSearch(e.target.value);
                        fetchVehicleAllocationCoupons(1, e.target.value);
                      }}
                      className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="primary" onClick={() => setVehicleAllocationCouponsModalOpen(true)}>
                      Add Coupon
                    </Button>
                    <Button onClick={exportVehicleAllocationCouponsToPDF}>
                      Export PDF
                    </Button>
                  </div>
                </div>
              </div>

              {/* Vehicle Allocation Coupons Table */}
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <Table
                  dataSource={vehicleAllocationCoupons}
                  loading={vehicleAllocationCouponsLoading}
                  columns={[
                    {
                      title: 'Coupon ID',
                      dataIndex: 'couponId',
                      key: 'couponId',
                      align: 'center' as const,
                      render: (text: string) => <span className="font-medium">{text}</span>
                    },
                    {
                      title: 'Customer Name',
                      dataIndex: 'fullName',
                      key: 'fullName',
                      align: 'center' as const
                    },
                    {
                      title: 'Vehicle Type',
                      dataIndex: 'vehicleType',
                      key: 'vehicleType',
                      align: 'center' as const
                    },
                    {
                      title: 'Total Amount',
                      dataIndex: 'totalAmount',
                      key: 'totalAmount',
                      align: 'center' as const,
                      render: (amount: number) => amount ? `LKR ${amount.toLocaleString()}` : '-'
                    },
                    {
                      title: 'Down Payment',
                      dataIndex: 'downPayment',
                      key: 'downPayment',
                      align: 'center' as const,
                      render: (amount: number) => amount ? `LKR ${amount.toLocaleString()}` : '-'
                    },
                    {
                      title: 'Balance',
                      dataIndex: 'balance',
                      key: 'balance',
                      align: 'center' as const,
                      render: (amount: number) => amount ? `LKR ${amount.toLocaleString()}` : '-'
                    },
                    {
                      title: 'Payment Type',
                      dataIndex: 'paymentType',
                      key: 'paymentType',
                      align: 'center' as const
                    },
                    {
                      title: 'Status',
                      dataIndex: 'status',
                      key: 'status',
                      align: 'center' as const,
                      render: (status: string) => {
                        const statusColors = {
                          'Pending': 'orange',
                          'Paid': 'green'
                        };
                        return (
                          <Tag color={statusColors[status as keyof typeof statusColors] || 'default'}>
                            {status}
                          </Tag>
                        );
                      }
                    },
                    {
                      title: 'Date',
                      dataIndex: 'date',
                      key: 'date',
                      align: 'center' as const,
                      render: (date: string) => date ? new Date(date).toLocaleDateString('en-GB') : '-'
                    },
                    {
                      title: 'Actions',
                      key: 'actions',
                      align: 'center' as const,
                      render: (_, record: any) => (
                        <div className="flex gap-2 justify-center">
                          <Button size="small" type="primary" onClick={() => handleViewVehicleAllocationCoupon(record)}>
                            View
                          </Button>
                          <Button size="small" onClick={() => handleEditVehicleAllocationCoupon(record)}>
                            Edit
                          </Button>
                          <Button size="small" danger onClick={() => handleDeleteVehicleAllocationCoupon(record._id)}>
                            Delete
                          </Button>
                        </div>
                      )
                    }
                  ]}
                  pagination={{
                    current: vehicleAllocationCouponsPagination.current,
                    pageSize: vehicleAllocationCouponsPagination.pageSize,
                    total: vehicleAllocationCouponsPagination.total,
                    onChange: (page) => fetchVehicleAllocationCoupons(page, vehicleAllocationCouponsSearch),
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                  }}
                />
              </div>
            </div>
          )}

          {/* Vehicle Allocation Coupon Modal */}
          <Modal
            title={
              <div>
                <div>{editingVehicleAllocationCoupon ? 'Edit Vehicle Allocation Coupon' : 'Add New Vehicle Allocation Coupon'}</div>
                <div className="text-sm text-blue-600 mt-1">
                  ⚡ Sales Transaction and Installment Plan data are stored directly in this coupon
                </div>
              </div>
            }
            open={vehicleAllocationCouponsModalOpen}
            onCancel={() => {
              setVehicleAllocationCouponsModalOpen(false);
              setEditingVehicleAllocationCoupon(null);
            }}
            footer={null}
            width={1200}
            style={{ top: 20 }}
          >
            <form onSubmit={(e) => { e.preventDefault(); handleVehicleAllocationCouponSubmit(); }}>
              <div className="space-y-6">
                {/* Header Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">AKR & SON'S (PVT) LTD - VEHICLE ALLOCATION COUPON</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Work Shop No. *</label>
                      <input
                        type="text"
                        name="workshopNo"
                        value={vehicleAllocationCouponForm.workshopNo}
                        onChange={handleVehicleAllocationCouponFormChange}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Branch *</label>
                      <input
                        type="text"
                        name="branch"
                        value={vehicleAllocationCouponForm.branch}
                        onChange={handleVehicleAllocationCouponFormChange}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Date *</label>
                      <input
                        type="date"
                        name="date"
                        value={vehicleAllocationCouponForm.date}
                        onChange={handleVehicleAllocationCouponFormChange}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">1. Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={vehicleAllocationCouponForm.fullName}
                        onChange={handleVehicleAllocationCouponFormChange}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">2. Address *</label>
                      <textarea
                        name="address"
                        value={vehicleAllocationCouponForm.address}
                        onChange={handleVehicleAllocationCouponFormChange}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                        rows={2}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">3. NIC No/ Business Registration *</label>
                      <input
                        type="text"
                        name="nicNo"
                        value={vehicleAllocationCouponForm.nicNo}
                        onChange={handleVehicleAllocationCouponFormChange}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">4. Contact No *</label>
                      <input
                        type="tel"
                        name="contactNo"
                        value={vehicleAllocationCouponForm.contactNo}
                        onChange={handleVehicleAllocationCouponFormChange}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">5. Occupation *</label>
                      <input
                        type="text"
                        name="occupation"
                        value={vehicleAllocationCouponForm.occupation}
                        onChange={handleVehicleAllocationCouponFormChange}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">6. Date Of Birth *</label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={vehicleAllocationCouponForm.dateOfBirth}
                        onChange={handleVehicleAllocationCouponFormChange}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Vehicle Information */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Vehicle Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">7. Vehicle Type / Model *</label>
                      <select
                        name="vehicleType"
                        value={vehicleAllocationCouponForm.vehicleType}
                        onChange={(e) => {
                          handleVehicleSelection(e.target.value);
                        }}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                        required
                      >
                        <option value="">Select Vehicle Model</option>
                        {vehicleAllocationCouponDropdownData.vehicles?.map((vehicle: any) => (
                          <option key={vehicle.name} value={vehicle.name}>
                            {vehicle.name} - LKR {vehicle.price?.toLocaleString()}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">8. Engine No *</label>
                      <select
                        name="engineNo"
                        value={vehicleAllocationCouponForm.engineNo}
                        onChange={(e) => handleEngineNumberSelection(e.target.value)}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                        required
                      >
                        <option value="">Select Engine No</option>
                        {vehicleAllocationCouponForm.vehicleType && 
                          vehicleAllocationCouponDropdownData.vehicles?.find(v => v.name === vehicleAllocationCouponForm.vehicleType)?.engineNumbers?.map((engineNo: string) => (
                            <option key={engineNo} value={engineNo}>{engineNo}</option>
                          ))
                        }
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">9. Chassis No *</label>
                      <select
                        name="chassisNo"
                        value={vehicleAllocationCouponForm.chassisNo}
                        onChange={(e) => handleChassisNumberSelection(e.target.value)}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                        required
                      >
                        <option value="">Select Chassis No</option>
                        {vehicleAllocationCouponForm.vehicleType && 
                          vehicleAllocationCouponDropdownData.vehicles?.find(v => v.name === vehicleAllocationCouponForm.vehicleType)?.chassisNumbers?.map((chassisNo: string) => (
                            <option key={chassisNo} value={chassisNo}>{chassisNo}</option>
                          ))
                        }
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">10. Date Of Purchase *</label>
                      <input
                        type="date"
                        name="dateOfPurchase"
                        value={vehicleAllocationCouponForm.dateOfPurchase}
                        onChange={handleVehicleAllocationCouponFormChange}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Payment Method Selection</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Payment Method *</label>
                      <select
                        name="paymentMethod"
                        value={vehicleAllocationCouponForm.paymentMethod}
                        onChange={handleVehicleAllocationCouponFormChange}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                        required
                      >
                        <option value="Full Payment">Full Payment</option>
                        <option value="Leasing via AKR">Leasing via AKR</option>
                        <option value="Leasing via Other Company">Leasing via Other Company</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Leasing Company Information - Show for both "Leasing via AKR" and "Leasing via Other Company" */}
                {(vehicleAllocationCouponForm.paymentMethod === 'Leasing via AKR' || vehicleAllocationCouponForm.paymentMethod === 'Leasing via Other Company') && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Leasing Company Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">11. Leasing Company</label>
                        <input
                          type="text"
                          name="leasingCompany"
                          value={vehicleAllocationCouponForm.leasingCompany}
                          onChange={handleVehicleAllocationCouponFormChange}
                          className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">I. Name Of The Officer</label>
                        <input
                          type="text"
                          name="officerName"
                          value={vehicleAllocationCouponForm.officerName}
                          onChange={handleVehicleAllocationCouponFormChange}
                          className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">II. Contact No</label>
                        <input
                          type="tel"
                          name="officerContactNo"
                          value={vehicleAllocationCouponForm.officerContactNo}
                          onChange={handleVehicleAllocationCouponFormChange}
                          className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">III. Commission (percentage)</label>
                        <input
                          type="number"
                          name="commissionPercentage"
                          value={vehicleAllocationCouponForm.commissionPercentage}
                          onChange={handleVehicleAllocationCouponNumberChange}
                          className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                          step="0.01"
                          min="0"
                        />
                      </div>
                      
                    </div>
                  </div>
                )}

                                {/* Payment Details - Show for all payment methods */}
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Show Down Payment for all except Full Payment */}
                    {vehicleAllocationCouponForm.paymentMethod !== 'Full Payment' && (
                      <div>
                        <label className="block text-sm font-medium mb-1">Down Payment *</label>
                        <input
                          type="number"
                          name="downPayment"
                          value={vehicleAllocationCouponForm.downPayment}
                          onChange={handleVehicleAllocationCouponNumberChange}
                          className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                          step="0.01"
                          min="0"
                          required
                        />
                      </div>
                    )}
                      <div>
                        <label className="block text-sm font-medium mb-1">Reg. Fee</label>
                        <input
                          type="number"
                          name="regFee"
                          value={vehicleAllocationCouponForm.regFee}
                          onChange={handleVehicleAllocationCouponNumberChange}
                          className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Doc. Charge</label>
                        <input
                          type="number"
                          name="docCharge"
                          value={vehicleAllocationCouponForm.docCharge}
                          onChange={handleVehicleAllocationCouponNumberChange}
                          className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Insurance Co.</label>
                        <input
                          type="number"
                          name="insuranceCo"
                          value={vehicleAllocationCouponForm.insuranceCo}
                          onChange={handleVehicleAllocationCouponNumberChange}
                          className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                          step="0.01"
                          min="0"
                        />
                      </div>
                      
                      {/* Interest Amount - Only show for Leasing via AKR */}
                      {vehicleAllocationCouponForm.paymentMethod === 'Leasing via AKR' && (
                        <div>
                          <label className="block text-sm font-medium mb-1">Interest Amount</label>
                          <input
                            type="number"
                            name="interestAmount"
                            value={vehicleAllocationCouponForm.interestAmount}
                            onChange={handleVehicleAllocationCouponNumberChange}
                            className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                            step="0.01"
                            min="0"
                            placeholder="Enter interest amount"
                          />
                        </div>
                      )}
                    </div>

                  {/* Discount Information - Before Total Amount and Balance */}
                  <div className="mt-4 pt-4 border-t border-purple-200">
                    <h4 className="text-md font-semibold mb-3">Discount Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="discountApplied"
                          checked={vehicleAllocationCouponForm.discountApplied}
                          onChange={handleVehicleAllocationCouponFormChange}
                          className="mr-2"
                        />
                        <label className="text-sm font-medium">Apply 15,000 Discount for Ready Cash</label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Discount Amount</label>
                        <input
                          type="number"
                          name="discountAmount"
                          value={vehicleAllocationCouponForm.discountAmount}
                          onChange={handleVehicleAllocationCouponNumberChange}
                          className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                          step="0.01"
                          min="0"
                          placeholder="Enter discount amount"
                          disabled={!vehicleAllocationCouponForm.discountApplied}
                        />
                      </div>
                    </div>
                  </div>

                                    {/* Total Amount and Balance - After Discount Information */}
                  <div className="mt-4 pt-4 border-t border-purple-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Total Amount *</label>
                        <input
                          type="number"
                          name="totalAmount"
                          value={vehicleAllocationCouponForm.totalAmount}
                          className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200 bg-gray-100"
                          step="0.01"
                          min="0"
                          required
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Balance *</label>
                        <input
                          type="number"
                          name="balance"
                          value={vehicleAllocationCouponForm.balance}
                          className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200 bg-gray-100"
                          step="0.01"
                          min="0"
                          required
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Installment Details - Only show for "Leasing via AKR" */}
                {vehicleAllocationCouponForm.paymentMethod === 'Leasing via AKR' && (
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Installment Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                              <div>
                          <label className="block text-sm font-medium mb-1">1st Installment Amount</label>
                          <input
                            type="number"
                            name="firstInstallmentAmount"
                            value={vehicleAllocationCouponForm.firstInstallmentAmount}
                            onChange={handleVehicleAllocationCouponNumberChange}
                            className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                            step="0.01"
                            min="0"
                            placeholder="Enter amount or leave for auto-calculation"
                          />
                        </div>
                                              <div>
                          <label className="block text-sm font-medium mb-1">1st Installment Date</label>
                          <input
                            type="date"
                            name="firstInstallmentDate"
                            value={vehicleAllocationCouponForm.firstInstallmentDate}
                            onChange={handleVehicleAllocationCouponFormChange}
                            className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                          />
                        </div>
                                              <div>
                          <label className="block text-sm font-medium mb-1">2nd Installment Amount</label>
                          <input
                            type="number"
                            name="secondInstallmentAmount"
                            value={vehicleAllocationCouponForm.secondInstallmentAmount}
                            onChange={handleVehicleAllocationCouponNumberChange}
                            className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                            step="0.01"
                            min="0"
                            placeholder="Enter amount or leave for auto-calculation"
                          />
                        </div>
                                              <div>
                          <label className="block text-sm font-medium mb-1">2nd Installment Date</label>
                          <input
                            type="date"
                            name="secondInstallmentDate"
                            value={vehicleAllocationCouponForm.secondInstallmentDate}
                            onChange={handleVehicleAllocationCouponFormChange}
                            className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                          />
                        </div>
                                              <div>
                          <label className="block text-sm font-medium mb-1">3rd Installment Amount</label>
                          <input
                            type="number"
                            name="thirdInstallmentAmount"
                            value={vehicleAllocationCouponForm.thirdInstallmentAmount}
                            onChange={handleVehicleAllocationCouponNumberChange}
                            className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                            step="0.01"
                            min="0"
                            placeholder="Auto-calculated (remaining balance)"
                          />
                        </div>
                                              <div>
                          <label className="block text-sm font-medium mb-1">3rd Installment Date</label>
                          <input
                            type="date"
                            name="thirdInstallmentDate"
                            value={vehicleAllocationCouponForm.thirdInstallmentDate}
                            onChange={handleVehicleAllocationCouponFormChange}
                            className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                          />
                        </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Cheque No</label>
                        <input
                          type="text"
                          name="chequeNo"
                          value={vehicleAllocationCouponForm.chequeNo}
                          onChange={handleVehicleAllocationCouponFormChange}
                          className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Cheque Amount</label>
                        <input
                          type="number"
                          name="chequeAmount"
                          value={vehicleAllocationCouponForm.chequeAmount}
                          onChange={handleVehicleAllocationCouponNumberChange}
                          className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Type and Vehicle Issue */}
                <div className="bg-pink-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Payment Type & Vehicle Issue</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">15. Type Of Payment (Customer) *</label>
                      <select
                        name="paymentType"
                        value={vehicleAllocationCouponForm.paymentType}
                        onChange={handleVehicleAllocationCouponFormChange}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                        required
                      >
                        <option value="Cash">Cash</option>
                        <option value="Bank Draft">Bank Draft</option>
                        <option value="Online">Online</option>
                        <option value="Credit Card">Credit Card</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">16. Date And Time Of Issue Of The Vehicle</label>
                      <input
                        type="date"
                        name="vehicleIssueDate"
                        value={vehicleAllocationCouponForm.vehicleIssueDate}
                        onChange={handleVehicleAllocationCouponFormChange}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Time</label>
                      <input
                        type="time"
                        name="vehicleIssueTime"
                        value={vehicleAllocationCouponForm.vehicleIssueTime}
                        onChange={handleVehicleAllocationCouponFormChange}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Status</label>
                      <select
                        name="status"
                        value={vehicleAllocationCouponForm.status}
                        onChange={handleVehicleAllocationCouponFormChange}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>



                {/* Notes */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Additional Notes</h3>
                  <div>
                    <label className="block text-sm font-medium mb-1">Notes</label>
                    <textarea
                      name="notes"
                      value={vehicleAllocationCouponForm.notes}
                      onChange={handleVehicleAllocationCouponFormChange}
                      className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200"
                      rows={3}
                      placeholder="Additional notes about the vehicle allocation coupon"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button type="default" onClick={() => {
                  setVehicleAllocationCouponsModalOpen(false);
                  setEditingVehicleAllocationCoupon(null);
                }}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  {editingVehicleAllocationCoupon ? 'Update' : 'Add'} Vehicle Allocation Coupon
                </Button>
              </div>
            </form>
          </Modal>
          
          {akrTab === 'overview' && (
            <div className="col-span-full">
              {/* Header Section */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Overview</h1>
                <p className="text-gray-600">Welcome to AKR & SONS (PVT) LTD - Vehicle Dealership & Services</p>
              </div>

              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total Bookings</p>
                      <p className="text-3xl font-bold">{preBookings.length}</p>
                </div>
                    <div className="bg-blue-400 bg-opacity-30 p-3 rounded-full">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
              </div>
                </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Total Stock</p>
                      <p className="text-3xl font-bold">{detailedStockInfo.reduce((sum, model) => sum + model.totalStock, 0)}</p>
                    </div>
                    <div className="bg-green-400 bg-opacity-30 p-3 rounded-full">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
              </div>
                      </div>
              
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium">Pending Inquiries</p>
                      <p className="text-3xl font-bold">{preBookings.filter(b => b.status === 'Pending').length}</p>
                    </div>
                    <div className="bg-orange-400 bg-opacity-30 p-3 rounded-full">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Total Customers</p>
                      <p className="text-3xl font-bold">{customers.length}</p>
                    </div>
                    <div className="bg-purple-400 bg-opacity-30 p-3 rounded-full">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Quick Links */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      Quick Links
                    </h3>
                    <div className="space-y-3">
                      <button 
                        onClick={() => setAkrTab('vehicles')}
                        className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </div>
                          <span className="font-medium text-gray-700">Manage Vehicles</span>
                        </div>
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>

                      <button 
                        onClick={() => setAkrTab('bikeInventory')}
                        className="w-full flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                          <span className="font-medium text-gray-700">Bike Inventory</span>
                        </div>
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>

                      <button 
                        onClick={() => setAkrTab('vehicleAllocationCoupons')}
                        className="w-full flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <span className="font-medium text-gray-700">Allocation Coupons</span>
                        </div>
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>

                      <button 
                        onClick={() => setAkrTab('customers')}
                        className="w-full flex items-center justify-between p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <span className="font-medium text-gray-700">Customer Management</span>
                        </div>
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-orange-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>

                      <button 
                        onClick={() => setAkrTab('salesTransactions')}
                        className="w-full flex items-center justify-between p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors group"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                          </div>
                          <span className="font-medium text-gray-700">Sales Transactions</span>
                        </div>
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>

                      <button 
                        onClick={() => setAkrTab('installmentPlans')}
                        className="w-full flex items-center justify-between p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors group"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                          </div>
                          <span className="font-medium text-gray-700">Installment Plans</span>
                        </div>
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Detailed Stock Information by Model & Color */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-gray-800 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Stock Availability by Model & Color
                      </h3>
                      <Button 
                        type="default" 
                        onClick={fetchDetailedStockInfo}
                        loading={detailedStockInfoLoading}
                        size="small"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Refresh
                      </Button>
                    </div>
                    
                    {detailedStockInfoLoading ? (
                      <div className="text-center py-8">
                        <Spin size="large" />
                        <p className="text-gray-500 mt-2">Loading stock information...</p>
                      </div>
                    ) : detailedStockInfo.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <h3 className="text-xl font-semibold mb-2">No Stock Information</h3>
                        <p>Add bikes to inventory to see detailed stock breakdown</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                        {detailedStockInfo.map((model: any, index: number) => (
                          <div key={index} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 text-sm leading-tight">{model.model}</h4>
                                <p className="text-xs text-gray-500 mt-1">{model.category || 'N/A'}</p>
                              </div>
                              <div className="text-right ml-2">
                                <div className="text-lg font-bold text-blue-600">{model.totalStock}</div>
                                <div className="text-xs text-gray-500">Total</div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              {Object.entries(model.colors).map(([color, bikes]: [string, any]) => (
                                <div key={color} className="flex justify-between items-center py-1 px-2 bg-gray-50 rounded text-xs">
                                  <span className="font-medium text-gray-700">{color}</span>
                                  <span className="font-bold text-green-600">{bikes.length}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex flex-wrap justify-center gap-6 text-sm">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                          <span>Good Stock ({detailedStockInfo.filter(m => m.totalStock > 2).length})</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                          <span>Low Stock ({detailedStockInfo.filter(m => m.totalStock > 0 && m.totalStock <= 2).length})</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                          <span>Out of Stock ({detailedStockInfo.filter(m => m.totalStock === 0).length})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Due Installments, Cheque Release Reminders, and Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Due Installments */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      Due Installments
                    </h3>
                    <Button 
                      type="link" 
                      size="small" 
                      onClick={() => setAkrTab('nextDueInstallments')}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      More Details →
                    </Button>
                  </div>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {(() => {
                      // Debug: Log the data we have
                      console.log('Vehicle Allocation Coupons:', vehicleAllocationCoupons);
                      console.log('Total coupons:', vehicleAllocationCoupons.length);
                      
                      // Get all coupons with balance and installment dates (ONLY Leasing via AKR)
                      const couponsWithInstallments = vehicleAllocationCoupons.filter((coupon: any) => {
                        const balance = parseFloat(coupon.balance) || 0;
                        const remainingBalance = parseFloat(coupon.remainingBalance) || 0;
                        const hasBalance = balance > 0 || remainingBalance > 0;
                        const isAKRLeasing = coupon.paymentMethod === 'Leasing via AKR';
                        
                        console.log('Coupon:', coupon.couponId, 'Balance:', coupon.balance, 'Remaining Balance:', coupon.remainingBalance, 'Payment Method:', coupon.paymentMethod, 'Has Balance:', hasBalance, 'Is AKR Leasing:', isAKRLeasing);
                        
                        return hasBalance && isAKRLeasing;
                      });

                      console.log('Coupons with installments:', couponsWithInstallments.length);

                      // Find the next due installment for each coupon
                      const nextInstallments = couponsWithInstallments.map((coupon: any) => {
                        const today = new Date();
                        let nextDueDate = null;
                        let nextAmount = 0;
                        let installmentType = '';

                        // Check for different possible date field names
                        const firstDate = coupon.firstInstallmentDate || coupon.firstInstallment?.date;
                        const secondDate = coupon.secondInstallmentDate || coupon.secondInstallment?.date;
                        const thirdDate = coupon.thirdInstallmentDate || coupon.thirdInstallment?.date;

                        // Check for different possible amount field names
                        const firstAmount = parseFloat(coupon.firstInstallmentAmount || coupon.firstInstallment?.amount || 0);
                        const secondAmount = parseFloat(coupon.secondInstallmentAmount || coupon.secondInstallment?.amount || 0);
                        const thirdAmount = parseFloat(coupon.thirdInstallmentAmount || coupon.thirdInstallment?.amount || 0);

                        console.log('Installment dates for', coupon.couponId, ':', { firstDate, secondDate, thirdDate });
                        console.log('Installment amounts for', coupon.couponId, ':', { firstAmount, secondAmount, thirdAmount });

                        // Debug: Log the installment objects specifically
                        console.log('First Installment Object:', coupon.firstInstallment);
                        console.log('Second Installment Object:', coupon.secondInstallment);
                        console.log('Third Installment Object:', coupon.thirdInstallment);

                        // Check for payment status of each installment (objects with nested data)
                        const firstPaid = coupon.firstInstallmentPaid || coupon.firstInstallment?.paid || coupon.firstInstallmentPaidStatus || false;
                        const secondPaid = coupon.secondInstallmentPaid || coupon.secondInstallment?.paid || coupon.secondInstallmentPaidStatus || false;
                        const thirdPaid = coupon.thirdInstallmentPaid || coupon.thirdInstallment?.paid || coupon.thirdInstallmentPaidStatus || false;

                        // Check for payment status in the nested installment objects
                        const firstInstallmentPaid = coupon.firstInstallment?.paid || coupon.firstInstallment?.status === 'Paid' || coupon.firstInstallment?.paidAmount > 0 || false;
                        const secondInstallmentPaid = coupon.secondInstallment?.paid || coupon.secondInstallment?.status === 'Paid' || coupon.secondInstallment?.paidAmount > 0 || false;
                        const thirdInstallmentPaid = coupon.thirdInstallment?.paid || coupon.thirdInstallment?.status === 'Paid' || coupon.thirdInstallment?.paidAmount > 0 || false;

                        // Also check if the installment has a checkmark or "✓" in the data
                        const firstHasCheckmark = String(coupon.firstInstallment?.date || '').includes('✓') || String(coupon.firstInstallment?.status || '').includes('✓') || false;
                        const secondHasCheckmark = String(coupon.secondInstallment?.date || '').includes('✓') || String(coupon.secondInstallment?.status || '').includes('✓') || false;
                        const thirdHasCheckmark = String(coupon.thirdInstallment?.date || '').includes('✓') || String(coupon.thirdInstallment?.status || '').includes('✓') || false;

                        // Check for "Paid" text in installment data
                        const firstHasPaidText = String(coupon.firstInstallment?.status || '').toLowerCase().includes('paid') || false;
                        const secondHasPaidText = String(coupon.secondInstallment?.status || '').toLowerCase().includes('paid') || false;
                        const thirdHasPaidText = String(coupon.thirdInstallment?.status || '').toLowerCase().includes('paid') || false;

                        // Consider an installment paid if any of these conditions are met
                        const firstIsPaid = firstPaid || firstInstallmentPaid || firstHasCheckmark || firstHasPaidText;
                        const secondIsPaid = secondPaid || secondInstallmentPaid || secondHasCheckmark || secondHasPaidText;
                        const thirdIsPaid = thirdPaid || thirdInstallmentPaid || thirdHasCheckmark || thirdHasPaidText;

                        console.log('Payment status for', coupon.couponId, ':', { 
                          firstPaid, secondPaid, thirdPaid,
                          firstInstallmentPaid, secondInstallmentPaid, thirdInstallmentPaid,
                          firstHasCheckmark, secondHasCheckmark, thirdHasCheckmark,
                          firstHasPaidText, secondHasPaidText, thirdHasPaidText,
                          firstIsPaid, secondIsPaid, thirdIsPaid
                        });
                        
                        console.log('Final payment decision for', coupon.couponId, ':', {
                          '1st Installment': { paid: firstIsPaid, date: firstDate, amount: firstAmount },
                          '2nd Installment': { paid: secondIsPaid, date: secondDate, amount: secondAmount },
                          '3rd Installment': { paid: thirdIsPaid, date: thirdDate, amount: thirdAmount }
                        });

                        // Find the next unpaid installment
                        if (firstDate && !firstIsPaid) {
                          const firstDateObj = new Date(firstDate);
                          if (firstDateObj >= today) {
                            nextDueDate = firstDateObj;
                            nextAmount = firstAmount;
                            installmentType = '1st';
                          }
                        }

                        // Check second installment if first is paid or overdue
                        if (!nextDueDate && secondDate && !secondIsPaid) {
                          const secondDateObj = new Date(secondDate);
                          if (secondDateObj >= today) {
                            nextDueDate = secondDateObj;
                            nextAmount = secondAmount;
                            installmentType = '2nd';
                          }
                        }

                        // Check third installment if first and second are paid or overdue
                        if (!nextDueDate && thirdDate && !thirdIsPaid) {
                          const thirdDateObj = new Date(thirdDate);
                          if (thirdDateObj >= today) {
                            nextDueDate = thirdDateObj;
                            nextAmount = thirdAmount;
                            installmentType = '3rd';
                          }
                        }

                        // If no future unpaid installments, find the most recent overdue unpaid one
                        if (!nextDueDate) {
                          const installments = [
                            { date: firstDate, amount: firstAmount, type: '1st', paid: firstIsPaid },
                            { date: secondDate, amount: secondAmount, type: '2nd', paid: secondIsPaid },
                            { date: thirdDate, amount: thirdAmount, type: '3rd', paid: thirdIsPaid }
                          ].filter(d => d.date && !d.paid); // Only unpaid installments

                          if (installments.length > 0) {
                            const mostRecent = installments.reduce((latest, current) => {
                              return new Date(current.date) > new Date(latest.date) ? current : latest;
                            });
                            nextDueDate = new Date(mostRecent.date);
                            nextAmount = mostRecent.amount;
                            installmentType = mostRecent.type;
                          }
                        }

                        return {
                          coupon,
                          nextDueDate,
                          nextAmount,
                          installmentType
                        };
                      }).filter(item => item.nextDueDate);

                      console.log('Next installments found:', nextInstallments.length);

                      // Sort by due date (earliest first) and then by days remaining
                      nextInstallments.sort((a, b) => {
                        const today = new Date();
                        const daysA = Math.floor((new Date(a.nextDueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                        const daysB = Math.floor((new Date(b.nextDueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                        
                        // Sort by days remaining (ascending - earliest due first)
                        return daysA - daysB;
                      });

                      if (nextInstallments.length === 0) {
                        return (
                          <div className="text-center py-8 text-gray-500">
                            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p>No due installments found</p>
                            <p className="text-xs mt-2">Debug: {vehicleAllocationCoupons.length} total coupons, {couponsWithInstallments.length} with balance</p>
                          </div>
                        );
                      }

                      return nextInstallments.slice(0, 10).map((item, index) => {
                        const { coupon, nextDueDate, nextAmount, installmentType } = item;
                        const today = new Date();
                        const daysOverdue = Math.floor((today.getTime() - nextDueDate.getTime()) / (1000 * 60 * 60 * 24));
                        const isOverdue = daysOverdue > 0;
                        
                        return (
                          <div key={`${coupon._id}-${index}`} className={`p-3 rounded-lg border-l-4 ${
                            isOverdue ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'
                          }`}>
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900">{coupon.fullName}</div>
                                <div className="text-sm text-gray-600">{coupon.vehicleType}</div>
                                <div className="text-sm text-gray-500">
                                  Contact: {coupon.contactNo || 'N/A'} | Coupon: {coupon.couponId}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {installmentType} Installment
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`font-bold ${
                                  isOverdue ? 'text-red-600' : 'text-yellow-600'
                                }`}>
                                  LKR {nextAmount.toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {isOverdue ? 
                                    `${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue` : 
                                    `Due in ${Math.abs(daysOverdue)} day${Math.abs(daysOverdue) > 1 ? 's' : ''}`
                                  }
                                </div>
                                <div className="text-xs text-gray-400">
                                  Due: {nextDueDate.toLocaleDateString()}
                                </div>
                                <div className="text-xs text-gray-400">
                                  Total Balance: LKR {parseFloat(coupon.balance).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Cheque Release Reminders */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Reminders
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-gray-500">
                        {chequeReleaseRemindersLoading ? (
                          <Spin size="small" />
                        ) : (
                          `${chequeReleaseReminders.length} pending`
                        )}
                      </div>
                      <Button 
                        type="link" 
                        size="small" 
                        onClick={() => setAkrTab('chequeReleaseReminders')}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        More Details →
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {chequeReleaseRemindersLoading ? (
                      <div className="text-center py-8">
                        <Spin />
                        <p className="text-gray-500 mt-2">Loading reminders...</p>
                      </div>
                    ) : chequeReleaseReminders.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>No cheque release reminders</p>
                        <p className="text-xs mt-2">All cheques are up to date</p>
                      </div>
                                         ) : (
                       chequeReleaseReminders.slice(0, 8).map((reminder: any) => {
                         const isOverdue = reminder.isOverdue;
                         const daysSinceDownPayment = reminder.daysSinceDownPayment || 0;
                         const daysUntilRelease = reminder.daysUntilRelease || 0;
                         
                         return (
                           <div key={reminder._id} className={`p-3 rounded-lg border-l-4 ${
                             isOverdue ? 'border-red-500 bg-red-50' : daysUntilRelease <= 1 ? 'border-orange-500 bg-orange-50' : 'border-blue-500 bg-blue-50'
                           }`}>
                             <div className="flex justify-between items-start">
                               <div className="flex-1">
                                 <div className="font-semibold text-gray-900">{reminder.fullName}</div>
                                 <div className="text-sm text-gray-600">{reminder.vehicleType}</div>
                                 <div className="text-sm text-gray-500">
                                   Contact: {reminder.contactNo || 'N/A'} | Coupon: {reminder.couponId}
                                 </div>
                                 <div className="text-xs text-gray-400 mt-1">
                                   Down Payment: LKR {parseFloat(reminder.downPayment).toLocaleString()}
                                 </div>
                                 <div className="text-xs text-gray-400">
                                   Days since payment: {daysSinceDownPayment} day{daysSinceDownPayment !== 1 ? 's' : ''}
                                 </div>
                               </div>
                               <div className="text-right">
                                 <div className={`font-bold ${
                                   isOverdue ? 'text-red-600' : daysUntilRelease <= 1 ? 'text-orange-600' : 'text-blue-600'
                                 }`}>
                                   {isOverdue ? 'OVERDUE' : daysUntilRelease <= 1 ? 'DUE SOON' : 'UPCOMING'}
                                 </div>
                                 <div className="text-xs text-gray-500">
                                   {isOverdue ? 
                                     `${reminder.daysOverdue} day${reminder.daysOverdue !== 1 ? 's' : ''} overdue` : 
                                     daysUntilRelease === 0 ? 'Due today' : 
                                     daysUntilRelease === 1 ? 'Due tomorrow' : 
                                     `Due in ${daysUntilRelease} day${daysUntilRelease !== 1 ? 's' : ''}`
                                   }
                                 </div>
                                 <div className="text-xs text-gray-400">
                                   Release: {new Date(reminder.chequeReleaseDate).toLocaleDateString()}
                                 </div>
                                 <div className="text-xs text-gray-400">
                                   To: David Peries
                                 </div>
                               </div>
                             </div>
                           </div>
                         );
                       })
                     )}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Recent Activity
                    </h3>
                    <Button 
                      type="link" 
                      size="small" 
                      onClick={() => setAkrTab('recentActivity')}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      More Details →
                    </Button>
                  </div>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {preBookings.slice(0, 8).map((booking: any) => (
                      <div key={booking._id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          booking.status === 'Pending' ? 'bg-yellow-500' :
                          booking.status === 'Ordered' ? 'bg-blue-500' :
                          booking.status === 'Delivered' ? 'bg-green-500' :
                          'bg-red-500'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-gray-900">{booking.fullName}</div>
                              <div className="text-sm text-gray-600">Booked {booking.vehicleModel}</div>
                            </div>
                            <div className="text-right">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                booking.status === 'Ordered' ? 'bg-blue-100 text-blue-800' :
                                booking.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {booking.status}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(booking.createdAt).toLocaleString()}
                          </div>
                      </div>
                    </div>
                  ))}
                    {preBookings.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>No recent activity</p>
                        </div>
                    )}
                  </div>
              </div>
                      </div>

              {/* Additional Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h4 className="text-lg font-semibold mb-3 text-gray-800">Booking Status</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Inquiries</span>
                      <span className="font-semibold text-yellow-600">{preBookings.filter(b => b.status === 'Pending').length}</span>
                </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Confirm</span>
                      <span className="font-semibold text-blue-600">{preBookings.filter(b => b.status === 'Confirmed').length}</span>
              </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Cancelled</span>
                      <span className="font-semibold text-red-600">{preBookings.filter(b => b.status === 'Cancelled').length}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h4 className="text-lg font-semibold mb-3 text-gray-800">Vehicle Categories</h4>
                  <div className="space-y-2">
                    {(() => {
                      // Get unique categories, normalize them (trim, lowercase) to avoid duplicates
                      const categoryCounts = vehicles.reduce((acc: any, v: any) => {
                        const category = (v.category || 'Uncategorized').trim();
                        acc[category] = (acc[category] || 0) + 1;
                        return acc;
                      }, {});
                      
                      return Object.entries(categoryCounts)
                        .slice(0, 4)
                        .map(([category, count]: [string, any]) => (
                          <div key={category} className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">{category}</span>
                            <span className="font-semibold text-gray-900">{count}</span>
                          </div>
                        ));
                    })()}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h4 className="text-lg font-semibold mb-3 text-gray-800">Payment Methods</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Full Payment</span>
                      <span className="font-semibold text-green-600">{vehicleAllocationCoupons.filter((c: any) => c.paymentMethod === 'Full Payment').length}</span>
                </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Leasing via AKR</span>
                      <span className="font-semibold text-blue-600">{vehicleAllocationCoupons.filter((c: any) => c.paymentMethod === 'Leasing via AKR').length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Other Leasing</span>
                      <span className="font-semibold text-purple-600">{vehicleAllocationCoupons.filter((c: any) => c.paymentMethod === 'Leasing via Other Company').length}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h4 className="text-lg font-semibold mb-3 text-gray-800">Quick Actions</h4>
                  <div className="space-y-2">
                    <button 
                      onClick={() => { setAkrTab('vehicles'); setTimeout(() => setAddModalOpen(true), 0); }}
                      className="w-full text-left p-2 hover:bg-blue-50 rounded transition-colors text-sm"
                    >
                      ➕ Add New Vehicle
                    </button>
                    <button 
                      onClick={() => { setAkrTab('customers'); setTimeout(() => setCustomerModalOpen(true), 0); }}
                      className="w-full text-left p-2 hover:bg-green-50 rounded transition-colors text-sm"
                    >
                      👤 Add New Customer
                    </button>
                    <button 
                      onClick={() => setAkrTab('vehicleAllocationCoupons')}
                      className="w-full text-left p-2 hover:bg-purple-50 rounded transition-colors text-sm"
                    >
                      📋 View All Coupons
                    </button>
                    <button 
                      onClick={() => setAkrTab('bikeInventory')}
                      className="w-full text-left p-2 hover:bg-orange-50 rounded transition-colors text-sm"
                    >
                      📦 Check Inventory
                    </button>
                      </div>
                </div>
              </div>
              </div>
            )}

          {/* Next Due Installments Tab */}
          {akrTab === 'nextDueInstallments' && (
            <div className="col-span-full">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Next Due Installments</h1>
                <p className="text-gray-600">Track all upcoming and overdue installments for AKR leasing customers</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="space-y-4">
                  {(() => {
                    // Get all coupons with balance and installment dates (ONLY Leasing via AKR)
                    const couponsWithInstallments = vehicleAllocationCoupons.filter((coupon: any) => {
                      const balance = parseFloat(coupon.balance) || 0;
                      const remainingBalance = parseFloat(coupon.remainingBalance) || 0;
                      const hasBalance = balance > 0 || remainingBalance > 0;
                      const isAKRLeasing = coupon.paymentMethod === 'Leasing via AKR';
                      return hasBalance && isAKRLeasing;
                    });

                    // Find the next due installment for each coupon
                    const nextInstallments = couponsWithInstallments.map((coupon: any) => {
                      const today = new Date();
                      let nextDueDate = null;
                      let nextAmount = 0;
                      let installmentType = '';

                      // Check for different possible date field names
                      const firstDate = coupon.firstInstallmentDate || coupon.firstInstallment?.date;
                      const secondDate = coupon.secondInstallmentDate || coupon.secondInstallment?.date;
                      const thirdDate = coupon.thirdInstallmentDate || coupon.thirdInstallment?.date;

                      // Check for different possible amount field names
                      const firstAmount = parseFloat(coupon.firstInstallmentAmount || coupon.firstInstallment?.amount || 0);
                      const secondAmount = parseFloat(coupon.secondInstallmentAmount || coupon.secondInstallment?.amount || 0);
                      const thirdAmount = parseFloat(coupon.thirdInstallmentAmount || coupon.thirdInstallment?.amount || 0);

                      // Check for payment status in the nested installment objects
                      const firstInstallmentPaid = coupon.firstInstallment?.paid || coupon.firstInstallment?.status === 'Paid' || coupon.firstInstallment?.paidAmount > 0 || false;
                      const secondInstallmentPaid = coupon.secondInstallment?.paid || coupon.secondInstallment?.status === 'Paid' || coupon.secondInstallment?.paidAmount > 0 || false;
                      const thirdInstallmentPaid = coupon.thirdInstallment?.paid || coupon.thirdInstallment?.status === 'Paid' || coupon.thirdInstallment?.paidAmount > 0 || false;

                      // Find the next unpaid installment
                      if (firstDate && !firstInstallmentPaid) {
                        const firstDateObj = new Date(firstDate);
                        if (firstDateObj >= today) {
                          nextDueDate = firstDateObj;
                          nextAmount = firstAmount;
                          installmentType = '1st';
                        }
                      }

                      if (!nextDueDate && secondDate && !secondInstallmentPaid) {
                        const secondDateObj = new Date(secondDate);
                        if (secondDateObj >= today) {
                          nextDueDate = secondDateObj;
                          nextAmount = secondAmount;
                          installmentType = '2nd';
                        }
                      }

                      if (!nextDueDate && thirdDate && !thirdInstallmentPaid) {
                        const thirdDateObj = new Date(thirdDate);
                        if (thirdDateObj >= today) {
                          nextDueDate = thirdDateObj;
                          nextAmount = thirdAmount;
                          installmentType = '3rd';
                        }
                      }

                      // If no future unpaid installments, find the most recent overdue unpaid one
                      if (!nextDueDate) {
                        const installments = [
                          { date: firstDate, amount: firstAmount, type: '1st', paid: firstInstallmentPaid },
                          { date: secondDate, amount: secondAmount, type: '2nd', paid: secondInstallmentPaid },
                          { date: thirdDate, amount: thirdAmount, type: '3rd', paid: thirdInstallmentPaid }
                        ].filter(d => d.date && !d.paid);

                        if (installments.length > 0) {
                          const mostRecent = installments.reduce((latest, current) => {
                            return new Date(current.date) > new Date(latest.date) ? current : latest;
                          });
                          nextDueDate = new Date(mostRecent.date);
                          nextAmount = mostRecent.amount;
                          installmentType = mostRecent.type;
                        }
                      }

                      return {
                        coupon,
                        nextDueDate,
                        nextAmount,
                        installmentType
                      };
                    }).filter(item => item.nextDueDate);

                    // Sort by due date (earliest first)
                    nextInstallments.sort((a, b) => {
                      const today = new Date();
                      const daysA = Math.floor((new Date(a.nextDueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                      const daysB = Math.floor((new Date(b.nextDueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                      return daysA - daysB;
                    });

                    if (nextInstallments.length === 0) {
                      return (
                        <div className="text-center py-12 text-gray-500">
                          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <h3 className="text-xl font-semibold mb-2">No Due Installments</h3>
                          <p>All AKR leasing installments are up to date!</p>
                        </div>
                      );
                    }

                    return nextInstallments.map((item, index) => {
                      const { coupon, nextDueDate, nextAmount, installmentType } = item;
                      const today = new Date();
                      const daysOverdue = Math.floor((today.getTime() - nextDueDate.getTime()) / (1000 * 60 * 60 * 24));
                      const isOverdue = daysOverdue > 0;
                      
                      return (
                        <div key={`${coupon._id}-${index}`} className={`p-6 rounded-lg border-l-4 ${
                          isOverdue ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'
                        }`}>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-semibold text-lg text-gray-900 mb-2">{coupon.fullName}</div>
                              <div className="text-sm text-gray-600 mb-1">{coupon.vehicleType}</div>
                              <div className="text-sm text-gray-500 mb-2">
                                Contact: {coupon.contactNo || 'N/A'} | Coupon: {coupon.couponId}
                              </div>
                              <div className="text-xs text-gray-400">
                                {installmentType} Installment
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-2xl font-bold mb-1 ${
                                isOverdue ? 'text-red-600' : 'text-yellow-600'
                              }`}>
                                LKR {nextAmount.toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-500 mb-1">
                                {isOverdue ? 
                                  `${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue` : 
                                  `Due in ${Math.abs(daysOverdue)} day${Math.abs(daysOverdue) > 1 ? 's' : ''}`
                                }
                              </div>
                              <div className="text-xs text-gray-400 mb-1">
                                Due: {nextDueDate.toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-400">
                                Total Balance: LKR {parseFloat(coupon.balance).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Cheque Release Reminders Tab */}
          {akrTab === 'chequeReleaseReminders' && (
            <div className="col-span-full">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Cheque Release Reminders</h1>
                <p className="text-gray-600">Track all pending cheque releases for David Peries after customer down payments</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="text-sm text-gray-500">
                    {chequeReleaseRemindersLoading ? (
                      <Spin size="small" />
                    ) : (
                      `Total: ${chequeReleaseReminders.length} reminders`
                    )}
                  </div>
                  <Button 
                    type="primary" 
                    onClick={exportChequeReleaseRemindersToPDF}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Export PDF
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {chequeReleaseRemindersLoading ? (
                    <div className="text-center py-12">
                      <Spin size="large" />
                      <p className="text-gray-500 mt-4">Loading cheque release reminders...</p>
                    </div>
                  ) : chequeReleaseReminders.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="text-xl font-semibold mb-2">No Cheque Release Reminders</h3>
                      <p>All cheques are up to date</p>
                    </div>
                  ) : (
                    <>
                      {/* Pending Reminders */}
                      {chequeReleaseReminders.filter((r: any) => r.status === 'pending').map((reminder: any) => {
                        const isOverdue = reminder.isOverdue;
                        const daysSinceDownPayment = reminder.daysSinceDownPayment || 0;
                        const daysUntilRelease = reminder.daysUntilRelease || 0;
                        
                        return (
                          <div key={reminder._id} className={`p-6 rounded-lg border-l-4 ${
                            isOverdue ? 'border-red-500 bg-red-50' : daysUntilRelease <= 1 ? 'border-orange-500 bg-orange-50' : 'border-blue-500 bg-blue-50'
                          }`}>
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="font-semibold text-lg text-gray-900">{reminder.fullName}</div>
                                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                                    isOverdue ? 'bg-red-100 text-red-800' : daysUntilRelease <= 1 ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {isOverdue ? 'OVERDUE' : daysUntilRelease <= 1 ? 'DUE SOON' : 'UPCOMING'}
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  <div>
                                    <div className="text-sm text-gray-600">Vehicle</div>
                                    <div className="font-medium">{reminder.vehicleType}</div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-gray-600">Coupon ID</div>
                                    <div className="font-medium">{reminder.couponId}</div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-gray-600">Contact</div>
                                    <div className="font-medium">{reminder.contactNo || 'N/A'}</div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-gray-600">Down Payment</div>
                                    <div className="font-medium text-lg">LKR {parseFloat(reminder.downPayment).toLocaleString()}</div>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <div className="text-gray-600">Days since payment</div>
                                    <div className="font-medium">{daysSinceDownPayment} day{daysSinceDownPayment !== 1 ? 's' : ''}</div>
                                  </div>
                                  <div>
                                    <div className="text-gray-600">Cheque release date</div>
                                    <div className="font-medium">{new Date(reminder.chequeReleaseDate).toLocaleDateString()}</div>
                                  </div>
                                  <div>
                                    <div className="text-gray-600">Status</div>
                                    <div className="font-medium">
                                      {isOverdue ? 
                                        `${reminder.daysOverdue} day${reminder.daysOverdue !== 1 ? 's' : ''} overdue` : 
                                        daysUntilRelease === 0 ? 'Due today' : 
                                        daysUntilRelease === 1 ? 'Due tomorrow' : 
                                        `Due in ${daysUntilRelease} day${daysUntilRelease !== 1 ? 's' : ''}`
                                      }
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                <div className="text-sm text-gray-600 mb-2">To: David Peries</div>
                                <div className="text-xs text-gray-500 mb-3">
                                  Cheque amount: LKR {parseFloat(reminder.downPayment).toLocaleString()}
                                </div>
                                <Button 
                                  type="primary" 
                                  size="small"
                                  onClick={() => markChequeAsReleased(reminder.couponId)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Mark as Done
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Released Reminders */}
                      {chequeReleaseReminders.filter((r: any) => r.status === 'released').length > 0 && (
                        <div className="mt-8">
                          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Released Cheques</h3>
                          {chequeReleaseReminders.filter((r: any) => r.status === 'released').map((reminder: any) => {
                            const daysSinceDownPayment = reminder.daysSinceDownPayment || 0;
                            const daysSinceReleased = reminder.daysSinceReleased || 0;
                            
                            return (
                              <div key={reminder._id} className="p-6 rounded-lg border-l-4 border-green-500 bg-green-50 mb-4">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                      <div className="font-semibold text-lg text-gray-900">{reminder.fullName}</div>
                                      <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                                        RELEASED
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                      <div>
                                        <div className="text-sm text-gray-600">Vehicle</div>
                                        <div className="font-medium">{reminder.vehicleType}</div>
                                      </div>
                                      <div>
                                        <div className="text-sm text-gray-600">Coupon ID</div>
                                        <div className="font-medium">{reminder.couponId}</div>
                                      </div>
                                      <div>
                                        <div className="text-sm text-gray-600">Contact</div>
                                        <div className="font-medium">{reminder.contactNo || 'N/A'}</div>
                                      </div>
                                      <div>
                                        <div className="text-sm text-gray-600">Down Payment</div>
                                        <div className="font-medium text-lg">LKR {parseFloat(reminder.downPayment).toLocaleString()}</div>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                      <div>
                                        <div className="text-gray-600">Days since payment</div>
                                        <div className="font-medium">{daysSinceDownPayment} day{daysSinceDownPayment !== 1 ? 's' : ''}</div>
                                      </div>
                                      <div>
                                        <div className="text-gray-600">Released date</div>
                                        <div className="font-medium">{new Date(reminder.chequeReleasedDate).toLocaleDateString()}</div>
                                      </div>
                                      <div>
                                        <div className="text-gray-600">Days since release</div>
                                        <div className="font-medium">{daysSinceReleased} day{daysSinceReleased !== 1 ? 's' : ''}</div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right ml-4">
                                    <div className="text-sm text-gray-600 mb-2">To: David Peries</div>
                                    <div className="text-xs text-gray-500">
                                      Cheque amount: LKR {parseFloat(reminder.downPayment).toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity Tab */}
          {akrTab === 'recentActivity' && (
            <div className="col-span-full">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Recent Activity</h1>
                <p className="text-gray-600">Track all recent pre-booking activities and customer interactions</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="space-y-4">
                  {preBookings.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <h3 className="text-xl font-semibold mb-2">No Recent Activity</h3>
                      <p>No pre-booking activities found</p>
                    </div>
                  ) : (
                    preBookings.map((booking: any) => (
                      <div key={booking._id} className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                        <div className={`w-3 h-3 rounded-full mt-2 ${
                          booking.status === 'Pending' ? 'bg-yellow-500' :
                          booking.status === 'Ordered' ? 'bg-blue-500' :
                          booking.status === 'Delivered' ? 'bg-green-500' :
                          'bg-red-500'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-semibold text-lg text-gray-900">{booking.fullName}</div>
                              <div className="text-sm text-gray-600">Booked {booking.vehicleModel}</div>
                            </div>
                            <div className="text-right">
                              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                                booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                booking.status === 'Ordered' ? 'bg-blue-100 text-blue-800' :
                                booking.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {booking.status}
                              </span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(booking.createdAt).toLocaleString()}
                          </div>
                          {booking.contactNo && (
                            <div className="text-sm text-gray-500 mt-1">
                              Contact: {booking.contactNo}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
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

      {/* Stock Update Modal */}
      <Modal
        title="Update Stock Quantity"
        open={stockUpdateModalOpen}
        onCancel={() => {
          setStockUpdateModalOpen(false);
          setSelectedVehicle(null);
          setNewStockQuantity(0);
        }}
        onOk={handleStockUpdateSubmit}
        okText="Update Stock"
        cancelText="Cancel"
        centered
      >
        {selectedVehicle && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">{selectedVehicle.name}</h3>
              <p className="text-gray-600">Current Stock: <span className="font-semibold">{selectedVehicle.stockQuantity || 0}</span></p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">New Stock Quantity</label>
              <input
                type="number"
                min="0"
                value={newStockQuantity}
                onChange={(e) => setNewStockQuantity(parseInt(e.target.value) || 0)}
                className="border px-3 py-2 rounded w-full"
                placeholder="Enter new stock quantity"
              />
            </div>
            
            <div className="text-sm text-gray-600">
              <p>• Set to 0 if out of stock</p>
              <p>• This will update the stock quantity for this vehicle</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Customer History Modal */}
      <Modal
        title={
          <div>
            <div className="text-lg font-semibold">Customer History</div>
            {selectedCustomerForHistory && (
              <div className="text-sm text-gray-600 mt-1">
                {selectedCustomerForHistory.fullName} - {selectedCustomerForHistory.phoneNo}
              </div>
            )}
          </div>
        }
        open={customerHistoryModalOpen}
        onCancel={() => {
          setCustomerHistoryModalOpen(false);
          setSelectedCustomerForHistory(null);
          setCustomerHistoryData([]);
        }}
        footer={null}
        width={1000}
        style={{ top: 20 }}
      >
        {customerHistoryLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading customer history...</p>
          </div>
        ) : customerHistoryData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg">No purchase history found</p>
            <p className="text-sm">This customer has no vehicle allocation coupons</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="bg-blue-50 p-4 rounded-lg flex-1">
              <h3 className="font-semibold text-blue-800 mb-2">Purchase Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Purchases:</span>
                  <div className="font-semibold">{customerHistoryData.length}</div>
                </div>
                <div>
                  <span className="text-gray-600">Total Amount:</span>
                  <div className="font-semibold">
                    LKR {customerHistoryData.reduce((sum, coupon) => sum + (coupon.totalAmount || 0), 0).toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Total Down Payment:</span>
                  <div className="font-semibold">
                    LKR {customerHistoryData.reduce((sum, coupon) => sum + (coupon.downPayment || 0), 0).toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Total Balance:</span>
                  <div className="font-semibold">
                    LKR {customerHistoryData.reduce((sum, coupon) => sum + (coupon.balance || 0), 0).toLocaleString()}
                  </div>
                </div>
              </div>
              </div>
              <Button 
                type="primary" 
                onClick={() => exportCustomerHistoryToPDF(selectedCustomerForHistory, customerHistoryData)}
                className="ml-4"
              >
                Export PDF
              </Button>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">Purchase History</h3>
              {customerHistoryData.map((coupon, index) => (
                <div key={coupon._id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-lg">{coupon.couponId}</h4>
                      <p className="text-gray-600">{coupon.vehicleType}</p>
                      <p className="text-sm text-gray-500">
                        Purchase Date: {new Date(coupon.dateOfPurchase).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-green-600">
                        LKR {coupon.totalAmount?.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {coupon.paymentMethod}
                      </div>
                      <Tag color={
                        coupon.status === 'Completed' ? 'green' : 
                        coupon.status === 'Approved' ? 'blue' : 
                        coupon.status === 'Pending' ? 'orange' : 'red'
                      }>
                        {coupon.status}
                      </Tag>
                    </div>
                  </div>
                  
                  {/* Customer Information */}
                  <div className="bg-gray-50 p-3 rounded-lg mb-3">
                    <h5 className="font-semibold text-gray-800 mb-2">Customer Information</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <span className="text-gray-600">Full Name:</span>
                        <div className="font-medium">{coupon.fullName}</div>
                    </div>
                    <div>
                        <span className="text-gray-600">NIC/Driving License:</span>
                        <div className="font-medium">{coupon.nicDrivingLicense || coupon.nicNo || coupon.nicDrivingLicense || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Phone:</span>
                        <div className="font-medium">{coupon.contactNo || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Address:</span>
                        <div className="font-medium">{coupon.address || 'N/A'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Information */}
                  <div className="bg-blue-50 p-3 rounded-lg mb-3">
                    <h5 className="font-semibold text-blue-800 mb-2">Vehicle Information</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Vehicle Type:</span>
                        <div className="font-medium">{coupon.vehicleType}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Engine No:</span>
                      <div className="font-medium">{coupon.engineNo}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Chassis No:</span>
                      <div className="font-medium">{coupon.chassisNo}</div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="bg-green-50 p-3 rounded-lg mb-3">
                    <h5 className="font-semibold text-green-800 mb-2">Payment Details</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Base Price:</span>
                        <div className="font-medium">LKR {coupon.basePrice?.toLocaleString() || '0'}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Reg Fee:</span>
                        <div className="font-medium">LKR {coupon.regFee?.toLocaleString() || '0'}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Doc Charge:</span>
                        <div className="font-medium">LKR {coupon.docCharge?.toLocaleString() || '0'}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Insurance:</span>
                        <div className="font-medium">LKR {coupon.insuranceCo?.toLocaleString() || '0'}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Amount:</span>
                        <div className="font-medium">LKR {coupon.totalAmount?.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Down Payment:</span>
                        <div className="font-medium">LKR {coupon.downPayment?.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Discount:</span>
                        <div className="font-medium">LKR {coupon.discountAmount?.toLocaleString() || '0'}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Balance:</span>
                        <div className="font-medium">LKR {coupon.balance?.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  {/* Show Leasing Company Details for "Leasing via AKR" */}
                  {coupon.paymentMethod === 'Leasing via AKR' && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <h5 className="font-semibold text-blue-800 mb-2">Leasing Company Details</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Company:</span>
                          <div className="font-medium">{coupon.leasingCompany || 'AKR Easy Credit'}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Officer:</span>
                          <div className="font-medium">{coupon.officerName || 'Anton Rojar Stalin'}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Contact:</span>
                          <div className="font-medium">{coupon.officerContactNo || '0773111266'}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Commission:</span>
                          <div className="font-medium">{coupon.commissionPercentage || '3'}%</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Show Installment Details only for "Leasing via AKR" */}
                  {coupon.paymentMethod === 'Leasing via AKR' && coupon.balance > 0 && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                      <h5 className="font-semibold text-yellow-800 mb-2">Installment Details</h5>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">1st Installment:</span>
                          <div className="font-medium">
                            LKR {(() => {
                              // Check multiple possible field names for first installment amount
                              const amount = coupon.firstInstallmentAmount || 
                                           coupon.firstInstallment?.amount || 
                                           coupon.firstInstallmentAmount || 
                                           (coupon.balance / 3);
                              return amount ? amount.toLocaleString() : 'N/A';
                            })()}
                            <br />
                            <span className="text-xs text-gray-500">
                              {(() => {
                                const date = coupon.firstInstallmentDate || 
                                           coupon.firstInstallment?.date || 
                                           coupon.firstInstallmentDate;
                                return date ? new Date(date).toLocaleDateString('en-GB') : 'N/A';
                              })()}
                            </span>
                            <div className="text-xs mt-1">
                              <span className={`px-2 py-1 rounded-full text-white ${
                                (() => {
                                  // Check multiple sources for payment status
                                  const isPaid = coupon.firstInstallmentPaid || 
                                               coupon.firstInstallment?.paid || 
                                               coupon.firstInstallmentPaidStatus ||
                                               String(coupon.firstInstallment?.date || '').includes('✓') ||
                                               String(coupon.firstInstallment?.status || '').toLowerCase().includes('paid') ||
                                               String(coupon.firstInstallmentDate || '').includes('✓') ||
                                               String(coupon.firstInstallmentAmount || '').includes('✓') ||
                                               coupon.firstInstallment?.paidAmount > 0 ||
                                               coupon.firstInstallment?.status === 'Paid';
                                  return isPaid ? 'bg-green-500' : 'bg-red-500';
                                })()
                              }`}>
                                {(() => {
                                  // Check multiple sources for payment status
                                  const isPaid = coupon.firstInstallmentPaid || 
                                               coupon.firstInstallment?.paid || 
                                               coupon.firstInstallmentPaidStatus ||
                                               String(coupon.firstInstallment?.date || '').includes('✓') ||
                                               String(coupon.firstInstallment?.status || '').toLowerCase().includes('paid') ||
                                               String(coupon.firstInstallmentDate || '').includes('✓') ||
                                               String(coupon.firstInstallmentAmount || '').includes('✓') ||
                                               coupon.firstInstallment?.paidAmount > 0 ||
                                               coupon.firstInstallment?.status === 'Paid';
                                  return isPaid ? '✓ Paid' : '❌ Unpaid';
                                })()}
                            </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">2nd Installment:</span>
                          <div className="font-medium">
                            LKR {(() => {
                              // Check multiple possible field names for second installment amount
                              const amount = coupon.secondInstallmentAmount || 
                                           coupon.secondInstallment?.amount || 
                                           coupon.secondInstallmentAmount || 
                                           (coupon.balance / 3);
                              return amount ? amount.toLocaleString() : 'N/A';
                            })()}
                            <br />
                            <span className="text-xs text-gray-500">
                              {(() => {
                                const date = coupon.secondInstallmentDate || 
                                           coupon.secondInstallment?.date || 
                                           coupon.secondInstallmentDate;
                                return date ? new Date(date).toLocaleDateString('en-GB') : 'N/A';
                              })()}
                            </span>
                            <div className="text-xs mt-1">
                              <span className={`px-2 py-1 rounded-full text-white ${
                                (() => {
                                  // Check multiple sources for payment status
                                  const isPaid = coupon.secondInstallmentPaid || 
                                               coupon.secondInstallment?.paid || 
                                               coupon.secondInstallmentPaidStatus ||
                                               String(coupon.secondInstallment?.date || '').includes('✓') ||
                                               String(coupon.secondInstallment?.status || '').toLowerCase().includes('paid') ||
                                               String(coupon.secondInstallmentDate || '').includes('✓') ||
                                               String(coupon.secondInstallmentAmount || '').includes('✓') ||
                                               coupon.secondInstallment?.paidAmount > 0 ||
                                               coupon.secondInstallment?.status === 'Paid';
                                  return isPaid ? 'bg-green-500' : 'bg-red-500';
                                })()
                              }`}>
                                {(() => {
                                  // Check multiple sources for payment status
                                  const isPaid = coupon.secondInstallmentPaid || 
                                               coupon.secondInstallment?.paid || 
                                               coupon.secondInstallmentPaidStatus ||
                                               String(coupon.secondInstallment?.date || '').includes('✓') ||
                                               String(coupon.secondInstallment?.status || '').toLowerCase().includes('paid') ||
                                               String(coupon.secondInstallmentDate || '').includes('✓') ||
                                               String(coupon.secondInstallmentAmount || '').includes('✓') ||
                                               coupon.secondInstallment?.paidAmount > 0 ||
                                               coupon.secondInstallment?.status === 'Paid';
                                  return isPaid ? '✓ Paid' : '❌ Unpaid';
                                })()}
                            </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">3rd Installment:</span>
                          <div className="font-medium">
                            LKR {(() => {
                              // Check multiple possible field names for third installment amount
                              const amount = coupon.thirdInstallmentAmount || 
                                           coupon.thirdInstallment?.amount || 
                                           coupon.thirdInstallmentAmount || 
                                           (coupon.balance / 3);
                              return amount ? amount.toLocaleString() : 'N/A';
                            })()}
                            <br />
                            <span className="text-xs text-gray-500">
                              {(() => {
                                const date = coupon.thirdInstallmentDate || 
                                           coupon.thirdInstallment?.date || 
                                           coupon.thirdInstallmentDate;
                                return date ? new Date(date).toLocaleDateString('en-GB') : 'N/A';
                              })()}
                            </span>
                            <div className="text-xs mt-1">
                              <span className={`px-2 py-1 rounded-full text-white ${
                                (() => {
                                  // Check multiple sources for payment status
                                  const isPaid = coupon.thirdInstallmentPaid || 
                                               coupon.thirdInstallment?.paid || 
                                               coupon.thirdInstallmentPaidStatus ||
                                               String(coupon.thirdInstallment?.date || '').includes('✓') ||
                                               String(coupon.thirdInstallment?.status || '').toLowerCase().includes('paid') ||
                                               String(coupon.thirdInstallmentDate || '').includes('✓') ||
                                               String(coupon.thirdInstallmentAmount || '').includes('✓') ||
                                               coupon.thirdInstallment?.paidAmount > 0 ||
                                               coupon.thirdInstallment?.status === 'Paid';
                                  return isPaid ? 'bg-green-500' : 'bg-red-500';
                                })()
                              }`}>
                                {(() => {
                                  // Check multiple sources for payment status
                                  const isPaid = coupon.thirdInstallmentPaid || 
                                               coupon.thirdInstallment?.paid || 
                                               coupon.thirdInstallmentPaidStatus ||
                                               String(coupon.thirdInstallment?.date || '').includes('✓') ||
                                               String(coupon.thirdInstallment?.status || '').toLowerCase().includes('paid') ||
                                               String(coupon.thirdInstallmentDate || '').includes('✓') ||
                                               String(coupon.thirdInstallmentAmount || '').includes('✓') ||
                                               coupon.thirdInstallment?.paidAmount > 0 ||
                                               coupon.thirdInstallment?.status === 'Paid';
                                  return isPaid ? '✓ Paid' : '❌ Unpaid';
                                })()}
                            </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Show Leasing Company Details for "Leasing via Other Company" */}
                  {coupon.paymentMethod === 'Leasing via Other Company' && (
                    <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                      <h5 className="font-semibold text-purple-800 mb-2">Leasing Company Details</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Company:</span>
                          <div className="font-medium">{coupon.leasingCompany || 'N/A'}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Officer:</span>
                          <div className="font-medium">{coupon.officerName || 'N/A'}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Contact:</span>
                          <div className="font-medium">{coupon.officerContactNo || 'N/A'}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Commission:</span>
                          <div className="font-medium">{coupon.commissionPercentage || '0'}%</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {coupon.notes && (
                    <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                      <span className="text-gray-600">Notes:</span> {coupon.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* View Vehicle Allocation Coupon Modal */}
      <Modal
        title={
          <div>
            <div className="text-lg font-semibold">Vehicle Allocation Coupon Details</div>
            <div className="text-sm text-blue-600 mt-1">
              Customer: {viewingVehicleAllocationCoupon?.fullName || 'N/A'}
            </div>
          </div>
        }
        open={viewVehicleAllocationCouponModalOpen}
        onCancel={() => {
          setViewVehicleAllocationCouponModalOpen(false);
          setViewingVehicleAllocationCoupon(null);
        }}
        footer={[
          <Button key="export" type="primary" onClick={() => exportIndividualVehicleAllocationCouponToPDF(viewingVehicleAllocationCoupon)}>
            Export PDF
          </Button>,
          <Button key="close" onClick={() => {
            setViewVehicleAllocationCouponModalOpen(false);
            setViewingVehicleAllocationCoupon(null);
          }}>
            Close
          </Button>
        ]}
        width={1000}
        style={{ top: 20 }}
      >
        {viewingVehicleAllocationCoupon && (
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Coupon ID</label>
                  <div className="text-lg font-semibold">{viewingVehicleAllocationCoupon.couponId || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Customer Name</label>
                  <div className="text-lg font-semibold">{viewingVehicleAllocationCoupon.fullName || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">NIC Number</label>
                  <div className="text-base">{viewingVehicleAllocationCoupon.nicNo || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Contact Number</label>
                  <div className="text-base">{viewingVehicleAllocationCoupon.contactNo || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Address</label>
                  <div className="text-base">{viewingVehicleAllocationCoupon.address || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Occupation</label>
                  <div className="text-base">{viewingVehicleAllocationCoupon.occupation || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Date of Birth</label>
                  <div className="text-base">
                    {viewingVehicleAllocationCoupon.dateOfBirth ? new Date(viewingVehicleAllocationCoupon.dateOfBirth).toLocaleDateString('en-GB') : 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-blue-800">Vehicle Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Vehicle Type</label>
                  <div className="text-lg font-semibold">{viewingVehicleAllocationCoupon.vehicleType || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Engine Number</label>
                  <div className="text-base">{viewingVehicleAllocationCoupon.engineNo || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Chassis Number</label>
                  <div className="text-base">{viewingVehicleAllocationCoupon.chassisNo || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Date of Purchase</label>
                  <div className="text-base">
                    {viewingVehicleAllocationCoupon.dateOfPurchase ? new Date(viewingVehicleAllocationCoupon.dateOfPurchase).toLocaleDateString('en-GB') : 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-green-800">Payment Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Payment Method</label>
                  <div className="text-lg font-semibold">{viewingVehicleAllocationCoupon.paymentMethod || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Payment Type</label>
                  <div className="text-base">{viewingVehicleAllocationCoupon.paymentType || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Total Amount</label>
                  <div className="text-lg font-semibold text-green-600">
                    LKR {viewingVehicleAllocationCoupon.totalAmount ? parseFloat(viewingVehicleAllocationCoupon.totalAmount).toLocaleString() : '0'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Down Payment</label>
                  <div className="text-lg font-semibold text-blue-600">
                    LKR {viewingVehicleAllocationCoupon.downPayment ? parseFloat(viewingVehicleAllocationCoupon.downPayment).toLocaleString() : '0'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Balance</label>
                  <div className="text-lg font-semibold text-orange-600">
                    LKR {viewingVehicleAllocationCoupon.balance ? parseFloat(viewingVehicleAllocationCoupon.balance).toLocaleString() : '0'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Registration Fee</label>
                  <div className="text-base">LKR {viewingVehicleAllocationCoupon.regFee ? parseFloat(viewingVehicleAllocationCoupon.regFee).toLocaleString() : '0'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Document Charge</label>
                  <div className="text-base">LKR {viewingVehicleAllocationCoupon.docCharge ? parseFloat(viewingVehicleAllocationCoupon.docCharge).toLocaleString() : '0'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Insurance</label>
                  <div className="text-base">LKR {viewingVehicleAllocationCoupon.insuranceCo ? parseFloat(viewingVehicleAllocationCoupon.insuranceCo).toLocaleString() : '0'}</div>
                </div>
                {viewingVehicleAllocationCoupon.discountApplied && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Discount Applied</label>
                      <div className="text-base text-green-600">Yes</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Discount Amount</label>
                      <div className="text-base text-green-600">
                        LKR {viewingVehicleAllocationCoupon.discountAmount ? parseFloat(viewingVehicleAllocationCoupon.discountAmount).toLocaleString() : '0'}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Leasing Company Information */}
            {(viewingVehicleAllocationCoupon.paymentMethod === 'Leasing via AKR' || viewingVehicleAllocationCoupon.paymentMethod === 'Leasing via Other Company') && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-purple-800">Leasing Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Leasing Company</label>
                    <div className="text-lg font-semibold">{viewingVehicleAllocationCoupon.leasingCompany || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Officer Name</label>
                    <div className="text-base">{viewingVehicleAllocationCoupon.officerName || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Contact Number</label>
                    <div className="text-base">{viewingVehicleAllocationCoupon.officerContactNo || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Commission</label>
                    <div className="text-base">{viewingVehicleAllocationCoupon.commissionPercentage ? viewingVehicleAllocationCoupon.commissionPercentage + '%' : 'N/A'}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Installment Details */}
            {viewingVehicleAllocationCoupon.paymentMethod === 'Leasing via AKR' && (
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-indigo-800">Installment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">1st Installment</label>
                    <div className="text-base">
                      <div className="font-semibold">
                        LKR {viewingVehicleAllocationCoupon.firstInstallment?.amount ? parseFloat(viewingVehicleAllocationCoupon.firstInstallment.amount).toLocaleString() : '0'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {viewingVehicleAllocationCoupon.firstInstallment?.date ? new Date(viewingVehicleAllocationCoupon.firstInstallment.date).toLocaleDateString('en-GB') : 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">2nd Installment</label>
                    <div className="text-base">
                      <div className="font-semibold">
                        LKR {viewingVehicleAllocationCoupon.secondInstallment?.amount ? parseFloat(viewingVehicleAllocationCoupon.secondInstallment.amount).toLocaleString() : '0'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {viewingVehicleAllocationCoupon.secondInstallment?.date ? new Date(viewingVehicleAllocationCoupon.secondInstallment.date).toLocaleDateString('en-GB') : 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">3rd Installment</label>
                    <div className="text-base">
                      <div className="font-semibold">
                        LKR {viewingVehicleAllocationCoupon.thirdInstallment?.amount ? parseFloat(viewingVehicleAllocationCoupon.thirdInstallment.amount).toLocaleString() : '0'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {viewingVehicleAllocationCoupon.thirdInstallment?.date ? new Date(viewingVehicleAllocationCoupon.thirdInstallment.date).toLocaleDateString('en-GB') : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-yellow-800">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Workshop No</label>
                  <div className="text-base">{viewingVehicleAllocationCoupon.workshopNo || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Branch</label>
                  <div className="text-base">{viewingVehicleAllocationCoupon.branch || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Date</label>
                  <div className="text-base">
                    {viewingVehicleAllocationCoupon.date ? new Date(viewingVehicleAllocationCoupon.date).toLocaleDateString('en-GB') : 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Status</label>
                  <div className="text-base">
                    <Tag color={
                      viewingVehicleAllocationCoupon.status === 'Completed' ? 'green' : 
                      viewingVehicleAllocationCoupon.status === 'Approved' ? 'blue' : 
                      viewingVehicleAllocationCoupon.status === 'Pending' ? 'orange' : 'red'
                    }>
                      {viewingVehicleAllocationCoupon.status || 'N/A'}
                    </Tag>
                  </div>
                </div>
                {viewingVehicleAllocationCoupon.notes && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600">Notes</label>
                    <div className="text-base">{viewingVehicleAllocationCoupon.notes}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* View Sales Transaction Modal */}
      <Modal
        title={
          <div>
            <div className="text-lg font-semibold">Sales Transaction Details</div>
            <div className="text-sm text-blue-600 mt-1">
              Customer: {viewingSalesTransaction?.customerName || 'N/A'}
            </div>
          </div>
        }
        open={viewSalesTransactionModalOpen}
        onCancel={() => {
          setViewSalesTransactionModalOpen(false);
          setViewingSalesTransaction(null);
        }}
        footer={[
          <Button key="export" type="primary" onClick={() => exportIndividualSalesTransactionToPDF(viewingSalesTransaction)}>
            Export PDF
          </Button>,
          <Button key="close" onClick={() => {
            setViewSalesTransactionModalOpen(false);
            setViewingSalesTransaction(null);
          }}>
            Close
          </Button>
        ]}
        width={1000}
        style={{ top: 20 }}
      >
        {viewingSalesTransaction && (
          <div className="space-y-6">
            {/* Transaction Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Transaction Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Invoice No</label>
                  <div className="text-lg font-semibold">{viewingSalesTransaction.invoiceNo || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Bike ID</label>
                  <div className="text-lg font-semibold">{viewingSalesTransaction.bikeId || '-'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Sales Date</label>
                  <div className="text-base">
                    {viewingSalesTransaction.salesDate ? new Date(viewingSalesTransaction.salesDate).toLocaleDateString('en-GB') : 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Salesperson</label>
                  <div className="text-base">{viewingSalesTransaction.salespersonName || '-'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Payment Status</label>
                  <div className="text-base">
                    <Tag color={
                      viewingSalesTransaction.paymentStatus === 'Paid' ? 'green' : 
                      viewingSalesTransaction.paymentStatus === 'Pending' ? 'orange' : 'red'
                    }>
                      {viewingSalesTransaction.paymentStatus || 'N/A'}
                    </Tag>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-blue-800">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Customer Name</label>
                  <div className="text-lg font-semibold">{viewingSalesTransaction.customerName || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Phone Number</label>
                  <div className="text-base">{viewingSalesTransaction.customerPhone || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Address</label>
                  <div className="text-base">{viewingSalesTransaction.customerAddress || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-green-800">Vehicle Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Vehicle Model</label>
                  <div className="text-lg font-semibold">{viewingSalesTransaction.vehicleModel || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Engine Number</label>
                  <div className="text-base">{viewingSalesTransaction.engineNumber || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Chassis Number</label>
                  <div className="text-base">{viewingSalesTransaction.chassisNumber || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Color</label>
                  <div className="text-base">{viewingSalesTransaction.bikeColor || '-'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Category</label>
                  <div className="text-base">{viewingSalesTransaction.bikeCategory || '-'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Insurance</label>
                  <div className="text-base">{viewingSalesTransaction.insuranceCo || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-purple-800">Payment Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Payment Method</label>
                  <div className="text-lg font-semibold">{viewingSalesTransaction.paymentMethod || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Selling Price</label>
                  <div className="text-lg font-semibold text-green-600">
                    LKR {viewingSalesTransaction.sellingPrice ? parseFloat(viewingSalesTransaction.sellingPrice).toLocaleString() : '0'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Down Payment</label>
                  <div className="text-lg font-semibold text-blue-600">
                    LKR {viewingSalesTransaction.downPayment ? parseFloat(viewingSalesTransaction.downPayment).toLocaleString() : '0'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Balance Amount</label>
                  <div className="text-lg font-semibold text-orange-600">
                    LKR {viewingSalesTransaction.balanceAmount ? parseFloat(viewingSalesTransaction.balanceAmount).toLocaleString() : '0'}
                  </div>
                </div>
                {viewingSalesTransaction.discountApplied && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Discount Applied</label>
                      <div className="text-base text-green-600">Yes</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Discount Amount</label>
                      <div className="text-base text-green-600">
                        LKR {viewingSalesTransaction.discountAmount ? parseFloat(viewingSalesTransaction.discountAmount).toLocaleString() : '0'}
                      </div>
                    </div>
                  </>
                )}
                {viewingSalesTransaction.regFee > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Registration Fee</label>
                    <div className="text-base">LKR {viewingSalesTransaction.regFee ? parseFloat(viewingSalesTransaction.regFee).toLocaleString() : '0'}</div>
                  </div>
                )}
                {viewingSalesTransaction.docCharge > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Document Charge</label>
                    <div className="text-base">LKR {viewingSalesTransaction.docCharge ? parseFloat(viewingSalesTransaction.docCharge).toLocaleString() : '0'}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Leasing Information */}
            {viewingSalesTransaction.leasingCompany && viewingSalesTransaction.leasingCompany.trim() !== '' && (
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-indigo-800">Leasing Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Leasing Company</label>
                    <div className="text-lg font-semibold">{viewingSalesTransaction.leasingCompany || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Officer Name</label>
                    <div className="text-base">{viewingSalesTransaction.officerName || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Contact Number</label>
                    <div className="text-base">{viewingSalesTransaction.officerContactNo || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Commission</label>
                    <div className="text-base">{viewingSalesTransaction.commissionPercentage ? viewingSalesTransaction.commissionPercentage + '%' : 'N/A'}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-yellow-800">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Branch</label>
                  <div className="text-base">{viewingSalesTransaction.branch || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Issue Time</label>
                  <div className="text-base">{viewingSalesTransaction.vehicleIssueTime || 'N/A'}</div>
                </div>
                {viewingSalesTransaction.warrantyPeriod && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Warranty Period</label>
                    <div className="text-base">{viewingSalesTransaction.warrantyPeriod}</div>
                  </div>
                )}
                {viewingSalesTransaction.freeServiceDetails && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Free Service Details</label>
                    <div className="text-base">{viewingSalesTransaction.freeServiceDetails}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* View Installment Plan Modal */}
      <Modal
        title={
          <div>
            <div className="text-lg font-semibold">Installment Plan Details</div>
            <div className="text-sm text-blue-600 mt-1">
              Customer: {viewingInstallmentPlan?.customerName || 'N/A'}
            </div>
          </div>
        }
        open={viewInstallmentPlanModalOpen}
        onCancel={() => {
          setViewInstallmentPlanModalOpen(false);
          setViewingInstallmentPlan(null);
        }}
        footer={[
          <Button key="export" type="primary" onClick={() => exportIndividualInstallmentPlanToPDF(viewingInstallmentPlan)}>
            Export PDF
          </Button>,
          <Button key="close" onClick={() => {
            setViewInstallmentPlanModalOpen(false);
            setViewingInstallmentPlan(null);
          }}>
            Close
          </Button>
        ]}
        width={1000}
        style={{ top: 20 }}
      >
        {viewingInstallmentPlan && (
          <div className="space-y-6">
            {/* Plan Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Plan Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Installment ID</label>
                  <div className="text-lg font-semibold">{viewingInstallmentPlan.installmentId || '-'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Customer Name</label>
                  <div className="text-lg font-semibold">{viewingInstallmentPlan.customerName || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Phone Number</label>
                  <div className="text-base">{viewingInstallmentPlan.customerPhone || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Address</label>
                  <div className="text-base">{viewingInstallmentPlan.customerAddress || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-blue-800">Vehicle Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Vehicle Model</label>
                  <div className="text-lg font-semibold">{viewingInstallmentPlan.vehicleModel || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Engine Number</label>
                  <div className="text-base">{viewingInstallmentPlan.engineNumber || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Chassis Number</label>
                  <div className="text-base">{viewingInstallmentPlan.chassisNumber || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-green-800">Payment Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Payment Method</label>
                  <div className="text-lg font-semibold">{viewingInstallmentPlan.paymentMethod || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Total Amount</label>
                  <div className="text-lg font-semibold text-green-600">
                    LKR {viewingInstallmentPlan.totalAmount ? parseFloat(viewingInstallmentPlan.totalAmount).toLocaleString() : '0'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Down Payment</label>
                  <div className="text-lg font-semibold text-blue-600">
                    LKR {viewingInstallmentPlan.downPayment ? parseFloat(viewingInstallmentPlan.downPayment).toLocaleString() : '0'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Balance Amount</label>
                  <div className="text-lg font-semibold text-orange-600">
                    LKR {viewingInstallmentPlan.balanceAmount ? parseFloat(viewingInstallmentPlan.balanceAmount).toLocaleString() : '0'}
                  </div>
                </div>
              </div>
            </div>

            {/* Installment Details */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-purple-800">Installment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">1st Installment</label>
                  <div className="text-base">
                    <div className="font-semibold">
                      LKR {viewingInstallmentPlan.firstInstallmentAmount ? parseFloat(viewingInstallmentPlan.firstInstallmentAmount).toLocaleString() : '0'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {viewingInstallmentPlan.firstInstallment?.date ? new Date(viewingInstallmentPlan.firstInstallment.date).toLocaleDateString('en-GB') : '-'}
                    </div>
                    <div className="text-xs mt-1">
                      <Tag color={viewingInstallmentPlan.firstInstallmentPaidAmount > 0 ? 'green' : 'red'}>
                        {viewingInstallmentPlan.firstInstallmentPaidAmount > 0 ? '✓ Paid' : '❌ Pending'}
                      </Tag>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">2nd Installment</label>
                  <div className="text-base">
                    <div className="font-semibold">
                      LKR {viewingInstallmentPlan.secondInstallmentAmount ? parseFloat(viewingInstallmentPlan.secondInstallmentAmount).toLocaleString() : '0'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {viewingInstallmentPlan.secondInstallment?.date ? new Date(viewingInstallmentPlan.secondInstallment.date).toLocaleDateString('en-GB') : '-'}
                    </div>
                    <div className="text-xs mt-1">
                      <Tag color={viewingInstallmentPlan.secondInstallmentPaidAmount > 0 ? 'green' : 'red'}>
                        {viewingInstallmentPlan.secondInstallmentPaidAmount > 0 ? '✓ Paid' : '❌ Pending'}
                      </Tag>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">3rd Installment</label>
                  <div className="text-base">
                    <div className="font-semibold">
                      LKR {viewingInstallmentPlan.thirdInstallmentAmount ? parseFloat(viewingInstallmentPlan.thirdInstallmentAmount).toLocaleString() : '0'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {viewingInstallmentPlan.thirdInstallment?.date ? new Date(viewingInstallmentPlan.thirdInstallment.date).toLocaleDateString('en-GB') : '-'}
                    </div>
                    <div className="text-xs mt-1">
                      <Tag color={viewingInstallmentPlan.thirdInstallmentPaidAmount > 0 ? 'green' : 'red'}>
                        {viewingInstallmentPlan.thirdInstallmentPaidAmount > 0 ? '✓ Paid' : '❌ Pending'}
                      </Tag>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Leasing Information */}
            {viewingInstallmentPlan.leasingCompany && (
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-indigo-800">Leasing Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Leasing Company</label>
                    <div className="text-lg font-semibold">{viewingInstallmentPlan.leasingCompany || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Officer Name</label>
                    <div className="text-base">{viewingInstallmentPlan.officerName || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Contact Number</label>
                    <div className="text-base">{viewingInstallmentPlan.officerContactNo || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Commission</label>
                    <div className="text-base">{viewingInstallmentPlan.commissionPercentage ? viewingInstallmentPlan.commissionPercentage + '%' : 'N/A'}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Summary */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-yellow-800">Payment Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Total Paid</label>
                  <div className="text-lg font-semibold text-green-600">
                    LKR {((viewingInstallmentPlan.firstInstallmentPaidAmount || 0) + (viewingInstallmentPlan.secondInstallmentPaidAmount || 0) + (viewingInstallmentPlan.thirdInstallmentPaidAmount || 0)).toLocaleString()}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Remaining Balance</label>
                  <div className="text-lg font-semibold text-orange-600">
                    LKR {(viewingInstallmentPlan.balanceAmount - ((viewingInstallmentPlan.firstInstallmentPaidAmount || 0) + (viewingInstallmentPlan.secondInstallmentPaidAmount || 0) + (viewingInstallmentPlan.thirdInstallmentPaidAmount || 0))).toLocaleString()}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Payment Status</label>
                  <div className="text-base">
                    <Tag color={((viewingInstallmentPlan.firstInstallmentPaidAmount || 0) + (viewingInstallmentPlan.secondInstallmentPaidAmount || 0) + (viewingInstallmentPlan.thirdInstallmentPaidAmount || 0)) >= viewingInstallmentPlan.balanceAmount ? 'green' : 'orange'}>
                      {((viewingInstallmentPlan.firstInstallmentPaidAmount || 0) + (viewingInstallmentPlan.secondInstallmentPaidAmount || 0) + (viewingInstallmentPlan.thirdInstallmentPaidAmount || 0)) >= viewingInstallmentPlan.balanceAmount ? 'Fully Paid' : 'Partially Paid'}
                    </Tag>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* View Bike Inventory Modal */}
      <Modal
        title={
          <div>
            <div className="text-lg font-semibold">Bike Inventory Details</div>
            <div className="text-sm text-blue-600 mt-1">
              Bike ID: {viewingBikeInventory?.bikeId || 'N/A'}
            </div>
          </div>
        }
        open={viewBikeInventoryModalOpen}
        onCancel={() => {
          setViewBikeInventoryModalOpen(false);
          setViewingBikeInventory(null);
        }}
        footer={[
          <Button key="export" type="primary" onClick={() => exportIndividualBikeInventoryToPDF(viewingBikeInventory)}>
            Export PDF
          </Button>,
          <Button key="close" onClick={() => {
            setViewBikeInventoryModalOpen(false);
            setViewingBikeInventory(null);
          }}>
            Close
          </Button>
        ]}
        width={800}
        style={{ top: 20 }}
      >
        {viewingBikeInventory && (
          <div className="space-y-6">
            {/* Bike Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Bike Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Bike ID</label>
                  <div className="text-lg font-semibold">{viewingBikeInventory.bikeId || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Date</label>
                  <div className="text-base">
                    {viewingBikeInventory.date ? new Date(viewingBikeInventory.date).toLocaleDateString('en-GB') : 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Branch</label>
                  <div className="text-base">{viewingBikeInventory.branch || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-blue-800">Vehicle Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Category</label>
                  <div className="text-lg font-semibold">{viewingBikeInventory.category || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Model</label>
                  <div className="text-lg font-semibold">{viewingBikeInventory.model || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Color</label>
                  <div className="text-base">{viewingBikeInventory.color || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Engine Number</label>
                  <div className="text-base">{viewingBikeInventory.engineNo || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Chassis Number</label>
                  <div className="text-base">{viewingBikeInventory.chassisNumber || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Workshop No</label>
                  <div className="text-base">{viewingBikeInventory.workshopNo || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
} 