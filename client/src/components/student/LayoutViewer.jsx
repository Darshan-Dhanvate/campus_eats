import React, { useState, useRef, useEffect, useCallback } from 'react';

const LayoutViewer = ({ layout, onChairSelect, selectedChairs = [] }) => {
  const canvasRef = useRef(null);
  const [hoveredChair, setHoveredChair] = useState(null);

  // Canvas drawing functions
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !layout) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid (lighter for viewer)
    drawGrid(ctx);
    
    // Draw borders
    if (layout.borders) {
      layout.borders.forEach(border => drawBorder(ctx, border));
    }
    
    // Draw tables
    if (layout.tables) {
      layout.tables.forEach(table => drawTable(ctx, table));
    }
    
    // Draw chairs
    if (layout.chairs) {
      layout.chairs.forEach(chair => drawChair(ctx, chair));
    }
  }, [layout, selectedChairs, hoveredChair]);

  const drawGrid = (ctx) => {
    const gridSize = 20;
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 0.3;
    
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
    
    if (table.shape === 'rectangle' || table.shape === 'square') {
      ctx.fillRect(-table.size.width/2, -table.size.height/2, table.size.width, table.size.height);
      ctx.strokeRect(-table.size.width/2, -table.size.height/2, table.size.width, table.size.height);
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
    
    // Determine chair color based on state
    let fillColor = chair.style.color;
    if (chair.isOccupied) {
      fillColor = '#dc3545'; // Red for occupied
    } else if (selectedChairs.includes(chair.chairNumber)) {
      fillColor = '#28a745'; // Green for selected
    } else if (hoveredChair === chair.chairNumber) {
      fillColor = '#ffc107'; // Yellow for hovered
    }
    
    ctx.fillStyle = fillColor;
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

  // Mouse event handlers
  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const findChairAtPosition = (pos) => {
    if (!layout.chairs) return null;
    
    for (let chair of layout.chairs) {
      if (isPointInChair(pos, chair)) {
        return chair;
      }
    }
    return null;
  };

  const isPointInChair = (point, chair) => {
    return point.x >= chair.position.x && 
           point.x <= chair.position.x + chair.size.width &&
           point.y >= chair.position.y && 
           point.y <= chair.position.y + chair.size.height;
  };

  const handleMouseMove = (e) => {
    const pos = getMousePos(e);
    const chair = findChairAtPosition(pos);
        setHoveredChair(chair ? chair.chairNumber : null);
  };

  const handleMouseClick = (e) => {
    const pos = getMousePos(e);
    const chair = findChairAtPosition(pos);
    
    if (chair && !chair.isOccupied && onChairSelect) {
      onChairSelect(chair);
    }
  };

  // Redraw canvas when layout or state changes
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  if (!layout || !layout.chairs) {
    return (
      <div className="bg-gray-100 p-8 rounded-lg text-center">
        <p className="text-gray-500">No seating layout available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Seating Layout</h3>
        <div className="flex items-center gap-4 mt-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>Hover</span>
          </div>
        </div>
      </div>
      
      <div className="p-4 overflow-auto">
        <canvas
          ref={canvasRef}
          width={layout.canvas.width}
          height={layout.canvas.height}
          onMouseMove={handleMouseMove}
          onClick={handleMouseClick}
          className="border border-gray-300 cursor-pointer"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
      
      {hoveredChair && (
        <div className="px-4 pb-4">
          <div className="bg-blue-50 p-3 rounded-lg text-sm">
            {(() => {
              const chair = layout.chairs.find(c => c.chairNumber === hoveredChair);
              return chair ? (
                <div>
                  <strong>Chair {chair.chairNumber}</strong>
                  {chair.isOccupied ? (
                    <span className="text-red-600 ml-2">• Occupied</span>
                  ) : (
                    <span className="text-green-600 ml-2">• Available - Click to select</span>
                  )}
                </div>
              ) : null;
            })()}
          </div>
        </div>
      )}

      {selectedChairs.length > 0 && (
        <div className="px-4 pb-4">
          <div className="bg-green-50 p-3 rounded-lg">
            <strong className="text-green-800">Selected Chairs:</strong>
            <div className="flex flex-wrap gap-1 mt-1">
              {selectedChairs.map(chairId => {
                const chair = layout.chairs.find(c => c.chairNumber === chairId);
                return chair ? (
                  <span key={chairId} className="bg-green-200 text-green-800 px-2 py-1 rounded text-sm">
                    Chair {chair.chairNumber}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LayoutViewer;