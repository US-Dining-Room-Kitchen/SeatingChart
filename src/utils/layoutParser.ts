import { Table, LayoutOption } from '../types';

/**
 * Parse layout data from a JSON array
 * 
 * @param layoutData - The raw layout data from a JSON file
 * @returns Array of parsed Table objects
 * @throws Error if the layout data is not a valid array
 */
export function parseLayoutData(layoutData: unknown): Table[] {
  if (!Array.isArray(layoutData)) {
    throw new Error('Layout file must be a JSON array.');
  }

  return layoutData.map((table: Record<string, unknown>, index: number) => ({
    internalId: table.internalId || `table-${index}-${Date.now()}`,
    displayId: (table.displayId || `${index + 1}`).toString(),
    orientation: table.orientation === 'vertical' ? 'vertical' : 'horizontal',
    gridCol: Number(table.gridCol),
    gridRow: Number(table.gridRow),
    capacity: Number(table.capacity) || 10,
  } as Table));
}

/**
 * Load layout from a URL
 * 
 * @param url - The URL to fetch the layout from
 * @returns Promise that resolves to an array of tables
 * @throws Error if the layout cannot be loaded or parsed
 */
export async function loadLayoutFromUrl(url: string): Promise<Table[]> {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Layout file not found');
  }

  const data = await response.json();
  return parseLayoutData(data);
}

/**
 * Load the list of available layouts
 * 
 * @returns Promise that resolves to an array of layout options
 */
export async function loadLayoutOptions(): Promise<LayoutOption[]> {
  try {
    const response = await fetch('./layouts/layouts.json');
    
    if (!response.ok) {
      console.warn('Failed to load layouts list');
      return [];
    }

    const data = await response.json();
    return data as LayoutOption[];
  } catch (err) {
    console.warn('Failed to load layouts list', err);
    return [];
  }
}

/**
 * Load a layout file from the file system
 * 
 * @param file - The layout file to parse
 * @returns Promise that resolves to an array of tables
 * @throws Error if the file cannot be parsed
 */
export async function parseLayoutFile(file: File): Promise<Table[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const layoutData = JSON.parse(event.target?.result as string);
        const tables = parseLayoutData(layoutData);
        resolve(tables);
      } catch (err) {
        reject(new Error(`Failed to parse layout file: ${(err as Error).message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Error reading layout file."));
    };
    
    reader.readAsText(file);
  });
}
