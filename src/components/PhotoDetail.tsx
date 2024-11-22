import React, { useState } from 'react';
import { Photo } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';

interface PhotoDetailProps {
  photo: Photo;
  onClose: () => void;
  onSaveNote: (id: string, note: string) => void;
}

const PhotoDetail: React.FC<PhotoDetailProps> = ({ photo, onClose, onSaveNote }) => {
  const [note, setNote] = useState(photo.metadata.note || '');

  const handleSave = () => {
    onSaveNote(photo.id, note);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('default', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const formatCoordinate = (coord: any): string => {
    if (typeof coord === 'string') {
      const parsed = parseFloat(coord.replace(',', '.'));
      return isNaN(parsed) ? '0.000000' : parsed.toFixed(6);
    }
    return typeof coord === 'number' ? coord.toFixed(6) : '0.000000';
  };

  return (
    <Card className="fixed inset-0 z-50 bg-white overflow-auto animate-fadeIn">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-ios-text">Photo Details</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-ios-secondary"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="space-y-4">
          <img
            src={photo.url}
            alt={`Photo ${photo.id}`}
            className="w-full max-h-96 object-contain rounded-lg"
          />

          <div className="space-y-2">
            <p className="text-ios-text">
              <span className="font-semibold">Original Date:</span>{' '}
              {formatDate(photo.metadata.date)}
            </p>
            {photo.metadata.gpsCoordinates ? (
              <p className="text-ios-text">
                <span className="font-semibold">Location:</span>{' '}
                {formatCoordinate(photo.metadata.gpsCoordinates.latitude)},{' '}
                {formatCoordinate(photo.metadata.gpsCoordinates.longitude)}
              </p>
            ) : (
              <p className="text-ios-text text-gray-500 italic">
                No GPS data available for this photo
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-ios-text font-semibold">Note:</label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full min-h-[100px]"
              placeholder="Add a note about this photo..."
            />
          </div>

          <Button
            className="w-full bg-ios-blue text-white hover:bg-ios-blue/90"
            onClick={handleSave}
          >
            Save Note
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PhotoDetail;