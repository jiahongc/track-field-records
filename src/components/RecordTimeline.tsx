import { Record } from '@/types/records';
import { format, differenceInYears, differenceInMonths, differenceInDays } from 'date-fns';

interface RecordTimelineProps {
  records: Record[];
}

const formatTimeDifference = (prevDate: Date, currentDate: Date) => {
  const years = differenceInYears(currentDate, prevDate);
  const months = differenceInMonths(currentDate, prevDate) % 12;
  const days = differenceInDays(currentDate, prevDate) % 30;

  const parts = [];
  if (years > 0) parts.push(`${years} year${years > 1 ? 's' : ''}`);
  if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`);
  if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);

  return parts.join(', ');
};

const RecordTimeline = ({ records }: RecordTimelineProps) => {
  // Sort records from newest to oldest
  const sortedRecords = [...records].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="relative w-full max-w-2xl mx-auto py-8">
      {/* Vertical line */}
      <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gray-200" />

      {sortedRecords.map((record, index) => {
        const currentDate = new Date(record.date);
        const prevRecord = sortedRecords[index + 1];
        const timeDiff = prevRecord ? formatTimeDifference(new Date(prevRecord.date), currentDate) : null;

        return (
          <div key={record.id}>
            <div className="relative flex items-center mb-2">
              {/* Timeline dot */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full bg-blue-500 border-2 border-white" />

              {/* Content card - alternating sides */}
              <div className={`w-5/12 ${index % 2 === 0 ? 'ml-auto pl-6' : 'mr-auto pr-6 text-right'}`}>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="font-bold text-lg mb-1">{record.mark}</div>
                  <div className="text-gray-700 text-sm mb-0.5">{record.athlete}</div>
                  <div className="text-gray-600 text-xs mb-0.5">{record.nationality}</div>
                  <div className="text-gray-500 text-xs mb-0.5">{record.location}</div>
                  <div className="text-gray-400 text-xs">
                    {format(currentDate, 'MMMM d, yyyy')}
                  </div>
                  {record.notes && (
                    <div className="mt-1 text-xs text-blue-600 italic">
                      {record.notes}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Time difference */}
            {timeDiff && (
              <div className="relative flex justify-center mb-6">
                <div className="bg-gray-50 text-gray-500 text-xs px-3 py-1 rounded-full border border-gray-200">
                  {timeDiff}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default RecordTimeline; 