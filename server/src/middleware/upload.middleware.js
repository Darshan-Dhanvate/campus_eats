import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// Storage configuration for menu item images
const menuItemStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'public/images/menu-items';
        ensureDirectoryExists(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generate unique filename: canteenId_timestamp_originalname
        const uniqueName = `${req.user._id}_${Date.now()}_${file.originalname}`;
        cb(null, uniqueName);
    }
});

// Storage configuration for canteen profile images
const canteenProfileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'public/images/canteen-profiles';
        ensureDirectoryExists(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generate unique filename: canteenId_profile_timestamp.ext
        const ext = path.extname(file.originalname);
        const uniqueName = `${req.user._id}_profile_${Date.now()}${ext}`;
        cb(null, uniqueName);
    }
});

// File filter to only allow images
const imageFileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
    }
};

// Configure multer for menu items
export const uploadMenuItemImage = multer({
    storage: menuItemStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: imageFileFilter
}).single('image');

// Configure multer for canteen profiles
export const uploadCanteenProfileImage = multer({
    storage: canteenProfileStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: imageFileFilter
}).single('profileImage');

// Helper function to delete old image files
export const deleteImageFile = (filePath) => {
    if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

// Helper function to get image URL
export const getImageUrl = (filename, type = 'menu-item') => {
    if (!filename) return null;
    const baseUrl = process.env.BASE_URL || 'http://localhost:8000';
    const folder = type === 'profile' ? 'canteen-profiles' : 'menu-items';
    return `${baseUrl}/images/${folder}/${filename}`;
};