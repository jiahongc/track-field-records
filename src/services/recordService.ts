import { Record, Event } from '@/types/records';

export const getRecordsByEvent = async (event: Event): Promise<Record[]> => {
  const response = await fetch(`/api/records?event=${event}`);
  if (!response.ok) {
    throw new Error('Failed to fetch records');
  }
  return response.json();
};

export const getUniqueEvents = async (): Promise<Event[]> => {
  const response = await fetch('/api/records');
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }
  return response.json();
}; 