const VehicleAllocationCoupon = require('../models/VehicleAllocationCoupon');
const SalesTransaction = require('../models/SalesTransaction');
const InstallmentPlan = require('../models/InstallmentPlan');
const Customer = require('../models/Customer');
const Vehicle = require('../models/Vehicle.cjs');
const BikeInventory = require('../models/BikeInventory');

// Generate the next couponId in the format 'VAC-001', 'VAC-002', ...
async function generateCouponId() {
  const latest = await VehicleAllocationCoupon.findOne({ couponId: /^VAC-\d+$/i })
    .sort({ createdAt: -1 })
    .lean();
  let nextNum = 1;
  if (latest && latest.couponId) {
    const match = latest.couponId.match(/VAC-(\d+)/i);
    if (match) {
      nextNum = parseInt(match[1], 10) + 1;
    }
  }
  const padded = String(nextNum).padStart(3, '0');
  return `VAC-${padded}`;
}

// Create a new vehicle allocation coupon
exports.createVehicleAllocationCoupon = async (req, res, next) => {
  try {
    const couponId = await generateCouponId();
    
    // Auto-generate workshop number if not provided
    let workshopNo = req.body.workshopNo;
    if (!workshopNo || workshopNo.trim() === '') {
      const lastCoupon = await VehicleAllocationCoupon.findOne().sort({ workshopNo: -1 });
      let nextWorkshopNo = 1;
      
      if (lastCoupon && lastCoupon.workshopNo) {
        const lastWorkshopNoStr = lastCoupon.workshopNo.toString();
        const lastNumber = parseInt(lastWorkshopNoStr.match(/\d+/)?.[0] || '0');
        nextWorkshopNo = lastNumber + 1;
      }
      
      workshopNo = nextWorkshopNo.toString();
    }
    
    // Auto-calculate installment dates if payment method is leasing or if there's a balance
    let couponData = { ...req.body, couponId, workshopNo };
    
    // Set status based on payment method and balance
    if (req.body.paymentMethod === 'Leasing via AKR') {
      // For "Leasing via AKR" - status will be "Pending" initially, updated based on installments
      couponData.status = 'Pending';
    } else if (req.body.paymentMethod === 'Full Payment' || req.body.paymentMethod === 'Leasing via Other Company') {
      // For "Full Payment" or "Leasing via Other Company" - automatically mark as "Completed"
      couponData.status = 'Completed';
    }
    
    if ((req.body.paymentMethod === 'Leasing via AKR' || parseFloat(req.body.balance) > 0) && req.body.dateOfPurchase) {
      const purchaseDate = new Date(req.body.dateOfPurchase);
      
      // Calculate installment amounts if balance > 0
      const balance = parseFloat(req.body.balance) || 0;
      const installmentAmount = balance > 0 ? balance / 3 : 0;
      
      // Set installment dates with 1-month gaps
      couponData.firstInstallment = {
        amount: installmentAmount,
        date: new Date(purchaseDate.getFullYear(), purchaseDate.getMonth() + 1, purchaseDate.getDate())
      };
      
      couponData.secondInstallment = {
        amount: installmentAmount,
        date: new Date(purchaseDate.getFullYear(), purchaseDate.getMonth() + 2, purchaseDate.getDate())
      };
      
      couponData.thirdInstallment = {
        amount: installmentAmount,
        date: new Date(purchaseDate.getFullYear(), purchaseDate.getMonth() + 3, purchaseDate.getDate())
      };
    }
    
    const vehicleAllocationCoupon = new VehicleAllocationCoupon(couponData);
    await vehicleAllocationCoupon.save();

    // Reduce stock quantity when a vehicle is sold
    try {
      // Reduce stock in Vehicle model
      if (req.body.vehicleType) {
        const vehicle = await Vehicle.findOne({ name: req.body.vehicleType });
        if (vehicle && vehicle.stockQuantity > 0) {
          vehicle.stockQuantity = Math.max(0, vehicle.stockQuantity - 1);
          await vehicle.save();
        }
      }

      // Reduce stock in BikeInventory model
      if (req.body.engineNo) {
        const bikeInventory = await BikeInventory.findOne({ engineNo: req.body.engineNo });
        if (bikeInventory && bikeInventory.stockQuantity > 0) {
          bikeInventory.stockQuantity = Math.max(0, bikeInventory.stockQuantity - 1);
          await bikeInventory.save();
        }
      }
    } catch (stockError) {
      console.error('Error reducing stock:', stockError);
      // Don't fail the coupon creation if stock reduction fails
    }

    // Automatically create Customer record
    const customer = new Customer({
      fullName: req.body.fullName,
      nicDrivingLicense: req.body.nicNo,
      phoneNo: req.body.contactNo,
      address: req.body.address,
      occupation: req.body.occupation,
      dateOfPurchase: req.body.dateOfPurchase
    });
    await customer.save();

    // Note: Sales Transaction and Installment Plan data are now displayed directly from Vehicle Allocation Coupon
    // No separate records are created - all data comes from the coupon itself

    res.status(201).json({
      vehicleAllocationCoupon,
      customer,
      message: 'Vehicle Allocation Coupon created successfully with automatic Customer record generation'
    });
  } catch (err) {
    next(err);
  }
};

// Get all vehicle allocation coupons with pagination and search
exports.getAllVehicleAllocationCoupons = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', paymentType = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (search) {
      query.$or = [
        { couponId: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } },
        { nicNo: { $regex: search, $options: 'i' } },
        { vehicleType: { $regex: search, $options: 'i' } },
        { engineNo: { $regex: search, $options: 'i' } },
        { chassisNo: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (paymentType) {
      query.paymentType = paymentType;
    }

    const vehicleAllocationCoupons = await VehicleAllocationCoupon.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await VehicleAllocationCoupon.countDocuments(query);

    res.json({
      vehicleAllocationCoupons,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    next(err);
  }
};

// Get vehicle allocation coupon by ID
exports.getVehicleAllocationCouponById = async (req, res, next) => {
  try {
    const vehicleAllocationCoupon = await VehicleAllocationCoupon.findById(req.params.id);
    if (!vehicleAllocationCoupon) {
      return res.status(404).json({ message: 'Vehicle allocation coupon not found' });
    }
    res.json(vehicleAllocationCoupon);
  } catch (err) {
    next(err);
  }
};

// Update vehicle allocation coupon
exports.updateVehicleAllocationCoupon = async (req, res, next) => {
  try {
    // First, get the current coupon to check installment status
    const currentCoupon = await VehicleAllocationCoupon.findById(req.params.id);
    if (!currentCoupon) {
      return res.status(404).json({ message: 'Vehicle allocation coupon not found' });
    }

    // Check if this is an installment payment update
    const isInstallmentUpdate = req.body.firstInstallment || req.body.secondInstallment || req.body.thirdInstallment;
    
    let updateData = { ...req.body };
    
    // Status logic based on payment method and installment payments
    if (currentCoupon.paymentMethod === 'Leasing via AKR') {
      // For "Leasing via AKR" - status depends on installment payments
      if (isInstallmentUpdate) {
        const updatedCoupon = { ...currentCoupon.toObject(), ...req.body };
        
        // Check if all installments are paid
        const firstPaid = (updatedCoupon.firstInstallment?.paidAmount || 0) >= (updatedCoupon.firstInstallment?.amount || 0);
        const secondPaid = (updatedCoupon.secondInstallment?.paidAmount || 0) >= (updatedCoupon.secondInstallment?.amount || 0);
        const thirdPaid = (updatedCoupon.thirdInstallment?.paidAmount || 0) >= (updatedCoupon.thirdInstallment?.amount || 0);
        
        // If all installments are paid, update status to 'Completed'
        if (firstPaid && secondPaid && thirdPaid) {
          updateData.status = 'Completed';
        } else if (firstPaid || secondPaid || thirdPaid) {
          // If some installments are paid, keep status as 'Pending'
          updateData.status = 'Pending';
        }
      }
    } else if (currentCoupon.paymentMethod === 'Full Payment' || currentCoupon.paymentMethod === 'Leasing via Other Company') {
      // For "Full Payment" or "Leasing via Other Company" - automatically mark as "Completed"
      updateData.status = 'Completed';
    }

    const vehicleAllocationCoupon = await VehicleAllocationCoupon.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    // Update related Customer record
    const customer = await Customer.findOneAndUpdate(
      { 
        fullName: req.body.fullName,
        phoneNo: req.body.contactNo 
      },
      {
        fullName: req.body.fullName,
        nicDrivingLicense: req.body.nicNo,
        phoneNo: req.body.contactNo,
        address: req.body.address,
        occupation: req.body.occupation,
        dateOfPurchase: req.body.dateOfPurchase
      },
      { new: true, upsert: true }
    );

    // Note: Sales Transaction and Installment Plan data are updated directly in the Vehicle Allocation Coupon
    // No separate record updates needed - all data is stored in the coupon itself

    res.json({
      vehicleAllocationCoupon,
      customer: customer ? 'Updated' : 'Not found',
      message: 'Vehicle Allocation Coupon updated successfully with automatic Customer record update'
    });
  } catch (err) {
    next(err);
  }
};

// Delete vehicle allocation coupon
exports.deleteVehicleAllocationCoupon = async (req, res, next) => {
  try {
    const vehicleAllocationCoupon = await VehicleAllocationCoupon.findById(req.params.id);
    if (!vehicleAllocationCoupon) {
      return res.status(404).json({ message: 'Vehicle allocation coupon not found' });
    }

    // Delete related Customer record
    await Customer.deleteMany({ 
      fullName: vehicleAllocationCoupon.fullName,
      phoneNo: vehicleAllocationCoupon.contactNo 
    });

    // Note: No separate Sales Transaction or Installment Plan records to delete
    // All data is stored directly in the Vehicle Allocation Coupon

    // Delete the vehicle allocation coupon
    await VehicleAllocationCoupon.findByIdAndDelete(req.params.id);

    res.json({ 
      message: 'Vehicle allocation coupon and related customer record deleted successfully',
      deletedRecords: {
        coupon: 'Deleted',
        customer: 'Deleted'
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get dropdown data for vehicle allocation coupon form
exports.getVehicleAllocationCouponDropdownData = async (req, res, next) => {
  try {
    const BikeInventory = require('../models/BikeInventory');
    
    // Get all bike inventory items for dropdown
    const bikeInventory = await BikeInventory.find();
    
    // Get all sold/allocated vehicles to filter them out
    const soldVehicles = await VehicleAllocationCoupon.find({}, 'engineNo chassisNo');
    const soldEngineNumbers = soldVehicles.map(v => v.engineNo).filter(Boolean);
    const soldChassisNumbers = soldVehicles.map(v => v.chassisNo).filter(Boolean);
    
    // Generate next workshop number
    const lastCoupon = await VehicleAllocationCoupon.findOne().sort({ workshopNo: -1 });
    let nextWorkshopNo = 1;
    
    if (lastCoupon && lastCoupon.workshopNo) {
      const lastWorkshopNoStr = lastCoupon.workshopNo.toString();
      const lastNumber = parseInt(lastWorkshopNoStr.match(/\d+/)?.[0] || '0');
      nextWorkshopNo = lastNumber + 1;
    }
    
    // Group bike inventory by model and collect engine/chassis numbers (excluding sold ones)
    const vehicleData = {};
    
    bikeInventory.forEach(bike => {
      // Skip if this bike is already sold/allocated
      if (soldEngineNumbers.includes(bike.engineNo) || soldChassisNumbers.includes(bike.chassisNumber)) {
        return;
      }
      
      const modelKey = `${bike.brand} ${bike.model}`;
      
      if (!vehicleData[modelKey]) {
        vehicleData[modelKey] = {
          name: modelKey,
          brand: bike.brand,
          model: bike.model,
          category: bike.category,
          price: bike.sellingPrice,
          color: bike.color,
          engineNumbers: [],
          chassisNumbers: []
        };
      }
      
      // Add engine number if not already present
      if (bike.engineNo && !vehicleData[modelKey].engineNumbers.includes(bike.engineNo)) {
        vehicleData[modelKey].engineNumbers.push(bike.engineNo);
      }
      
      // Add chassis number if not already present
      if (bike.chassisNumber && !vehicleData[modelKey].chassisNumbers.includes(bike.chassisNumber)) {
        vehicleData[modelKey].chassisNumbers.push(bike.chassisNumber);
      }
    });
    
    // Convert to array format
    const vehiclesArray = Object.values(vehicleData);
    
    res.json({
      nextWorkshopNo: nextWorkshopNo.toString(),
      vehicles: vehiclesArray,
      paymentMethods: ['Full Payment', 'Leasing via AKR', 'Leasing via Other Company'],
      paymentTypes: ['Cash', 'Bank Draft', 'Online', 'Credit Card']
    });
  } catch (err) {
    next(err);
  }
};

// Get vehicle allocation coupon statistics
exports.getVehicleAllocationCouponStats = async (req, res, next) => {
  try {
    const totalCoupons = await VehicleAllocationCoupon.countDocuments();
    const pendingCoupons = await VehicleAllocationCoupon.countDocuments({ status: 'Pending' });
    const completedCoupons = await VehicleAllocationCoupon.countDocuments({ status: 'Completed' });
    
    const totalAmount = await VehicleAllocationCoupon.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const totalBalance = await VehicleAllocationCoupon.aggregate([
      { $group: { _id: null, total: { $sum: '$balance' } } }
    ]);

    const totalDownPayment = await VehicleAllocationCoupon.aggregate([
      { $group: { _id: null, total: { $sum: '$downPayment' } } }
    ]);

    const cashPayments = await VehicleAllocationCoupon.countDocuments({ paymentType: 'Cash' });
    const bankDraftPayments = await VehicleAllocationCoupon.countDocuments({ paymentType: 'Bank Draft' });
    const onlinePayments = await VehicleAllocationCoupon.countDocuments({ paymentType: 'Online' });
    const creditCardPayments = await VehicleAllocationCoupon.countDocuments({ paymentType: 'Credit Card' });

    const recentCoupons = await VehicleAllocationCoupon.find()
      .sort({ date: -1 })
      .limit(5)
      .select('couponId fullName vehicleType totalAmount status date');

    const topVehicles = await VehicleAllocationCoupon.aggregate([
      { $group: { _id: '$vehicleType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      overall: {
        totalCoupons,
        pendingCoupons,
        completedCoupons,
        totalAmount: totalAmount[0]?.total || 0,
        totalBalance: totalBalance[0]?.total || 0,
        totalDownPayment: totalDownPayment[0]?.total || 0,
        cashPayments,
        bankDraftPayments,
        onlinePayments,
        creditCardPayments
      },
      recentCoupons,
      topVehicles
    });
  } catch (err) {
    next(err);
  }
}; 