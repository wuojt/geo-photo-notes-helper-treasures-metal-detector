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

const convertDMSToDD = (dms: any, ref: any): number => {
  if (!dms || !dms.value) {
    console.log('No DMS data found');
    return 0;
  }
  
  try {
    const degrees = Array.isArray(dms.value[0]) ? dms.value[0][0] : parseInt(String(dms.value[0])) || 0;
    const minutes = Array.isArray(dms.value[1]) ? dms.value[1][0] : parseInt(String(dms.value[1])) || 0;
    const secondsArr = Array.isArray(dms.value[2]) ? dms.value[2] : [parseInt(String(dms.value[2])), 1];
    const seconds = secondsArr[0] / secondsArr[1];
    
    let dd = degrees + (minutes / 60) + (seconds / 3600);
    
    const refValue = Array.isArray(ref?.value) ? ref.value[0] : ref?.value;
    if (refValue && (refValue === 'S' || refValue === 'W')) {
      dd *= -1;
    }
    
    console.log('Converting DMS to DD:', {
      original: { degrees, minutes, seconds, ref: refValue },
      result: dd
    });
    
    return Number(dd.toFixed(6));
  } catch (error) {
    console.error('Error converting DMS to DD:', error);
    return 0;
  }
};

const extractGPSCoordinates = (exifData: any) => {
  if (!exifData) {
    console.log('No EXIF data provided');
    return null;
  }

  console.log('Extracting GPS data from:', exifData);
  
  try {
    // Sprawdzamy wszystkie możliwe ścieżki do danych GPS
    const gpsData = {
      latitude: exifData['GPS:Latitude'] || exifData.GPSLatitude || exifData.gps?.Latitude,
      longitude: exifData['GPS:Longitude'] || exifData.GPSLongitude || exifData.gps?.Longitude,
      latitudeRef: exifData['GPS:LatitudeRef'] || exifData.GPSLatitudeRef || exifData.gps?.LatitudeRef,
      longitudeRef: exifData['GPS:LongitudeRef'] || exifData.GPSLongitudeRef || exifData.gps?.LongitudeRef
    };

    console.log('Found raw GPS data:', gpsData);

    if (!gpsData.latitude || !gpsData.longitude) {
      console.log('No GPS coordinates found in EXIF data');
      return null;
    }

    const latitude = convertDMSToDD(gpsData.latitude, gpsData.latitudeRef);
    const longitude = convertDMSToDD(gpsData.longitude, gpsData.longitudeRef);

    console.log('Successfully extracted GPS coordinates:', { latitude, longitude });
    
    if (latitude === 0 && longitude === 0) {
      console.log('Invalid GPS coordinates (0,0)');
      return null;
    }

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