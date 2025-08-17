const BikeInventory = require('../models/BikeInventory');
const Vehicle = require('../models/Vehicle.cjs');

// Get all bike inventory with pagination and search
const getAllBikeInventory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const dateFilter = req.query.dateFilter || '';
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = {
        $or: [
          { bikeId: { $regex: search, $options: 'i' } },
          { branch: { $regex: search, $options: 'i' } },
          { brand: { $regex: search, $options: 'i' } },
          { model: { $regex: search, $options: 'i' } },
          { color: { $regex: search, $options: 'i' } },
          { engineNo: { $regex: search, $options: 'i' } },
          { chassisNumber: { $regex: search, $options: 'i' } },
          { workshopNo: { $regex: search, $options: 'i' } },
          { registrationNo: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Add date filtering
    if (dateFilter) {
      const now = new Date();
      let startDate, endDate;
      
      switch (dateFilter) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
          break;
        case 'yesterday':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'last7days':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          break;
        case 'last30days':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          break;
        case 'thisMonth':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          break;
        case 'lastMonth':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          break;
      }
      
      if (startDate && endDate) {
        query.date = { $gte: startDate, $lt: endDate };
      }
    }

    const [bikes, total] = await Promise.all([
      BikeInventory.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      BikeInventory.countDocuments(query)
    ]);

    // Add category information to each bike
    const vehicles = await Vehicle.find();
    const vehicleMap = {};
    vehicles.forEach(vehicle => {
      vehicleMap[vehicle.name] = vehicle;
    });

    const bikesWithCategory = bikes.map(bike => {
      const vehicle = vehicleMap[bike.model];
      return {
        ...bike.toObject(),
        category: vehicle?.category || 'Unknown'
      };
    });

    const totalPages = Math.ceil(total / limit);

    res.json({
      data: bikesWithCategory,
      pagination: {
        current: page,
        total: totalPages,
        totalRecords: total,
        limit
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get bike inventory by ID
const getBikeInventoryById = async (req, res) => {
  try {
    const bike = await BikeInventory.findById(req.params.id);
    if (!bike) {
      return res.status(404).json({ message: 'Bike not found' });
    }
    res.json(bike);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get dropdown data for bike inventory form
const getBikeInventoryDropdownData = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    
    // Get unique categories
    const categories = [...new Set(vehicles.map(v => v.category))];
    
    // Get vehicles grouped by category
    const vehiclesByCategory = {};
    categories.forEach(category => {
      vehiclesByCategory[category] = vehicles.filter(v => v.category === category);
    });
    
    // Get all available colors
    const allColors = [...new Set(vehicles.flatMap(v => v.colors?.map(c => c.name) || []))];
    
    // Get next available bike ID
    const allBikes = await BikeInventory.find({}, 'bikeId');
    let maxBikeId = 0;
    
    allBikes.forEach(bike => {
      if (bike.bikeId) {
        const bikeIdStr = bike.bikeId.toString();
        const numericPart = parseInt(bikeIdStr.match(/\d+/)?.[0] || '0');
        if (numericPart > maxBikeId) {
          maxBikeId = numericPart;
        }
      }
    });
    
    const nextBikeId = maxBikeId + 1;
    
    res.json({
      categories,
      vehiclesByCategory,
      allColors,
      nextBikeId: nextBikeId.toString(),
      vehicles: vehicles.map(v => ({
        name: v.name,
        category: v.category,
        price: v.price,
        colors: v.colors?.map(c => c.name) || []
      })).sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new bike inventory
const createBikeInventory = async (req, res) => {
  try {
    const bikeData = { ...req.body };
    
    // Auto-generate bike ID if not provided
    if (!bikeData.bikeId || bikeData.bikeId.trim() === '') {
      // Get all bike IDs and find the highest numeric value
      const allBikes = await BikeInventory.find({}, 'bikeId');
      let maxBikeId = 0;
      
      allBikes.forEach(bike => {
        if (bike.bikeId) {
          const bikeIdStr = bike.bikeId.toString();
          const numericPart = parseInt(bikeIdStr.match(/\d+/)?.[0] || '0');
          if (numericPart > maxBikeId) {
            maxBikeId = numericPart;
          }
        }
      });
      
      const nextBikeId = maxBikeId + 1;
      bikeData.bikeId = nextBikeId.toString();
    }
    
    // Auto-fill brand and prices if model is provided
    if (bikeData.model) {
      const vehicle = await Vehicle.findOne({ name: bikeData.model });
      if (vehicle) {
        bikeData.brand = 'Bajaj'; // Default brand
        if (!bikeData.unitCostPrice || bikeData.unitCostPrice === 0) {
          bikeData.unitCostPrice = Math.round(vehicle.price * 0.8); // 80% of selling price
        }
        if (!bikeData.sellingPrice || bikeData.sellingPrice === 0) {
          bikeData.sellingPrice = vehicle.price;
        }
      }
    }
    
    const bike = new BikeInventory(bikeData);
    const savedBike = await bike.save();
    
    // Auto-update vehicle stock quantity
    await updateVehicleStock(savedBike.model);
    
    res.status(201).json({
      ...savedBike.toObject(),
      message: 'Bike inventory created and vehicle stock updated successfully'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update bike inventory
const updateBikeInventory = async (req, res) => {
  try {
    const oldBike = await BikeInventory.findById(req.params.id);
    if (!oldBike) {
      return res.status(404).json({ message: 'Bike not found' });
    }

    const bike = await BikeInventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    // Auto-update vehicle stock quantity for both old and new model
    await updateVehicleStock(oldBike.model);
    if (req.body.model && req.body.model !== oldBike.model) {
      await updateVehicleStock(req.body.model);
    }
    
    res.json({
      ...bike.toObject(),
      message: 'Bike inventory updated and vehicle stock updated successfully'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete bike inventory
const deleteBikeInventory = async (req, res) => {
  try {
    const bike = await BikeInventory.findById(req.params.id);
    if (!bike) {
      return res.status(404).json({ message: 'Bike not found' });
    }

    await BikeInventory.findByIdAndDelete(req.params.id);
    
    // Auto-update vehicle stock quantity
    await updateVehicleStock(bike.model);
    
    res.json({ 
      message: 'Bike deleted successfully and vehicle stock updated'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to update vehicle stock quantity
const updateVehicleStock = async (modelName) => {
  try {
    // Count total bikes for this model in inventory
    const totalBikes = await BikeInventory.countDocuments({ model: modelName });
    
    // Find the vehicle and update its stock quantity
    const vehicle = await Vehicle.findOne({ name: modelName });
    if (vehicle) {
      vehicle.stockQuantity = totalBikes;
      vehicle.available = totalBikes > 0;
      await vehicle.save();
      console.log(`✅ Updated ${modelName} stock to ${totalBikes} units`);
    } else {
      console.log(`⚠️ Vehicle not found for model: ${modelName}`);
    }
  } catch (error) {
    console.error(`❌ Error updating stock for ${modelName}:`, error);
  }
};

// Get detailed stock information by model and color
const getDetailedStockInfo = async (req, res) => {
  try {
    // Get all bikes from inventory with individual details
    const bikes = await BikeInventory.find({}).sort({ model: 1, color: 1 });
    
    // Group bikes by model and color, but show individual bikes
    const stockByModel = {};
    
    bikes.forEach(bike => {
      if (!stockByModel[bike.model]) {
        stockByModel[bike.model] = {
          model: bike.model,
          category: bike.category,
          totalStock: 0,
          bikes: []
        };
      }
      
      // Clean up color data - handle combined colors like "Black & Blue"
      let cleanColor = bike.color;
      if (cleanColor && cleanColor.includes('&')) {
        // Split combined colors and take the first one
        const colors = cleanColor.split('&').map(c => c.trim());
        cleanColor = colors[0]; // Take the first color
      }
      
      // Add individual bike with its cleaned color
      stockByModel[bike.model].bikes.push({
        bikeId: bike.bikeId,
        color: cleanColor,
        originalColor: bike.color, // Keep original for reference
        engineNo: bike.engineNo,
        chassisNumber: bike.chassisNumber,
        workshopNo: bike.workshopNo,
        date: bike.date
      });
      
      stockByModel[bike.model].totalStock += bike.stockQuantity || 1;
    });
    
    // Convert to array format for easier frontend consumption
    const stockArray = Object.values(stockByModel).map(model => ({
      ...model,
      // Group bikes by cleaned color for display
      colors: model.bikes.reduce((acc, bike) => {
        if (!acc[bike.color]) {
          acc[bike.color] = [];
        }
        acc[bike.color].push(bike);
        return acc;
      }, {})
    }));
    
    // Sort by total stock (descending)
    stockArray.sort((a, b) => b.totalStock - a.totalStock);
    
    res.json({
      stockInfo: stockArray,
      totalModels: stockArray.length,
      totalBikes: stockArray.reduce((sum, model) => sum + model.totalStock, 0)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Clean up bike inventory color data
const cleanupBikeInventoryColors = async (req, res) => {
  try {
    // Find all bikes with combined colors (containing '&')
    const bikesWithCombinedColors = await BikeInventory.find({
      color: { $regex: /&/ }
    });

    let updatedCount = 0;
    
    for (const bike of bikesWithCombinedColors) {
      const colors = bike.color.split('&').map(c => c.trim());
      const firstColor = colors[0]; // Take the first color
      
      // Update the bike with the first color only
      await BikeInventory.findByIdAndUpdate(bike._id, {
        color: firstColor
      });
      
      updatedCount++;
      console.log(`Updated bike ${bike.bikeId}: "${bike.color}" → "${firstColor}"`);
    }

    res.json({
      message: `Cleaned up ${updatedCount} bike color entries`,
      updatedCount,
      details: bikesWithCombinedColors.map(bike => ({
        bikeId: bike.bikeId,
        oldColor: bike.color,
        newColor: bike.color.split('&')[0].trim()
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Bulk import bike inventory
const bulkImportBikeInventory = async (req, res) => {
  try {
    const { bikes } = req.body;
    
    if (!Array.isArray(bikes) || bikes.length === 0) {
      return res.status(400).json({ message: 'Invalid data format' });
    }

    const savedBikes = await BikeInventory.insertMany(bikes);
    res.status(201).json({
      message: `${savedBikes.length} bikes imported successfully`,
      count: savedBikes.length
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get bike inventory statistics
const getBikeInventoryStats = async (req, res) => {
  try {
    const stats = await BikeInventory.aggregate([
      {
        $group: {
          _id: null,
          totalBikes: { $sum: 1 },
          totalStockQuantity: { $sum: '$stockQuantity' },
          totalCostValue: { $sum: { $multiply: ['$unitCostPrice', '$stockQuantity'] } },
          totalSellingValue: { $sum: { $multiply: ['$sellingPrice', '$stockQuantity'] } },
          averageCostPrice: { $avg: '$unitCostPrice' },
          averageSellingPrice: { $avg: '$sellingPrice' }
        }
      }
    ]);

    const brandStats = await BikeInventory.aggregate([
      {
        $group: {
          _id: '$brand',
          count: { $sum: 1 },
          totalStock: { $sum: '$stockQuantity' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const branchStats = await BikeInventory.aggregate([
      {
        $group: {
          _id: '$branch',
          count: { $sum: 1 },
          totalStock: { $sum: '$stockQuantity' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const result = stats[0] || {
      totalBikes: 0,
      totalStockQuantity: 0,
      totalCostValue: 0,
      totalSellingValue: 0,
      averageCostPrice: 0,
      averageSellingPrice: 0
    };

    res.json({
      ...result,
      brandStats,
      branchStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllBikeInventory,
  getBikeInventoryById,
  getBikeInventoryDropdownData,
  createBikeInventory,
  updateBikeInventory,
  deleteBikeInventory,
  bulkImportBikeInventory,
  getBikeInventoryStats,
  getDetailedStockInfo,
  cleanupBikeInventoryColors
}; 