import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Event, Gender } from '@/types/records';

// Configure runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Configure CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

const normalizeEventName = (distance: string): Event => {
  // Remove 'k' from distances like '5k' and add 'm'
  const normalized = distance.replace('k', '000m');
  return normalized as Event;
};

const parseCSVRecord = (row: string) => {
  const [distance, _recordType, recordTime, athlete, nationality, location, date, event, gender] = row.split(',');
  
  if (gender !== 'Men' && gender !== 'Women') {
    throw new Error(`Invalid gender value: ${gender}`);
  }

  return {
    id: uuidv4(),
    event: normalizeEventName(distance),
    gender: gender as Gender,
    athlete,
    nationality,
    mark: recordTime,
    date,
    location,
    notes: event || undefined
  };
};

const loadRecords = () => {
  const csvPath = path.join(process.cwd(), 'public', 'track_field_records.csv');
  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  const rows = fileContent.split('\n');
  
  // Skip header row and empty rows
  return rows
    .slice(1)
    .filter(row => row.trim().length > 0)
    .map(row => parseCSVRecord(row));
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const event = searchParams.get('event');
    const records = loadRecords();
    
    if (event) {
      const filteredRecords = records
        .filter(record => record.event === event)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      return NextResponse.json(filteredRecords, { headers: corsHeaders });
    }

    // If no event specified, return unique events
    const uniqueEvents = Array.from(new Set(records.map(record => record.event)));
    return NextResponse.json(uniqueEvents, { headers: corsHeaders });
  } catch (error) {
    console.error('Error loading records:', error);
    return NextResponse.json(
      { error: 'Failed to load records' }, 
      { status: 500, headers: corsHeaders }
    );
  }
} 