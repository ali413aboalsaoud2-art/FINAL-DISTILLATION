export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const parseDataFile = async (file: File): Promise<Array<Record<string, string | number>>> => {
  const text = await file.text();
  
  if (file.name.toLowerCase().endsWith('.json')) {
    try {
      const data = JSON.parse(text);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.error("Invalid JSON", e);
      return [];
    }
  }

  if (file.name.toLowerCase().endsWith('.csv')) {
    const rows = text.split('\n').map(r => r.trim()).filter(r => r);
    if (rows.length < 2) return [];

    const headers = rows[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    return rows.slice(1).map(row => {
      // Handle simple CSV splitting (doesn't account for commas in quotes completely, but sufficient for simple data)
      const values = row.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      return headers.reduce((obj, header, index) => {
        const val = values[index];
        // Try to convert to number if possible
        const numVal = Number(val);
        obj[header] = !isNaN(numVal) && val !== '' ? numVal : val;
        return obj;
      }, {} as Record<string, string | number>);
    });
  }

  return [];
};