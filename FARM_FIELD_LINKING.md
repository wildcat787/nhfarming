# 🌾 Farm-Field Linking Feature

The NHFarming application now supports linking fields to specific farms, providing better organization and management of agricultural operations.

## Features

- **Farm Assignment**: Each field can be assigned to a specific farm
- **Farm Filtering**: Fields are automatically filtered based on user's farm access
- **Farm Display**: Field cards show which farm they belong to
- **Farm Validation**: Fields cannot be created without selecting a farm
- **Farm Area Calculation**: Farm total areas are automatically updated when fields are added/modified/deleted

## Database Changes

### Fields Table
- Added `farm_id` column with foreign key reference to farms table
- Existing fields will have `farm_id` set to NULL until manually updated

### Automatic Migration
The system automatically adds the `farm_id` column to the fields table if it doesn't exist.

## API Changes

### Fields API (`/api/fields`)

#### GET /api/fields
- Returns fields filtered by user's farm access
- Includes farm name in response (`farm_name` field)
- Non-admin users only see fields from farms they have access to

#### POST /api/fields
- **Required**: `farm_id` field
- Validates that user has access to the specified farm
- Automatically updates farm total area after field creation

#### PUT /api/fields/:id
- **Required**: `farm_id` field
- Validates that user has access to the specified farm
- Updates farm areas if field is moved between farms

#### DELETE /api/fields/:id
- Validates that user has access to the field's farm
- Automatically updates farm total area after field deletion

## Frontend Changes

### FieldsPage Updates

#### Form Changes
- Added farm selection dropdown to field creation/editing form
- Farm selection is required for all new fields
- Farm selection shows farm name and location

#### Display Changes
- Field cards now show the farm name
- Farm name is displayed prominently with primary color
- Field filtering respects user's farm access

#### Form Validation
- Farm selection is required before form submission
- Clear error messages if farm is not selected

## User Experience

### Creating Fields
1. Navigate to Fields page
2. Click "Add Field" button
3. Fill in field details including farm selection
4. Farm dropdown shows all farms user has access to
5. Submit form to create field

### Editing Fields
1. Click edit button on any field card
2. Form pre-populates with current values including farm
3. Can change farm assignment if needed
4. Farm area calculations update automatically

### Viewing Fields
- Field cards display farm name prominently
- Fields are automatically filtered by user's farm access
- Farm information is clearly visible

## Farm Area Calculations

### Automatic Updates
- Farm total areas are automatically calculated from field areas
- Updates occur when:
  - New field is created
  - Field area is modified
  - Field is moved between farms
  - Field is deleted

### Calculation Method
- Sums all field areas within each farm
- Respects different area units (converts to common unit)
- Updates farm total area in real-time

## Permissions

### Access Control
- Users can only see fields from farms they have access to
- Farm access is determined by user roles and farm assignments
- Admin users can see all fields across all farms

### Field Operations
- Users can only create fields on farms they have access to
- Users can only edit/delete fields on farms they have access to
- Farm selection dropdown only shows accessible farms

## Migration Notes

### Existing Data
- Existing fields will have `farm_id` set to NULL
- Users should manually assign farms to existing fields
- System continues to work with unassigned fields

### Backward Compatibility
- API accepts requests without `farm_id` (for existing fields)
- Frontend gracefully handles missing farm information
- Existing functionality remains intact

## Configuration

### Environment Variables
No additional environment variables are required for this feature.

### Database Setup
The feature automatically sets up required database changes:
- Adds `farm_id` column to fields table
- Creates foreign key constraints
- Maintains data integrity

## Troubleshooting

### Common Issues

1. **Field not showing in farm dropdown**
   - Check user has access to the farm
   - Verify farm exists and is active

2. **Farm area not updating**
   - Check field area calculations
   - Verify farm_id is correctly set

3. **Permission errors**
   - Verify user has appropriate farm access
   - Check user role and farm assignments

### Error Messages
- "Farm ID is required" - Must select a farm when creating/editing fields
- "Cannot delete field with existing applications or crops" - Field has dependencies
- "Farm not found" - Selected farm doesn't exist or user lacks access

## Future Enhancements

### Planned Features
- Bulk field assignment to farms
- Field templates per farm
- Farm-specific field categories
- Advanced farm area reporting

### Potential Improvements
- Field grouping by farm in UI
- Farm-specific field naming conventions
- Farm area validation and warnings
- Historical farm assignment tracking
