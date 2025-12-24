import * as XLSX from 'xlsx';
import type { Guest } from '../types';

/**
 * Parse guest data from a CSV or Excel file
 * 
 * @param file - The file to parse
 * @returns Promise that resolves to an array of guests
 * @throws Error if the file cannot be parsed or contains invalid data
 */
export async function parseGuestFile(file: File): Promise<Guest[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    const processGuestData = (data: unknown[][]): Guest[] => {
      if (!data || data.length === 0) {
        throw new Error("File is empty or contains no data.");
      }

      let startRow = 0;
      let nameIdx = 0;
      let sizeIdx = 1;
      let notesIdx = 2;

      // Check if first row contains headers
      if (Array.isArray(data[0])) {
        const headers = data[0].map(h => (h || '').toString().trim().toLowerCase());
        const hostPos = headers.indexOf('host name');
        const seatsPos = headers.indexOf('seats required');
        
        if (hostPos !== -1 && seatsPos !== -1) {
          startRow = 1;
          nameIdx = hostPos;
          sizeIdx = seatsPos;
          notesIdx = headers.indexOf('notes');
        }
      }

      // Parse each row into a guest object
      const newGuests = data.slice(startRow).map((row, idx) => {
        if (!Array.isArray(row)) return null;
        if (row.every(item => item === null || item === '')) return null;

        const rowNum = idx + startRow + 1;
        const name = (row[nameIdx] || '').toString().trim().replace(/^"|"$/g, '');
        const sizeStr = (row[sizeIdx] || '').toString().trim();
        let notes = '';

        if (notesIdx != null && notesIdx >= 0 && row.length > notesIdx) {
          notes = (row[notesIdx] || '').toString().trim().replace(/^"|"$/g, '');
        } else if (startRow === 0 && row.length > 2) {
          notes = (row.slice(2).join(', ') || '').toString().trim().replace(/^"|"$/g, '');
        }

        if (!name && !sizeStr) return null;
        if (!name) throw new Error(`Missing guest name on row ${rowNum}.`);

        const size = parseInt(sizeStr, 10);
        if (isNaN(size) || size <= 0) {
          throw new Error(`Invalid party size for "${name}" on row ${rowNum}.`);
        }

        return {
          id: `imported-g${rowNum}-${Date.now()}`,
          name,
          size,
          notes: notes || undefined,
        } as Guest;
      }).filter((guest): guest is Guest => guest !== null);

      if (newGuests.length === 0) {
        throw new Error("No valid guest data found in the file.");
      }

      return newGuests;
    };

    // Handle Excel files (.xlsx)
    if (file.name.endsWith('.xlsx')) {
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as unknown[][];
          const guests = processGuestData(jsonData);
          resolve(guests);
        } catch (err) {
          reject(new Error(`Error processing .xlsx file: ${(err as Error).message}`));
        }
      };
      reader.onerror = () => {
        reject(new Error("Error reading file."));
      };
      reader.readAsArrayBuffer(file);
    }
    // Handle CSV files
    else {
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
          
          // Determine delimiter (comma or semicolon)
          const delimiter = text.indexOf(";") !== -1 && 
            (text.indexOf(";") < text.indexOf(",") || text.indexOf(",") === -1) 
            ? ";" 
            : ",";
          
          // Split CSV respecting quoted values
          const regex = delimiter === "," 
            ? /,(?=(?:(?:[^"]*"){2})*[^"]*$)/ 
            : /;(?=(?:(?:[^"]*"){2})*[^"]*$)/;
          
          const csvData = lines.map(line => line.split(regex));
          const guests = processGuestData(csvData);
          resolve(guests);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => {
        reject(new Error("Error reading file."));
      };
      reader.readAsText(file);
    }
  });
}
