// Main application initialization and entry point

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
    
    // Initialize undo/redo system
    initializeUndoSystem();
    
    // Initialize panel drag and drop system
    loadPanelOrder();
    initializePanelDragDrop();
});