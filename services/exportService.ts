// A utility function to get the current date in YYYY-MM-DD format
const getFormattedDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

// A utility function to trigger the download of a file in the browser
const downloadFile = (content: string, mimeType: string, filename: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// Converts a value to a CSV-safe string. Handles objects, arrays, and strings with special characters.
const toCsvValue = (value: any): string => {
    if (value === null || value === undefined) {
        return '';
    }
    if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
    }
    const stringValue = String(value);
    if (/[",\n]/.test(stringValue)) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
};


/**
 * Converts an array of objects to a CSV string.
 * @param data The array of objects to convert.
 * @returns A string in CSV format.
 */
const jsonToCsv = (data: any[]): string => {
    if (data.length === 0) {
        return '';
    }
    const headers = Object.keys(data[0]);
    const headerRow = headers.map(toCsvValue).join(',');
    const rows = data.map(row => {
        return headers.map(header => toCsvValue(row[header])).join(',');
    });
    return [headerRow, ...rows].join('\n');
};

/**
 * Exports data as a JSON file.
 * @param data The data to export.
 * @param fileNamePrefix The prefix for the filename.
 */
export const exportAsJson = (data: any[], fileNamePrefix: string) => {
    const jsonString = JSON.stringify(data, null, 2);
    const filename = `${fileNamePrefix}_export_${getFormattedDate()}.json`;
    downloadFile(jsonString, 'application/json', filename);
};


/**
 * Exports data as a CSV file.
 * @param data The data to export.
 * @param fileNamePrefix The prefix for the filename.
 */
export const exportAsCsv = (data: any[], fileNamePrefix: string) => {
    const csvString = jsonToCsv(data);
    const filename = `${fileNamePrefix}_export_${getFormattedDate()}.csv`;
    downloadFile(csvString, 'text/csv;charset=utf-8;', filename);
};
