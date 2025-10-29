// Canvas buttons functionality and styling

/**
 * Updates the canvas buttons' dimensions and background color
 * to match the canvas size and background
 */
function updateCanvasButtons() {
    const canvas = document.getElementById('myCanvas');
    const backgroundColorSelect = document.getElementById('backgroundColor');
    
    if (!canvas || !backgroundColorSelect) {
        console.warn('Canvas or background color element not found');
        return;
    }
    
    // Get canvas dimensions
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Calculate button dimensions (1/8 of canvas size)
    const buttonWidth = Math.floor(canvasWidth / 8);
    const buttonHeight = Math.floor(canvasHeight / 8);
    
    // Get the background color (convert system color to RGB if needed)
    const backgroundColor = convertSystemColor(backgroundColorSelect.value);
    
    // Update vertical buttons (right side)
    const verticalButtons = document.querySelectorAll('.vscanvasbutton');
    verticalButtons.forEach(button => {
        button.style.width = buttonWidth + 'px';
        button.style.height = buttonHeight + 'px';
        button.style.backgroundColor = backgroundColor;
    });
    
    // Update horizontal buttons (bottom)
    const horizontalButtons = document.querySelectorAll('.hscanvasbutton');
    horizontalButtons.forEach(button => {
        button.style.width = buttonWidth + 'px';
        button.style.height = buttonHeight + 'px';
        button.style.backgroundColor = backgroundColor;
    });
}

/**
 * Initialize canvas buttons on page load
 */
function initializeCanvasButtons() {
    // Update buttons immediately
    updateCanvasButtons();
    
    // Update buttons when canvas size changes
    const canvasWidthInput = document.getElementById('canvasWidth');
    const canvasHeightInput = document.getElementById('canvasHeight');
    const backgroundColorSelect = document.getElementById('backgroundColor');
    const backgroundColorPicker = document.getElementById('backgroundColorPicker');
    
    if (canvasWidthInput) {
        canvasWidthInput.addEventListener('input', updateCanvasButtons);
    }
    
    if (canvasHeightInput) {
        canvasHeightInput.addEventListener('input', updateCanvasButtons);
    }
    
    if (backgroundColorSelect) {
        backgroundColorSelect.addEventListener('change', updateCanvasButtons);
    }
    
    if (backgroundColorPicker) {
        backgroundColorPicker.addEventListener('input', updateCanvasButtons);
    }
}

// Placeholder functions for button click handlers
// These can be customized based on your specific requirements
function VS1() { console.log('Vertical button 1 clicked'); }
function VS2() { console.log('Vertical button 2 clicked'); }
function VS3() { console.log('Vertical button 3 clicked'); }
function VS4() { console.log('Vertical button 4 clicked'); }
function VS5() { console.log('Vertical button 5 clicked'); }
function VS6() { console.log('Vertical button 6 clicked'); }
function VS7() { console.log('Vertical button 7 clicked'); }
function VS8() { console.log('Vertical button 8 clicked'); }

function HS1() { console.log('Horizontal button 1 clicked'); }
function HS2() { console.log('Horizontal button 2 clicked'); }
function HS3() { console.log('Horizontal button 3 clicked'); }
function HS4() { console.log('Horizontal button 4 clicked'); }
function HS5() { console.log('Horizontal button 5 clicked'); }
function HS6() { console.log('Horizontal button 6 clicked'); }
function HS7() { console.log('Horizontal button 7 clicked'); }
function HS8() { console.log('Horizontal button 8 clicked'); }