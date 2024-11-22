import React, { useState } from 'react';
import { Photo } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, MapPin, Map } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';

interface PhotoDetailProps {
  photo: Photo;
  onClose: () => void;
  onSaveNote: (id: string, notes: Array<{ text: string; createdAt: Date; }>) => void;
}

const MAX_NOTE_LENGTH = 1000;

const PhotoDetail: React.FC<PhotoDetailProps> = ({ photo, onClose, onSaveNote }) => {
  const [currentNote, setCurrentNote] = useState('');
  const { toast } = useToast();

  const handleSave = () => {
    if (!currentNote.trim()) return;
    
    const newNote = {
      text: currentNote,
      createdAt: new Date()
    };
    
    const updatedNotes = [newNote, ...(photo.metadata.notes || [])];
    onSaveNote(photo.id, updatedNotes);
    setCurrentNote('');
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= MAX_NOTE_LENGTH) {
      setCurrentNote(text);
    } else {
      toast({
        title: "Character limit exceeded",
        description: `Notes are limited to ${MAX_NOTE_LENGTH} characters`,
        variant: "destructive",
      });
    }
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

  const formatNoteDate = (date: Date) => {
    return new Intl.DateTimeFormat('default', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatCoordinate = (coord: any): string => {
    if (typeof coord === 'string') {
      const parsed = parseFloat(coord.replace(',', '.'));
      return isNaN(parsed) ? '0.000000' : parsed.toFixed(6);
    }
    return typeof coord === 'number' ? coord.toFixed(6) : '0.000000';
  };

  const getGoogleSearchUrl = (latitude: number, longitude: number): string => {
    const coordinates = `${latitude},${longitude}`;
    return `https://www.google.com/search?q=${encodeURIComponent(coordinates)}`;
  };

  const getGoogleMapsUrl = (latitude: number, longitude: number): string => {
    return `https://www.google.com/maps/place/${latitude}%C2%B0N+${longitude}%C2%B0E/@${latitude},${longitude},15z`;
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
              <div className="space-y-1">
                <p className="text-ios-text">
                  <span className="font-semibold">Location:</span>{' '}
                  {formatCoordinate(photo.metadata.gpsCoordinates.latitude)},{' '}
                  {formatCoordinate(photo.metadata.gpsCoordinates.longitude)}
                </p>
                <div className="flex flex-col space-y-2">
                  <a
                    href={getGoogleSearchUrl(
                      photo.metadata.gpsCoordinates.latitude,
                      photo.metadata.gpsCoordinates.longitude
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-ios-blue hover:underline"
                  >
                    <MapPin className="w-4 h-4 mr-1" />
                    Search this location on Google
                  </a>
                  <a
                    href={getGoogleMapsUrl(
                      photo.metadata.gpsCoordinates.latitude,
                      photo.metadata.gpsCoordinates.longitude
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-ios-blue hover:underline"
                  >
                    <Map className="w-4 h-4 mr-1" />
                    View on Google Maps
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-ios-text text-gray-500 italic">
                No GPS data available for this photo
              </p>
            )}
          </div>

          {photo.metadata.notes && photo.metadata.notes.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-ios-text font-semibold">Notes:</h3>
              <ScrollArea className="h-[200px] rounded-md border p-4">
                {photo.metadata.notes.map((note, index) => (
                  <div
                    key={index}
                    className="mb-2 p-3 bg-gray-50 rounded-md text-ios-text"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <p className="flex-1">{note.text}</p>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatNoteDate(note.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-ios-text font-semibold">
              Add Note: ({currentNote.length}/{MAX_NOTE_LENGTH})
            </label>
            <Textarea
              value={currentNote}
              onChange={handleNoteChange}
              className="w-full min-h-[100px]"
              placeholder="Add a note about this photo..."
              maxLength={MAX_NOTE_LENGTH}
            />
            <Button
              className="w-full bg-ios-blue text-white hover:bg-ios-blue/90"
              onClick={handleSave}
            >
              Save Note
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PhotoDetail;