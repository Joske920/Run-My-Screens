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
    
    // Initialize color dropdowns with system colors
    populateColorDropdown('backgroundColor', '#ffffff');
    populateColorDropdown('borderColor', '#000000');
    populateColorDropdown('fillColor', '#ff0000');
    populateColorDropdown('vSepColor', '#000000');
    populateColorDropdown('hSepColor', '#000000');
    
    // Initialize property controls based on current state
    updateShapeControls(); // This will handle both selected shapes and default values
    
    // Add event listeners for real-time updates
    setupEventListeners();
    
    // Setup color picker synchronization
    setupColorPickerSynchronization();
    
    // Initialize canvas buttons
    initializeCanvasButtons();
    
    // Initialize undo/redo system
    initializeUndoSystem();
    
    // Initialize panel drag and drop system
    loadPanelOrder();
    initializePanelDragDrop();
});