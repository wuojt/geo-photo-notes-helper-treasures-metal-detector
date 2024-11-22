import React from 'react';
import { Photo } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useSettings } from '@/lib/settings';
import { useToast } from '@/components/ui/use-toast';

interface PhotoGridProps {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
  onPhotoDelete: (photoId: string) => void;
}

const PhotoGrid: React.FC<PhotoGridProps> = ({ photos, onPhotoClick, onPhotoDelete }) => {
  const { showNotifications } = useSettings();
  const { toast } = useToast();

  const handleDelete = (e: React.MouseEvent, photo: Photo) => {
    e.stopPropagation();
    onPhotoDelete(photo.id);
    showNotifications && toast({
      title: "Success",
      description: "Photo deleted successfully",
    });
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 p-4">
      {photos.map((photo) => (
        <Card
          key={photo.id}
          className="relative overflow-hidden cursor-pointer hover:scale-105 transition-transform animate-fadeIn group"
          onClick={() => onPhotoClick(photo)}
        >
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 z-10 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => handleDelete(e, photo)}
          >
            <X className="h-4 w-4" />
          </Button>
          <img
            src={photo.url}
            alt={`Photo ${photo.id}`}
            className="w-full h-24 sm:h-28 md:h-32 lg:h-36 object-cover"
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