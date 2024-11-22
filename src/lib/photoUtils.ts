import ExifReader from 'exifreader';
import { Photo, PhotoMetadata } from './types';

const getExifData = async (file: File): Promise<any> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const tags = await ExifReader.load(arrayBuffer);
    console.log('EXIF data extracted successfully:', tags);
    return tags;
  } catch (error) {
    console.error('Error extracting EXIF data:', error);
    throw new Error('Failed to extract EXIF data');
  }
};

const convertDMSToDD = (dms: any): number | null => {
  if (!dms || !dms.description) return null;
  
  try {
    const parts = dms.description.match(/(\d+),(\d+.\d+)([NSEW])/);
    if (!parts) return null;
    
    const degrees = parseFloat(parts[1]);
    const minutes = parseFloat(parts[2]);
    const direction = parts[3];
    
    let dd = degrees + minutes / 60;
    if (direction === 'S' || direction === 'W') {
      dd = dd * -1;
    }
    return dd;
  } catch (error) {
    console.error('Error converting DMS to DD:', error);
    return null;
  }
};

const extractGPSCoordinates = (exifData: any) => {
  if (!exifData.GPSLatitude || !exifData.GPSLongitude) {
    console.log('No GPS data found in EXIF');
    return null;
  }

  const latitude = convertDMSToDD(exifData.GPSLatitude);
  const longitude = convertDMSToDD(exifData.GPSLongitude);

  if (latitude === null || longitude === null) {
    return null;
  }

  return { latitude, longitude };
};

export const extractMetadata = async (file: File): Promise<PhotoMetadata> => {
  try {
    console.log('Starting metadata extraction for:', file.name);
    const exifData = await getExifData(file);
    console.log('Processing EXIF data for image:', file.name);

    const gpsCoordinates = extractGPSCoordinates(exifData);
    const dateTimeOriginal = exifData.DateTimeOriginal?.description;
    
    let date: Date;
    if (dateTimeOriginal) {
      const [datePart, timePart] = dateTimeOriginal.split(' ');
      const [year, month, day] = datePart.split(':');
      const [hour, minute, second] = timePart.split(':');
      date = new Date(+year, +month - 1, +day, +hour, +minute, +second);
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
  } catch (error) {
    console.error('Error extracting metadata:', error);
    throw new Error('Failed to extract photo metadata');
  }
};

export const createPhotoObject = async (file: File): Promise<Photo> => {
  try {
    console.log('Creating photo object for:', file.name);
    const metadata = await extractMetadata(file);
    return {
      id: metadata.id,
      url: URL.createObjectURL(file),
      metadata
    };
  } catch (error) {
    console.error('Error creating photo object:', error);
    throw new Error('Failed to process photo');
  }
};