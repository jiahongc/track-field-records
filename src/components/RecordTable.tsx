'use client';

import React from 'react';
import { Record, Event, Gender } from '@/types/records';

interface RecordTableProps {
  records: Record[];
  event: Event;
  gender: Gender;
}

const RecordTable: React.FC<RecordTableProps> = ({ records, event, gender }) => {
  return (
    <div className="overflow-x-auto">
      <h2 className="text-2xl font-bold mb-4">{event} - {gender}</h2>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">Athlete</th>
            <th className="px-4 py-2 text-left">Nationality</th>
            <th className="px-4 py-2 text-left">Mark</th>
            <th className="px-4 py-2 text-left">Location</th>
            <th className="px-4 py-2 text-left">Notes</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id} className="border-t border-gray-300 hover:bg-gray-50">
              <td className="px-4 py-2">{new Date(record.date).toLocaleDateString()}</td>
              <td className="px-4 py-2 font-medium">{record.athlete}</td>
              <td className="px-4 py-2">{record.nationality}</td>
              <td className="px-4 py-2 font-mono">{record.mark}</td>
              <td className="px-4 py-2">{record.location}</td>
              <td className="px-4 py-2 text-gray-600">{record.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecordTable; 