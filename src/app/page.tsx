// src\app\page.tsx
"use client";

import { useRef, useState, useEffect } from 'react';
import ImageUploader from '../components/ImageUploader';
import { adjustBrightness, adjustContrast, invertColors, applyEdgeDetection } from '../utils/imageManipulation';
import { motion } from 'framer-motion';


export default function Home() {
  const [manipulatedCanvas, setManipulatedCanvas] = useState<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [showOriginal, setShowOriginal] = useState(true);

  const handleImageUpload = (imageSrc: string) => {
    if (imageRef.current) {
      imageRef.current.src = imageSrc;
      setManipulatedCanvas(null); 
    } else {
      console.error('ImageRef is not assigned correctly');
    }
  };

  const manipulatedCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (manipulatedCanvas && manipulatedCanvasRef.current) {
      manipulatedCanvasRef.current.replaceWith(manipulatedCanvas);
      manipulatedCanvasRef.current = manipulatedCanvas;
    }
  }, [manipulatedCanvas]);

  const handleManipulate = async (type: string) => {
    const sourceElement = manipulatedCanvas || imageRef.current;
  
    if (!sourceElement || !(sourceElement instanceof HTMLImageElement || sourceElement instanceof HTMLCanvasElement))
      return;
  
    setLoading(true);
    let canvas: HTMLCanvasElement | null = null;
  
    try {
      switch (type) {
        case 'edge-detection':
          canvas = await applyEdgeDetection(sourceElement);
          break;
        case 'Brightness Adjustment':
          canvas = await adjustBrightness(sourceElement, 1.2); 
          break;
        case 'Contrast Adjustment':
          canvas = await adjustContrast(sourceElement, 1.2); 
          break;
        case 'Invert Colors':
          canvas = await invertColors(sourceElement); 
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
  

  function TypingEffect({
    texts,
    typingSpeed = 100,
    deletingSpeed = 50,
  }: {
    texts: string[];
    typingSpeed?: number;
    deletingSpeed?: number;
  }) {
    const [displayedText, setDisplayedText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopIndex, setLoopIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
  
    useEffect(() => {
      const currentText = texts[loopIndex % texts.length];
  
      const handleTyping = () => {
        if (!isDeleting && charIndex < currentText.length) {
          setDisplayedText(currentText.slice(0, charIndex + 1));
          setCharIndex((prev) => prev + 1);
        } else if (isDeleting && charIndex > 0) {
          setDisplayedText(currentText.slice(0, charIndex - 1));
          setCharIndex((prev) => prev - 1);
        } else if (!isDeleting && charIndex === currentText.length) {
          setTimeout(() => setIsDeleting(true), 1000);
        } else if (isDeleting && charIndex === 0) {
          setIsDeleting(false);
          setLoopIndex((prev) => prev + 1);
        }
      };
  
      const typingTimeout = setTimeout(handleTyping, isDeleting ? deletingSpeed : typingSpeed);
  
      return () => clearTimeout(typingTimeout);
    }, [charIndex, isDeleting, texts, typingSpeed, deletingSpeed, loopIndex]);
  
    return (
      <span className="typing-effect">
        {displayedText}
        <span className="cursor">|</span>
      </span>
    );
  }
  
  const handleDownload = (format: 'png' | 'jpeg') => {
    if (manipulatedCanvas) {
      const link = document.createElement('a');
      link.download = `manipulated-image.${format}`;
      link.href = manipulatedCanvas.toDataURL(`image/${format}`);
      link.click();
    }
  };

  const Spinner = () => (
    <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-8 w-8"></div>
  );

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
          The website where you can{' '}
          <span style={{ display: 'inline-block' }}>
            <TypingEffect
              texts={[
                'upload your images',
                'apply basic adjustments',
                'apply filtering',
                'transform your images',
                'apply image effects',
              ]}
              typingSpeed={100}
              deletingSpeed={50}
            />
          </span>
        </p>
      </motion.header>

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full max-w-7xl">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-6 rounded-xl shadow-2xl flex flex-col items-center hover:shadow-xl transform hover:scale-105 transition"
      >
        <h2 className="text-3xl font-semibold text-gray-700 mb-2">
          {showOriginal ? 'Original Image' : 'Manipulated Image'}
        </h2>
        <p className="text-gray-500 mb-4 text-center">
          {showOriginal
            ? 'This is your original uploaded image.'
            : 'This is your manipulated image.'}
        </p>

        <ImageUploader onImageUpload={handleImageUpload} imageRef={imageRef} />

        <div className="mt-6 w-full h-72 border-2 border-dashed border-gray-300 rounded-lg shadow-md overflow-hidden flex items-center justify-center">
          {loading ? (
            <Spinner />
          ) : (
            <>
              {showOriginal && imageRef.current && (
                <img
                  src={imageRef.current.src}
                  alt="Uploaded Image"
                  className="max-w-full max-h-full object-contain"
                />
              )}
              {!showOriginal && manipulatedCanvas && (
                <canvas
                  ref={manipulatedCanvasRef}
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </>
          )}
        </div>

        <button
          onClick={() => setShowOriginal((prev) => !prev)}
          className="mt-4 bg-purple-500 text-white py-2 px-4 rounded-full shadow-md hover:bg-purple-600 transition transform hover:scale-105"
        >
          {showOriginal ? 'View Manipulated Image' : 'View Original Image'}
        </button>
      </motion.div>


        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-6 rounded-xl shadow-2xl flex flex-col items-center hover:shadow-xl transform hover:scale-105 transition"
        >
          <h2 className="text-3xl font-semibold text-gray-700 mb-2">Image Manipulation Controls</h2>
          <p className="text-gray-500 mb-4 text-center">
            Choose a category and select an effect to apply to your image.
          </p>

          <div className="flex flex-col gap-8 mt-4 mb-4 justify-center">
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Basic Adjustments</h3>
              <div className="flex gap-4 flex-wrap">
                {['Brightness Adjustment', 'Contrast Adjustment', 'Invert Colors'].map((effect) => (
                  <button
                    key={effect}
                    onClick={() => handleManipulate(effect)}
                    className="bg-blue-500 text-white py-2 px-4 rounded-full shadow-md hover:bg-blue-600 transition-all"
                  >
                    {effect}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Filters</h3>
              <div className="flex gap-4 flex-wrap">
                {['Sepia Tone', 'Saturation Adjustment', 'Hue Rotation'].map((effect) => (
                  <button
                    key={effect}
                    onClick={() => handleManipulate(effect)}
                    className="bg-blue-500 text-white py-2 px-4 rounded-full shadow-md hover:bg-blue-600 transition-all"
                  >
                    {effect}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Transformations</h3>
              <div className="flex gap-4 flex-wrap">
                {['Flip Horizontal', 'Flip Vertical', 'Rotate', 'Crop', 'Resize'].map((effect) => (
                  <button
                    key={effect}
                    onClick={() => handleManipulate(effect)}
                    className="bg-blue-500 text-white py-2 px-4 rounded-full shadow-md hover:bg-blue-600 transition-all"
                  >
                    {effect}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Effects</h3>
              <div className="flex gap-4 flex-wrap">
                {[
                  'Blur Effect',
                  'Sharpen',
                  'Pixelate',
                  'Noise Addition',
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
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="text-center mt-12 text-sm text-gray-200">
        Powered by Next.js and TensorFlow.js | Created by Finn Massari
      </footer>
    </div>
  );
}
