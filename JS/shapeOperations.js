// Shape creation, manipulation, and property update functions

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

// Shape management functions
function addShape() {
    // Save state for undo before making changes
    saveStateToUndo();
    
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
    
    if (shapeType === 'def') {
        // DEF uses variableName, variableType, limits, defaultValue, toggle, and texts format - read from properties panel
        newShape.variableName = document.getElementById('defVariableName').value || 'variable';
        newShape.variableType = document.getElementById('defVariableType').value || 'I';
        newShape.limits = document.getElementById('defLimits').value || '';
        newShape.defaultValue = document.getElementById('defDefaultValue').value || '';
        newShape.toggle = document.getElementById('defToggle').value || '';
        
        // Add texts properties (all 5 fields)
        newShape.texts = {
            longText: document.getElementById('defLongText').value || '',
            shortText: document.getElementById('defShortText').value || '',
            graphicText: document.getElementById('defGraphicText').value || '',
            unitText: document.getElementById('defUnitText').value || '',
            tooltip: document.getElementById('defTooltip').value || ''
        };
        
        // Add attributes properties (all 11 attribute types)
        newShape.attributes = {
            displayMode: document.getElementById('defDisplayMode').value || '',
            displayOption: document.getElementById('defDisplayOption').value || '',
            updateRate: document.getElementById('defUpdateRate').value || '',
            toggleSymbol: document.getElementById('defToggleSymbol').value || '',
            inputMode: document.getElementById('defInputMode').value || '',
            accessLevel: document.getElementById('defAccessLevel').value || '',
            alignment: document.getElementById('defAlignment').value || '',
            fontSize: document.getElementById('defFontSize').value || '',
            limitsCheck: document.getElementById('defLimitsCheck').value || '',
            changeMethod: document.getElementById('defChangeMethod').value || '',
            emptyInput: document.getElementById('defEmptyInput').value || ''
        };
        
        // Add help display property
        newShape.helpDisplay = document.getElementById('defHelpDisplay').value || '';
        
        // Add system variable property
        newShape.systemVariable = document.getElementById('defSystemVariable').value || '';
        
        // Add position properties as objects with individual x,y,width,height values
        newShape.shortTextPos = {
            x: parseInt(document.getElementById('defShortTextX').value) || 10,
            y: parseInt(document.getElementById('defShortTextY').value) || 20,
            width: parseInt(document.getElementById('defShortTextWidth').value) || 100
        };
        
        newShape.ioFieldPos = {
            x: parseInt(document.getElementById('defIOFieldX').value) || 50,
            y: parseInt(document.getElementById('defIOFieldY').value) || 40,
            width: parseInt(document.getElementById('defIOFieldWidth').value) || 120,
            height: parseInt(document.getElementById('defIOFieldHeight').value) || 25
        };
        
   } else if (shapeType === 'ellipse' || shapeType === 'rectangle') {
        // Ellipse and Rectangle use x, y, w, h format - read from properties panel
        newShape.f1 = convertSystemColor(document.getElementById('borderColor').value) || '#000000'; // border color
        newShape.f2 = convertSystemColor(document.getElementById('fillColor').value) || '#ff0000';   // fill color
        newShape.s = document.getElementById('borderStyle').value || '1';        // border style
        newShape.x = parseInt(document.getElementById('positionX').value) || 50;   // x-coordinate (top-left)
        newShape.y = parseInt(document.getElementById('positionY').value) || 50;   // y-coordinate (top-left)
        newShape.w = parseInt(document.getElementById('shapeWidth').value) || 100; // width
        newShape.h = parseInt(document.getElementById('shapeHeight').value) || 100; // height
        
        // New ellipse/rectangle properties
        const shapeTag = document.getElementById('shapeTag');
        const shapeVisible = document.getElementById('shapeVisible');
        
        newShape.tag = shapeTag?.value || '';                                      // tag string
        newShape.visible = shapeVisible?.getAttribute('data-value') === 'true';    // visibility boolean
    } else if (shapeType === 'line') {
        // Line uses x1, y1, x2, y2, f, s format - read from properties panel
        newShape.x1 = parseInt(document.getElementById('lineX1').value) || 50;   // start x-coordinate
        newShape.y1 = parseInt(document.getElementById('lineY1').value) || 50;   // start y-coordinate
        newShape.x2 = parseInt(document.getElementById('lineX2').value) || 150;  // end x-coordinate
        newShape.y2 = parseInt(document.getElementById('lineY2').value) || 150;  // end y-coordinate
        newShape.f = convertSystemColor(document.getElementById('borderColor').value) || '#000000';   // line color
        newShape.s = document.getElementById('borderStyle').value || '1';         // border style
        
        // New line properties
        const lineTag = document.getElementById('lineTag');
        const lineVisible = document.getElementById('lineVisible');
        
        newShape.tag = lineTag?.value || '';                                      // tag string
        newShape.visible = lineVisible?.getAttribute('data-value') === 'true';    // visibility boolean
    } else if (shapeType === 'v_separator') {
        // V_SEPARATOR uses x, w, color, pen format - read from properties panel
        const vSepX = document.getElementById('vSepX');
        const vSepWidth = document.getElementById('vSepWidth');
        const vSepColor = document.getElementById('vSepColor');
        const vSepPen = document.getElementById('vSepPen');
        
        newShape.x = parseInt(vSepX?.value) || 300;          // x position (horizontal position)
        newShape.w = parseInt(vSepWidth?.value) || 2;        // line weight
        newShape.color = convertSystemColor(vSepColor?.value) || '#000000';      // color
        newShape.pen = vSepPen?.value || '1';               // pen style
        
        // New v_separator properties
        const vSepTag = document.getElementById('vSepTag');
        const vSepVisible = document.getElementById('vSepVisible');
        
        newShape.tag = vSepTag?.value || '';                                      // tag string
        newShape.visible = vSepVisible?.getAttribute('data-value') === 'true';    // visibility boolean
    } else if (shapeType === 'h_separator') {
        // H_SEPARATOR uses y, h, color, pen format - read from properties panel
        const hSepY = document.getElementById('hSepY');
        const hSepHeight = document.getElementById('hSepHeight');
        const hSepColor = document.getElementById('hSepColor');
        const hSepPen = document.getElementById('hSepPen');
        
        newShape.y = parseInt(hSepY?.value) || 200;          // y position (vertical position)
        newShape.h = parseInt(hSepHeight?.value) || 2;       // line weight (height/thickness)
        newShape.color = convertSystemColor(hSepColor?.value) || '#000000';      // color
        newShape.pen = hSepPen?.value || '1';               // pen style
        
        // New h_separator properties
        const hSepTag = document.getElementById('hSepTag');
        const hSepVisible = document.getElementById('hSepVisible');
        
        newShape.tag = hSepTag?.value || '';                                      // tag string
        newShape.visible = hSepVisible?.getAttribute('data-value') === 'true';    // visibility boolean
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
    // Save state for undo before making changes
    saveStateToUndo();
    
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

function clearCanvas() {
    const bgColor = convertSystemColor(document.getElementById('backgroundColor').value);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function screenshotCanvasPng() {
    // Save the current selected shape ID to restore later
    const originalSelectedShapeId = selectedShapeId;
    
    // Temporarily clear selection to avoid exporting selection indicators
    selectedShapeId = null;
    
    // Redraw the canvas without selection indicators
    updateCanvas();
    
    // Create the download link with the clean canvas
    const link = document.createElement('a');
    link.download = 'canvas-drawing.png';
    link.href = canvas.toDataURL();
    
    // Restore the original selection
    selectedShapeId = originalSelectedShapeId;
    
    // Redraw the canvas with selection indicators restored
    updateCanvas();
    
    // Trigger the download
    link.click();
}