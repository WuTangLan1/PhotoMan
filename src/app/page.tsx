// src/app/page.tsx
"use client"; 

import { useRef, useState } from 'react';
import Image from 'next/image';
import ImageUploader from '../components/ImageUploader';
import { manipulateImage, applyEdgeDetection } from '../utils/imageManipulation';

export default function Home() {
  const [manipulatedCanvas, setManipulatedCanvas] = useState<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleImageUpload = (imageSrc: string) => {
    if (imageRef.current) {
      imageRef.current.src = imageSrc;
    }
  };

  const handleManipulate = async (type: string) => {
    try {
      if (imageRef.current) {
        let canvas: HTMLCanvasElement | null = null;
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
      }
    } catch (error) {
      console.error('Manipulation failed:', error);
      alert('Failed to manipulate the image. Please try again.');
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
    <div className="min-h-screen p-8 pb-20 sm:p-20 flex flex-col items-center justify-center bg-gray-100">
      <header className="text-center mb-12">
        <Image
          className="dark:invert"
          src="https://nextjs.org/icons/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <h1 className="text-4xl font-bold mt-4">Welcome to Photoman</h1>
        <p className="text-lg mt-2 text-gray-700">
          Upload your images, manipulate them using TensorFlow.js, and download the results instantly.
        </p>
      </header>

      <main className="flex flex-col items-center gap-8 w-full max-w-3xl bg-white p-6 rounded-lg shadow-lg">
        <ImageUploader onImageUpload={handleImageUpload} />
        <img ref={imageRef} style={{ display: 'none' }} alt="To be manipulated" />

        <div className="flex gap-4 mt-4">
          <button
            onClick={() => handleManipulate('grayscale')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Grayscale
          </button>
          <button
            onClick={() => handleManipulate('edge-detection')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Edge Detection
          </button>
        </div>

        {manipulatedCanvas && (
          <div className="flex flex-col items-center mt-6">
            <canvas
              ref={(el) => {
                if (el && manipulatedCanvas) {
                  el.replaceWith(manipulatedCanvas);
                }
              }}
            />
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => handleDownload('png')}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
              >
                Download as PNG
              </button>
              <button
                onClick={() => handleDownload('jpeg')}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
              >
                Download as JPEG
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="text-center mt-12 text-sm text-gray-500">
        Powered by Next.js and TensorFlow.js | Created by Your Name
      </footer>
    </div>
  );
}
