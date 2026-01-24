import csv from "csv-parser"
import fs from 'fs'

export const parseCSV = async (filePath) => {
  const results = [];
  const stream = fs.createReadStream(filePath).pipe(csv());

  for await (const row of stream) {
    results.push(row);
  }

  return results;
};


export const validatedCenters = (rows) => {
  const centers = [];

  for (const row of rows) {
    const name = row.name?.trim();
    const type = row.type?.toLowerCase();
    if (!name) continue;
    if (!["hospital", "police"].includes(type)) continue;

    centers.push({
      name,
      type,
      city: row.city?.trim(),
      address: row.address?.trim(),
      contact: row.contact?.trim(),
      capacityPerDay: Number(row.capacityPerDay) || 0,
    });

    
  }
  return centers
}
