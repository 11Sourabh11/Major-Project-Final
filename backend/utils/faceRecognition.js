const tf = require('@tensorflow/tfjs-node');
const faceapi = require('@vladmandic/face-api');
const canvas = require('canvas');
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

let modelInitialized = false;

const initializeModels = async () => {
    if (!modelInitialized) {
        await faceapi.nets.ssdMobilenetv1.loadFromDisk('./models');
        await faceapi.nets.faceLandmark68Net.loadFromDisk('./models');
        await faceapi.nets.faceRecognitionNet.loadFromDisk('./models');
        modelInitialized = true;
    }
};

exports.detectFaces = async (imagePath) => {
    try {
        await initializeModels();

        // Load the image
        const img = await canvas.loadImage(imagePath);
        
        // Detect faces
        const detections = await faceapi
            .detectAllFaces(img)
            .withFaceLandmarks()
            .withFaceDescriptors();

        // Format the results
        const faces = detections.map(detection => ({
            boundingBox: {
                x: detection.detection.box.x,
                y: detection.detection.box.y,
                width: detection.detection.box.width,
                height: detection.detection.box.height
            },
            landmarks: detection.landmarks.positions,
            descriptor: Array.from(detection.descriptor),
            confidence: detection.detection.score
        }));

        return faces;
    } catch (error) {
        console.error('Face detection error:', error);
        throw new Error('Failed to process image for face detection');
    }
};

exports.compareFaces = async (face1Descriptor, face2Descriptor) => {
    try {
        const distance = faceapi.euclideanDistance(
            new Float32Array(face1Descriptor),
            new Float32Array(face2Descriptor)
        );
        
        // threshold for determining if faces match
        const threshold = 0.6;
        return distance < threshold;
    } catch (error) {
        console.error('Face comparison error:', error);
        throw new Error('Failed to compare faces');
    }
};