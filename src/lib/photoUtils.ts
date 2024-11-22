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
    // Handle different GPS coordinate formats
    const parts = dms.description.split(' ');
    if (parts.length === 0) return null;

    let degrees = 0;
    let minutes = 0;
    let seconds = 0;
    let direction = '';

    // Parse the different parts of the coordinate
    parts.forEach((part: string) => {
      if (part.includes('°')) {
        degrees = parseFloat(part.replace('°', ''));
      } else if (part.includes("'")) {
        minutes = parseFloat(part.replace("'", ''));
      } else if (part.includes('"')) {
        seconds = parseFloat(part.replace('"', ''));
      } else if (['N', 'S', 'E', 'W'].includes(part)) {
        direction = part;
      }
    });

    let dd = degrees + (minutes / 60) + (seconds / 3600);
    if (direction === 'S' || direction === 'W') {
      dd *= -1;
    }
    
    console.log('Converted coordinates:', { degrees, minutes, seconds, direction, dd });
    return dd;
  } catch (error) {
    console.error('Error converting DMS to DD:', error);
    return null;
  }
};

const extractGPSCoordinates = (exifData: any) => {
  console.log('Extracting GPS data from:', exifData);
  
  try {
    if (!exifData.GPSLatitude || !exifData.GPSLongitude) {
      console.log('No GPS data found in standard format');
      // Try alternative GPS tags
      if (exifData.gps && exifData.gps.Latitude && exifData.gps.Longitude) {
        return {
          latitude: parseFloat(exifData.gps.Latitude.description),
          longitude: parseFloat(exifData.gps.Longitude.description)
        };
      }
      return null;
    }

    const latitude = convertDMSToDD(exifData.GPSLatitude);
    const longitude = convertDMSToDD(exifData.GPSLongitude);

    if (latitude === null || longitude === null) {
      console.log('Could not convert GPS coordinates');
      return null;
    }

    console.log('Successfully extracted GPS coordinates:', { latitude, longitude });
    return { latitude, longitude };
  } catch (error) {
    console.error('Error extracting GPS coordinates:', error);
    return null;
  }
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