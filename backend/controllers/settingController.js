const Setting = require('../models/Setting');

// Get settings (singleton)
exports.getSettings = async (req, res, next) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({});
    }
    res.json(setting);
  } catch (err) {
    next(err);
  }
};

// Update settings (singleton)
exports.updateSettings = async (req, res, next) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({});
    }
    setting.mode = req.body.mode || setting.mode;
    setting.bannerText = req.body.bannerText || setting.bannerText;
    setting.bannerHeading = req.body.bannerHeading || setting.bannerHeading;
    setting.bannerSubheading = req.body.bannerSubheading || setting.bannerSubheading;
    // Handle bannerImages as array or append single
    if (Array.isArray(req.body.bannerImages)) {
      setting.bannerImages = req.body.bannerImages;
    } else if (req.body.bannerImage) {
      // For backward compatibility: append single
      if (!setting.bannerImages.includes(req.body.bannerImage)) {
        setting.bannerImages.push(req.body.bannerImage);
      }
    }
    if (typeof req.body.phone === 'string') setting.phone = req.body.phone;
    if (typeof req.body.email === 'string') setting.email = req.body.email;
    if (typeof req.body.address === 'string') setting.address = req.body.address;
    if (typeof req.body.socialLinks === 'object' && req.body.socialLinks !== null) {
      setting.socialLinks = {
        facebook: req.body.socialLinks.facebook || setting.socialLinks.facebook || '',
        instagram: req.body.socialLinks.instagram || setting.socialLinks.instagram || '',
        whatsapp: req.body.socialLinks.whatsapp || setting.socialLinks.whatsapp || '',
        twitter: req.body.socialLinks.twitter || setting.socialLinks.twitter || ''
      };
    }
    if (Array.isArray(req.body.openingHours)) {
      setting.openingHours = req.body.openingHours;
    }
    // Handle specialOffers
    if (Array.isArray(req.body.specialOffers)) {
      setting.specialOffers = req.body.specialOffers;
    }
    await setting.save();
    res.json(setting);
  } catch (err) {
    next(err);
  }
}; 