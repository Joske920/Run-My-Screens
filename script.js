// Canvas and context variables
let canvas;
let ctx;

// Drag state variables
let isDragging = false;
let isResizing = false;
let resizeHandle = null; // 'tl', 'tr', 'bl', 'br', 'start', 'end'
let dragOffsetX = 0;
let dragOffsetY = 0;
let draggedShapeId = null;

// Shapes array and current selection
let shapes = [];
let selectedShapeId = null;
let nextShapeId = 1;

// Storage key for localStorage
const STORAGE_KEY = 'canvasSimulatorState';

// Z-order configuration for shape layering
// Lower numbers are drawn first (behind), higher numbers are drawn last (on top)
const SHAPE_Z_ORDER = {
    'rectangle': 1,      // Bottom layer
    'ellipse': 2,        // Middle layer  
    'v_separator': 2.5,  // Between ellipse and line
    'h_separator': 2.7,  // Between v_separator and line
    'line': 3,           // Top layer
    // Future shapes can be added here with appropriate z-order values
    // 'triangle': 4,
    // 'circle': 2.5,
    // etc.
};

function getShapeZOrder(shapeType) {
    return SHAPE_Z_ORDER[shapeType] || 0; // Default to 0 if type not found
}

// Sort shapes array by z-order for proper rendering
function sortShapesByZOrder() {
    shapes.sort((a, b) => {
        const aZOrder = a.zOrder !== undefined ? a.zOrder : getShapeZOrder(a.type);
        const bZOrder = b.zOrder !== undefined ? b.zOrder : getShapeZOrder(b.type);
        
        // Primary sort by z-order
        if (aZOrder !== bZOrder) {
            return aZOrder - bZOrder;
        }
        
        // Secondary sort by creation order (id) for shapes with same z-order
        return a.id - b.id;
    });
}

// Get shapes sorted by z-order in reverse (for hit testing - top to bottom)
function getShapesByZOrderReverse() {
    const sortedShapes = [...shapes];
    return sortedShapes.sort((a, b) => {
        const aZOrder = a.zOrder !== undefined ? a.zOrder : getShapeZOrder(a.type);
        const bZOrder = b.zOrder !== undefined ? b.zOrder : getShapeZOrder(b.type);
        
        // Primary sort by z-order (reverse for hit testing)
        if (aZOrder !== bZOrder) {
            return bZOrder - aZOrder;
        }
        
        // Secondary sort by creation order (reverse)
        return b.id - a.id;
    });
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    canvas = document.getElementById('myCanvas');
    ctx = canvas.getContext('2d');
    
    // Load saved state
    loadState();
    
    // Initialize canvas with loaded/default values
    updateCanvas();
    updateShapesList();
    
    // Initialize property controls based on current state
    updateShapeControls(); // This will handle both selected shapes and default values
    
    // Add event listeners for real-time updates
    setupEventListeners();
});

function setupEventListeners() {
    // Helper function to safely add event listeners
    function addEventListenerSafe(elementId, event, handler) {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener(event, handler);
        } else {
            console.warn(`Element with ID '${elementId}' not found`);
        }
    }

    // Shape property controls - update selected shape
    addEventListenerSafe('shapeType', 'change', function() {
        if (selectedShapeId !== null) {
            const shape = getShapeById(selectedShapeId);
            if (shape) {
                const oldType = shape.type;
                shape.type = this.value;
                
                // Convert between shape types while preserving position
                if (oldType !== shape.type) {
                    if (shape.type === 'line') {
                        // Convert to line format
                        shape.x1 = shape.x || 50;
                        shape.y1 = shape.y || 50;
                        shape.x2 = (shape.x || 50) + (shape.w || 100);
                        shape.y2 = (shape.y || 50) + (shape.h || 100);
                        shape.f = shape.f1 || '#000000';
                        // Remove old properties
                        delete shape.x; delete shape.y; delete shape.w; delete shape.h; delete shape.f1; delete shape.f2;
                    } else if (oldType === 'line') {
                        // Convert from line to other shapes
                        shape.x = Math.min(shape.x1, shape.x2);
                        shape.y = Math.min(shape.y1, shape.y2);
                        if (shape.type === 'ellipse' || shape.type === 'rectangle') {
                            shape.w = Math.abs(shape.x2 - shape.x1) || 100;
                            shape.h = Math.abs(shape.y2 - shape.y1) || 100;
                            shape.f1 = shape.f || '#000000';
                            shape.f2 = '#ff0000';
                        }
                        // Remove line properties
                        delete shape.x1; delete shape.y1; delete shape.x2; delete shape.y2; delete shape.f;
                    }
                }
                
                updatePropertyVisibility(this.value); // Update visibility immediately
                updateShapeControls(); // Update controls with new values
                updateCanvas();
                saveState();
            }
        } else {
            // No shape selected - update property visibility and default values for new shape creation
            updateShapeControls(); // This will now handle the dropdown selection case
        }
    });
    
    addEventListenerSafe('borderStyle', 'change', function() {
        if (selectedShapeId !== null) {
            const shape = getShapeById(selectedShapeId);
            if (shape) {
                shape.s = this.value; // Border style
                updateCanvas();
                saveState();
            }
        }
    });

    addEventListenerSafe('borderColor', 'input', function() {
        if (selectedShapeId !== null) {
            const shape = getShapeById(selectedShapeId);
            if (shape) {
                if (shape.type === 'line') {
                    shape.f = this.value; // Line color
                } else {
                    shape.f1 = this.value; // Border color
                }
                updateCanvas();
                saveState();
            }
        }
    });

    addEventListenerSafe('fillColor', 'input', function() {
        if (selectedShapeId !== null) {
            const shape = getShapeById(selectedShapeId);
            if (shape) {
                shape.f2 = this.value; // Fill color
                updateCanvas();
                saveState();
            }
        }
    });

    addEventListenerSafe('positionX', 'input', function() {
        if (selectedShapeId !== null) {
            const shape = getShapeById(selectedShapeId);
            if (shape && shape.type !== 'line') { // Position controls don't apply to lines
                shape.x = parseInt(this.value);
                updateCanvas();
                saveState();
            }
        }
    });
    
    document.getElementById('positionY').addEventListener('input', function() {
        if (selectedShapeId !== null) {
            const shape = getShapeById(selectedShapeId);
            if (shape && shape.type !== 'line') { // Position controls don't apply to lines
                shape.y = parseInt(this.value);
                updateCanvas();
                saveState();
            }
        }
    });
    
    // Rectangle-specific properties
    // Ellipse and Rectangle width/height properties
    addEventListenerSafe('shapeWidth', 'input', function() {
        if (selectedShapeId !== null) {
            const shape = getShapeById(selectedShapeId);
            if (shape && (shape.type === 'ellipse' || shape.type === 'rectangle')) {
                shape.w = parseInt(this.value);
                updateCanvas();
                saveState();
            }
        }
    });
    
    addEventListenerSafe('shapeHeight', 'input', function() {
        if (selectedShapeId !== null) {
            const shape = getShapeById(selectedShapeId);
            if (shape && (shape.type === 'ellipse' || shape.type === 'rectangle')) {
                shape.h = parseInt(this.value);
                updateCanvas();
                saveState();
            }
        }
    });
    
    // Line coordinate properties
    addEventListenerSafe('lineX1', 'input', function() {
        if (selectedShapeId !== null) {
            const shape = getShapeById(selectedShapeId);
            if (shape && shape.type === 'line') {
                shape.x1 = parseInt(this.value);
                updateCanvas();
                saveState();
            }
        }
    });
    
    addEventListenerSafe('lineY1', 'input', function() {
        if (selectedShapeId !== null) {
            const shape = getShapeById(selectedShapeId);
            if (shape && shape.type === 'line') {
                shape.y1 = parseInt(this.value);
                updateCanvas();
                saveState();
            }
        }
    });
    
    addEventListenerSafe('lineX2', 'input', function() {
        if (selectedShapeId !== null) {
            const shape = getShapeById(selectedShapeId);
            if (shape && shape.type === 'line') {
                shape.x2 = parseInt(this.value);
                updateCanvas();
                saveState();
            }
        }
    });
    
    addEventListenerSafe('lineY2', 'input', function() {
        if (selectedShapeId !== null) {
            const shape = getShapeById(selectedShapeId);
            if (shape && shape.type === 'line') {
                shape.y2 = parseInt(this.value);
                updateCanvas();
                saveState();
            }
        }
    });
    
    // V_SEPARATOR coordinate and style properties
    addEventListenerSafe('vSepX', 'input', function() {
        if (selectedShapeId !== null) {
            const shape = getShapeById(selectedShapeId);
            if (shape && shape.type === 'v_separator') {
                shape.x = parseInt(this.value);
                updateCanvas();
                saveState();
            }
        }
    });
    
    addEventListenerSafe('vSepWidth', 'input', function() {
        if (selectedShapeId !== null) {
            const shape = getShapeById(selectedShapeId);
            if (shape && shape.type === 'v_separator') {
                shape.w = parseInt(this.value);
                updateCanvas();
                saveState();
            }
        }
    });
    
    addEventListenerSafe('vSepColor', 'input', function() {
        if (selectedShapeId !== null) {
            const shape = getShapeById(selectedShapeId);
            if (shape && shape.type === 'v_separator') {
                shape.color = this.value;
                updateCanvas();
                saveState();
            }
        }
    });
    
    addEventListenerSafe('vSepPen', 'change', function() {
        if (selectedShapeId !== null) {
            const shape = getShapeById(selectedShapeId);
            if (shape && shape.type === 'v_separator') {
                shape.pen = this.value;
                updateCanvas();
                saveState();
            }
        }
    });
    
    // H_SEPARATOR coordinate and style properties
    addEventListenerSafe('hSepY', 'input', function() {
        if (selectedShapeId !== null) {
            const shape = getShapeById(selectedShapeId);
            if (shape && shape.type === 'h_separator') {
                shape.y = parseInt(this.value);
                updateCanvas();
                saveState();
            }
        }
    });
    
    addEventListenerSafe('hSepHeight', 'input', function() {
        if (selectedShapeId !== null) {
            const shape = getShapeById(selectedShapeId);
            if (shape && shape.type === 'h_separator') {
                shape.h = parseInt(this.value);
                updateCanvas();
                saveState();
            }
        }
    });
    
    addEventListenerSafe('hSepColor', 'input', function() {
        if (selectedShapeId !== null) {
            const shape = getShapeById(selectedShapeId);
            if (shape && shape.type === 'h_separator') {
                shape.color = this.value;
                updateCanvas();
                saveState();
            }
        }
    });
    
    addEventListenerSafe('hSepPen', 'change', function() {
        if (selectedShapeId !== null) {
            const shape = getShapeById(selectedShapeId);
            if (shape && shape.type === 'h_separator') {
                shape.pen = this.value;
                updateCanvas();
                saveState();
            }
        }
    });
    
    // Background color control
    addEventListenerSafe('backgroundColor', 'input', function() {
        updateCanvas();
        saveState();
    });
    
    // Canvas dimension controls
    addEventListenerSafe('canvasWidth', 'input', function() {
        canvas.width = this.value;
        const positionXElement = document.getElementById('positionX');
        if (positionXElement) {
            positionXElement.max = this.value;
        }
        updateCanvas();
        saveState();
    });
    
    addEventListenerSafe('canvasHeight', 'input', function() {
        canvas.height = this.value;
        const positionYElement = document.getElementById('positionY');
        if (positionYElement) {
            positionYElement.max = this.value;
        }
        updateCanvas();
        saveState();
    });
    
    // Canvas mouse events
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    
    // Keyboard events for moving selected shapes
    document.addEventListener('keydown', handleKeyDown);
}

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

// Shape management functions
function addShape() {
    // Check if there's a selected shape to copy
    if (selectedShapeId !== null) {
        // Copy the selected shape with position offset
        copyShape();
        return;
    }
    
    // No shape selected - create new shape with values from property panel
    const shapeType = document.getElementById('shapeType').value;
    
    const newShape = {
        id: nextShapeId++,
        type: shapeType,
        zOrder: getShapeZOrder(shapeType) // Add z-order based on shape type
    };
    
    if (shapeType === 'ellipse' || shapeType === 'rectangle') {
        // Ellipse and Rectangle use x, y, w, h format - read from properties panel
        newShape.f1 = document.getElementById('borderColor').value || '#000000'; // border color
        newShape.f2 = document.getElementById('fillColor').value || '#ff0000';   // fill color
        newShape.s = document.getElementById('borderStyle').value || '1';        // border style
        newShape.x = parseInt(document.getElementById('positionX').value) || 50;   // x-coordinate (top-left)
        newShape.y = parseInt(document.getElementById('positionY').value) || 50;   // y-coordinate (top-left)
        newShape.w = parseInt(document.getElementById('shapeWidth').value) || 100; // width
        newShape.h = parseInt(document.getElementById('shapeHeight').value) || 100; // height
    } else if (shapeType === 'line') {
        // Line uses x1, y1, x2, y2, f, s format - read from properties panel
        newShape.x1 = parseInt(document.getElementById('lineX1').value) || 50;   // start x-coordinate
        newShape.y1 = parseInt(document.getElementById('lineY1').value) || 50;   // start y-coordinate
        newShape.x2 = parseInt(document.getElementById('lineX2').value) || 150;  // end x-coordinate
        newShape.y2 = parseInt(document.getElementById('lineY2').value) || 150;  // end y-coordinate
        newShape.f = document.getElementById('borderColor').value || '#000000';   // line color
        newShape.s = document.getElementById('borderStyle').value || '1';         // border style
    } else if (shapeType === 'v_separator') {
        // V_SEPARATOR uses x, w, color, pen format - read from properties panel
        const vSepX = document.getElementById('vSepX');
        const vSepWidth = document.getElementById('vSepWidth');
        const vSepColor = document.getElementById('vSepColor');
        const vSepPen = document.getElementById('vSepPen');
        
        newShape.x = parseInt(vSepX?.value) || 300;          // x position (horizontal position)
        newShape.w = parseInt(vSepWidth?.value) || 2;        // line weight
        newShape.color = vSepColor?.value || '#000000';      // color
        newShape.pen = vSepPen?.value || '1';               // pen style
    } else if (shapeType === 'h_separator') {
        // H_SEPARATOR uses y, h, color, pen format - read from properties panel
        const hSepY = document.getElementById('hSepY');
        const hSepHeight = document.getElementById('hSepHeight');
        const hSepColor = document.getElementById('hSepColor');
        const hSepPen = document.getElementById('hSepPen');
        
        newShape.y = parseInt(hSepY?.value) || 200;          // y position (vertical position)
        newShape.h = parseInt(hSepHeight?.value) || 2;       // line weight (height/thickness)
        newShape.color = hSepColor?.value || '#000000';      // color
        newShape.pen = hSepPen?.value || '1';               // pen style
    }
    
    // Add new shape to the end of the array (user controls order)
    shapes.push(newShape);
    
    selectedShapeId = newShape.id;
    updateShapeControls();
    updateShapesList();
    updateCanvas();
    saveState();
}

function copyShape() {
    // Only copy if there's a selected shape
    if (selectedShapeId === null) {
        return;
    }
    
    const originalShape = getShapeById(selectedShapeId);
    if (!originalShape) {
        return;
    }
    
    // Create a deep copy of the selected shape
    const copiedShape = JSON.parse(JSON.stringify(originalShape));
    copiedShape.id = nextShapeId++;
    
    // Offset position to make the copy visible
    const offset = 20; // 20 pixels offset
    
    if (copiedShape.type === 'ellipse' || copiedShape.type === 'rectangle') {
        // For ellipse/rectangle: offset x and y position
        copiedShape.x += offset;
        copiedShape.y += offset;
        
        // Keep within canvas bounds
        const canvas = document.getElementById('myCanvas');
        const maxX = canvas.width - (copiedShape.w || 100);
        const maxY = canvas.height - (copiedShape.h || 100);
        
        if (copiedShape.x > maxX) copiedShape.x = Math.max(0, maxX);
        if (copiedShape.y > maxY) copiedShape.y = Math.max(0, maxY);
        
    } else if (copiedShape.type === 'line') {
        // For line: offset both start and end points
        copiedShape.x1 += offset;
        copiedShape.y1 += offset;
        copiedShape.x2 += offset;
        copiedShape.y2 += offset;
        
        // Keep within canvas bounds
        const canvas = document.getElementById('myCanvas');
        if (copiedShape.x1 >= canvas.width || copiedShape.x2 >= canvas.width) {
            const xShift = Math.min(copiedShape.x1, copiedShape.x2) - offset;
            copiedShape.x1 = copiedShape.x1 - xShift;
            copiedShape.x2 = copiedShape.x2 - xShift;
        }
        if (copiedShape.y1 >= canvas.height || copiedShape.y2 >= canvas.height) {
            const yShift = Math.min(copiedShape.y1, copiedShape.y2) - offset;
            copiedShape.y1 = copiedShape.y1 - yShift;
            copiedShape.y2 = copiedShape.y2 - yShift;
        }
        
    } else if (copiedShape.type === 'v_separator') {
        // For v_separator: offset x position
        copiedShape.x += offset;
        
        // Keep within canvas bounds
        const canvas = document.getElementById('myCanvas');
        if (copiedShape.x >= canvas.width) {
            copiedShape.x = canvas.width - offset;
        }
        
    } else if (copiedShape.type === 'h_separator') {
        // For h_separator: offset y position
        copiedShape.y += offset;
        
        // Keep within canvas bounds
        const canvas = document.getElementById('myCanvas');
        if (copiedShape.y >= canvas.height) {
            copiedShape.y = canvas.height - offset;
        }
    }
    
    // Add copied shape to the end of the array (user controls order)
    shapes.push(copiedShape);
    
    // Select the newly created copy
    selectedShapeId = copiedShape.id;
    updateShapeControls();
    updateShapesList();
    updateCanvas();
    saveState();
}

function deleteShape(id) {
    const index = shapes.findIndex(shape => shape.id === id);
    if (index !== -1) {
        shapes.splice(index, 1);
        
        // Select another shape or clear selection
        if (selectedShapeId === id) {
            selectedShapeId = shapes.length > 0 ? shapes[0].id : null;
        }
        
        updateShapeControls();
        updateShapesList();
        updateCanvas();
        saveState();
    }
}

function selectShape(id) {
    selectedShapeId = id;
    updateShapeControls();
    updateShapesList();
    updateCanvas();
}

function getShapeById(id) {
    return shapes.find(shape => shape.id === id);
}

function updateShapeControls() {
    const shape = getShapeById(selectedShapeId);
    
    if (shape) {
        // Show properties of selected shape
        document.getElementById('shapeType').value = shape.type;
        document.getElementById('borderStyle').value = shape.s || '1';
        
        // Update property visibility and labels based on shape type
        updatePropertyVisibility(shape.type);
        
        if (shape.type === 'ellipse' || shape.type === 'rectangle') {
            // Ellipse and Rectangle: both use x, y, w, h properties
            document.getElementById('borderColor').value = shape.f1 || '#000000';
            document.getElementById('fillColor').value = shape.f2 || '#ff0000';
            document.getElementById('positionX').value = shape.x;
            document.getElementById('positionY').value = shape.y;
            document.getElementById('shapeWidth').value = shape.w || 100;
            document.getElementById('shapeHeight').value = shape.h || 100;
        } else if (shape.type === 'line') {
            // Line: uses x1, y1, x2, y2, f properties
            document.getElementById('borderColor').value = shape.f || '#000000';
            document.getElementById('lineX1').value = shape.x1 || 50;
            document.getElementById('lineY1').value = shape.y1 || 50;
            document.getElementById('lineX2').value = shape.x2 || 150;
            document.getElementById('lineY2').value = shape.y2 || 150;
        } else if (shape.type === 'v_separator') {
            // V_SEPARATOR: uses x, w, color, pen properties
            const vSepX = document.getElementById('vSepX');
            const vSepWidth = document.getElementById('vSepWidth');
            const vSepColor = document.getElementById('vSepColor');
            const vSepPen = document.getElementById('vSepPen');
            
            if (vSepX) vSepX.value = shape.x || 300;
            if (vSepWidth) vSepWidth.value = shape.w || 2;
            if (vSepColor) vSepColor.value = shape.color || '#000000';
            if (vSepPen) vSepPen.value = shape.pen || '1';
        } else if (shape.type === 'h_separator') {
            // H_SEPARATOR: uses y, h, color, pen properties
            const hSepY = document.getElementById('hSepY');
            const hSepHeight = document.getElementById('hSepHeight');
            const hSepColor = document.getElementById('hSepColor');
            const hSepPen = document.getElementById('hSepPen');
            
            if (hSepY) hSepY.value = shape.y || 200;
            if (hSepHeight) hSepHeight.value = shape.h || 2;
            if (hSepColor) hSepColor.value = shape.color || '#000000';
            if (hSepPen) hSepPen.value = shape.pen || '1';
        }
    } else {
        // No shape selected - show default values for the dropdown selection
        const shapeType = document.getElementById('shapeType').value;
        updatePropertyVisibility(shapeType);
        
        // Set default values based on shape type
        if (shapeType === 'ellipse' || shapeType === 'rectangle') {
            document.getElementById('borderColor').value = '#000000';
            document.getElementById('fillColor').value = '#ff0000';
            document.getElementById('borderStyle').value = '1';
            document.getElementById('positionX').value = 50;
            document.getElementById('positionY').value = 50;
            document.getElementById('shapeWidth').value = 100;
            document.getElementById('shapeHeight').value = 100;
        } else if (shapeType === 'line') {
            document.getElementById('borderColor').value = '#000000';
            document.getElementById('borderStyle').value = '1';
            document.getElementById('lineX1').value = 50;
            document.getElementById('lineY1').value = 50;
            document.getElementById('lineX2').value = 150;
            document.getElementById('lineY2').value = 150;
        } else if (shapeType === 'v_separator') {
            const vSepX = document.getElementById('vSepX');
            const vSepWidth = document.getElementById('vSepWidth');
            const vSepColor = document.getElementById('vSepColor');
            const vSepPen = document.getElementById('vSepPen');
            
            if (vSepX) vSepX.value = 300;
            if (vSepWidth) vSepWidth.value = 2;
            if (vSepColor) vSepColor.value = '#000000';
            if (vSepPen) vSepPen.value = '1';
        } else if (shapeType === 'h_separator') {
            const hSepY = document.getElementById('hSepY');
            const hSepHeight = document.getElementById('hSepHeight');
            const hSepColor = document.getElementById('hSepColor');
            const hSepPen = document.getElementById('hSepPen');
            
            if (hSepY) hSepY.value = 200;
            if (hSepHeight) hSepHeight.value = 2;
            if (hSepColor) hSepColor.value = '#000000';
            if (hSepPen) hSepPen.value = '1';
        }
    }
    
    // Update add button text based on selection state
    updateAddButtonText();
}

function updateAddButtonText() {
    const addBtn = document.querySelector('button[onclick="addShape()"]');
    if (addBtn) {
        if (selectedShapeId !== null) {
            addBtn.innerHTML = '📋 Copy Selected Shape';
            addBtn.style.backgroundColor = '#17a2b8'; // Blue for copy
        } else {
            addBtn.innerHTML = '+ Add New Shape';
            addBtn.style.backgroundColor = '#28a745'; // Green for new
        }
    }
}

function updatePropertyVisibility(shapeType) {
    const ellipseRectangleControls = document.querySelectorAll('.ellipse-rectangle-only');
    const lineControls = document.querySelectorAll('.line-only');
    const vSeparatorControls = document.querySelectorAll('.v-separator-only');
    const hSeparatorControls = document.querySelectorAll('.h-separator-only');
    
    // Hide all controls first
    ellipseRectangleControls.forEach(control => {
        control.classList.add('hide');
        control.style.display = 'none';
    });
    lineControls.forEach(control => {
        control.classList.remove('show');
        control.style.display = 'none';
    });
    vSeparatorControls.forEach(control => {
        control.classList.remove('show');
        control.style.display = 'none';
    });
    hSeparatorControls.forEach(control => {
        control.classList.remove('show');
        control.style.display = 'none';
    });
    
    if (shapeType === 'ellipse' || shapeType === 'rectangle') {
        // Show ellipse/rectangle controls (w, h)
        ellipseRectangleControls.forEach(control => {
            control.classList.remove('hide');
            // Use flex for row layout, block for regular controls
            if (control.classList.contains('control-row')) {
                control.style.display = 'flex';
            } else {
                control.style.display = 'block';
            }
        });
    } else if (shapeType === 'line') {
        // Show line controls (x1, y1, x2, y2) and border color
        lineControls.forEach(control => {
            control.classList.add('show');
            if (control.classList.contains('control-row')) {
                control.style.display = 'flex';
            } else {
                control.style.display = 'block';
            }
        });
    } else if (shapeType === 'v_separator') {
        // Show v_separator controls (x, w, color, pen)
        vSeparatorControls.forEach(control => {
            control.classList.add('show');
            control.style.display = 'block';
        });
    } else if (shapeType === 'h_separator') {
        // Show h_separator controls (y, h, color, pen)
        hSeparatorControls.forEach(control => {
            control.classList.add('show');
            control.style.display = 'block';
        });
    }
}

function drawShape(shape, isSelected = false) {
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

function clearCanvas() {
    const bgColor = document.getElementById('backgroundColor').value;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function downloadCanvas() {
    const link = document.createElement('a');
    link.download = 'canvas-drawing.png';
    link.href = canvas.toDataURL();
    link.click();
}

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

// Mouse event handlers for dragging
function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // First, check if clicking on the currently selected shape
    if (selectedShapeId !== null) {
        const selectedShape = getShapeById(selectedShapeId);
        if (selectedShape) {
            // Check if clicking on a resize handle of the selected shape
            const handle = getResizeHandle(mouseX, mouseY, selectedShape);
            if (handle) {
                isResizing = true;
                resizeHandle = handle;
                draggedShapeId = selectedShape.id;
                canvas.style.cursor = getResizeCursor(handle);
                return;
            }
            
            // Check if clicking in the center of the selected shape (for moving)
            if (isPointInShapeCenter(mouseX, mouseY, selectedShape)) {
                isDragging = true;
                draggedShapeId = selectedShape.id;
                
                if (selectedShape.type === 'line') {
                    dragOffsetX = mouseX - selectedShape.x1;
                    dragOffsetY = mouseY - selectedShape.y1;
                } else {
                    dragOffsetX = mouseX - selectedShape.x;
                    dragOffsetY = mouseY - selectedShape.y;
                }
                
                canvas.style.cursor = 'grabbing';
                return;
            }
        }
    }
    
    // If not clicking on selected shape, find any shape at this position
    let clickedShape = null;
    const shapesInZOrder = getShapesByZOrderReverse(); // Get shapes from top to bottom
    
    for (let i = 0; i < shapesInZOrder.length; i++) {
        const hitTest = isPointInShape(mouseX, mouseY, shapesInZOrder[i]);
        if (hitTest) {
            clickedShape = shapesInZOrder[i];
            break;
        }
    }
    
    if (clickedShape) {
        // Select the clicked shape and start moving it
        selectShape(clickedShape.id);
        
        isDragging = true;
        draggedShapeId = clickedShape.id;
        
        if (clickedShape.type === 'line') {
            dragOffsetX = mouseX - clickedShape.x1;
            dragOffsetY = mouseY - clickedShape.y1;
        } else {
            dragOffsetX = mouseX - clickedShape.x;
            dragOffsetY = mouseY - clickedShape.y;
        }
        
        canvas.style.cursor = 'grabbing';
    } else {
        // Clear selection when clicking empty space
        selectedShapeId = null;
        updateShapeControls();
        updateShapesList();
        updateCanvas();
    }
}

function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    if (isResizing && draggedShapeId !== null) {
        // Handle resize operations
        const shape = getShapeById(draggedShapeId);
        if (shape) {
            handleShapeResize(shape, mouseX, mouseY, resizeHandle);
            updateCanvas();
            saveState();
        }
    } else if (isDragging && draggedShapeId !== null) {
        // Handle move operations
        const shape = getShapeById(draggedShapeId);
        if (shape) {
            // Calculate new position
            const newX = mouseX - dragOffsetX;
            const newY = mouseY - dragOffsetY;
            
            // Keep shape within canvas bounds based on shape type
            let boundedX, boundedY;
            
            if (shape.type === 'rectangle') {
                // Rectangle: x,y is top-left, so constrain based on width/height
                const width = shape.w || 100;
                const height = shape.h || 100;
                boundedX = Math.max(0, Math.min(canvas.width - width, newX));
                boundedY = Math.max(0, Math.min(canvas.height - height, newY));
            } else if (shape.type === 'ellipse') {
                // Ellipse: x,y is top-left, so constrain based on width/height
                const width = shape.w || 100;
                const height = shape.h || 100;
                boundedX = Math.max(0, Math.min(canvas.width - width, newX));
                boundedY = Math.max(0, Math.min(canvas.height - height, newY));
            } else if (shape.type === 'line') {
                // Line: move both points, keeping the line within canvas bounds
                const deltaX = newX - shape.x1;
                const deltaY = newY - shape.y1;
                const newX2 = shape.x2 + deltaX;
                const newY2 = shape.y2 + deltaY;
                
                // Constrain both points within canvas
                boundedX = Math.max(0, Math.min(canvas.width, newX));
                boundedY = Math.max(0, Math.min(canvas.height, newY));
                const boundedX2 = Math.max(0, Math.min(canvas.width, newX2));
                const boundedY2 = Math.max(0, Math.min(canvas.height, newY2));
                
                // Update line coordinates
                shape.x1 = boundedX;
                shape.y1 = boundedY;
                shape.x2 = boundedX2;
                shape.y2 = boundedY2;
            } else if (shape.type === 'v_separator') {
                // V_SEPARATOR: only x position can be moved, spans full height
                boundedX = Math.max(0, Math.min(canvas.width, newX));
                shape.x = boundedX;
            } else if (shape.type === 'h_separator') {
                // H_SEPARATOR: only y position can be moved, spans full width
                boundedY = Math.max(0, Math.min(canvas.height, newY));
                shape.y = boundedY;
            } else {
                // Circle: x,y is center, so constrain based on radius/half-size
                const halfSize = (shape.size || 50) / 2;
                boundedX = Math.max(halfSize, Math.min(canvas.width - halfSize, newX));
                boundedY = Math.max(halfSize, Math.min(canvas.height - halfSize, newY));
            }
            
            // Update shape position (for non-line shapes that use x,y)
            if (shape.type !== 'line' && shape.type !== 'v_separator' && shape.type !== 'h_separator') {
                shape.x = boundedX;
                shape.y = boundedY;
            }
            
            // Update controls if this is the selected shape
            updateShapeControlsFromShape(shape);
            
            // Redraw canvas and save state
            updateCanvas();
            saveState();
        }
    } else {
        // Handle cursor changes when hovering
        handleMouseHover(mouseX, mouseY);
    }
}

function handleShapeResize(shape, mouseX, mouseY, handle) {
    const minSize = 10; // Minimum size for shapes
    
    if (shape.type === 'ellipse' || shape.type === 'rectangle') {
        const originalX = shape.x;
        const originalY = shape.y;
        const originalW = shape.w;
        const originalH = shape.h;
        
        switch(handle) {
            case 'tl': // Top-left
                const newW = originalW + (originalX - mouseX);
                const newH = originalH + (originalY - mouseY);
                if (newW >= minSize && newH >= minSize) {
                    shape.x = mouseX;
                    shape.y = mouseY;
                    shape.w = newW;
                    shape.h = newH;
                }
                break;
            case 'tr': // Top-right
                const newW2 = mouseX - originalX;
                const newH2 = originalH + (originalY - mouseY);
                if (newW2 >= minSize && newH2 >= minSize) {
                    shape.y = mouseY;
                    shape.w = newW2;
                    shape.h = newH2;
                }
                break;
            case 'bl': // Bottom-left
                const newW3 = originalW + (originalX - mouseX);
                const newH3 = mouseY - originalY;
                if (newW3 >= minSize && newH3 >= minSize) {
                    shape.x = mouseX;
                    shape.w = newW3;
                    shape.h = newH3;
                }
                break;
            case 'br': // Bottom-right
                const newW4 = mouseX - originalX;
                const newH4 = mouseY - originalY;
                if (newW4 >= minSize && newH4 >= minSize) {
                    shape.w = newW4;
                    shape.h = newH4;
                }
                break;
        }
        
        // Keep shape within canvas bounds
        shape.x = Math.max(0, Math.min(canvas.width - shape.w, shape.x));
        shape.y = Math.max(0, Math.min(canvas.height - shape.h, shape.y));
        shape.w = Math.min(canvas.width - shape.x, shape.w);
        shape.h = Math.min(canvas.height - shape.y, shape.h);
        
    } else if (shape.type === 'line') {
        // For lines, resize means moving the endpoints
        switch(handle) {
            case 'start':
                shape.x1 = Math.max(0, Math.min(canvas.width, mouseX));
                shape.y1 = Math.max(0, Math.min(canvas.height, mouseY));
                break;
            case 'end':
                shape.x2 = Math.max(0, Math.min(canvas.width, mouseX));
                shape.y2 = Math.max(0, Math.min(canvas.height, mouseY));
                break;
        }
    }
    
    // Update control inputs
    updateShapeControlsFromShape(shape);
}

function updateShapeControlsFromShape(shape) {
    if (selectedShapeId === shape.id) {
        if (shape.type === 'line') {
            const lineX1 = document.getElementById('lineX1');
            const lineY1 = document.getElementById('lineY1');
            const lineX2 = document.getElementById('lineX2');
            const lineY2 = document.getElementById('lineY2');
            
            if (lineX1) lineX1.value = Math.round(shape.x1);
            if (lineY1) lineY1.value = Math.round(shape.y1);
            if (lineX2) lineX2.value = Math.round(shape.x2);
            if (lineY2) lineY2.value = Math.round(shape.y2);
        } else if (shape.type === 'v_separator') {
            const vSepX = document.getElementById('vSepX');
            const vSepWidth = document.getElementById('vSepWidth');
            const vSepColor = document.getElementById('vSepColor');
            const vSepPen = document.getElementById('vSepPen');
            
            if (vSepX) vSepX.value = Math.round(shape.x);
            if (vSepWidth) vSepWidth.value = Math.round(shape.w);
            if (vSepColor) vSepColor.value = shape.color;
            if (vSepPen) vSepPen.value = shape.pen;
        } else if (shape.type === 'h_separator') {
            const hSepY = document.getElementById('hSepY');
            const hSepHeight = document.getElementById('hSepHeight');
            const hSepColor = document.getElementById('hSepColor');
            const hSepPen = document.getElementById('hSepPen');
            
            if (hSepY) hSepY.value = Math.round(shape.y);
            if (hSepHeight) hSepHeight.value = Math.round(shape.h);
            if (hSepColor) hSepColor.value = shape.color;
            if (hSepPen) hSepPen.value = shape.pen;
        } else {
            const positionX = document.getElementById('positionX');
            const positionY = document.getElementById('positionY');
            const shapeWidth = document.getElementById('shapeWidth');
            const shapeHeight = document.getElementById('shapeHeight');
            
            if (positionX) positionX.value = Math.round(shape.x);
            if (positionY) positionY.value = Math.round(shape.y);
            if (shapeWidth) shapeWidth.value = Math.round(shape.w);
            if (shapeHeight) shapeHeight.value = Math.round(shape.h);
        }
    }
}

function handleMouseHover(mouseX, mouseY) {
    // Check if hovering over selected shape's resize handles
    if (selectedShapeId !== null) {
        const selectedShape = getShapeById(selectedShapeId);
        if (selectedShape) {
            const handle = getResizeHandle(mouseX, mouseY, selectedShape);
            if (handle) {
                canvas.style.cursor = getResizeCursor(handle);
                return;
            }
            
            // Check if hovering over the center of selected shape
            if (isPointInShapeCenter(mouseX, mouseY, selectedShape)) {
                canvas.style.cursor = 'grab';
                return;
            }
        }
    }
    
    // Check if hovering over any shape
    let hoveringOverShape = false;
    const shapesInZOrder = getShapesByZOrderReverse(); // Check from top to bottom
    
    for (let i = 0; i < shapesInZOrder.length; i++) {
        if (isPointInShape(mouseX, mouseY, shapesInZOrder[i])) {
            hoveringOverShape = true;
            break;
        }
    }
    canvas.style.cursor = hoveringOverShape ? 'grab' : 'default';
}

function handleMouseUp(e) {
    if (isDragging || isResizing) {
        isDragging = false;
        isResizing = false;
        resizeHandle = null;
        draggedShapeId = null;
        canvas.style.cursor = 'default';
    }
}

// Handle keyboard events for moving selected shapes
function handleKeyDown(e) {
    // Only process arrow keys when a shape is selected
    if (selectedShapeId === null) {
        return;
    }
    
    // Check if we're focused on an input field - if so, don't intercept arrow keys
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        return;
    }
    
    const shape = getShapeById(selectedShapeId);
    if (!shape) {
        return;
    }
    
    let moved = false;
    
    switch(e.key) {
        case 'ArrowUp':
            e.preventDefault();
            if (shape.type === 'line') {
                shape.y1 -= 1;
                shape.y2 -= 1;
            } else if (shape.type === 'v_separator') {
                // v_separator doesn't have a y property - it spans full height
                return;
            } else if (shape.type === 'h_separator') {
                shape.y -= 1;
            } else {
                // rectangle, ellipse
                shape.y -= 1;
            }
            moved = true;
            break;
            
        case 'ArrowDown':
            e.preventDefault();
            if (shape.type === 'line') {
                shape.y1 += 1;
                shape.y2 += 1;
            } else if (shape.type === 'v_separator') {
                // v_separator doesn't have a y property - it spans full height
                return;
            } else if (shape.type === 'h_separator') {
                shape.y += 1;
            } else {
                // rectangle, ellipse
                shape.y += 1;
            }
            moved = true;
            break;
            
        case 'ArrowLeft':
            e.preventDefault();
            if (shape.type === 'line') {
                shape.x1 -= 1;
                shape.x2 -= 1;
            } else if (shape.type === 'v_separator') {
                shape.x -= 1;
            } else if (shape.type === 'h_separator') {
                // h_separator doesn't have an x property - it spans full width
                return;
            } else {
                // rectangle, ellipse
                shape.x -= 1;
            }
            moved = true;
            break;
            
        case 'ArrowRight':
            e.preventDefault();
            if (shape.type === 'line') {
                shape.x1 += 1;
                shape.x2 += 1;
            } else if (shape.type === 'v_separator') {
                shape.x += 1;
            } else if (shape.type === 'h_separator') {
                // h_separator doesn't have an x property - it spans full width
                return;
            } else {
                // rectangle, ellipse
                shape.x += 1;
            }
            moved = true;
            break;
    }
    
    if (moved) {
        // Update the property controls to reflect the new position
        updateShapeControls();
        // Redraw the canvas
        updateCanvas();
        // Save the state
        saveState();
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

// Update the shapes list UI
// Helper function to format shape properties for display
function formatShapeProperties(shape) {
    switch(shape.type) {
        case 'ellipse':
            return `ELLIPSE(${shape.x || 0},${shape.y || 0},${shape.w || 100},${shape.h || 100},"${shape.f1 || '#000000'}","${shape.f2 || '#ff0000'}",${shape.s || '1'})`;
            
        case 'rectangle':
            return `RECT(${shape.x || 0},${shape.y || 0},${shape.w || 100},${shape.h || 100},"${shape.f1 || '#000000'}","${shape.f2 || '#ff0000'}",${shape.s || '1'})`;
            
        case 'line':
            return `LINE(${shape.x1 || 0},${shape.y1 || 0},${shape.x2 || 0},${shape.y2 || 0},"${shape.f || '#000000'}",${shape.s || '1'})`;
            
        case 'v_separator':
            return `V_SEPARATOR(${shape.x || 0},${shape.w || 2},"${shape.color || '#000000'}",${shape.pen || '1'})`;
            
        case 'h_separator':
            return `H_SEPARATOR(${shape.y || 0},${shape.h || 2},"${shape.color || '#000000'}",${shape.pen || '1'})`;
            
        default:
            return `${shape.type.toUpperCase()} (unknown format)`;
    }
}

// Helper function to get representative color(s) for shape preview
function getShapePreviewColor(shape) {
    switch(shape.type) {
        case 'ellipse':
        case 'rectangle':
            // For shapes with both border and fill, show fill color as primary
            return {
                primary: shape.f2 || '#ff0000',
                secondary: shape.f1 || '#000000',
                hasBorder: true
            };
            
        case 'line':
            return {
                primary: shape.f || '#000000',
                secondary: null,
                hasBorder: false
            };
            
        case 'v_separator':
        case 'h_separator':
            return {
                primary: shape.color || '#000000',
                secondary: null,
                hasBorder: false
            };
            
        default:
            return {
                primary: '#000000',
                secondary: null,
                hasBorder: false
            };
    }
}

function updateShapesList() {
    const container = document.getElementById('shapesList');
    container.innerHTML = '';
    
    // Show shapes in their natural order (as arranged by user)
    // No sorting here - let the user see and control the order directly
    
    // Add drop zone at the very top (before first item)
    if (shapes.length > 0) {
        const topDropZone = document.createElement('div');
        topDropZone.className = 'drop-zone';
        topDropZone.dataset.insertAtStart = 'true';
        
        // Add drop zone event listeners
        topDropZone.addEventListener('dragover', handleDropZoneDragOver);
        topDropZone.addEventListener('dragleave', handleDropZoneDragLeave);
        topDropZone.addEventListener('drop', handleDropZoneDrop);
        
        container.appendChild(topDropZone);
    }
    
    shapes.forEach((shape, index) => {
        const shapeItem = document.createElement('div');
        shapeItem.className = `shape-item ${shape.id === selectedShapeId ? 'selected' : ''}`;
        shapeItem.dataset.shapeId = shape.id;
        
        // Get formatted properties and preview colors
        const shapeProperties = formatShapeProperties(shape);
        const colorInfo = getShapePreviewColor(shape);
        
        // Create color preview HTML
        let colorPreviewHTML;
        if (colorInfo.hasBorder && colorInfo.secondary) {
            // Show both fill and border colors for ellipse/rectangle
            colorPreviewHTML = `<span class="shape-preview dual-color" style="background-color: ${colorInfo.primary}; border: 2px solid ${colorInfo.secondary};"></span>`;
        } else {
            // Show single color for lines and separators
            colorPreviewHTML = `<span class="shape-preview" style="background-color: ${colorInfo.primary};"></span>`;
        }
        
        shapeItem.innerHTML = `
            <div class="shape-info" onclick="selectShape(${shape.id})">
                ${colorPreviewHTML}
                <span class="shape-details">${shapeProperties} #${shape.id}</span>
            </div>
            <button class="delete-btn" onclick="deleteShape(${shape.id})" ${shapes.length <= 1 ? 'disabled' : ''}>×</button>
        `;
        
        // Add drag functionality (only dragstart and dragend, no drop on items)
        shapeItem.draggable = true;
        shapeItem.addEventListener('dragstart', handleShapeDragStart);
        shapeItem.addEventListener('dragend', handleShapeDragEnd);
        
        container.appendChild(shapeItem);
        
        // Add drop zone after each item (for dropping below it)
        const dropZone = document.createElement('div');
        dropZone.className = 'drop-zone';
        dropZone.dataset.insertAfterShapeId = shape.id;
        
        // Add drop zone event listeners
        dropZone.addEventListener('dragover', handleDropZoneDragOver);
        dropZone.addEventListener('dragleave', handleDropZoneDragLeave);
        dropZone.addEventListener('drop', handleDropZoneDrop);
        
        container.appendChild(dropZone);
    });
}

// Save current state to localStorage
function saveState() {
    const state = {
        canvasWidth: document.getElementById('canvasWidth').value,
        canvasHeight: document.getElementById('canvasHeight').value,
        backgroundColor: document.getElementById('backgroundColor').value,
        shapes: shapes,
        selectedShapeId: selectedShapeId,
        nextShapeId: nextShapeId,
        timestamp: Date.now()
    };
    
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        showStatusIndicator();
    } catch (error) {
        console.warn('Could not save state to localStorage:', error);
    }
}

// Show status indicator briefly
function showStatusIndicator() {
    const indicator = document.getElementById('statusIndicator');
    indicator.classList.add('show');
    
    // Hide after 2 seconds
    setTimeout(() => {
        indicator.classList.remove('show');
    }, 3000);
}

// Load state from localStorage
function loadState() {
    try {
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (savedState) {
            const state = JSON.parse(savedState);
            
            // Load canvas settings
            document.getElementById('canvasWidth').value = state.canvasWidth || 600;
            document.getElementById('canvasHeight').value = state.canvasHeight || 400;
            document.getElementById('backgroundColor').value = state.backgroundColor || '#ffffff';
            
            // Update canvas dimensions
            canvas.width = state.canvasWidth || 600;
            canvas.height = state.canvasHeight || 400;
            
            // Load shapes data
            if (state.shapes && state.shapes.length > 0) {
                shapes = state.shapes.map(shape => {
                    const migratedShape = {
                        ...shape,
                        // Migrate old properties to new format
                        f1: shape.f1 || shape.borderColor || '#000000', // Border color
                        f2: shape.f2 || shape.color || '#ff0000',       // Fill color
                        s: shape.s || shape.borderStyle || '1',          // Border style
                        // Add z-order if missing
                        zOrder: shape.zOrder !== undefined ? shape.zOrder : getShapeZOrder(shape.type)
                    };
                    
                    if (shape.type === 'rectangle') {
                        // Rectangle: only x, y, w, h (no size property)
                        migratedShape.w = shape.w || shape.size || 100;
                        migratedShape.h = shape.h || shape.size || 100;
                    } else if (shape.type === 'ellipse') {
                        // Ellipse: only x, y, w, h (no size property)
                        migratedShape.w = shape.w || shape.size || 100;
                        migratedShape.h = shape.h || shape.size || 100;
                    } else if (shape.type === 'line') {
                        // Line: ensure proper properties
                        migratedShape.x1 = shape.x1 || 50;
                        migratedShape.y1 = shape.y1 || 50;
                        migratedShape.x2 = shape.x2 || 150;
                        migratedShape.y2 = shape.y2 || 150;
                        migratedShape.f = shape.f || shape.f1 || '#000000';
                        // Remove properties not used by lines
                        delete migratedShape.x;
                        delete migratedShape.y;
                        delete migratedShape.w;
                        delete migratedShape.h;
                        delete migratedShape.size;
                        delete migratedShape.f1;
                        delete migratedShape.f2;
                    } else if (shape.type === 'v_separator') {
                        // V_SEPARATOR: ensure proper properties (x, w, color, pen)
                        migratedShape.x = shape.x !== undefined ? shape.x : 300;
                        migratedShape.w = shape.w !== undefined ? shape.w : 2;
                        migratedShape.color = shape.color || shape.f1 || '#000000';
                        migratedShape.pen = shape.pen || shape.s || '1';
                        // Remove properties not used by v_separator
                        delete migratedShape.y;
                        delete migratedShape.h;
                        delete migratedShape.size;
                        delete migratedShape.f1;
                        delete migratedShape.f2;
                        delete migratedShape.s;
                        delete migratedShape.f;
                        delete migratedShape.x1;
                        delete migratedShape.y1;
                        delete migratedShape.x2;
                        delete migratedShape.y2;
                    } else if (shape.type === 'h_separator') {
                        // H_SEPARATOR: ensure proper properties (y, h, color, pen)
                        migratedShape.y = shape.y !== undefined ? shape.y : 200;
                        migratedShape.h = shape.h !== undefined ? shape.h : 2;
                        migratedShape.color = shape.color || shape.f1 || '#000000';
                        migratedShape.pen = shape.pen || shape.s || '1';
                        // Remove properties not used by h_separator
                        delete migratedShape.x;
                        delete migratedShape.w;
                        delete migratedShape.size;
                        delete migratedShape.f1;
                        delete migratedShape.f2;
                        delete migratedShape.s;
                        delete migratedShape.f;
                        delete migratedShape.x1;
                        delete migratedShape.y1;
                        delete migratedShape.x2;
                        delete migratedShape.y2;
                    }
                    
                    return migratedShape;
                });
                
                // Sort shapes by z-order after loading
                sortShapesByZOrder();
                
                selectedShapeId = state.selectedShapeId || shapes[0].id;
                nextShapeId = state.nextShapeId || (Math.max(...shapes.map(s => s.id)) + 1);
            }
            
            // Update position input max values
            document.getElementById('positionX').max = state.canvasWidth || 600;
            document.getElementById('positionY').max = state.canvasHeight || 400;
        }
    } catch (error) {
        console.warn('Could not load state from localStorage:', error);
    }
}

// Clear saved state (optional function for debugging)
function clearSavedState() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        shapes = [];
        selectedShapeId = null;
        nextShapeId = 1;
    } catch (error) {
        console.warn('Could not clear saved state:', error);
    }
}

// Drag and drop functionality for shape list reordering

function handleShapeDragStart(e) {
    const shapeId = parseInt(e.target.dataset.shapeId);
    const shape = shapes.find(s => s.id === shapeId);
    
    draggedShapeId = shapeId;
    
    e.target.style.opacity = '0.5';
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
}

function handleShapeDragEnd(e) {
    e.target.style.opacity = '';
    draggedShapeId = null;
    
    // Clear any remaining CSS classes
    document.querySelectorAll('.drop-zone').forEach(zone => {
        zone.classList.remove('drag-over-valid');
    });
}

// Drop zone event handlers
function handleDropZoneDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Clear previous classes
    e.currentTarget.classList.remove('drag-over-valid');
    
    // Always allow drop - no type restrictions
    e.currentTarget.classList.add('drag-over-valid');
}

function handleDropZoneDragLeave(e) {
    e.currentTarget.classList.remove('drag-over-valid');
}

function handleDropZoneDrop(e) {
    e.preventDefault();
    
    const insertAtStart = e.currentTarget.dataset.insertAtStart;
    const insertAfterShapeId = e.currentTarget.dataset.insertAfterShapeId;
    
    // Allow drop for any shape type
    if (draggedShapeId) {
        const draggedIndex = shapes.findIndex(s => s.id === draggedShapeId);
        
        // Find the target insertion point BEFORE removing the dragged shape
        let targetIndex;
        
        if (insertAtStart === 'true') {
            // Drop at the beginning of the list
            targetIndex = 0;
        } else if (insertAfterShapeId) {
            // Drop after a specific shape
            const afterShapeIndex = shapes.findIndex(s => s.id === parseInt(insertAfterShapeId));
            targetIndex = afterShapeIndex + 1;
        } else {
            console.error('Invalid drop zone configuration');
            return;
        }
        
        console.log('Before move - Dragged index:', draggedIndex, 'Target index:', targetIndex);
        
        // If we're moving the item to a position after its current position,
        // we need to adjust for the fact that we'll remove it first
        if (targetIndex > draggedIndex) {
            targetIndex = targetIndex - 1;
        }
        
        // Remove dragged shape from its current position
        const [draggedShape] = shapes.splice(draggedIndex, 1);
        
        console.log('After removal - Adjusted target index:', targetIndex);
        
        // Insert the shape at the new position
        shapes.splice(targetIndex, 0, draggedShape);
        
        console.log('Reordered shapes - New position:', targetIndex);
        console.log('About to update canvas and shapes list...');
        
        // Update the canvas and shape list
        updateCanvas();
        
        // Use setTimeout to ensure the shapes list updates after any DOM processing
        setTimeout(() => {
            updateShapesList();
            console.log('Delayed updateShapesList completed');
        }, 0);
        
        saveState();
    }
    
    // Reset visual feedback
    e.currentTarget.classList.remove('drag-over-valid');
}

// Panel Drag and Drop System
let draggedPanel = null;
let panelDragOffset = { x: 0, y: 0 };

function initializePanelDragDrop() {
    const panels = document.querySelectorAll('.panel');
    const mainLayout = document.getElementById('mainLayout');
    
    panels.forEach(panel => {
        const header = panel.querySelector('.panel-header');
        
        header.addEventListener('dragstart', (e) => {
            draggedPanel = panel;
            panel.classList.add('dragging');
            
            // Add drag-active class to main layout for visual indicators
            const mainLayout = document.getElementById('mainLayout');
            mainLayout.classList.add('drag-active');
            
            // Create drag image of the entire panel (optional)
            const dragImage = panel.cloneNode(true);
            dragImage.style.transform = 'rotate(2deg)';
            dragImage.style.opacity = '0.8';
            // Calculate offset relative to the panel, not just the header
            const headerRect = header.getBoundingClientRect();
            const panelRect = panel.getBoundingClientRect();
            const offsetX = e.clientX - panelRect.left;
            const offsetY = e.clientY - panelRect.top;
            e.dataTransfer.setDragImage(dragImage, offsetX, offsetY);
            
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', panel.outerHTML);
        });
        
        header.addEventListener('dragend', () => {
            if (draggedPanel) {
                draggedPanel.classList.remove('dragging');
                draggedPanel = null;
            }
            
            // Remove all visual indicators
            const mainLayout = document.getElementById('mainLayout');
            mainLayout.classList.remove('drag-active');
            panels.forEach(p => p.classList.remove('drag-over'));
        });
        
        // Allow dropping on other panels
        panel.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            if (draggedPanel && draggedPanel !== panel) {
                panel.classList.add('drag-over');
            }
        });
        
        panel.addEventListener('dragleave', (e) => {
            // Only remove drag-over if we're really leaving the panel
            if (!panel.contains(e.relatedTarget)) {
                panel.classList.remove('drag-over');
            }
        });
        
        panel.addEventListener('drop', (e) => {
            e.preventDefault();
            panel.classList.remove('drag-over');
            
            if (draggedPanel && draggedPanel !== panel) {
                // Determine if we should insert before or after based on drop position
                const rect = panel.getBoundingClientRect();
                const dropX = e.clientX;
                const panelCenterX = rect.left + rect.width / 2;
                
                if (dropX < panelCenterX) {
                    // Insert before the target panel
                    mainLayout.insertBefore(draggedPanel, panel);
                } else {
                    // Insert after the target panel
                    mainLayout.insertBefore(draggedPanel, panel.nextSibling);
                }
                
                // Save the new layout order
                savePanelOrder();
            }
        });
    });
    
    // Also allow dropping on empty space in main layout
    mainLayout.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        if (draggedPanel) {
            // Check if we're over empty space (not over a panel)
            const panelsAtPoint = document.elementsFromPoint(e.clientX, e.clientY);
            const overPanel = panelsAtPoint.find(el => el.classList.contains('panel') && el !== draggedPanel);
            
            if (!overPanel) {
                // We're over empty space - show layout-level drop indicator
                mainLayout.classList.add('drag-active');
            }
        }
    });
    
    mainLayout.addEventListener('drop', (e) => {
        e.preventDefault();
        mainLayout.classList.remove('drag-active');
        
        if (draggedPanel) {
            // Get all current panels and their positions
            const allPanels = Array.from(document.querySelectorAll('.panel')).filter(p => p !== draggedPanel);
            const dropX = e.clientX;
            
            // Find the correct insertion point based on X position
            let insertBefore = null;
            for (const panel of allPanels) {
                const rect = panel.getBoundingClientRect();
                if (dropX < rect.left + rect.width / 2) {
                    insertBefore = panel;
                    break;
                }
            }
            
            if (insertBefore) {
                mainLayout.insertBefore(draggedPanel, insertBefore);
            } else {
                // Append to the end
                mainLayout.appendChild(draggedPanel);
            }
            
            savePanelOrder();
        }
    });
}

function savePanelOrder() {
    const panels = document.querySelectorAll('.panel');
    const order = Array.from(panels).map(panel => panel.dataset.panel);
    localStorage.setItem('panelOrder', JSON.stringify(order));
    console.log('Saved panel order:', order);
}

function loadPanelOrder() {
    const savedOrder = localStorage.getItem('panelOrder');
    if (savedOrder) {
        try {
            const order = JSON.parse(savedOrder);
            const mainLayout = document.getElementById('mainLayout');
            
            // Reorder panels according to saved order
            order.forEach(panelType => {
                const panel = document.querySelector(`[data-panel="${panelType}"]`);
                if (panel) {
                    mainLayout.appendChild(panel);
                }
            });
            
            console.log('Loaded panel order:', order);
        } catch (error) {
            console.warn('Could not load panel order:', error);
        }
    }
}

// Initialize panel drag and drop when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadPanelOrder();
    initializePanelDragDrop();
});

// Sidebar toggle functionality
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
}