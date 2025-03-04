'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow, differenceInDays, format, parseISO } from 'date-fns';
import ReactCountryFlag from 'react-country-flag';

interface Record {
  Distance: string;
  'Record Type': string;
  'Record Time': string;
  Athlete: string;
  Nationality: string;
  Location: string;
  Date: string;
  Event: string;
  Gender: string;
}

// Define the correct order of distances
const distanceOrder: { [key: string]: number } = {
  '100m': 1,
  '200m': 2,
  '400m': 3,
  '800m': 4,
  '1500m': 5,
  'Mile': 6,
  '5k': 7,
  '10k': 8,
  'Half Marathon': 9,
  'Marathon': 10
};

// ISO country code mapping for common nationalities
const countryCodeMap: { [key: string]: string } = {
  'USA': 'US',
  'United States': 'US',
  'Great Britain': 'GB',
  'UK': 'GB',
  'United Kingdom': 'GB',
  'Kenya': 'KE',
  'Ethiopia': 'ET',
  'Jamaica': 'JM',
  'Canada': 'CA',
  'Australia': 'AU',
  'New Zealand': 'NZ',
  'France': 'FR',
  'Germany': 'DE',
  'Italy': 'IT',
  'Spain': 'ES',
  'Japan': 'JP',
  'China': 'CN',
  'Russia': 'RU',
  'Brazil': 'BR',
  'South Africa': 'ZA',
  'Morocco': 'MA',
  'Algeria': 'DZ',
  'Norway': 'NO',
  'Sweden': 'SE',
  'Finland': 'FI',
  'Denmark': 'DK',
  'Netherlands': 'NL',
  'Belgium': 'BE',
  'Switzerland': 'CH',
  'Austria': 'AT',
  'Poland': 'PL',
  'Czech Republic': 'CZ',
  'Hungary': 'HU',
  'Romania': 'RO',
  'Ukraine': 'UA',
  'Greece': 'GR',
  'Turkey': 'TR',
  'Portugal': 'PT',
  'Ireland': 'IE',
  'Mexico': 'MX',
  'Argentina': 'AR',
  'Colombia': 'CO',
  'Chile': 'CL',
  'Peru': 'PE',
  'Venezuela': 'VE',
  'Ecuador': 'EC',
  'Uruguay': 'UY',
  'Paraguay': 'PY',
  'Bolivia': 'BO',
  'Costa Rica': 'CR',
  'Panama': 'PA',
  'Dominican Republic': 'DO',
  'Puerto Rico': 'PR',
  'Cuba': 'CU',
  'Trinidad and Tobago': 'TT',
  'Bahamas': 'BS',
  'Barbados': 'BB',
  'Haiti': 'HT',
  'India': 'IN',
  'Pakistan': 'PK',
  'Bangladesh': 'BD',
  'Sri Lanka': 'LK',
  'Nepal': 'NP',
  'Indonesia': 'ID',
  'Malaysia': 'MY',
  'Singapore': 'SG',
  'Thailand': 'TH',
  'Vietnam': 'VN',
  'Philippines': 'PH',
  'South Korea': 'KR',
  'North Korea': 'KP',
  'Taiwan': 'TW',
  'Hong Kong': 'HK',
  'Egypt': 'EG',
  'Tunisia': 'TN',
  'Libya': 'LY',
  'Sudan': 'SD',
  'Nigeria': 'NG',
  'Ghana': 'GH',
  'Cameroon': 'CM',
  'Senegal': 'SN',
  'Ivory Coast': 'CI',
  'Uganda': 'UG',
  'Tanzania': 'TZ',
  'Zimbabwe': 'ZW',
  'Botswana': 'BW',
  'Namibia': 'NA',
  'Qatar': 'QA',
  'UAE': 'AE',
  'Saudi Arabia': 'SA',
  'Kuwait': 'KW',
  'Bahrain': 'BH',
  'Oman': 'OM',
  'Israel': 'IL',
  'Palestine': 'PS',
  'Lebanon': 'LB',
  'Jordan': 'JO',
  'Syria': 'SY',
  'Iraq': 'IQ',
  'Iran': 'IR',
  'Afghanistan': 'AF',
  'Kazakhstan': 'KZ',
  'Uzbekistan': 'UZ',
  'Turkmenistan': 'TM',
  'Kyrgyzstan': 'KG',
  'Tajikistan': 'TJ',
  'Mongolia': 'MN',
  'Belarus': 'BY',
  'Moldova': 'MD',
  'Georgia': 'GE',
  'Armenia': 'AM',
  'Azerbaijan': 'AZ',
  'Estonia': 'EE',
  'Latvia': 'LV',
  'Lithuania': 'LT',
  'Slovenia': 'SI',
  'Croatia': 'HR',
  'Bosnia and Herzegovina': 'BA',
  'Serbia': 'RS',
  'Montenegro': 'ME',
  'North Macedonia': 'MK',
  'Albania': 'AL',
  'Bulgaria': 'BG',
  'Slovakia': 'SK',
  'Luxembourg': 'LU',
  'Malta': 'MT',
  'Cyprus': 'CY',
  'Iceland': 'IS',
  'Liechtenstein': 'LI',
  'Monaco': 'MC',
  'Andorra': 'AD',
  'San Marino': 'SM',
  'Vatican City': 'VA'
};

// Function to get ISO country code from nationality
const getCountryCode = (nationality: string): string => {
  return countryCodeMap[nationality] || 'UN'; // Default to UN flag if not found
};

export default function Home() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDistance, setSelectedDistance] = useState<string>('');
  const [selectedGender, setSelectedGender] = useState<string>('');

  useEffect(() => {
    async function fetchRecords() {
      try {
        const response = await fetch('/api/records');
        if (!response.ok) {
          throw new Error('Failed to fetch records');
        }
        const data = await response.json();
        setRecords(data.records);
        
        // Set default selections for distance and gender if available
        if (data.records.length > 0) {
          setSelectedDistance(data.records[0].Distance);
          setSelectedGender(data.records[0].Gender);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching records:', err);
        setError('Failed to load records. Please try again later.');
        setLoading(false);
      }
    }

    fetchRecords();
  }, []);

  // Get unique distances and genders for filters
  const distances = [...new Set(records.map(record => record.Distance))];
  
  // Sort distances according to the predefined order
  const sortedDistances = [...distances].sort((a, b) => {
    const orderA = distanceOrder[a] || 999; // Default high value for unknown distances
    const orderB = distanceOrder[b] || 999;
    return orderA - orderB;
  });
  
  const genders = [...new Set(records.map(record => record.Gender))].sort();

  // Filter records based on selected distance and gender
  const filteredRecords = records.filter(record => {
    if (selectedDistance && record.Distance !== selectedDistance) return false;
    if (selectedGender && record.Gender !== selectedGender) return false;
    return true;
  });

  // Sort records by date in descending order (newest first)
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    return new Date(b.Date).getTime() - new Date(a.Date).getTime();
  });

  // Calculate time since last record
  const lastRecord = sortedRecords.length > 0 ? sortedRecords[0] : null;
  const timeSinceLastRecord = lastRecord ? formatDistanceToNow(new Date(lastRecord.Date), { addSuffix: true }) : '';

  // Format as "X years, Y months, Z days"
  const formatDetailedTimeSince = (dateString: string) => {
    const recordDate = new Date(dateString);
    const now = new Date();
    
    const totalDays = differenceInDays(now, recordDate);
    const years = Math.floor(totalDays / 365);
    const months = Math.floor((totalDays % 365) / 30);
    const days = totalDays % 30;
    
    return `${years} years, ${months} months, ${days} days`;
  };

  // Generate Wikipedia search URL for an athlete
  const getAthleteUrl = (name: string, nationality: string) => {
    // Format the name for Wikipedia search
    const formattedName = encodeURIComponent(name + " " + nationality + " athlete");
    return `https://en.wikipedia.org/wiki/Special:Search?search=${formattedName}`;
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-8 text-center">Track & Field World Records Timeline</h1>
      
      {/* Filters */}
      <div className="w-full max-w-4xl mb-8 flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-sm">Distance</label>
          <select 
            className="px-3 py-1 border rounded-md bg-white text-sm"
            value={selectedDistance}
            onChange={(e) => setSelectedDistance(e.target.value)}
          >
            {sortedDistances.map(distance => (
              <option key={distance} value={distance}>{distance}</option>
            ))}
          </select>
        </div>
        
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-sm">Gender</label>
          <select 
            className="px-3 py-1 border rounded-md bg-white text-sm"
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
          >
            {genders.map(gender => (
              <option key={gender} value={gender}>{gender}</option>
            ))}
          </select>
        </div>
      </div>
      
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {error && <p className="text-xl text-red-500 text-center">{error}</p>}
      
      {!loading && !error && (
        <>
          {lastRecord && (
            <div className="mb-8 p-5 bg-white rounded-xl border border-gray-200 shadow-lg max-w-md mx-auto transform hover:scale-[1.02] transition-all duration-300">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Current {selectedDistance} Record</h2>
                  <p className="text-sm text-gray-500">{formatDetailedTimeSince(lastRecord.Date)}</p>
                </div>
                <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                  {lastRecord['Record Type']}
                </span>
              </div>
              
              <div className="flex justify-between items-center mb-3">
                <div className="text-3xl font-bold text-blue-700">{lastRecord['Record Time']}</div>
                <div className="text-sm font-medium text-gray-600">{format(new Date(lastRecord.Date), 'MMMM d, yyyy')}</div>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <a 
                  href={getAthleteUrl(lastRecord.Athlete, lastRecord.Nationality)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                  title="Search for this athlete on Wikipedia"
                >
                  {lastRecord.Athlete}
                </a>
                <ReactCountryFlag 
                  countryCode={getCountryCode(lastRecord.Nationality)} 
                  svg 
                  style={{ width: '1.2em', height: '1.2em' }} 
                  title={lastRecord.Nationality}
                />
              </div>
              
              <div className="text-sm text-gray-600">{lastRecord.Location}</div>
              
              {lastRecord.Event && (
                <div className="mt-3 text-sm italic text-gray-500">{lastRecord.Event}</div>
              )}
            </div>
          )}
          
          <p className="text-md mb-4 text-center">
            {selectedDistance} - {selectedGender}
            <span className="text-gray-500 ml-2">({sortedRecords.length} records)</span>
          </p>
          
          {/* Timeline */}
          <div className="w-full max-w-4xl relative mt-16 mb-16">
            {/* Timeline line with gradient */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-400 via-purple-500 to-pink-500"></div>
            
            {/* Add CSS for pulsing animation */}
            <style jsx>{`
              @keyframes pulse {
                0% {
                  box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7);
                }
                70% {
                  box-shadow: 0 0 0 6px rgba(37, 99, 235, 0);
                }
                100% {
                  box-shadow: 0 0 0 0 rgba(37, 99, 235, 0);
                }
              }
              .timeline-dot {
                animation: pulse 2s infinite;
              }
            `}</style>
            
            {/* Records */}
            {sortedRecords.map((record, index) => {
              // Calculate improvement from next record (which is older since we're sorting newest first)
              let improvement = '';
              if (index < sortedRecords.length - 1) {
                const currentTime = parseFloat(record['Record Time'].replace(':', '.'));
                const previousTime = parseFloat(sortedRecords[index + 1]['Record Time'].replace(':', '.'));
                if (!isNaN(currentTime) && !isNaN(previousTime)) {
                  const diff = previousTime - currentTime;
                  improvement = diff.toFixed(2) + 's faster';
                }
              }
              
              // Calculate time between records
              let timeBetweenRecords = '';
              if (index > 0) {
                const currentDate = new Date(record.Date);
                const previousDate = new Date(sortedRecords[index - 1].Date);
                const daysBetween = differenceInDays(previousDate, currentDate);
                
                const years = Math.floor(daysBetween / 365);
                const months = Math.floor((daysBetween % 365) / 30);
                const days = daysBetween % 30;
                
                if (years > 0) {
                  timeBetweenRecords = `${years}y ${months}mon ${days}d`;
                } else if (months > 0) {
                  timeBetweenRecords = `${months}mon ${days}d`;
                } else {
                  timeBetweenRecords = `${days} days`;
                }
              }
              
              return (
                <div 
                  key={index} 
                  className={`flex items-center mb-5 ${
                    index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  {/* Timeline dot with pulsing effect */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-blue-600 z-10 shadow-md timeline-dot"></div>
                  
                  {/* Time between records */}
                  {index > 0 && (
                    <div className="absolute left-1/2 transform -translate-x-1/2 text-xs text-gray-500 bg-white px-2 py-1 rounded-full -mt-10 z-10 shadow-sm">
                      {timeBetweenRecords}
                    </div>
                  )}
                  
                  {/* Content card */}
                  <div className={`w-5/12 ${index % 2 === 0 ? 'mr-auto pr-4' : 'ml-auto pl-4'}`}>
                    <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-sm text-gray-500">{format(new Date(record.Date), 'MMM d, yyyy')}</div>
                        <div className="text-sm font-semibold text-blue-600">{record['Record Time']}</div>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <a 
                          href={getAthleteUrl(record.Athlete, record.Nationality)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                          title="Search for this athlete on Wikipedia"
                        >
                          {record.Athlete}
                        </a>
                        <ReactCountryFlag 
                          countryCode={getCountryCode(record.Nationality)} 
                          svg 
                          style={{ width: '1.2em', height: '1.2em' }} 
                          title={record.Nationality}
                        />
                      </div>
                      
                      <div className="text-sm text-gray-600">{record.Location}</div>
                      
                      {improvement && (
                        <div className="mt-2 text-sm font-medium text-green-600">
                          {improvement}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
} 