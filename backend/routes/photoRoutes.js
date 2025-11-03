const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    uploadPhoto,
    getPhotosByEvent,
    getPhotoById,
    updatePhoto,
    deletePhoto,
    tagFace
} = require('../controllers/photoController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB limit
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
});

// Check file type
function checkFileType(file, cb) {
    // Allowed extensions
    const filetypes = /jpeg|jpg|png|gif/;
    // Check extension
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime type
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

router.use(protect); // All routes require authentication

// Photo routes
router.post('/', authorize('photographer', 'admin'), upload.single('photo'), uploadPhoto);
router.get('/event/:eventId', getPhotosByEvent);
router.get('/:id', getPhotoById);
router.put('/:id', authorize('photographer', 'admin'), updatePhoto);
router.delete('/:id', authorize('photographer', 'admin'), deletePhoto);
router.post('/:id/tag', tagFace);

module.exports = router;