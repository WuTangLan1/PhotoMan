"use client";

import { useRef, useState, useEffect } from 'react';
import ImageUploader from '../components/ImageUploader';
import { manipulateImage, applyEdgeDetection } from '../utils/imageManipulation';

export default function Home() {
  const [manipulatedCanvas, setManipulatedCanvas] = useState<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Use useEffect to log the current ref and ensure assignment
  useEffect(() => {
    if (!imageRef.current) {
      console.error('ImageRef is not assigned correctly in useEffect');
    }
  }, [imageRef.current]);

  const handleImageUpload = (imageSrc: string) => {
    if (imageRef.current) {
      imageRef.current.src = imageSrc;
      console.log('Image uploaded and src set:', imageRef.current.src);
    } else {
      console.error('ImageRef is not assigned correctly');
    }
  };


  const handleManipulate = async (type: string) => {
    try {
      if (imageRef.current) {
        console.log(`Button clicked: ${type}`); // Log button click event
        setLoading(true);
  
        // Check if image is loaded correctly
        if (!imageRef.current.src) {
          console.error('Image not loaded properly'); // Debug: Check if the image is loaded
          return;
        }
  
        let canvas: HTMLCanvasElement | null = null;
        switch (type) {
          case 'grayscale':
            console.log('Starting Grayscale Manipulation'); // Log before grayscale manipulation
            canvas = await manipulateImage(imageRef.current);
            console.log('Grayscale Manipulation Complete'); // Log after grayscale manipulation
            break;
          case 'edge-detection':
            console.log('Starting Edge Detection'); // Log before edge detection manipulation
            canvas = await applyEdgeDetection(imageRef.current);
            console.log('Edge Detection Complete'); // Log after edge detection manipulation
            break;
          default:
            alert('Invalid manipulation type');
        }
  
        if (canvas) {
          console.log('Canvas created successfully', canvas); // Log canvas details if created successfully
          setManipulatedCanvas(canvas);
        } else {
          console.error('Failed to create canvas'); // Log if canvas creation failed
        }
      } else {
        console.error('ImageRef is null'); // Debug: Check if imageRef is accessible
      }
    } catch (error) {
      console.error('Manipulation failed:', error); // Log error details
      alert('Failed to manipulate the image. Please try again.');
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
    <div className="min-h-screen p-8 pb-20 sm:p-20 flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-gray-100">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-extrabold mt-4 text-gray-800">Welcome to Photoman</h1>
        <p className="text-xl mt-2 text-gray-600">
          Upload your images, manipulate them using TensorFlow.js, and download the results instantly.
        </p>
      </header>

      <main className="flex flex-col items-center gap-8 w-full max-w-3xl bg-white p-8 rounded-lg shadow-xl transition-all duration-300 ease-in-out hover:shadow-2xl">
        <div className="w-full flex flex-col items-center">
          <ImageUploader onImageUpload={handleImageUpload} />
          {/* Always render the img element */}
          <img
            ref={imageRef}
            src=""
            alt="Uploaded"
            className="mt-4 w-64 h-64 object-contain border-2 border-gray-300 rounded-lg shadow-sm"
          />
        </div>

        <div className="flex gap-4 mt-4">
          <button
            onClick={() => handleManipulate('grayscale')}
            className="bg-blue-500 text-white px-5 py-3 rounded-full shadow-md hover:bg-blue-600 hover:shadow-lg transition-all duration-200 ease-in-out"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Grayscale'}
          </button>
          <button
            onClick={() => handleManipulate('edge-detection')}
            className="bg-blue-500 text-white px-5 py-3 rounded-full shadow-md hover:bg-blue-600 hover:shadow-lg transition-all duration-200 ease-in-out"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Edge Detection'}
          </button>
        </div>

        {manipulatedCanvas && (
        <div className="flex flex-col items-center mt-6">
          <canvas
            className="rounded-lg shadow-md"
            width={manipulatedCanvas.width}
            height={manipulatedCanvas.height}
            ref={(el) => {
              if (el && manipulatedCanvas) {
                el.parentNode?.replaceChild(manipulatedCanvas, el);
              }
            }}
            />
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => handleDownload('png')}
                className="bg-green-500 text-white px-5 py-3 rounded-full shadow-md hover:bg-green-600 hover:shadow-lg transition-all duration-200 ease-in-out"
              >
                Download as PNG
              </button>
              <button
                onClick={() => handleDownload('jpeg')}
                className="bg-green-500 text-white px-5 py-3 rounded-full shadow-md hover:bg-green-600 hover:shadow-lg transition-all duration-200 ease-in-out"
              >
                Download as JPEG
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="text-center mt-12 text-sm text-gray-500">
        Powered by Next.js and TensorFlow.js | Created by Finn Massari
      </footer>
    </div>
  );
}
