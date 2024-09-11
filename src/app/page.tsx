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
  const flipCardRef = useRef<HTMLDivElement | null>(null);
  const [showOriginal, setShowOriginal] = useState(true);
  const [isManipulated, setIsManipulated] = useState(false); 


  const handleImageUpload = (imageSrc: string) => {
    if (imageRef.current) {
      imageRef.current.src = imageSrc; 
      console.log("Image uploaded successfully:", imageSrc);
      setManipulatedCanvas(null);
    } else {
      console.error('ImageRef is not assigned correctly');
    }
  };

  const manipulatedCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (manipulatedCanvas && manipulatedCanvasRef.current) {
      manipulatedCanvasRef.current.parentNode?.replaceChild(manipulatedCanvas, manipulatedCanvasRef.current);
      manipulatedCanvasRef.current = manipulatedCanvas;
      console.log("Manipulated canvas updated successfully and displayed.");
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
  
      if (canvas) {
        // Set canvas dimensions to match the source image
        canvas.width = sourceElement.width;
        canvas.height = sourceElement.height;
        setManipulatedCanvas(canvas);
      }
  
      setIsManipulated(true);
    } catch (error) {
      console.error('Manipulation failed:', error);
    } finally {
      setLoading(false);
    }
  };
  

  const handleToggleFlip = () => {
    if (flipCardRef.current && isManipulated) {
      console.log("View Manipulated Image button clicked."); 
      flipCardRef.current.classList.toggle('flipped'); 
      setShowOriginal(!showOriginal); 
    } else {
      console.log("Cannot flip card - either flipCardRef is null or image is not manipulated.");
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
      className="flip-card relative w-full max-w-md"
      ref={flipCardRef} 
    >
      <div className="flip-card-inner relative w-full h-96 rounded-xl shadow-2xl transform transition-transform duration-700 ease-in-out">
        {/* Front Side - Original Image */}
        <div className="flip-card-front absolute w-full h-full bg-white p-6 rounded-xl shadow-xl flex flex-col items-center justify-center">
          <h2 className="text-3xl font-semibold text-gray-700 mb-4">Original Image</h2>
          <ImageUploader onImageUpload={handleImageUpload} imageRef={imageRef} />
          {isManipulated && (
            <button
              onClick={handleToggleFlip} 
              className="mt-6 bg-purple-500 text-white py-2 px-6 rounded-full shadow-md hover:bg-purple-600 transition transform hover:scale-105"
            >
              View Manipulated Image
            </button>
          )}
        </div>

        {/* Back Side - Manipulated Image */}
        <div className="flip-card-back absolute w-full h-full bg-gradient-to-br from-gray-200 to-gray-400 p-6 rounded-xl shadow-xl flex flex-col items-center justify-center">
          <h2 className="text-3xl font-semibold text-gray-700 mb-4">Manipulated Image</h2>
          <div className="w-full h-72 border-2 border-dashed border-gray-300 rounded-lg shadow-md overflow-hidden flex items-center justify-center">
            {loading ? (
              <Spinner />
            ) : (
              <canvas
                ref={manipulatedCanvasRef}
                className="w-full h-full object-contain"
              />
            )}
          </div>
          <button
            onClick={handleToggleFlip}
            className="mt-6 bg-purple-500 text-white py-2 px-6 rounded-full shadow-md hover:bg-purple-600 transition transform hover:scale-105"
          >
            View Original Image
          </button>
          <div className="mt-4 flex gap-4">
            <button
              onClick={() => handleDownload('png')}
              className="bg-blue-500 text-white py-2 px-4 rounded-full shadow-md hover:bg-blue-600 transition transform hover:scale-105"
            >
              Download PNG
            </button>
            <button
              onClick={() => handleDownload('jpeg')}
              className="bg-blue-500 text-white py-2 px-4 rounded-full shadow-md hover:bg-blue-600 transition transform hover:scale-105"
            >
              Download JPEG
            </button>
          </div>
        </div>
      </div>
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
