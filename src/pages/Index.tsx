import React, { useState, useRef } from 'react';
import { Photo } from '@/lib/types';
import { createPhotoObject } from '@/lib/photoUtils';
import PhotoGrid from '@/components/PhotoGrid';
import PhotoDetail from '@/components/PhotoDetail';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2 } from 'lucide-react';
import { useSettings } from '@/lib/settings';
import { SettingsDialog } from '@/components/SettingsDialog';

const MAX_PHOTOS = 100;

const Index = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { showNotifications } = useSettings();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    console.log('Processing selected files:', files.length);

    if (photos.length + files.length > MAX_PHOTOS) {
      showNotifications && toast({
        title: "Error",
        description: `You can only add up to ${MAX_PHOTOS} photos. Currently: ${photos.length}`,
        variant: "destructive",
      });
      return;
    }

    try {
      const newPhotos = await Promise.all(
        Array.from(files).map(async (file) => {
          const photo = await createPhotoObject(file);
          return {
            ...photo,
            metadata: {
              ...photo.metadata,
              notes: [],
            },
          };
        })
      );
      
      setPhotos((prev) => [...prev, ...newPhotos]);
      showNotifications && toast({
        title: "Success",
        description: `Added ${files.length} photo${files.length === 1 ? '' : 's'}`,
      });
    } catch (error) {
      console.error('Error processing photos:', error);
      showNotifications && toast({
        title: "Error",
        description: "Failed to process photos",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAll = () => {
    setPhotos([]);
    setSelectedPhoto(null);
    showNotifications && toast({
      title: "Success",
      description: "All photos have been deleted",
    });
  };

  const handleDeletePhoto = (photoId: string) => {
    setPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
    if (selectedPhoto?.id === photoId) {
      setSelectedPhoto(null);
    }
  };

  const handleSaveNote = (id: string, notes: Array<{ text: string; createdAt: Date; }>) => {
    setPhotos((prev) =>
      prev.map((photo) =>
        photo.id === id
          ? {
              ...photo,
              metadata: { ...photo.metadata, notes },
            }
          : photo
      )
    );
    setSelectedPhoto((prev) =>
      prev?.id === id
        ? {
            ...prev,
            metadata: { ...prev.metadata, notes },
          }
        : prev
    );
    showNotifications && toast({
      title: "Success",
      description: "Note saved successfully",
    });
  };

  return (
    <div className="min-h-screen bg-ios-gray">
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-ios-text">Photo Notes</h1>
          <div className="flex gap-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-ios-blue text-white hover:bg-ios-blue/90"
              disabled={photos.length >= MAX_PHOTOS}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Photos
            </Button>
            <SettingsDialog />
            <Button
              onClick={handleDeleteAll}
              variant="destructive"
              className="hover:bg-destructive/90"
              disabled={photos.length === 0}
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Delete All
            </Button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            multiple
            className="hidden"
          />
        </div>

        {photos.length === 0 ? (
          <div className="text-center text-ios-secondary py-12">
            No photos yet. Click "Add Photos" to get started.
          </div>
        ) : (
          <PhotoGrid 
            photos={photos} 
            onPhotoClick={setSelectedPhoto}
            onPhotoDelete={handleDeletePhoto}
          />
        )}

        {selectedPhoto && (
          <PhotoDetail
            photo={selectedPhoto}
            onClose={() => setSelectedPhoto(null)}
            onSaveNote={handleSaveNote}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
