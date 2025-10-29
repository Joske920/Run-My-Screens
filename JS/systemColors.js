// Siemens System Color Utilities
// Maps system color indices (1-133) to RGB hex values

// System Color Index to RGB Mapping
const SYSTEM_COLORS = {
    1: '#000000',   // Black
    2: '#FFA500',   // Orange
    3: '#006400',   // Dark green
    4: '#D3D3D3',   // Light gray
    5: '#A9A9A9',   // Dark gray
    6: '#0000FF',   // Blue
    7: '#FF0000',   // Red
    8: '#A52A2A',   // Brown
    9: '#FFFF00',   // Yellow
    10: '#FFFFFF',  // White
    126: '#000000', // Black - Font color of an input/output field that is currently in focus
    127: '#FFE4B5', // Light orange - Background color of an input/output field that is currently in focus
    128: '#FFA500', // Orange - System color focus
    129: '#D3D3D3', // Light gray - Background color
    130: '#0000FF', // Blue - Header color (active)
    131: '#000000', // Black - Header font color (active)
    132: '#40E0D0', // Turquoise - Background color of a toggle field
    133: '#ADD8E6'  // Light blue - Background color of a list box
};

/**
 * Converts a system color index or RGB hex value to a valid RGB hex string
 * @param {string|number} colorInput - Either a system color index (1-133) or RGB hex value ("#RRGGBB")
 * @returns {string} RGB hex value ("#RRGGBB") or the original input if it's already a valid hex color
 */
function convertSystemColor(colorInput) {
    // If input is null, undefined, or empty string, return default black
    if (!colorInput && colorInput !== 0) {
        return '#000000';
    }
    
    // Convert to string for processing
    const input = String(colorInput).trim();
    
    // If it's already a hex color (starts with #), return as-is
    if (input.startsWith('#') && /^#[0-9A-Fa-f]{6}$/.test(input)) {
        return input.toUpperCase();
    }
    
    // Try to parse as a system color index
    const colorIndex = parseInt(input, 10);
    
    // Check if it's a valid system color index
    if (!isNaN(colorIndex) && SYSTEM_COLORS.hasOwnProperty(colorIndex)) {
        return SYSTEM_COLORS[colorIndex];
    }
    
    // If it's a number but not in our system colors, return default black
    if (!isNaN(colorIndex)) {
        console.warn(`System color index ${colorIndex} is not defined. Using black (#000000) as fallback.`);
        return '#000000';
    }
    
    // If it's not a number and not a hex color, try to parse as hex without #
    if (/^[0-9A-Fa-f]{6}$/.test(input)) {
        return '#' + input.toUpperCase();
    }
    
    // If nothing matches, return default black
    console.warn(`Invalid color input "${colorInput}". Using black (#000000) as fallback.`);
    return '#000000';
}

/**
 * Gets a system color description by index
 * @param {number} index - System color index
 * @returns {string} Color description or "Unknown color" if not found
 */
function getSystemColorDescription(index) {
    const descriptions = {
        1: 'Black',
        2: 'Orange', 
        3: 'Dark green',
        4: 'Light gray',
        5: 'Dark gray',
        6: 'Blue',
        7: 'Red',
        8: 'Brown',
        9: 'Yellow',
        10: 'White',
        126: 'Black - Font color of input/output field in focus',
        127: 'Light orange - Background color of input/output field in focus',
        128: 'Orange - System color focus',
        129: 'Light gray - Background color',
        130: 'Blue - Header color (active)',
        131: 'Black - Header font color (active)',
        132: 'Turquoise - Background color of toggle field',
        133: 'Light blue - Background color of list box'
    };
    
    return descriptions[index] || 'Unknown color';
}

/**
 * Gets all available system colors as an array of objects
 * @returns {Array} Array of {index, hex, description} objects
 */
function getAllSystemColors() {
    return Object.keys(SYSTEM_COLORS).map(index => ({
        index: parseInt(index),
        hex: SYSTEM_COLORS[index],
        description: getSystemColorDescription(parseInt(index))
    }));
}

/**
 * Checks if a given input is a valid system color index
 * @param {string|number} input - Input to check
 * @returns {boolean} True if it's a valid system color index
 */
function isValidSystemColorIndex(input) {
    const index = parseInt(String(input).trim(), 10);
    return !isNaN(index) && SYSTEM_COLORS.hasOwnProperty(index);
}

/**
 * Populates a select element with all system colors
 * @param {string} selectId - The ID of the select element to populate
 * @param {string} selectedValue - The currently selected value
 */
function populateColorDropdown(selectId, selectedValue = '#000000') {
    const selectElement = document.getElementById(selectId);
    if (!selectElement) return;
    
    // Clear existing options
    selectElement.innerHTML = '';
    
    // Convert selectedValue to RGB for comparison
    const selectedRGB = convertSystemColor(selectedValue);
    
    // Add all system colors
    const systemColors = getAllSystemColors();
    systemColors.forEach(color => {
        const option = document.createElement('option');
        option.value = color.hex;
        option.textContent = `${color.index}: ${color.description.split(' - ')[0]}`;
        
        if (color.hex === selectedRGB) {
            option.selected = true;
        }
        
        selectElement.appendChild(option);
    });
    
    // If the selected value is not a system color (custom RGB), add it as an option
    if (!systemColors.some(color => color.hex === selectedRGB)) {
        const customOption = document.createElement('option');
        customOption.value = selectedRGB;
        customOption.textContent = `Custom: ${selectedRGB}`;
        customOption.selected = true;
        selectElement.appendChild(customOption);
    }
}

/**
 * Updates a color dropdown when a custom color is selected from color picker
 * @param {string} selectId - The ID of the select element
 * @param {string} hexColor - The hex color value
 */
function updateColorDropdownWithCustom(selectId, hexColor) {
    const selectElement = document.getElementById(selectId);
    if (!selectElement) return;
    
    // Check if this color matches a system color
    const systemColors = getAllSystemColors();
    const matchingSystemColor = systemColors.find(color => color.hex.toLowerCase() === hexColor.toLowerCase());
    
    if (matchingSystemColor) {
        // Select the matching system color
        selectElement.value = matchingSystemColor.hex;
    } else {
        // Check if custom option already exists
        let customOption = Array.from(selectElement.options).find(option => 
            option.textContent.startsWith('Custom:')
        );
        
        if (customOption) {
            // Update existing custom option
            customOption.value = hexColor;
            customOption.textContent = `Custom: ${hexColor}`;
        } else {
            // Create new custom option
            customOption = document.createElement('option');
            customOption.value = hexColor;
            customOption.textContent = `Custom: ${hexColor}`;
            selectElement.appendChild(customOption);
        }
        
        // Select the custom option
        selectElement.value = hexColor;
    }
}