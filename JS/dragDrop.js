// Drag and drop functionality for shapes, panels, and shape list reordering

// Drag state variables
let isDragging = false;
let isResizing = false;
let resizeHandle = null; // 'tl', 'tr', 'bl', 'br', 'start', 'end'
let dragOffsetX = 0;
let dragOffsetY = 0;
let draggedShapeId = null;

// Mouse event handlers for dragging shapes
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

// Drag and drop functionality for shape list reordering

function handleShapeDragStart(e) {
    const shapeId = parseInt(e.target.dataset.shapeId);
    const shape = shapes.find(s => s.id === shapeId);
    
    draggedShapeId = shapeId;
    
    e.target.style.opacity = '0.5';
    e.target.setAttribute('dragging', 'true');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
}

function handleShapeDragEnd(e) {
    e.target.style.opacity = '';
    e.target.removeAttribute('dragging');
    draggedShapeId = null;
    
    // Reset drag over state tracking
    lastDragOverTarget = null;
    lastDragOverState = null;
    
    // Clear any space-opening classes and drop zone indicators
    document.querySelectorAll('.shape-item').forEach(item => {
        item.classList.remove('drag-target-above', 'drag-target-below');
    });
    document.querySelectorAll('.drop-zone').forEach(zone => {
        zone.classList.remove('drag-over-valid');
    });
}

// Improved edge-based space-opening drag handlers for shape items
let lastDragOverTarget = null;
let lastDragOverState = null;

function handleShapeItemDragOver(e) {
    // Check if we're actually over a drop zone - if so, let drop zone handle it
    if (e.target.classList.contains('drop-zone')) {
        return;
    }
    
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (!draggedShapeId || draggedShapeId == e.currentTarget.dataset.shapeId) {
        return; // Don't allow dropping on self
    }
    
    // Clear any drop zone indicators since we're over a shape item
    document.querySelectorAll('.drop-zone').forEach(zone => {
        zone.classList.remove('drag-over-valid');
    });
    
    // Get precise mouse position within the item
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseY = e.clientY;
    const itemTop = rect.top;
    const itemBottom = rect.bottom;
    const itemHeight = rect.height;
    
    // Define edge zones (top 25% and bottom 25% of the item)
    const edgeZoneSize = itemHeight * 0.25;
    const topEdgeLimit = itemTop + edgeZoneSize;
    const bottomEdgeLimit = itemBottom - edgeZoneSize;
    
    let newState = null;
    if (mouseY <= topEdgeLimit) {
        newState = 'above';
    } else if (mouseY >= bottomEdgeLimit) {
        newState = 'below';
    }
    
    // Only update if target or state has changed to prevent erratic movement
    if (lastDragOverTarget !== e.currentTarget || lastDragOverState !== newState) {
        // Clear all previous space-opening classes
        document.querySelectorAll('.shape-item').forEach(item => {
            item.classList.remove('drag-target-above', 'drag-target-below');
        });
        
        // Apply new state if we're in an edge zone
        if (newState === 'above') {
            e.currentTarget.classList.add('drag-target-above');
        } else if (newState === 'below') {
            e.currentTarget.classList.add('drag-target-below');
        }
        
        lastDragOverTarget = e.currentTarget;
        lastDragOverState = newState;
    }
}

function handleShapeItemDragLeave(e) {
    // Only clear classes if we're actually leaving the item
    if (!e.currentTarget.contains(e.relatedTarget)) {
        e.currentTarget.classList.remove('drag-target-above', 'drag-target-below');
        // Reset state tracking when leaving the item
        if (lastDragOverTarget === e.currentTarget) {
            lastDragOverTarget = null;
            lastDragOverState = null;
        }
    }
}

function handleShapeItemDrop(e) {
    e.preventDefault();
    
    if (!draggedShapeId || draggedShapeId == e.currentTarget.dataset.shapeId) {
        return;
    }
    
    const targetIndex = parseInt(e.currentTarget.dataset.shapeIndex);
    const draggedIndex = shapes.findIndex(s => s.id === draggedShapeId);
    
    // Determine drop position based on edge zones
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseY = e.clientY;
    const itemTop = rect.top;
    const itemBottom = rect.bottom;
    const itemHeight = rect.height;
    
    const edgeZoneSize = itemHeight * 0.25;
    const topEdgeLimit = itemTop + edgeZoneSize;
    const bottomEdgeLimit = itemBottom - edgeZoneSize;
    
    let newIndex;
    if (mouseY <= topEdgeLimit) {
        // Drop above target
        newIndex = targetIndex;
    } else if (mouseY >= bottomEdgeLimit) {
        // Drop below target
        newIndex = targetIndex + 1;
    } else {
        // Middle zone - no drop allowed, return to original position
        return;
    }
    
    // Adjust index if dragging from before the target
    if (draggedIndex < newIndex) {
        newIndex--;
    }
    
    // Move the shape in the array
    const [draggedShape] = shapes.splice(draggedIndex, 1);
    shapes.splice(newIndex, 0, draggedShape);
    
    // Update the canvas and shapes list
    updateCanvas();
    updateShapesList();
    saveState();
}

// Drop zone event handlers (restored)
function handleDropZoneDragOver(e) {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling to shape items
    e.dataTransfer.dropEffect = 'move';
    
    // Clear any item space-opening classes when over drop zones
    document.querySelectorAll('.shape-item').forEach(item => {
        item.classList.remove('drag-target-above', 'drag-target-below');
    });
    
    // Reset state tracking to prevent interference
    lastDragOverTarget = null;
    lastDragOverState = null;
    
    // Clear previous classes
    e.currentTarget.classList.remove('drag-over-valid');
    
    // Always allow drop - no type restrictions
    e.currentTarget.classList.add('drag-over-valid');
}

function handleDropZoneDragLeave(e) {
    e.stopPropagation(); // Prevent event bubbling
    e.currentTarget.classList.remove('drag-over-valid');
}

function handleDropZoneDrop(e) {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    
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
        
        // If we're moving the item to a position after its current position,
        // we need to adjust for the fact that we'll remove it first
        if (targetIndex > draggedIndex) {
            targetIndex = targetIndex - 1;
        }
        
        // Remove dragged shape from its current position
        const [draggedShape] = shapes.splice(draggedIndex, 1);
        
        // Insert the shape at the new position
        shapes.splice(targetIndex, 0, draggedShape);
        
        // Update the canvas and shape list
        updateCanvas();
        updateShapesList();
        saveState();
    }
    
    // Reset visual feedback
    e.currentTarget.classList.remove('drag-over-valid');
}

// Margin detector event handlers - trigger drop zones when hovering over margins
function handleMarginDetectorDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedShapeId) return;
    
    // Clear any shape item space-opening classes
    document.querySelectorAll('.shape-item').forEach(item => {
        item.classList.remove('drag-target-above', 'drag-target-below');
    });
    
    // Reset state tracking to prevent interference
    lastDragOverTarget = null;
    lastDragOverState = null;
    
    // Find and activate the corresponding drop zone
    const targetDropZoneIndex = parseInt(e.currentTarget.dataset.targetDropZoneIndex);
    const allDropZones = document.querySelectorAll('.drop-zone');
    
    // Clear all drop zones first
    allDropZones.forEach(zone => {
        zone.classList.remove('drag-over-valid');
    });
    
    // Activate the target drop zone
    if (allDropZones[targetDropZoneIndex]) {
        allDropZones[targetDropZoneIndex].classList.add('drag-over-valid');
    }
}

function handleMarginDetectorDragLeave(e) {
    e.stopPropagation();
    
    // Don't clear if we're moving to a related element (like the corresponding drop zone)
    if (!e.relatedTarget || 
        (!e.relatedTarget.classList.contains('drop-zone') && 
         !e.relatedTarget.classList.contains('margin-detector'))) {
        
        // Clear all drop zones
        document.querySelectorAll('.drop-zone').forEach(zone => {
            zone.classList.remove('drag-over-valid');
        });
    }
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
            dragImage.style.transform = 'rotate(1deg)';
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