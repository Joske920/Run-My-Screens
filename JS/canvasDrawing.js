// Canvas drawing, rendering, and visual indicator functions

function getCanvasSettings() {
    const bgColorElement = document.getElementById('backgroundColor');
    const widthElement = document.getElementById('canvasWidth');
    const heightElement = document.getElementById('canvasHeight');
    
    return {
        bgColor: bgColorElement ? bgColorElement.value : '#ffffff',
        width: widthElement ? parseInt(widthElement.value) : 600,
        height: heightElement ? parseInt(heightElement.value) : 400
    };
}

function updateCanvas() {
    const settings = getCanvasSettings();
    
    // Clear canvas and set background
    ctx.fillStyle = settings.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Create a sorted copy for drawing only (respects z-order hierarchy)
    // This doesn't change the original shapes array that the user controls
    const shapesForDrawing = [...shapes].sort((a, b) => {
        const aZOrder = getShapeZOrder(a.type);
        const bZOrder = getShapeZOrder(b.type);
        
        // Primary sort by shape type z-order (rectangle < ellipse < line < separators)
        if (aZOrder !== bZOrder) {
            return aZOrder - bZOrder;
        }
        
        // Secondary sort by user-defined order within same type
        // Use the array index to maintain user's arrangement within each type
        const aIndex = shapes.findIndex(s => s.id === a.id);
        const bIndex = shapes.findIndex(s => s.id === b.id);
        return aIndex - bIndex;
    });
    
    // First pass: Draw all shapes WITHOUT selection indicators
    shapesForDrawing.forEach(shape => {
        drawShape(shape, false); // Never draw selection indicator in first pass
    });
    
    // Second pass: Draw selection indicators on top of everything
    if (selectedShapeId !== null) {
        const selectedShape = getShapeById(selectedShapeId);
        if (selectedShape) {
            drawSelectionIndicator(selectedShape);
        }
    }
}

function drawShape(shape, isSelected = false) {
    // Check visibility for all shape types
    if (shape.visible === false) {
        return; // Don't draw invisible shapes
    }
    
    // DEF shapes are variable definitions and should not be drawn on canvas
    if (shape.type === 'def') {
        return; // DEF shapes are not visual elements
    }
    
    // Set colors and line width based on shape type
    if (shape.type === 'line') {
        ctx.strokeStyle = shape.f || '#000000'; // Line color (f)
        ctx.lineWidth = 2;
    } else if (shape.type === 'v_separator') {
        ctx.strokeStyle = shape.color || '#000000'; // V_SEPARATOR color
        ctx.lineWidth = shape.w || 2; // V_SEPARATOR line weight
    } else if (shape.type === 'h_separator') {
        ctx.strokeStyle = shape.color || '#000000'; // H_SEPARATOR color
        ctx.lineWidth = shape.h || 2; // H_SEPARATOR line weight
    } else {
        ctx.fillStyle = shape.f2 || shape.color || '#ff0000'; // Fill color (f2)
        ctx.strokeStyle = shape.f1 || '#000000'; // Border color (f1)
        ctx.lineWidth = 2;
    }
    
    // Apply border/line style
    let borderStyle;
    if (shape.type === 'v_separator' || shape.type === 'h_separator') {
        borderStyle = shape.pen || '1'; // Use pen style for separators
    } else {
        borderStyle = shape.s || shape.borderStyle || '1'; // Use s for other shapes
    }
    switch(borderStyle) {
        case '1': // Solid
            ctx.setLineDash([]);
            break;
        case '2': // Dashed
            ctx.setLineDash([10, 5]);
            break;
        case '3': // Dotted
            ctx.setLineDash([2, 3]);
            break;
        case '4': // Dashed and Dotted
            ctx.setLineDash([10, 5, 2, 5]);
            break;
        default:
            ctx.setLineDash([]);
    }
    
    switch(shape.type) {
        case 'ellipse':
            drawEllipse(shape.x, shape.y, shape.w, shape.h);
            break;
            
        case 'rectangle':
            drawRectangleNew(shape.x, shape.y, shape.w, shape.h);
            break;
            
        case 'line':
            drawLine(shape.x1, shape.y1, shape.x2, shape.y2);
            break;
            
        case 'v_separator':
            drawVSeparator(shape);
            break;
            
        case 'h_separator':
            drawHSeparator(shape);
            break;
    }
    
    // Reset line dash for other drawings
    ctx.setLineDash([]);
    
    // Draw selection indicator if this shape is selected
    if (isSelected) {
        drawSelectionIndicator(shape);
    }
}

function drawSelectionIndicator(shape) {
    // Save current context state
    const originalStrokeStyle = ctx.strokeStyle;
    const originalLineWidth = ctx.lineWidth;
    const originalFillStyle = ctx.fillStyle;
    
    // Set selection indicator style with enhanced visibility
    ctx.strokeStyle = '#0066ff';
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 2; // Slightly thicker border for better visibility
    ctx.setLineDash([]);
    
    const handleSize = 8; // Slightly larger handles for better visibility
    
    if (shape.type === 'ellipse' || shape.type === 'rectangle') {
        // For ellipse and rectangle: draw corner handles
        const x = shape.x;
        const y = shape.y;
        const w = shape.w || 100;
        const h = shape.h || 100;
        
        // Draw corner handles with subtle shadow effect
        const handles = [
            { x: x - handleSize/2, y: y - handleSize/2 }, // Top-left
            { x: x + w - handleSize/2, y: y - handleSize/2 }, // Top-right
            { x: x - handleSize/2, y: y + h - handleSize/2 }, // Bottom-left
            { x: x + w - handleSize/2, y: y + h - handleSize/2 } // Bottom-right
        ];
        
        handles.forEach(handle => {
            // Draw subtle shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(handle.x + 1, handle.y + 1, handleSize, handleSize);
            
            // Draw main handle
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
            ctx.strokeRect(handle.x, handle.y, handleSize, handleSize);
        });
        
    } else if (shape.type === 'line') {
        // For line: draw small circles at both ends with enhanced visibility
        const radius = 5; // Slightly larger radius
        
        // Start point with shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.arc(shape.x1 + 1, shape.y1 + 1, radius, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(shape.x1, shape.y1, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // End point with shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.arc(shape.x2 + 1, shape.y2 + 1, radius, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(shape.x2, shape.y2, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
    } else if (shape.type === 'v_separator') {
        // For v_separator: draw small squares at top and bottom
        const handleSize = 8;
        const x = shape.x || 0;
        
        const handles = [
            { x: x - handleSize/2, y: -handleSize/2 }, // Top handle
            { x: x - handleSize/2, y: canvas.height - handleSize/2 } // Bottom handle
        ];
        
        handles.forEach(handle => {
            // Draw subtle shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(handle.x + 1, handle.y + 1, handleSize, handleSize);
            
            // Draw main handle
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
            ctx.strokeRect(handle.x, handle.y, handleSize, handleSize);
        });
        
    } else if (shape.type === 'h_separator') {
        // For h_separator: draw small squares at left and right
        const handleSize = 8;
        const y = shape.y || 0;
        
        const handles = [
            { x: -handleSize/2, y: y - handleSize/2 }, // Left handle
            { x: canvas.width - handleSize/2, y: y - handleSize/2 } // Right handle
        ];
        
        handles.forEach(handle => {
            // Draw subtle shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(handle.x + 1, handle.y + 1, handleSize, handleSize);
            
            // Draw main handle
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
            ctx.strokeRect(handle.x, handle.y, handleSize, handleSize);
        });
    }
    
    // Restore original context state
    ctx.strokeStyle = originalStrokeStyle;
    ctx.lineWidth = originalLineWidth;
    ctx.fillStyle = originalFillStyle;
    ctx.setLineDash([]);
}

function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function drawEllipse(x, y, width, height) {
    // x, y = top-left corner coordinates, width and height define the ellipse
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const radiusX = width / 2;
    const radiusY = height / 2;
    
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
}

function drawRectangle(x, y, size) {
    const halfSize = size / 2;
    ctx.fillRect(x - halfSize, y - halfSize, size, size);
    ctx.strokeRect(x - halfSize, y - halfSize, size, size);
}

function drawRectangleNew(x, y, width, height) {
    // x, y = top-left corner coordinates
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);
}

function drawVSeparator(shape) {
    // Draw vertical separator from top to bottom of canvas at x position
    const x = shape.x || 0;
    
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
}

function drawHSeparator(shape) {
    // Draw horizontal separator from left to right of canvas at y position
    const y = shape.y || 0;
    const lineWeight = shape.h || 2;
    const color = shape.color || '#000000';
    const penStyle = shape.pen || '1';
    
    // Set line properties
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWeight;
    
    // Set line dash pattern based on pen style
    switch(penStyle) {
        case '1': // Solid
            ctx.setLineDash([]);
            break;
        case '2': // Dashed
            ctx.setLineDash([10, 5]);
            break;
        case '3': // Dotted
            ctx.setLineDash([2, 3]);
            break;
        case '4': // Dashed and dotted
            ctx.setLineDash([10, 5, 2, 5]);
            break;
        default:
            ctx.setLineDash([]);
    }
    
    // Draw the horizontal line spanning full canvas width
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
    
    // Reset line dash for other shapes
    ctx.setLineDash([]);
}