// Undo/Redo functionality for shape operations

// Undo/Redo state management
let undoStack = [];
let redoStack = [];
const maxUndoSteps = 50; // Limit undo history to prevent memory issues

// Save current state to undo stack
function saveStateToUndo() {
    // Create a deep copy of the current state
    const currentState = {
        shapes: JSON.parse(JSON.stringify(shapes)),
        selectedShapeId: selectedShapeId,
        nextShapeId: nextShapeId
    };
    
    // Add to undo stack
    undoStack.push(currentState);
    
    // Limit stack size
    if (undoStack.length > maxUndoSteps) {
        undoStack.shift(); // Remove oldest entry
    }
    
    // Clear redo stack when new action is performed
    redoStack = [];
    
    // Update button states
    updateUndoRedoButtons();
}

// Undo the last action
function undo() {
    if (undoStack.length === 0) return;
    
    // Save current state to redo stack before undoing
    const currentState = {
        shapes: JSON.parse(JSON.stringify(shapes)),
        selectedShapeId: selectedShapeId,
        nextShapeId: nextShapeId
    };
    redoStack.push(currentState);
    
    // Restore previous state
    const previousState = undoStack.pop();
    shapes = previousState.shapes;
    selectedShapeId = previousState.selectedShapeId;
    nextShapeId = previousState.nextShapeId;
    
    // Update UI
    updateCanvas();
    updateShapesList();
    updateShapeControls();
    saveState(); // Save to localStorage
    updateUndoRedoButtons();
}

// Redo the last undone action
function redo() {
    if (redoStack.length === 0) return;
    
    // Save current state to undo stack before redoing
    const currentState = {
        shapes: JSON.parse(JSON.stringify(shapes)),
        selectedShapeId: selectedShapeId,
        nextShapeId: nextShapeId
    };
    undoStack.push(currentState);
    
    // Restore next state
    const nextState = redoStack.pop();
    shapes = nextState.shapes;
    selectedShapeId = nextState.selectedShapeId;
    nextShapeId = nextState.nextShapeId;
    
    // Update UI
    updateCanvas();
    updateShapesList();
    updateShapeControls();
    saveState(); // Save to localStorage
    updateUndoRedoButtons();
}

// Update undo/redo button states
function updateUndoRedoButtons() {
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    
    if (undoBtn) {
        undoBtn.disabled = undoStack.length === 0;
        undoBtn.title = undoStack.length === 0 ? 'Nothing to undo' : `Undo (${undoStack.length} actions available)`;
    }
    
    if (redoBtn) {
        redoBtn.disabled = redoStack.length === 0;
        redoBtn.title = redoStack.length === 0 ? 'Nothing to redo' : `Redo (${redoStack.length} actions available)`;
    }
}

// Initialize undo system - call this when the app starts
function initializeUndoSystem() {
    // Save initial state
    saveStateToUndo();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Check if we're focused on an input field - if so, don't intercept shortcuts
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
            return;
        }
        
        // Ctrl+Z for undo
        if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            undo();
        }
        
        // Ctrl+Y or Ctrl+Shift+Z for redo
        if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'Z')) {
            e.preventDefault();
            redo();
        }
    });
    
    updateUndoRedoButtons();
}