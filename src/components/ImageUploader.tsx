// src\components\ImageUploader.tsx
import { useState, useEffect } from 'react';

const ImageUploader = ({
  onImageUpload,
  imageRef,
}: {
  onImageUpload: (image: string) => void;
  imageRef: React.RefObject<HTMLImageElement>;
}) => {
  const [image, setImage] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          const result = reader.result as string;
          setImage(result);
          onImageUpload(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Assign the imageRef once the image is loaded
  useEffect(() => {
    if (image && imageRef.current) {
      imageRef.current.src = image;
      console.log("ImageRef assigned with image:", image);
    }
  }, [image, imageRef]);

  return (
    <div className="relative w-full h-72 border-2 border-dashed border-gray-300 rounded-lg shadow-md overflow-hidden flex items-center justify-center">
      {!image && (
        <label className="absolute inset-0 flex items-center justify-center cursor-pointer bg-white/50 hover:bg-white/70 transition">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <span className="bg-blue-500 text-white px-4 py-2 rounded-full shadow-md hover:bg-blue-600 transition">
            Choose File
          </span>
        </label>
      )}
      {image && (
        <img
          ref={imageRef}
          src={image}
          alt="Uploaded"
          className="max-w-full max-h-full object-contain"
        />
      )}
    </div>
  );
};

export default ImageUploader;
