// utils/imageManipulation.ts
import * as tf from '@tensorflow/tfjs';

// Convert image to grayscale using TensorFlow.js
export const manipulateImage = async (imageElement: HTMLImageElement): Promise<HTMLCanvasElement> => {
  const tensor = tf.browser.fromPixels(imageElement);
  const grayscale = tensor.mean(2).expandDims(2).tile([1, 1, 3]);
  const manipulatedImage = await tf.browser.toPixels(grayscale);

  // Create a canvas to display the manipulated image
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

// Apply edge detection using TensorFlow.js
export const applyEdgeDetection = async (imageElement: HTMLImageElement): Promise<HTMLCanvasElement> => {
  const tensor = tf.browser.fromPixels(imageElement);
  const grayscale = tensor.mean(2).expandDims(2).toFloat().div(tf.scalar(255));
  const edges = tf.image.sobelEdges(grayscale);
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
