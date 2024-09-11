// utils/imageManipulation.ts
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';

/**
 * Helper function to convert a canvas to an image
 * @param {HTMLCanvasElement} canvas - The canvas element to convert
 * @returns {HTMLImageElement} - The converted image element
 */
const canvasToImage = (canvas: HTMLCanvasElement): HTMLImageElement => {
  const img = new Image();
  img.src = canvas.toDataURL();
  return img;
};

/**
 * Adjusts brightness of an image.
 * @param {HTMLImageElement | HTMLCanvasElement} imageElement - The image element to manipulate.
 * @param {number} factor - Brightness factor (0 - 2, where 1 is no change).
 * @returns {Promise<HTMLCanvasElement>} - The manipulated canvas.
 */
export const adjustBrightness = async (
  imageElement: HTMLImageElement | HTMLCanvasElement,
  factor: number = 1.2 // Default to increase brightness slightly
): Promise<HTMLCanvasElement> => {
  try {
    if (imageElement instanceof HTMLCanvasElement) {
      imageElement = canvasToImage(imageElement);
    }
    
    const tensor = tf.browser.fromPixels(imageElement).toFloat().div(tf.scalar(255));
    const adjusted = tensor.mul(tf.scalar(factor)).clipByValue(0, 1);
    const manipulatedImage = await tf.browser.toPixels(adjusted as tf.Tensor3D);

    const canvas = document.createElement('canvas');
    canvas.width = imageElement.width;
    canvas.height = imageElement.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const imageData = new ImageData(new Uint8ClampedArray(manipulatedImage), canvas.width, canvas.height);
      ctx.putImageData(imageData, 0, 0);
    }
    tf.dispose([tensor, adjusted]); // Clean up tensors
    return canvas;
  } catch (error) {
    console.error('Error in adjustBrightness:', error);
    throw error;
  }
};

/**
 * Adjusts contrast of an image.
 * @param {HTMLImageElement | HTMLCanvasElement} imageElement - The image element to manipulate.
 * @param {number} factor - Contrast factor (0 - 2, where 1 is no change).
 * @returns {Promise<HTMLCanvasElement>} - The manipulated canvas.
 */
export const adjustContrast = async (
  imageElement: HTMLImageElement | HTMLCanvasElement,
  factor: number = 1.2 // Default to increase contrast slightly
): Promise<HTMLCanvasElement> => {
  try {
    if (imageElement instanceof HTMLCanvasElement) {
      imageElement = canvasToImage(imageElement);
    }

    const tensor = tf.browser.fromPixels(imageElement).toFloat().div(tf.scalar(255));
    const mean = tensor.mean();
    const adjusted = tensor.sub(mean).mul(tf.scalar(factor)).add(mean).clipByValue(0, 1);
    const manipulatedImage = await tf.browser.toPixels(adjusted as tf.Tensor3D);

    const canvas = document.createElement('canvas');
    canvas.width = imageElement.width;
    canvas.height = imageElement.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const imageData = new ImageData(new Uint8ClampedArray(manipulatedImage), canvas.width, canvas.height);
      ctx.putImageData(imageData, 0, 0);
    }
    tf.dispose([tensor, adjusted, mean]); // Clean up tensors
    return canvas;
  } catch (error) {
    console.error('Error in adjustContrast:', error);
    throw error;
  }
};

/**
 * Inverts the colors of an image.
 * @param {HTMLImageElement | HTMLCanvasElement} imageElement - The image element to manipulate.
 * @returns {Promise<HTMLCanvasElement>} - The manipulated canvas.
 */
export const invertColors = async (
  imageElement: HTMLImageElement | HTMLCanvasElement
): Promise<HTMLCanvasElement> => {
  try {
    if (imageElement instanceof HTMLCanvasElement) {
      imageElement = canvasToImage(imageElement);
    }

    const tensor = tf.browser.fromPixels(imageElement).toFloat().div(tf.scalar(255));
    const inverted = tf.scalar(1).sub(tensor);
    const manipulatedImage = await tf.browser.toPixels(inverted as tf.Tensor3D);

    const canvas = document.createElement('canvas');
    canvas.width = imageElement.width;
    canvas.height = imageElement.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const imageData = new ImageData(new Uint8ClampedArray(manipulatedImage), canvas.width, canvas.height);
      ctx.putImageData(imageData, 0, 0);
    }
    tf.dispose([tensor, inverted]); // Clean up tensors
    return canvas;
  } catch (error) {
    console.error('Error in invertColors:', error);
    throw error;
  }
};

/**
 * Applies edge detection to an image.
 * @param {HTMLImageElement | HTMLCanvasElement} imageElement - The image element to manipulate.
 * @returns {Promise<HTMLCanvasElement>} - The manipulated canvas.
 */
export const applyEdgeDetection = async (
  imageElement: HTMLImageElement | HTMLCanvasElement
): Promise<HTMLCanvasElement> => {
  try {
    if (imageElement instanceof HTMLCanvasElement) {
      imageElement = canvasToImage(imageElement);
    }

    const tensor = tf.browser.fromPixels(imageElement).toFloat().div(tf.scalar(255));
    const grayscale = tensor.mean(2).expandDims(2) as tf.Tensor3D; 

    const sobelX = tf.tensor2d([
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1],
    ], [3, 3]).reshape([3, 3, 1, 1]) as tf.Tensor4D;

    const sobelY = tf.tensor2d([
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1],
    ], [3, 3]).reshape([3, 3, 1, 1]) as tf.Tensor4D;

    const edgesX = grayscale.conv2d(sobelX, 1, 'same') as tf.Tensor3D;
    const edgesY = grayscale.conv2d(sobelY, 1, 'same') as tf.Tensor3D;

    const magnitude = tf.sqrt(tf.add(tf.square(edgesX), tf.square(edgesY)))
      .mul(255)
      .clipByValue(0, 255)
      .toInt() as tf.Tensor3D;

    const manipulatedImage = await tf.browser.toPixels(magnitude.squeeze() as tf.Tensor3D);

    const canvas = document.createElement('canvas');
    canvas.width = imageElement.width;
    canvas.height = imageElement.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const imageData = new ImageData(new Uint8ClampedArray(manipulatedImage), canvas.width, canvas.height);
      ctx.putImageData(imageData, 0, 0);
    } else {
      console.error('Failed to get canvas context');
    }

    tf.dispose([tensor, grayscale, edgesX, edgesY, magnitude]);

    return canvas;
  } catch (error) {
    console.error('Error in applyEdgeDetection:', error);
    throw error;
  }
};
