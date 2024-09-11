// utils/imageManipulation.ts
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';

export const manipulateImage = async (imageElement: HTMLImageElement): Promise<HTMLCanvasElement> => {
  try {
    const tensor = tf.browser.fromPixels(imageElement) as tf.Tensor3D;
    console.log('Original Tensor:', tensor); 

    const grayscale = tensor.mean(2).expandDims(2).toFloat().div(tf.scalar(255));
    console.log('Grayscale Tensor (Normalized):', grayscale);

    const manipulatedImage = await tf.browser.toPixels(grayscale);
    console.log('Manipulated Image Data:', manipulatedImage); 

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

    return canvas;
  } catch (error) {
    console.error('Error in manipulateImage:', error); 
    throw error;
  }
};

export const applyEdgeDetection = async (imageElement: HTMLImageElement): Promise<HTMLCanvasElement> => {
    try {
      const tensor = tf.browser.fromPixels(imageElement).toFloat().div(tf.scalar(255)); 
      const grayscale = tensor.mean(2).expandDims(2); 
  
      const sobelX = tf.tensor2d([
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]
      ], [3, 3]);
  
      const sobelY = tf.tensor2d([
        [-1, -2, -1],
        [0, 0, 0],
        [1, 2, 1]
      ], [3, 3]);
  
      const edgesX = grayscale.conv2d(sobelX.reshape([3, 3, 1, 1]), 1, 'same');
      const edgesY = grayscale.conv2d(sobelY.reshape([3, 3, 1, 1]), 1, 'same');
  
      const magnitude = tf.sqrt(tf.add(tf.square(edgesX), tf.square(edgesY))).mul(255).clipByValue(0, 255).toInt();
  
      const manipulatedImage = await tf.browser.toPixels(magnitude.squeeze());
  
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
  
