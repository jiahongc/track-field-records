'use client';

import React from 'react';

interface RecordsSelectorProps {
  distances: string[];
  selectedDistance: string;
  selectedGender: string;
  selectedPaceUnit: string;
  onDistanceChange: (distance: string) => void;
  onGenderChange: (gender: string) => void;
  onPaceUnitChange: (paceUnit: string) => void;
}

const RecordsSelector: React.FC<RecordsSelectorProps> = ({
  distances,
  selectedDistance,
  selectedGender,
  selectedPaceUnit,
  onDistanceChange,
  onGenderChange,
  onPaceUnitChange,
}) => {
  return (
    <div className="bg-blue-50 p-4 rounded-lg shadow-sm mb-6">
      <div className="flex flex-wrap gap-4">
        {/* Distance Selector */}
        <div className="flex-1 min-w-[200px]">
          <select
            value={selectedDistance}
            onChange={(e) => onDistanceChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {distances.map((distance) => (
              <option key={distance} value={distance}>
                {distance}
              </option>
            ))}
          </select>
        </div>

        {/* Gender Selector */}
        <div className="flex-1 min-w-[200px]">
          <select
            value={selectedGender}
            onChange={(e) => onGenderChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Men">Men</option>
            <option value="Women">Women</option>
          </select>
        </div>

        {/* Pace Unit Selector */}
        <div className="flex-1 min-w-[200px]">
          <select
            value={selectedPaceUnit}
            onChange={(e) => onPaceUnitChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="min/km">min/km</option>
            <option value="min/mile">min/mile</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default RecordsSelector;