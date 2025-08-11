const db = require('./db');

/**
 * Calculate and update the total area of a farm based on the sum of all its fields
 * @param {number} farmId - The ID of the farm to update
 * @param {string} targetUnit - The unit to convert all areas to (default: 'hectares')
 */
function updateFarmArea(farmId, targetUnit = 'hectares') {
  return new Promise((resolve, reject) => {
    // Get all fields for this farm with their areas and units
    db.all(`
      SELECT area, area_unit 
      FROM fields 
      WHERE farm_id = ? AND area IS NOT NULL
    `, [farmId], (err, fields) => {
      if (err) {
        console.error('Error fetching fields for farm area calculation:', err);
        return reject(err);
      }

      if (fields.length === 0) {
        // No fields, set total_area to 0
        db.run(`
          UPDATE farms 
          SET total_area = 0, area_unit = ?, updated_at = datetime('now')
          WHERE id = ?
        `, [targetUnit, farmId], function (err) {
          if (err) {
            console.error('Error updating farm area to 0:', err);
            return reject(err);
          }
          resolve(0);
        });
        return;
      }

      // Convert all areas to the target unit and sum them
      let totalArea = 0;
      let farmAreaUnit = targetUnit;

      fields.forEach(field => {
        let convertedArea = field.area;
        
        // Convert to target unit if different
        if (field.area_unit !== targetUnit) {
          convertedArea = convertArea(field.area, field.area_unit, targetUnit);
        }
        
        totalArea += convertedArea;
      });

      // Update the farm's total area
      db.run(`
        UPDATE farms 
        SET total_area = ?, area_unit = ?, updated_at = datetime('now')
        WHERE id = ?
      `, [totalArea, farmAreaUnit, farmId], function (err) {
        if (err) {
          console.error('Error updating farm total area:', err);
          return reject(err);
        }
        resolve(totalArea);
      });
    });
  });
}

/**
 * Convert area from one unit to another
 * @param {number} area - The area value
 * @param {string} fromUnit - The source unit
 * @param {string} toUnit - The target unit
 * @returns {number} - The converted area
 */
function convertArea(area, fromUnit, toUnit) {
  if (fromUnit === toUnit) return area;

  // Convert to hectares first (as base unit)
  let hectares = 0;
  switch (fromUnit.toLowerCase()) {
    case 'hectares':
      hectares = area;
      break;
    case 'acres':
      hectares = area * 0.404686; // 1 acre = 0.404686 hectares
      break;
    case 'square_meters':
      hectares = area / 10000; // 1 hectare = 10,000 square meters
      break;
    case 'square_feet':
      hectares = area * 0.0000092903; // 1 sq ft = 0.0000092903 hectares
      break;
    default:
      hectares = area; // Assume hectares if unknown unit
  }

  // Convert from hectares to target unit
  switch (toUnit.toLowerCase()) {
    case 'hectares':
      return hectares;
    case 'acres':
      return hectares / 0.404686;
    case 'square_meters':
      return hectares * 10000;
    case 'square_feet':
      return hectares / 0.0000092903;
    default:
      return hectares; // Return hectares if unknown target unit
  }
}

/**
 * Update farm area when a field is added, updated, or deleted
 * @param {number} farmId - The farm ID to update
 */
function updateFarmAreaOnFieldChange(farmId) {
  return updateFarmArea(farmId).catch(err => {
    console.error(`Failed to update farm ${farmId} area:`, err);
  });
}

module.exports = {
  updateFarmArea,
  convertArea,
  updateFarmAreaOnFieldChange
}; 