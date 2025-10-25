// Event handler setup and management

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
                    saveStateToUndo(); // Save state before type conversion
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
                saveStateToUndo(); // Save state before changing style
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