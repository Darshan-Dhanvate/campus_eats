import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

const CanvasLayoutDesigner = ({ isOpen, onClose, onSave, initialLayout = null }) => {
  const canvasRef = useRef(null);
  const [selectedTool, setSelectedTool] = useState('select');
  const [selectedObject, setSelectedObject] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [tableShape, setTableShape] = useState('rectangle');
  const [layout, setLayout] = useState({
    canvas: { width: 800, height: 600, scale: 1 },
    borders: [],
    tables: [],
    chairs: [],
    metadata: { totalChairs: 0, lastModified: new Date(), version: 1 }
  });

  // Load initial layout if provided
  useEffect(() => {
    if (initialLayout) {
      setLayout(initialLayout);
    }
  }, [initialLayout]);

  // Auto-number chairs
  const getNextChairNumber = () => {
    const existingNumbers = layout.chairs.map(chair => chair.chairNumber).filter(num => num);
    let nextNumber = 1;
    while (existingNumbers.includes(nextNumber)) {
      nextNumber++;
    }
    return nextNumber;
  };

  // Generate unique ID
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Canvas drawing functions
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    drawGrid(ctx);
    
    // Draw borders
    layout.borders.forEach(border => drawBorder(ctx, border));
    
    // Draw tables
    layout.tables.forEach(table => drawTable(ctx, table));
    
    // Draw chairs
    layout.chairs.forEach(chair => drawChair(ctx, chair));
    
    // Draw selection highlight
    if (selectedObject) {
      drawSelectionHighlight(ctx, selectedObject);
    }
  };

  const drawGrid = (ctx) => {
    const gridSize = 20;
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 0.5;
    
    for (let x = 0; x < layout.canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, layout.canvas.height);
      ctx.stroke();
    }
    
    for (let y = 0; y < layout.canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(layout.canvas.width, y);
      ctx.stroke();
    }
  };

  const drawBorder = (ctx, border) => {
    if (border.points.length < 2) return;
    
    ctx.strokeStyle = border.style.color;
    ctx.lineWidth = border.style.thickness;
    ctx.beginPath();
    ctx.moveTo(border.points[0].x, border.points[0].y);
    
    for (let i = 1; i < border.points.length; i++) {
      ctx.lineTo(border.points[i].x, border.points[i].y);
    }
    ctx.stroke();
  };

  const drawTable = (ctx, table) => {
    ctx.save();
    ctx.translate(table.position.x + table.size.width/2, table.position.y + table.size.height/2);
    ctx.rotate(table.rotation * Math.PI / 180);
    
    ctx.fillStyle = table.style.color;
    ctx.strokeStyle = table.style.borderColor;
    ctx.lineWidth = 2;
    
    if (table.shape === 'rectangle') {
      ctx.fillRect(-table.size.width/2, -table.size.height/2, table.size.width, table.size.height);
      ctx.strokeRect(-table.size.width/2, -table.size.height/2, table.size.width, table.size.height);
    } else if (table.shape === 'square') {
      const size = Math.min(table.size.width, table.size.height);
      ctx.fillRect(-size/2, -size/2, size, size);
      ctx.strokeRect(-size/2, -size/2, size, size);
    } else if (table.shape === 'circle' || table.shape === 'oval') {
      ctx.beginPath();
      ctx.ellipse(0, 0, table.size.width/2, table.size.height/2, 0, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }
    
    // Draw table name/number if exists
    if (table.name) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(table.name, 0, 4);
    }
    
    ctx.restore();
  };

  const drawChair = (ctx, chair) => {
    ctx.save();
    ctx.translate(chair.position.x + chair.size.width/2, chair.position.y + chair.size.height/2);
    ctx.rotate(chair.rotation * Math.PI / 180);
    
    ctx.fillStyle = chair.isOccupied ? '#dc3545' : chair.style.color;
    ctx.strokeStyle = chair.style.borderColor;
    ctx.lineWidth = 2;
    
    // Draw chair as rounded rectangle
    const radius = 5;
    const x = -chair.size.width/2;
    const y = -chair.size.height/2;
    const width = chair.size.width;
    const height = chair.size.height;
    
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Draw chair number
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(chair.chairNumber.toString(), 0, 3);
    
    ctx.restore();
  };

  const drawSelectionHighlight = (ctx, obj) => {
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    const bounds = getObjectBounds(obj);
    ctx.strokeRect(bounds.x - 5, bounds.y - 5, bounds.width + 10, bounds.height + 10);
    
    ctx.setLineDash([]);
  };

  const getObjectBounds = (obj) => {
    if (obj.type === 'table') {
      return {
        x: obj.position.x,
        y: obj.position.y,
        width: obj.size.width,
        height: obj.size.height
      };
    } else if (obj.type === 'chair') {
      return {
        x: obj.position.x,
        y: obj.position.y,
        width: obj.size.width,
        height: obj.size.height
      };
    }
    return { x: 0, y: 0, width: 0, height: 0 };
  };

  // Mouse event handlers
  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const pos = getMousePos(e);
    
    if (selectedTool === 'select') {
      // Find clicked object
      const clickedObject = findObjectAtPosition(pos);
      setSelectedObject(clickedObject);
      
      if (clickedObject) {
        setDragStart(pos);
        setIsDrawing(true);
      }
    } else if (selectedTool === 'table') {
      addTable(pos);
    } else if (selectedTool === 'chair') {
      addChair(pos);
    } else if (selectedTool === 'border') {
      // Start drawing border
      setIsDrawing(true);
      setDragStart(pos);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    
    e.preventDefault();
    e.stopPropagation();
    const pos = getMousePos(e);
    
    if (selectedTool === 'select' && selectedObject && dragStart) {
      // Move selected object
      const dx = pos.x - dragStart.x;
      const dy = pos.y - dragStart.y;
      
      moveObject(selectedObject, dx, dy);
      setDragStart(pos);
    }
  };

  const handleMouseUp = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDrawing(false);
    setDragStart(null);
  };

  const findObjectAtPosition = (pos) => {
    // Check chairs first (smaller objects)
    for (let chair of layout.chairs) {
      if (isPointInObject(pos, chair, 'chair')) {
        return { ...chair, type: 'chair' };
      }
    }
    
    // Then check tables
    for (let table of layout.tables) {
      if (isPointInObject(pos, table, 'table')) {
        return { ...table, type: 'table' };
      }
    }
    
    return null;
  };

  const isPointInObject = (point, obj, type) => {
    const bounds = getObjectBounds({ ...obj, type });
    return point.x >= bounds.x && point.x <= bounds.x + bounds.width &&
           point.y >= bounds.y && point.y <= bounds.y + bounds.height;
  };

  const moveObject = (obj, dx, dy) => {
    setLayout(prev => {
      const newLayout = { ...prev };
      
      if (obj.type === 'table') {
        const tableIndex = newLayout.tables.findIndex(t => t.id === obj.id);
        if (tableIndex !== -1) {
          newLayout.tables[tableIndex].position.x += dx;
          newLayout.tables[tableIndex].position.y += dy;
        }
      } else if (obj.type === 'chair') {
        const chairIndex = newLayout.chairs.findIndex(c => c.id === obj.id);
        if (chairIndex !== -1) {
          newLayout.chairs[chairIndex].position.x += dx;
          newLayout.chairs[chairIndex].position.y += dy;
        }
      }
      
      return newLayout;
    });
  };

  const addTable = (pos) => {
    // Set size based on shape
    const size = tableShape === 'square' ? { width: 60, height: 60 } :
                 tableShape === 'circle' ? { width: 60, height: 60 } :
                 { width: 80, height: 40 }; // rectangle and oval
                 
    const newTable = {
      id: generateId(),
      name: `Table ${layout.tables.length + 1}`,
      position: { x: pos.x - size.width/2, y: pos.y - size.height/2 },
      size: size,
      shape: tableShape,
      rotation: 0,
      style: { color: '#8B4513', borderColor: '#654321' }
    };
    
    setLayout(prev => ({
      ...prev,
      tables: [...prev.tables, newTable]
    }));
    
    toast.success('Table added! Click on it to add chairs around it.');
  };

  const addChair = (pos) => {
    const newChair = {
      id: generateId(),
      chairNumber: getNextChairNumber(),
      tableId: null,
      position: { x: pos.x - 15, y: pos.y - 15 },
      size: { width: 30, height: 30 },
      rotation: 0,
      style: { color: '#4A90E2', borderColor: '#357ABD' },
      isOccupied: false,
      bookingHistory: []
    };
    
    setLayout(prev => ({
      ...prev,
      chairs: [...prev.chairs, newChair],
      metadata: { ...prev.metadata, totalChairs: prev.chairs.length + 1 }
    }));
    
    toast.success(`Chair ${newChair.chairNumber} added!`);
  };

  const addChairsAroundTable = (table) => {
    setLayout(prev => {
      const chairPositions = [
        { x: table.position.x - 35, y: table.position.y + 5 }, // Left
        { x: table.position.x + table.size.width + 5, y: table.position.y + 5 }, // Right
        { x: table.position.x + 25, y: table.position.y - 35 }, // Top
        { x: table.position.x + 25, y: table.position.y + table.size.height + 5 }, // Bottom
      ];
      
      const existingNumbers = prev.chairs.map(chair => chair.chairNumber).filter(num => num);
      
      const newChairs = chairPositions.map((pos, index) => {
        let nextNumber = 1;
        while (existingNumbers.includes(nextNumber)) {
          nextNumber++;
        }
        existingNumbers.push(nextNumber);
        
        return {
          id: generateId(),
          chairNumber: nextNumber,
          tableId: table.id,
          position: pos,
          size: { width: 30, height: 30 },
          rotation: 0,
          style: { color: '#4A90E2', borderColor: '#357ABD' },
          isOccupied: false,
          bookingHistory: []
        };
      });
      
      const updatedLayout = {
        ...prev,
        chairs: [...prev.chairs, ...newChairs],
        metadata: { ...prev.metadata, totalChairs: prev.chairs.length + newChairs.length }
      };
      
      toast.success(`Added ${newChairs.length} chairs around table!`);
      return updatedLayout;
    });
  };

  const deleteSelectedObject = () => {
    if (!selectedObject) return;
    
    setLayout(prev => {
      const newLayout = { ...prev };
      
      if (selectedObject.type === 'table') {
        newLayout.tables = newLayout.tables.filter(t => t.id !== selectedObject.id);
        // Also remove chairs associated with this table
        newLayout.chairs = newLayout.chairs.filter(c => c.tableId !== selectedObject.id);
      } else if (selectedObject.type === 'chair') {
        newLayout.chairs = newLayout.chairs.filter(c => c.id !== selectedObject.id);
      }
      
      newLayout.metadata.totalChairs = newLayout.chairs.length;
      return newLayout;
    });
    
    setSelectedObject(null);
    toast.success('Object deleted!');
  };

  const clearLayout = () => {
    setLayout({
      canvas: { width: 800, height: 600, scale: 1 },
      borders: [],
      tables: [],
      chairs: [],
      metadata: { totalChairs: 0, lastModified: new Date(), version: 1 }
    });
    setSelectedObject(null);
    toast.success('Layout cleared!');
  };

  const handleSave = () => {
    const layoutToSave = {
      ...layout,
      metadata: { ...layout.metadata, lastModified: new Date() }
    };
    onSave(layoutToSave);
    onClose();
  };

  // Redraw canvas when layout changes
  useEffect(() => {
    const timer = setTimeout(() => {
      drawCanvas();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [layout, selectedObject]);

  // Initial canvas setup
  useEffect(() => {
    if (canvasRef.current && isOpen) {
      const canvas = canvasRef.current;
      canvas.width = layout.canvas.width;
      canvas.height = layout.canvas.height;
      setTimeout(() => drawCanvas(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-lg w-full max-w-6xl h-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Canvas Layout Designer</h2>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 p-4 border-b bg-gray-50">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setSelectedTool('select'); }}
            className={`px-4 py-2 rounded transition-colors ${selectedTool === 'select' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Select
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setSelectedTool('border'); }}
            className={`px-4 py-2 rounded transition-colors ${selectedTool === 'border' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Border
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setSelectedTool('table'); }}
            className={`px-4 py-2 rounded transition-colors ${selectedTool === 'table' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Add Table
          </button>
          
          {/* Table Shape Selector */}
          {selectedTool === 'table' && (
            <div className="flex items-center space-x-2 ml-2">
              <span className="text-sm font-medium text-gray-700">Shape:</span>
              <select
                value={tableShape}
                onChange={(e) => setTableShape(e.target.value)}
                className="px-2 py-1 text-sm border border-gray-300 rounded bg-white"
                onClick={(e) => e.stopPropagation()}
              >
                <option value="rectangle">Rectangle</option>
                <option value="square">Square</option>
                <option value="circle">Circle</option>
                <option value="oval">Oval</option>
              </select>
            </div>
          )}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setSelectedTool('chair'); }}
            className={`px-4 py-2 rounded transition-colors ${selectedTool === 'chair' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Add Chair
          </button>
          
          <div className="border-l border-gray-300 h-8 mx-2"></div>
          
          {selectedObject && selectedObject.type === 'table' && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); addChairsAroundTable(selectedObject); }}
              className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600 transition-colors"
            >
              Add Chairs Around Table
            </button>
          )}
          
          {selectedObject && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); deleteSelectedObject(); }}
              className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              Delete Selected
            </button>
          )}
          
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); clearLayout(); }}
            className="px-4 py-2 rounded bg-orange-500 text-white hover:bg-orange-600 transition-colors"
          >
            Clear All
          </button>
          
          <div className="flex-1"></div>
          
          <div className="text-sm text-gray-600">
            Total Chairs: {layout.chairs.length}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="border border-gray-300 inline-block bg-white">
            <canvas
              ref={canvasRef}
              width={layout.canvas.width}
              height={layout.canvas.height}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className={`${
                selectedTool === 'select' ? 'cursor-pointer' :
                selectedTool === 'table' || selectedTool === 'chair' ? 'cursor-crosshair' :
                selectedTool === 'border' ? 'cursor-crosshair' : 'cursor-default'
              }`}
              style={{ display: 'block' }}
            />
          </div>
          
          <div className="mt-2 text-xs text-gray-500">
            Current tool: {selectedTool} | Canvas: {layout.canvas.width}x{layout.canvas.height} | Selected: {selectedObject ? `${selectedObject.type} ${selectedObject.name || selectedObject.chairNumber || ''}` : 'None'}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-4 border-t">
          <div className="text-sm text-gray-600">
            Instructions: Select tool to move objects, or use Add Table/Chair tools to create new items. Click on a table and use "Add Chairs Around Table" for quick setup.
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleSave(); }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              disabled={layout.chairs.length === 0}
            >
              Save Layout ({layout.chairs.length} chairs)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasLayoutDesigner;