import ExifReader from 'exifreader';
import { Photo, PhotoMetadata } from './types';

const getExifData = async (file: File): Promise<any> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const tags = await ExifReader.load(arrayBuffer);
    console.log('Raw EXIF data:', tags);
    return tags;
  } catch (error) {
    console.error('Error extracting EXIF data:', error);
    throw new Error('Failed to extract EXIF data');
  }
};

const convertDMSToDD = (dms: any, ref: any): number | null => {
  if (!dms || !dms.value) {
    console.log('No DMS data found');
    return null;
  }
  
  try {
    const degrees = dms.value[0];
    const minutes = dms.value[1];
    const seconds = dms.value[2];
    
    let dd = degrees + (minutes / 60) + (seconds / 3600);
    
    if (ref && (ref.value === 'S' || ref.value === 'W')) {
      dd *= -1;
    }
    
    console.log('Converted coordinates:', { degrees, minutes, seconds, ref: ref?.value, dd });
    return dd;
  } catch (error) {
    console.error('Error converting DMS to DD:', error);
    return null;
  }
};

const extractGPSCoordinates = (exifData: any) => {
  console.log('Extracting GPS data from:', exifData);
  
  try {
    // Check for GPS data in different possible formats
    const gpsData = {
      latitude: exifData.GPSLatitude || exifData['gps:Latitude'] || exifData.gps?.Latitude,
      longitude: exifData.GPSLongitude || exifData['gps:Longitude'] || exifData.gps?.Longitude,
      latitudeRef: exifData.GPSLatitudeRef || exifData['gps:LatitudeRef'] || exifData.gps?.LatitudeRef,
      longitudeRef: exifData.GPSLongitudeRef || exifData['gps:LongitudeRef'] || exifData.gps?.LongitudeRef
    };

    console.log('Found GPS data:', gpsData);

    if (!gpsData.latitude || !gpsData.longitude) {
      console.log('No GPS data found in any format');
      return null;
    }

    const latitude = convertDMSToDD(gpsData.latitude, gpsData.latitudeRef);
    const longitude = convertDMSToDD(gpsData.longitude, gpsData.longitudeRef);

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