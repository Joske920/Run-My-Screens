// Shape creation, manipulation, and property update functions

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