import EXIF from 'exif-js';
import { Photo, PhotoMetadata } from './types';

const getExifData = (file: File): Promise<any> => {
  return new Promise((resolve) => {
    EXIF.getData(file as any, function(this: any) {
      const exifData = EXIF.getAllTags(this);
      console.log('EXIF data extracted:', exifData);
      resolve(exifData);
    });
  });
};

const convertDMSToDD = (degrees: number, minutes: number, seconds: number, direction: string) => {
  let dd = degrees + minutes / 60 + seconds / 3600;
  if (direction === 'S' || direction === 'W') {
    dd = dd * -1;
  }
  return dd;
};

const extractGPSCoordinates = (exifData: any) => {
  if (!exifData.GPSLatitude || !exifData.GPSLongitude) {
    console.log('No GPS data found in EXIF');
    return null;
  }

  const latDegrees = exifData.GPSLatitude[0];
  const latMinutes = exifData.GPSLatitude[1];
  const latSeconds = exifData.GPSLatitude[2];
  const latDirection = exifData.GPSLatitudeRef;

  const lonDegrees = exifData.GPSLongitude[0];
  const lonMinutes = exifData.GPSLongitude[1];
  const lonSeconds = exifData.GPSLongitude[2];
  const lonDirection = exifData.GPSLongitudeRef;

  const latitude = convertDMSToDD(latDegrees, latMinutes, latSeconds, latDirection);
  const longitude = convertDMSToDD(lonDegrees, lonMinutes, lonSeconds, lonDirection);

  return { latitude, longitude };
};

export const extractMetadata = async (file: File): Promise<PhotoMetadata> => {
  const exifData = await getExifData(file);
  console.log('Processing EXIF data for image:', file.name);

  const gpsCoordinates = extractGPSCoordinates(exifData);
  const dateTimeOriginal = exifData.DateTimeOriginal;
  
  let date: Date;
  if (dateTimeOriginal) {
    // Convert EXIF date format (YYYY:MM:DD HH:mm:ss) to standard format
    const [datePart, timePart] = dateTimeOriginal.split(' ');
    const [year, month, day] = datePart.split(':');
    const [hour, minute, second] = timePart.split(':');
    date = new Date(year, month - 1, day, hour, minute, second);
    console.log('Original photo date extracted:', date);
  } else {
    date = new Date(file.lastModified);
    console.log('Using file modification date:', date);
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    date,
    gpsCoordinates: gpsCoordinates || undefined,
  };
};

export const createPhotoObject = async (file: File): Promise<Photo> => {
  const metadata = await extractMetadata(file);
  return {
    id: metadata.id,
    url: URL.createObjectURL(file),
    metadata
  };
};