import React from 'react';
import { Photo } from '@/lib/types';
import { Card } from '@/components/ui/card';

interface PhotoGridProps {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
}

const PhotoGrid: React.FC<PhotoGridProps> = ({ photos, onPhotoClick }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {photos.map((photo) => (
        <Card
          key={photo.id}
          className="overflow-hidden cursor-pointer hover:scale-105 transition-transform animate-fadeIn"
          onClick={() => onPhotoClick(photo)}
        >
          <img
            src={photo.url}
            alt={`Photo ${photo.id}`}
            className="w-full h-48 md:h-56 lg:h-64 object-cover"
          />
          <div className="p-2 text-ios-text text-sm">
            {photo.metadata.date.toLocaleDateString()}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default PhotoGrid;