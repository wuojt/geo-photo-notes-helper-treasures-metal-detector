import { Photo, PhotoMetadata } from './types';

export const extractMetadata = async (file: File): Promise<PhotoMetadata> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        console.log('Extracting metadata from image:', file.name);
        resolve({
          id: Math.random().toString(36).substr(2, 9),
          date: new Date(file.lastModified),
          // Note: In a real app, we would extract GPS data here
          gpsCoordinates: {
            latitude: 0,
            longitude: 0,
          }
        });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const createPhotoObject = async (file: File): Promise<Photo> => {
  const metadata = await extractMetadata(file);
  return {
    id: metadata.id,
    url: URL.createObjectURL(file),
    metadata
  };
};