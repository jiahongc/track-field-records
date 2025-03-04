export type Event = 
  | '100m'
  | '200m'
  | '400m'
  | '800m'
  | '1500m'
  | 'Mile'
  | '5000m'
  | '10000m'
  | 'Half Marathon'
  | 'Marathon';

export type Gender = 'Men' | 'Women';

export interface Record {
  id: string;
  event: Event;
  gender: Gender;
  athlete: string;
  nationality: string;
  mark: string; // Time in the format "MM:SS.ms" or "SS.ms"
  date: string; // ISO date string
  location: string;
  notes?: string;
}

export interface RecordProgression {
  event: Event;
  gender: Gender;
  records: Record[];
} 