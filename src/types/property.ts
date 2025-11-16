// src/types/property.ts

export interface TimeEntry {
  startTime: string;  // ISO-String z.B. "2025-11-01T09:00:00.000Z"
  endTime: string | null;  // null wenn Check-Out noch nicht erfolgt ist
  duration: number | null; // in Minuten, null wenn noch aktiv Dauer in Minuten, berechnet beim Check-Out
  date: string; // z.B. '2025-11-01'
}

export interface Property {
  id: string;
  name: string;
  street: string;
  houseNumber: string;
  city: string;
  timeEntries: TimeEntry[];
}
