// Storage key for localStorage
const STORAGE_KEY = 'canvasSimulatorState';

// Z-order configuration for shape layering
// Lower numbers are drawn first (behind), higher numbers are drawn last (on top)
const SHAPE_Z_ORDER = {
    'def': 0,            // Variables (not visual, lowest priority)
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
