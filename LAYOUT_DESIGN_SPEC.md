# Canvas Layout Designer - Technical Specification

## Data Structure Design

### Layout Schema
```javascript
canteenLayout: {
  // Canvas dimensions and scale
  canvas: {
    width: { type: Number, default: 800 }, // Canvas width in pixels
    height: { type: Number, default: 600 }, // Canvas height in pixels
    scale: { type: Number, default: 1 }, // Zoom level
  },
  
  // Room boundaries/borders
  borders: [{
    id: { type: String, required: true },
    type: { type: String, enum: ['wall', 'boundary'], default: 'wall' },
    points: [{ // Array of x,y coordinates for the border path
      x: { type: Number, required: true },
      y: { type: Number, required: true }
    }],
    style: {
      color: { type: String, default: '#000000' },
      thickness: { type: Number, default: 2 }
    }
  }],
  
  // Tables in the layout
  tables: [{
    id: { type: String, required: true }, // Auto-generated unique ID
    name: { type: String }, // Optional table name/number
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true }
    },
    size: {
      width: { type: Number, default: 80 },
      height: { type: Number, default: 40 }
    },
    shape: { type: String, enum: ['rectangle', 'circle', 'oval'], default: 'rectangle' },
    rotation: { type: Number, default: 0 }, // Rotation in degrees
    style: {
      color: { type: String, default: '#8B4513' },
      borderColor: { type: String, default: '#654321' }
    }
  }],
  
  // Chairs with unique identities
  chairs: [{
    id: { type: String, required: true }, // Auto-generated unique ID
    chairNumber: { type: Number, required: true }, // Sequential number (1, 2, 3...)
    tableId: { type: String }, // Reference to parent table (optional for standalone chairs)
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true }
    },
    size: {
      width: { type: Number, default: 30 },
      height: { type: Number, default: 30 }
    },
    rotation: { type: Number, default: 0 },
    style: {
      color: { type: String, default: '#4A90E2' },
      borderColor: { type: String, default: '#357ABD' }
    },
    isOccupied: { type: Boolean, default: false }, // For real-time booking status
    bookingHistory: [{ // Track which slots this chair is booked for
      slotId: String,
      startTime: String,
      endTime: String,
      bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }]
  }],
  
  // Metadata
  metadata: {
    totalChairs: { type: Number, default: 0 }, // Auto-calculated
    lastModified: { type: Date, default: Date.now },
    version: { type: Number, default: 1 } // For version control
  }
}
```

## Canvas Layout Designer Component Features

### 1. Canvas Tools
- **Select Tool**: Move, resize, and select objects
- **Border Tool**: Draw room boundaries and walls
- **Table Tool**: Add rectangular, circular, or oval tables
- **Chair Tool**: Add individual chairs or auto-add chairs around tables
- **Delete Tool**: Remove selected objects

### 2. Auto-Chair Numbering
- Chairs are automatically numbered sequentially (1, 2, 3, ...)
- When chairs are deleted, remaining chairs maintain their numbers
- New chairs get the next available number

### 3. Smart Table-Chair Association
- When adding a table, option to automatically place chairs around it
- Chairs can be associated with tables or be standalone
- Moving a table can optionally move associated chairs

### 4. Canvas Interactions
- Drag & drop to move objects
- Resize handles for tables and layout boundaries
- Snap-to-grid for precise placement
- Zoom in/out and pan across large layouts
- Undo/redo functionality

### 5. Save & Load
- Save layout to database
- Load existing layout for editing
- Export layout as image for reference

## Updated Booking System

### Chair-Based Reservations
Instead of booking "X seats", students will:
1. View the visual layout with available/occupied chairs
2. Select specific chair numbers they want to book
3. System validates chair availability for the selected time slot
4. Booking is tied to specific chair IDs rather than generic seat count

### Slot Management
```javascript
// Updated slot schema to work with chair IDs
{
  startTime: String,
  endTime: String,
  occupiedChairs: [String], // Array of chair IDs that are booked
  availableChairs: [String] // Array of chair IDs that are available
}
```

## Implementation Plan

### Phase 1: Data Model Updates
- Update User model to include canteenLayout schema
- Remove numberOfSeats field and replace with layout-based chair counting
- Update slot schema to work with chair IDs

### Phase 2: Canvas Designer Component
- Create React component with HTML5 Canvas
- Implement drawing tools and object management
- Add save/load functionality

### Phase 3: Backend API Updates
- Create endpoints for saving/loading layouts
- Update booking logic to work with chair IDs
- Migrate existing seat data to new format

### Phase 4: Frontend Integration
- Replace seat count input with "Design Layout" button
- Integrate canvas designer into canteen profile
- Update booking flow to show visual layout

### Phase 5: Testing & Migration
- Test complete flow from layout design to booking
- Migrate existing canteen data
- Handle edge cases and error scenarios