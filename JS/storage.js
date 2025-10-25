// localStorage save/load functionality

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