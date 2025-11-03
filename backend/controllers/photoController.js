const Photo = require('../models/Photo');
const Event = require('../models/Event');
const { detectFaces } = require('../utils/faceRecognition');

// Upload Photo
exports.uploadPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        const event = await Event.findById(req.body.eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Process image for face detection
        const faces = await detectFaces(req.file.path);

        const photo = await Photo.create({
            url: req.file.path,
            event: req.body.eventId,
            photographer: req.user._id,
            faces,
            metadata: {
                size: req.file.size,
                format: req.file.mimetype,
                resolution: req.body.resolution
            }
        });

        // Add photo to event
        event.photos.push(photo._id);
        await event.save();

        res.status(201).json(photo);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get Photos by Event
exports.getPhotosByEvent = async (req, res) => {
    try {
        const photos = await Photo.find({ event: req.params.eventId })
            .populate('photographer', 'name')
            .populate('faces.userId', 'name');

        res.json(photos);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get Photo by ID
exports.getPhotoById = async (req, res) => {
    try {
        const photo = await Photo.findById(req.params.id)
            .populate('photographer', 'name')
            .populate('faces.userId', 'name')
            .populate('event');

        if (!photo) {
            return res.status(404).json({ message: 'Photo not found' });
        }

        res.json(photo);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update Photo
exports.updatePhoto = async (req, res) => {
    try {
        const photo = await Photo.findById(req.params.id);

        if (!photo) {
            return res.status(404).json({ message: 'Photo not found' });
        }

        // Check if user is the photographer
        if (photo.photographer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this photo' });
        }

        const updatedPhoto = await Photo.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(updatedPhoto);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete Photo
exports.deletePhoto = async (req, res) => {
    try {
        const photo = await Photo.findById(req.params.id);

        if (!photo) {
            return res.status(404).json({ message: 'Photo not found' });
        }

        // Check if user is the photographer
        if (photo.photographer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this photo' });
        }

        // Remove photo from event
        const event = await Event.findById(photo.event);
        if (event) {
            event.photos = event.photos.filter(p => p.toString() !== photo._id.toString());
            await event.save();
        }

        await photo.remove();

        res.json({ message: 'Photo removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Tag Face in Photo
exports.tagFace = async (req, res) => {
    try {
        const photo = await Photo.findById(req.params.id);

        if (!photo) {
            return res.status(404).json({ message: 'Photo not found' });
        }

        const { userId, faceIndex } = req.body;

        if (faceIndex >= photo.faces.length) {
            return res.status(400).json({ message: 'Invalid face index' });
        }

        photo.faces[faceIndex].userId = userId;
        await photo.save();

        res.json(photo);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};