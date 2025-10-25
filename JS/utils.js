// Utility functions like hit testing, bounds checking, coordinate calculations

// Helper functions for resize handles
function getResizeHandle(mouseX, mouseY, shape) {
    if (!shape || (shape.type !== 'ellipse' && shape.type !== 'rectangle' && shape.type !== 'line' && shape.type !== 'v_separator' && shape.type !== 'h_separator')) {
        return null;
    }
    
    const handleSize = 8; // Match the visual handle size
    const tolerance = 3; // Extra area around handle for easier clicking
    
    if (shape.type === 'ellipse' || shape.type === 'rectangle') {
        const x = shape.x;
        const y = shape.y;
        const w = shape.w || 100;
        const h = shape.h || 100;
        
        // Define handle positions
        const handles = {
            'tl': { x: x, y: y }, // Top-left
            'tr': { x: x + w, y: y }, // Top-right
            'bl': { x: x, y: y + h }, // Bottom-left
            'br': { x: x + w, y: y + h } // Bottom-right
        };
        
        // Check if mouse is over any handle
        for (const [handleName, handle] of Object.entries(handles)) {
            if (mouseX >= handle.x - handleSize/2 - tolerance &&
                mouseX <= handle.x + handleSize/2 + tolerance &&
                mouseY >= handle.y - handleSize/2 - tolerance &&
                mouseY <= handle.y + handleSize/2 + tolerance) {
                return handleName;
            }
        }
    } else if (shape.type === 'line') {
        const radius = 5; // Match the visual handle size
        const tolerance = 3;
        
        // Check start point
        const distStart = Math.sqrt((mouseX - shape.x1) ** 2 + (mouseY - shape.y1) ** 2);
        if (distStart <= radius + tolerance) {
            return 'start';
        }
        
        // Check end point
        const distEnd = Math.sqrt((mouseX - shape.x2) ** 2 + (mouseY - shape.y2) ** 2);
        if (distEnd <= radius + tolerance) {
            return 'end';
        }
    } else if (shape.type === 'v_separator') {
        const handleSize = 8;
        const tolerance = 3;
        const x = shape.x || 0;
        
        // Top handle
        if (mouseX >= x - handleSize/2 - tolerance &&
            mouseX <= x + handleSize/2 + tolerance &&
            mouseY >= -handleSize/2 - tolerance &&
            mouseY <= handleSize/2 + tolerance) {
            return 'move'; // V_SEPARATOR only supports moving, not resizing
        }
        
        // Bottom handle
        if (mouseX >= x - handleSize/2 - tolerance &&
            mouseX <= x + handleSize/2 + tolerance &&
            mouseY >= canvas.height - handleSize/2 - tolerance &&
            mouseY <= canvas.height + handleSize/2 + tolerance) {
            return 'move'; // V_SEPARATOR only supports moving, not resizing
        }
    } else if (shape.type === 'h_separator') {
        const handleSize = 8;
        const tolerance = 3;
        const y = shape.y || 0;
        
        // Left handle
        if (mouseX >= -handleSize/2 - tolerance &&
            mouseX <= handleSize/2 + tolerance &&
            mouseY >= y - handleSize/2 - tolerance &&
            mouseY <= y + handleSize/2 + tolerance) {
            return 'move'; // H_SEPARATOR only supports moving, not resizing
        }
        
        // Right handle
        if (mouseX >= canvas.width - handleSize/2 - tolerance &&
            mouseX <= canvas.width + handleSize/2 + tolerance &&
            mouseY >= y - handleSize/2 - tolerance &&
            mouseY <= y + handleSize/2 + tolerance) {
            return 'move'; // H_SEPARATOR only supports moving, not resizing
        }
    }
    
    return null;
}

function isPointInShapeCenter(mouseX, mouseY, shape) {
    // Check if click is in the center area (not on handles)
    if (getResizeHandle(mouseX, mouseY, shape)) {
        return false; // Click is on a handle
    }
    
    // Use existing hit detection but exclude handle areas
    return isPointInShape(mouseX, mouseY, shape);
}

function getResizeCursor(handle) {
    switch(handle) {
        case 'tl':
        case 'br':
            return 'nw-resize';
        case 'tr':
        case 'bl':
            return 'ne-resize';
        case 'start':
        case 'end':
            return 'move';
        default:
            return 'default';
    }
}

// Check if a point is inside a shape
function isPointInShape(x, y, shape) {
    switch(shape.type) {
        case 'ellipse':
            // Check if point is inside ellipse using standard ellipse equation
            if (shape.x === undefined || shape.y === undefined || shape.w === undefined || shape.h === undefined) {
                console.warn('Ellipse missing properties:', shape);
                return false;
            }
            const centerX = shape.x + shape.w / 2;
            const centerY = shape.y + shape.h / 2;
            const radiusX = shape.w / 2;
            const radiusY = shape.h / 2;
            
            const normalizedX = (x - centerX) / radiusX;
            const normalizedY = (y - centerY) / radiusY;
            
            return (normalizedX * normalizedX + normalizedY * normalizedY) <= 1;
            
        case 'rectangle':
            // For new rectangle format: x,y = top-left, w,h = dimensions
            if (shape.w !== undefined && shape.h !== undefined) {
                if (shape.x === undefined || shape.y === undefined) {
                    console.warn('Rectangle missing x/y:', shape);
                    return false;
                }
                return x >= shape.x && x <= shape.x + shape.w && 
                       y >= shape.y && y <= shape.y + shape.h;
            }
            return false;
            
        case 'line':
            // Check if point is near the line (within tolerance)
            if (shape.x1 === undefined || shape.y1 === undefined || shape.x2 === undefined || shape.y2 === undefined) {
                console.warn('Line missing coordinates:', shape);
                return false;
            }
            
            const tolerance = 5;
            const A = shape.x2 - shape.x1;
            const B = shape.y2 - shape.y1;
            const C = A * (x - shape.x1) + B * (y - shape.y1);
            const D = A * A + B * B;
            
            if (D === 0) {
                // Line is a point
                return Math.sqrt((x - shape.x1) ** 2 + (y - shape.y1) ** 2) <= tolerance;
            }
            
            const t = Math.max(0, Math.min(1, C / D));
            const closestX = shape.x1 + t * A;
            const closestY = shape.y1 + t * B;
            const distance = Math.sqrt((x - closestX) ** 2 + (y - closestY) ** 2);
            
            return distance <= tolerance;
            
        case 'v_separator':
            // Check if point is near the vertical separator line (within tolerance)
            if (shape.x === undefined) {
                console.warn('V_SEPARATOR missing x property:', shape);
                return false;
            }
            
            const vSeparatorTolerance = Math.max(5, (shape.w || 2) / 2 + 2); // Base tolerance on line weight
            return Math.abs(x - shape.x) <= vSeparatorTolerance;
            
        case 'h_separator':
            // Check if point is near the horizontal separator line (within tolerance)
            if (shape.y === undefined) {
                console.warn('H_SEPARATOR missing y property:', shape);
                return false;
            }
            
            const hSeparatorTolerance = Math.max(5, (shape.h || 2) / 2 + 2); // Base tolerance on line weight
            return Math.abs(y - shape.y) <= hSeparatorTolerance;
            
        default:
            return false;
    }
}