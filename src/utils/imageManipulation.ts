// utils/imageManipulation.ts
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';

// Convert image to grayscale using TensorFlow.js
export const manipulateImage = async (imageElement: HTMLImageElement): Promise<HTMLCanvasElement> => {
  try {
    // Convert image to a tensor
    const tensor = tf.browser.fromPixels(imageElement) as tf.Tensor3D;
    console.log('Original Tensor:', tensor); // Debug: Check the loaded tensor

    // Convert to grayscale and normalize values to [0, 1]
    const grayscale = tensor.mean(2).expandDims(2).toFloat().div(tf.scalar(255));
    console.log('Grayscale Tensor (Normalized):', grayscale); // Debug: Check the normalized grayscale tensor

    // Convert grayscale tensor back to image pixels
    const manipulatedImage = await tf.browser.toPixels(grayscale);
    console.log('Manipulated Image Data:', manipulatedImage); // Debug: Check the pixel data

    // Create a canvas to display the manipulated image
    const canvas = document.createElement('canvas');
    canvas.width = imageElement.width;
    canvas.height = imageElement.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const imageData = new ImageData(new Uint8ClampedArray(manipulatedImage), canvas.width, canvas.height);
      ctx.putImageData(imageData, 0, 0);
    } else {
      console.error('Failed to get canvas context'); // Debug: Canvas context issue
    }

    return canvas;
  } catch (error) {
    console.error('Error in manipulateImage:', error); // Debug: Catch errors
    throw error;
  }
};

// Apply edge detection using TensorFlow.js
export const applyEdgeDetection = async (imageElement: HTMLImageElement): Promise<HTMLCanvasElement> => {
  const tensor = tf.browser.fromPixels(imageElement) as tf.Tensor3D; // Explicitly cast to Tensor3D
  const grayscale = tensor.mean(2).expandDims(2).toFloat().div(tf.scalar(255));
  const edges = tf.image.sobel(grayscale); // Correctly use tf.image.sobel function
  const edgeImage = edges.mul(tf.scalar(255)).clipByValue(0, 255).toInt();

  // Convert to canvas
  const manipulatedImage = await tf.browser.toPixels(edgeImage.squeeze());
  const canvas = document.createElement('canvas');
  canvas.width = imageElement.width;
  canvas.height = imageElement.height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const imageData = new ImageData(new Uint8ClampedArray(manipulatedImage), canvas.width, canvas.height);
    ctx.putImageData(imageData, 0, 0);
  }
  return canvas;
};
