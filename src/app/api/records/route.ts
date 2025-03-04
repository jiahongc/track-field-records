import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export async function GET() {
  try {
    // Read the CSV file
    const filePath = path.join(process.cwd(), 'track_field_records.csv');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Parse the CSV content
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });
    
    // Return the records as JSON
    return NextResponse.json({ records });
  } catch (error) {
    console.error('Error reading or parsing CSV file:', error);
    return NextResponse.json(
      { error: 'Failed to load records' },
      { status: 500 }
    );
  }
} 