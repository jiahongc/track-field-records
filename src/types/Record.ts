export interface Record {
  distance: string;
  recordType: string;
  recordTime: string;
  athlete: string;
  nationality: string;
  location: string;
  date: string;
  event?: string; // Optional since not all records have an event
  gender: 'Men' | 'Women';
}

// Helper function to parse CSV row into Record object
export const parseRecord = (row: string): Record => {
  const [distance, recordType, recordTime, athlete, nationality, location, date, event, gender] = row.split(',');
  
  if (gender !== 'Men' && gender !== 'Women') {
    throw new Error(`Invalid gender value: ${gender}`);
  }

  return {
    distance,
    recordType,
    recordTime,
    athlete,
    nationality,
    location,
    date,
    event: event || undefined,
    gender,
  };
}; 