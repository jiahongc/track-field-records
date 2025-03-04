'use client';

import { useState, useEffect } from 'react';
import { getRecordsByEvent, getUniqueEvents } from '@/services/recordService';
import RecordTimeline from '@/components/RecordTimeline';
import { Event, Gender, Record } from '@/types/records';

export default function Home() {
  const [selectedEvent, setSelectedEvent] = useState<Event>('100m');
  const [selectedGender, setSelectedGender] = useState<Gender>('Men');
  const [records, setRecords] = useState<Record[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load events on mount
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await getUniqueEvents();
        setEvents(data);
      } catch (error) {
        console.error('Error loading events:', error);
        setError('Failed to load events');
      }
    };
    loadEvents();
  }, []);

  // Load records when event or gender changes
  useEffect(() => {
    const loadRecords = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getRecordsByEvent(selectedEvent);
        const filteredData = data.filter(record => record.gender === selectedGender);
        setRecords(filteredData);
      } catch (error) {
        console.error('Error loading records:', error);
        setError('Failed to load records');
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, [selectedEvent, selectedGender]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Fixed header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-4xl font-bold mb-4 text-center">
              Track & Field World Records Progression
            </h1>

            {/* Event and Gender Selection */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              {/* Gender Toggle */}
              <div className="flex rounded-lg overflow-hidden border border-gray-200">
                {['Men', 'Women'].map((gender) => (
                  <button
                    key={gender}
                    onClick={() => setSelectedGender(gender as Gender)}
                    className={`px-4 py-2 text-sm font-medium ${
                      selectedGender === gender
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {gender}
                  </button>
                ))}
              </div>

              {/* Event Selection */}
              <div className="flex flex-wrap gap-2">
                {events.map((event) => (
                  <button
                    key={event}
                    onClick={() => setSelectedEvent(event)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedEvent === event
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    {event}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : records.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">No records found for this event</div>
          </div>
        ) : (
          <RecordTimeline records={records} />
        )}
      </div>
    </main>
  );
}
