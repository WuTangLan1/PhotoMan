"use client";

import { useRef, useState } from 'react';
import ImageUploader from '../components/ImageUploader';
import { manipulateImage, applyEdgeDetection } from '../utils/imageManipulation';
import { motion } from 'framer-motion';

export default function Home() {
  const [manipulatedCanvas, setManipulatedCanvas] = useState<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleImageUpload = (imageSrc: string) => {
    if (imageRef.current) {
      imageRef.current.src = imageSrc;
      setManipulatedCanvas(null); // Clear previous canvas if any
    } else {
      console.error('ImageRef is not assigned correctly');
    }
  };

  const handleManipulate = async (type: string) => {
    if (!imageRef.current || !imageRef.current.src) return;
    setLoading(true);
    let canvas: HTMLCanvasElement | null = null;

    try {
      switch (type) {
        case 'grayscale':
          canvas = await manipulateImage(imageRef.current);
          break;
        case 'edge-detection':
          canvas = await applyEdgeDetection(imageRef.current);
          break;
        default:
          alert('Invalid manipulation type');
      }

      if (canvas) setManipulatedCanvas(canvas);
    } catch (error) {
      console.error('Manipulation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (format: 'png' | 'jpeg') => {
    if (manipulatedCanvas) {
      const link = document.createElement('a');
      link.download = `manipulated-image.${format}`;
      link.href = manipulatedCanvas.toDataURL(`image/${format}`);
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-8 flex flex-col items-center">
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-6xl font-bold text-white tracking-wide">Photoman</h1>
        <p className="text-xl text-gray-200 mt-2">
          Upload, manipulate, and download your images with a touch of style.
        </p>
      </motion.header>

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full max-w-7xl">
        {/* Before Image Section */}
        <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-6 rounded-xl shadow-2xl flex flex-col items-center hover:shadow-xl transform hover:scale-105 transition"
          >
            <h2 className="text-3xl font-semibold text-gray-700 mb-2">Before</h2>
            <p className="text-gray-500 mb-4 text-center">
              This is your original uploaded image. Upload a new image to get started.
            </p>
            <ImageUploader onImageUpload={handleImageUpload} imageRef={imageRef} />
          </motion.div>
        {/* After Image Section */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-6 rounded-xl shadow-2xl flex flex-col items-center hover:shadow-xl transform hover:scale-105 transition"
        >
          <h2 className="text-3xl font-semibold text-gray-700 mb-2">After</h2>
          <p className="text-gray-500 mb-4 text-center">
            This shows the manipulated version of your image. Choose an effect to see the results.
          </p>
          <div className="mt-4 w-full h-72 border-2 border-dashed border-gray-300 rounded-lg shadow-md overflow-hidden flex items-center justify-center">
            {manipulatedCanvas ? (
              <canvas
                width={manipulatedCanvas.width}
                height={manipulatedCanvas.height}
                ref={(el) => {
                  if (el && manipulatedCanvas) {
                    el.parentNode?.replaceChild(manipulatedCanvas, el);
                  }
                }}
                className="max-w-full max-h-full object-contain" // Ensures consistent sizing
              />

            ) : (
              <div className="text-gray-400 text-sm">
                Your manipulated image will appear here.
              </div>
            )}
          </div>

          <h3 className="text-xl font-semibold text-gray-700 mt-6">Image Manipulation Controls</h3>
          <div className="flex flex-wrap gap-4 mt-4 mb-4 justify-center">
            <button
              onClick={() => handleManipulate('grayscale')}
              className={`bg-blue-500 text-white py-2 px-6 rounded-full shadow-md hover:bg-blue-600 transition-all ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Grayscale'}
            </button>
            <button
              onClick={() => handleManipulate('edge-detection')}
              className={`bg-blue-500 text-white py-2 px-6 rounded-full shadow-md hover:bg-blue-600 transition-all ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Edge Detection'}
            </button>
            {/* Add buttons for each effect */}
            {[
              'Brightness Adjustment',
              'Contrast Adjustment',
              'Invert Colors',
              'Blur Effect',
              'Sharpen',
              'Sepia Tone',
              'Saturation Adjustment',
              'Hue Rotation',
              'Flip Horizontal',
              'Flip Vertical',
              'Rotate',
              'Pixelate',
              'Noise Addition',
              'Crop',
              'Resize',
              'Emboss Effect',
              'Threshold',
              'Outline Detection',
            ].map((effect) => (
              <button
                key={effect}
                onClick={() => handleManipulate(effect)}
                className="bg-blue-500 text-white py-2 px-4 rounded-full shadow-md hover:bg-blue-600 transition-all"
              >
                {effect}
              </button>
            ))}
          </div>

          {manipulatedCanvas && (
            <div className="flex gap-4">
              <button
                onClick={() => handleDownload('png')}
                className="bg-green-500 text-white py-2 px-6 rounded-full shadow-md hover:bg-green-600 transition transform hover:scale-105"
              >
                Download as PNG
              </button>
              <button
                onClick={() => handleDownload('jpeg')}
                className="bg-green-500 text-white py-2 px-6 rounded-full shadow-md hover:bg-green-600 transition transform hover:scale-105"
              >
                Download as JPEG
              </button>
            </div>
          )}
        </motion.div>
      </main>

      <footer className="text-center mt-12 text-sm text-gray-200">
        Powered by Next.js and TensorFlow.js | Created by Finn Massari
      </footer>
    </div>
  );
}
