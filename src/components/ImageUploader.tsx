// components/ImageUploader.tsx
import { useState } from 'react';

const ImageUploader = ({ onImageUpload }: { onImageUpload: (image: string) => void }) => {
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

  return (
    <div className="image-uploader">
      <input type="file" accept="image/*" onChange={handleImageChange} />
      {image && <img src={image} alt="Uploaded" className="uploaded-image" />}
    </div>
  );
};

export default ImageUploader;
