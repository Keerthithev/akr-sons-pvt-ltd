const VehicleAllocationCoupon = require('../models/VehicleAllocationCoupon');
const SalesTransaction = require('../models/SalesTransaction');
const InstallmentPlan = require('../models/InstallmentPlan');
const Customer = require('../models/Customer');
const Vehicle = require('../models/Vehicle.cjs');
const BikeInventory = require('../models/BikeInventory');
const AccountData = require('../models/AccountData');

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
    
    // Add interest amount to total for AKR leasing
    if (req.body.paymentMethod === 'Leasing via AKR') {
      const interestAmount = parseFloat(req.body.interestAmount) || 0;
      if (interestAmount > 0) {
        couponData.totalAmount = (parseFloat(couponData.totalAmount) + interestAmount).toString();
        couponData.balance = (parseFloat(couponData.balance) + interestAmount).toString();
      }
    }
    
    // Set down payment date and calculate cheque release date (4 days after down payment)
    if (req.body.downPayment && req.body.downPayment > 0) {
      const downPaymentDate = new Date();
      couponData.downPaymentDate = downPaymentDate;
      
      // Calculate cheque release date (4 days after down payment)
      const chequeReleaseDate = new Date(downPaymentDate);
      chequeReleaseDate.setDate(chequeReleaseDate.getDate() + 4);
      couponData.chequeReleaseDate = chequeReleaseDate;
      couponData.chequeReleased = false;
    }
    
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
      const numberOfInstallments = 3; // Always use 3 installments
      
      // Calculate installment amounts if balance > 0
      const balance = parseFloat(req.body.balance) || 0;
      
      if (balance > 0) {
        // Use the installment amounts from the form if provided, otherwise calculate equally
        const firstAmount = parseFloat(req.body.firstInstallment?.amount || req.body.firstInstallmentAmount || 0);
        const secondAmount = parseFloat(req.body.secondInstallment?.amount || req.body.secondInstallmentAmount || 0);
        
        let installments = [];
        
        if (firstAmount > 0 || secondAmount > 0) {
          // User has provided manual amounts
          if (firstAmount > 0) {
            installments.push(firstAmount);
          }
          
          if (secondAmount > 0 && numberOfInstallments >= 2) {
            installments.push(secondAmount);
          }
          
          // Calculate remaining installments
          const usedAmount = installments.reduce((sum, amount) => sum + amount, 0);
          const remainingBalance = balance - usedAmount;
          
          if (numberOfInstallments === 2 && installments.length === 1) {
            // For 2 installments, second gets remaining balance
            installments.push(remainingBalance);
          } else if (numberOfInstallments === 3) {
            // For 3 installments, calculate remaining equally
            const remainingInstallments = numberOfInstallments - installments.length;
            if (remainingInstallments > 0 && remainingBalance > 0) {
              const equalAmount = remainingBalance / remainingInstallments;
              for (let i = 0; i < remainingInstallments; i++) {
                installments.push(equalAmount);
              }
            }
          }
        } else {
          // Default calculation - divide equally
          if (numberOfInstallments === 1) {
            installments = [balance];
          } else if (numberOfInstallments === 2) {
            const equalAmount = balance / 2;
            installments = [equalAmount, equalAmount];
          } else {
            const equalAmount = balance / 3;
            installments = [equalAmount, equalAmount, equalAmount];
          }
        }
        
        // Set installment data - use dates from frontend if provided, otherwise use defaults
        const firstDate = req.body.firstInstallment?.date || req.body.firstInstallmentDate || 
                         new Date(purchaseDate.getFullYear(), purchaseDate.getMonth() + 1, purchaseDate.getDate());
        const secondDate = req.body.secondInstallment?.date || req.body.secondInstallmentDate || 
                          new Date(purchaseDate.getFullYear(), purchaseDate.getMonth() + 2, purchaseDate.getDate());
        const thirdDate = req.body.thirdInstallment?.date || req.body.thirdInstallmentDate || 
                         new Date(purchaseDate.getFullYear(), purchaseDate.getMonth() + 3, purchaseDate.getDate());
        
        couponData.firstInstallment = {
          amount: installments[0] || 0,
          date: new Date(firstDate)
        };
        
        if (numberOfInstallments >= 2) {
          couponData.secondInstallment = {
            amount: installments[1] || 0,
            date: new Date(secondDate)
          };
        }
        
        if (numberOfInstallments >= 3) {
          couponData.thirdInstallment = {
            amount: installments[2] || 0,
            date: new Date(thirdDate)
          };
        }
      }
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

    // Get deposit information for each coupon
    const couponsWithDepositInfo = await Promise.all(
      vehicleAllocationCoupons.map(async (coupon) => {
        const couponObj = coupon.toObject();
        
        // Check if there are payment collection records for this coupon and sum them
        const depositRecords = await AccountData.aggregate([
          {
            $match: {
              $or: [
                { relatedCouponId: coupon.couponId },
                { details: { $regex: coupon.couponId, $options: 'i' } }
              ],
              amount: { $gt: 0 } // Only positive amounts (collections, not deductions)
            }
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: '$amount' },
              latestDate: { $max: '$date' },
              count: { $sum: 1 }
            }
          }
        ]);
        
        // Add deposit information to the coupon
        const depositInfo = depositRecords[0];
        couponObj.hasDeposit = !!depositInfo;
        couponObj.depositAmount = depositInfo ? depositInfo.totalAmount : 0;
        couponObj.depositDate = depositInfo ? depositInfo.latestDate : null;
        couponObj.depositCount = depositInfo ? depositInfo.count : 0;
        
        // Debug logging
        if (couponObj.hasDeposit) {
          console.log(`Found payment collections for ${coupon.couponId}:`, {
            totalAmount: depositInfo.totalAmount,
            latestDate: depositInfo.latestDate,
            count: depositInfo.count
          });
        }
        
        return couponObj;
      })
    );

    const total = await VehicleAllocationCoupon.countDocuments(query);

    res.json({
      vehicleAllocationCoupons: couponsWithDepositInfo,
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
    
    // Add interest amount to total for AKR leasing
    if (req.body.paymentMethod === 'Leasing via AKR') {
      const interestAmount = parseFloat(req.body.interestAmount) || 0;
      if (interestAmount > 0) {
        updateData.totalAmount = (parseFloat(updateData.totalAmount) + interestAmount).toString();
        updateData.balance = (parseFloat(updateData.balance) + interestAmount).toString();
      }
    }
    
    // Handle installment calculation for AKR leasing
    if (req.body.paymentMethod === 'Leasing via AKR' && req.body.dateOfPurchase && req.body.balance > 0) {
      const purchaseDate = new Date(req.body.dateOfPurchase);
      const numberOfInstallments = 3; // Always use 3 installments
      const balance = parseFloat(req.body.balance) || 0;
      
      if (balance > 0) {
        // Use the installment amounts from the form if provided, otherwise calculate equally
        const firstAmount = parseFloat(req.body.firstInstallment?.amount || req.body.firstInstallmentAmount || 0);
        const secondAmount = parseFloat(req.body.secondInstallment?.amount || req.body.secondInstallmentAmount || 0);
        
        let installments = [];
        
        if (firstAmount > 0 || secondAmount > 0) {
          // User has provided manual amounts
          if (firstAmount > 0) {
            installments.push(firstAmount);
          }
          
          if (secondAmount > 0 && numberOfInstallments >= 2) {
            installments.push(secondAmount);
          }
          
          // Calculate remaining installments
          const usedAmount = installments.reduce((sum, amount) => sum + amount, 0);
          const remainingBalance = balance - usedAmount;
          
          if (numberOfInstallments === 2 && installments.length === 1) {
            // For 2 installments, second gets remaining balance
            installments.push(remainingBalance);
          } else if (numberOfInstallments === 3) {
            // For 3 installments, calculate remaining equally
            const remainingInstallments = numberOfInstallments - installments.length;
            if (remainingInstallments > 0 && remainingBalance > 0) {
              const equalAmount = remainingBalance / remainingInstallments;
              for (let i = 0; i < remainingInstallments; i++) {
                installments.push(equalAmount);
              }
            }
          }
        } else {
          // Default calculation - divide equally
          if (numberOfInstallments === 1) {
            installments = [balance];
          } else if (numberOfInstallments === 2) {
            const equalAmount = balance / 2;
            installments = [equalAmount, equalAmount];
          } else {
            const equalAmount = balance / 3;
            installments = [equalAmount, equalAmount, equalAmount];
          }
        }
        
        // Set installment data - use dates from frontend if provided, otherwise use defaults
        const firstDate = req.body.firstInstallment?.date || req.body.firstInstallmentDate || 
                         new Date(purchaseDate.getFullYear(), purchaseDate.getMonth() + 1, purchaseDate.getDate());
        const secondDate = req.body.secondInstallment?.date || req.body.secondInstallmentDate || 
                          new Date(purchaseDate.getFullYear(), purchaseDate.getMonth() + 2, purchaseDate.getDate());
        const thirdDate = req.body.thirdInstallment?.date || req.body.thirdInstallmentDate || 
                         new Date(purchaseDate.getFullYear(), purchaseDate.getMonth() + 3, purchaseDate.getDate());
        
        updateData.firstInstallment = {
          amount: installments[0] || 0,
          date: new Date(firstDate)
        };
        
        if (numberOfInstallments >= 2) {
          updateData.secondInstallment = {
            amount: installments[1] || 0,
            date: new Date(secondDate)
          };
        }
        
        if (numberOfInstallments >= 3) {
          updateData.thirdInstallment = {
            amount: installments[2] || 0,
            date: new Date(thirdDate)
          };
        }
      }
    }
    
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
          chassisNumbers: [],
          engineChassisMap: [] // New array to store engine-chassis mappings
        };
      }
      
      // Add engine-chassis mapping
      if (bike.engineNo && bike.chassisNumber) {
        vehicleData[modelKey].engineChassisMap.push({
          engineNo: bike.engineNo,
          chassisNo: bike.chassisNumber
        });
        
        // Also keep separate arrays for backward compatibility
        if (!vehicleData[modelKey].engineNumbers.includes(bike.engineNo)) {
          vehicleData[modelKey].engineNumbers.push(bike.engineNo);
        }
        
        if (!vehicleData[modelKey].chassisNumbers.includes(bike.chassisNumber)) {
          vehicleData[modelKey].chassisNumbers.push(bike.chassisNumber);
        }
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

    // Calculate arrears statistics using the same logic as getAllVehicleAllocationCoupons
    // This ensures consistency with the frontend table display
    const allCoupons = await VehicleAllocationCoupon.find().lean();
    
    // Get deposit information for each coupon (same logic as getAllVehicleAllocationCoupons)
    const couponsWithDepositInfo = await Promise.all(
      allCoupons.map(async (coupon) => {
        const couponObj = { ...coupon };
        
        // Check if there are payment collection records for this coupon and sum them
        const depositRecords = await AccountData.aggregate([
          {
            $match: {
              $or: [
                { relatedCouponId: coupon.couponId },
                { details: { $regex: coupon.couponId, $options: 'i' } }
              ],
              amount: { $gt: 0 } // Only positive amounts (collections, not deductions)
            }
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: '$amount' }
            }
          }
        ]);
        
        // Add deposit information to the coupon
        const depositInfo = depositRecords[0];
        couponObj.depositAmount = depositInfo ? depositInfo.totalAmount : 0;
        
        // Debug: Show what was found for this coupon
        console.log(`DEBUG ${coupon.couponId}: Found ${depositRecords.length} collection records, total amount: ${couponObj.depositAmount}`);
        
        return couponObj;
      })
    );
    
    // Calculate arrears statistics from the enriched data
    let totalArrears = 0;
    let couponsWithArrears = 0;
    
    for (const coupon of couponsWithDepositInfo) {
      const downPayment = coupon.downPayment || 0;
      const depositAmount = coupon.depositAmount || 0;
      const arrears = Math.max(0, downPayment - depositAmount);
      
      if (arrears > 0) {
        totalArrears += arrears;
        couponsWithArrears++;
      }
    }
    
    const arrearsStats = {
      totalArrears: Math.round(totalArrears * 100) / 100, // Round to 2 decimal places
      couponsWithArrears,
      averageArrears: couponsWithArrears > 0 ? Math.round((totalArrears / couponsWithArrears) * 100) / 100 : 0
    };

    // Debug: Show detailed calculation for each coupon using enriched data
    console.log('=== DETAILED ARREARS CALCULATION ===');
    console.log('Total coupons processed:', couponsWithDepositInfo.length);
    
    for (const coupon of couponsWithDepositInfo) {
      const downPayment = coupon.downPayment || 0;
      const depositAmount = coupon.depositAmount || 0;
      const arrears = Math.max(0, downPayment - depositAmount);
      
      console.log(`${coupon.couponId}: Down Payment=${downPayment}, Collected=${depositAmount}, Arrears=${arrears}`);
      
      if (arrears > 0) {
        console.log(`  *** HAS ARREARS: ${coupon.couponId} ***`);
      }
    }
    
    // Debug: Show all AccountData records related to VAC coupons
    console.log('=== ACCOUNT DATA RECORDS ===');
    const allAccountData = await AccountData.find({
      $or: [
        { relatedCouponId: { $exists: true, $ne: '' } },
        { details: { $regex: 'VAC-', $options: 'i' } }
      ],
      amount: { $gt: 0 }
    }).lean();
    
    console.log('Total AccountData records found:', allAccountData.length);
    allAccountData.forEach(record => {
      console.log(`AccountData: relatedCouponId="${record.relatedCouponId}", details="${record.details}", amount=${record.amount}`);
    });
    
    console.log('=== FINAL ARREARS STATISTICS ===');
    console.log('Total Arrears:', arrearsStats.totalArrears);
    console.log('Coupons with Arrears:', arrearsStats.couponsWithArrears);
    console.log('Average Arrears:', arrearsStats.averageArrears);
    console.log('=== END ARREARS STATISTICS ===');

    // Get total collected amount
    const totalCollected = await AccountData.aggregate([
      {
        $match: {
          $or: [
            { relatedCouponId: { $exists: true, $ne: '' } },
            { details: { $regex: 'VAC-', $options: 'i' } }
          ],
          amount: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          totalCollected: { $sum: '$amount' }
        }
      }
    ]);

    // Debug: Show all AccountData records related to VAC coupons
    console.log('=== ACCOUNT DATA DEBUG ===');
    
    // First, check if there are ANY AccountData records
    const totalAccountData = await AccountData.countDocuments();
    console.log('Total AccountData records in database:', totalAccountData);
    
    // Check for records with positive amounts
    const positiveAmountRecords = await AccountData.countDocuments({ amount: { $gt: 0 } });
    console.log('AccountData records with positive amounts:', positiveAmountRecords);
    
    // Check for records related to VAC coupons
    const vacRelatedRecords = await AccountData.find({
      $or: [
        { relatedCouponId: { $exists: true, $ne: '' } },
        { details: { $regex: 'VAC-', $options: 'i' } }
      ],
      amount: { $gt: 0 }
    }).lean();
    
    console.log('Total VAC-related AccountData records found:', vacRelatedRecords.length);
    vacRelatedRecords.forEach(record => {
      console.log(`AccountData: relatedCouponId="${record.relatedCouponId}", details="${record.details}", amount=${record.amount}`);
    });
    console.log('=== END ACCOUNT DATA DEBUG ===');

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
        totalArrears: arrearsStats.totalArrears || 0,
        couponsWithArrears: arrearsStats.couponsWithArrears || 0,
        averageArrears: arrearsStats.averageArrears || 0,
        totalCollected: totalCollected[0]?.totalCollected || 0,
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

// Get cheque release reminders
exports.getChequeReleaseReminders = async (req, res, next) => {
  try {
    const today = new Date();
    const { includeReleased = 'false' } = req.query;
    
    // Get pending coupons with down payments
    const pendingReminders = await VehicleAllocationCoupon.find({
      downPayment: { $gt: 0 },
      chequeReleased: false
    })
    .select('couponId fullName contactNo downPayment downPaymentDate chequeReleaseDate vehicleType chequeReleasedDate')
    .sort({ chequeReleaseDate: 1 })
    .limit(20);

    // Calculate days since down payment and days until cheque release for pending reminders
    const pendingWithDays = pendingReminders.map(coupon => {
      const downPaymentDate = new Date(coupon.downPaymentDate);
      const releaseDate = new Date(coupon.chequeReleaseDate);
      
      // Days since down payment was made
      const daysSinceDownPayment = Math.ceil((today - downPaymentDate) / (1000 * 60 * 60 * 24));
      
      // Days until cheque release (or overdue)
      const daysUntilRelease = Math.ceil((releaseDate - today) / (1000 * 60 * 60 * 24));
      
      return {
        ...coupon.toObject(),
        daysSinceDownPayment: Math.max(0, daysSinceDownPayment),
        daysUntilRelease: daysUntilRelease,
        isOverdue: daysUntilRelease < 0,
        daysOverdue: daysUntilRelease < 0 ? Math.abs(daysUntilRelease) : 0,
        status: 'pending'
      };
    });

    let releasedReminders = [];
    
    // If includeReleased is true, also get released cheques
    if (includeReleased === 'true') {
      releasedReminders = await VehicleAllocationCoupon.find({
        downPayment: { $gt: 0 },
        chequeReleased: true
      })
      .select('couponId fullName contactNo downPayment downPaymentDate chequeReleaseDate vehicleType chequeReleasedDate')
      .sort({ chequeReleasedDate: -1 })
      .limit(20);

      // Calculate days since down payment and days since release for released reminders
      const releasedWithDays = releasedReminders.map(coupon => {
        const downPaymentDate = new Date(coupon.downPaymentDate);
        const releaseDate = new Date(coupon.chequeReleaseDate);
        const releasedDate = new Date(coupon.chequeReleasedDate);
        
        // Days since down payment was made
        const daysSinceDownPayment = Math.ceil((today - downPaymentDate) / (1000 * 60 * 60 * 24));
        
        // Days since cheque was released
        const daysSinceReleased = Math.ceil((today - releasedDate) / (1000 * 60 * 60 * 24));
        
        return {
          ...coupon.toObject(),
          daysSinceDownPayment: Math.max(0, daysSinceDownPayment),
          daysSinceReleased: Math.max(0, daysSinceReleased),
          status: 'released'
        };
      });

      releasedReminders = releasedWithDays;
    }

    // Combine pending and released reminders
    const allReminders = [...pendingWithDays, ...releasedReminders];

    res.json({
      reminders: allReminders,
      totalReminders: pendingWithDays.length,
      totalReleased: releasedReminders.length,
      overdueCount: pendingWithDays.filter(r => r.isOverdue).length
    });
  } catch (err) {
    next(err);
  }
};

// Mark cheque as released
exports.markChequeAsReleased = async (req, res, next) => {
  try {
    const { couponId } = req.params;
    
    const coupon = await VehicleAllocationCoupon.findOneAndUpdate(
      { couponId: couponId },
      { 
        chequeReleased: true,
        chequeReleasedDate: new Date()
      },
      { new: true }
    );

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.json({
      message: 'Cheque marked as released successfully',
      coupon
    });
  } catch (err) {
    next(err);
  }
};