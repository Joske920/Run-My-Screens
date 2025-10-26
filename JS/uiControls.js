// UI control updates, property panel management, and sidebar functions

function updateShapeControls() {
    const shape = getShapeById(selectedShapeId);
    
    if (shape) {
        // Show properties of selected shape
        document.getElementById('shapeType').value = shape.type;
        document.getElementById('borderStyle').value = shape.s || '1';
        
        // Update property visibility and labels based on shape type
        updatePropertyVisibility(shape.type);
        
        if (shape.type === 'ellipse' || shape.type === 'rectangle') {
            // Ellipse and Rectangle: both use x, y, w, h properties
            document.getElementById('borderColor').value = shape.f1 || '#000000';
            document.getElementById('fillColor').value = shape.f2 || '#ff0000';
            document.getElementById('positionX').value = shape.x;
            document.getElementById('positionY').value = shape.y;
            document.getElementById('shapeWidth').value = shape.w || 100;
            document.getElementById('shapeHeight').value = shape.h || 100;
            
            // New ellipse/rectangle properties
            const shapeTag = document.getElementById('shapeTag');
            const shapeVisible = document.getElementById('shapeVisible');
            
            if (shapeTag) shapeTag.value = shape.tag || '';
            if (shapeVisible) {
                const visible = shape.visible !== undefined ? shape.visible : true;
                shapeVisible.setAttribute('data-value', visible.toString());
                shapeVisible.textContent = visible ? 'TRUE' : 'FALSE';
            }
        } else if (shape.type === 'line') {
            // Line: uses x1, y1, x2, y2, f, tag, visible properties
            document.getElementById('borderColor').value = shape.f || '#000000';
            document.getElementById('lineX1').value = shape.x1 || 50;
            document.getElementById('lineY1').value = shape.y1 || 50;
            document.getElementById('lineX2').value = shape.x2 || 150;
            document.getElementById('lineY2').value = shape.y2 || 150;
            
            // New line properties
            const lineTag = document.getElementById('lineTag');
            const lineVisible = document.getElementById('lineVisible');
            
            if (lineTag) lineTag.value = shape.tag || '';
            if (lineVisible) {
                const visible = shape.visible !== undefined ? shape.visible : true;
                lineVisible.setAttribute('data-value', visible.toString());
                lineVisible.textContent = visible ? 'TRUE' : 'FALSE';
            }
        } else if (shape.type === 'v_separator') {
            // V_SEPARATOR: uses x, w, color, pen properties
            const vSepX = document.getElementById('vSepX');
            const vSepWidth = document.getElementById('vSepWidth');
            const vSepColor = document.getElementById('vSepColor');
            const vSepPen = document.getElementById('vSepPen');
            
            if (vSepX) vSepX.value = shape.x || 300;
            if (vSepWidth) vSepWidth.value = shape.w || 2;
            if (vSepColor) vSepColor.value = shape.color || '#000000';
            if (vSepPen) vSepPen.value = shape.pen || '1';
            
            // New v_separator properties
            const vSepTag = document.getElementById('vSepTag');
            const vSepVisible = document.getElementById('vSepVisible');
            
            if (vSepTag) vSepTag.value = shape.tag || '';
            if (vSepVisible) {
                const visible = shape.visible !== undefined ? shape.visible : true;
                vSepVisible.setAttribute('data-value', visible.toString());
                vSepVisible.textContent = visible ? 'TRUE' : 'FALSE';
            }
        } else if (shape.type === 'h_separator') {
            // H_SEPARATOR: uses y, h, color, pen properties
            const hSepY = document.getElementById('hSepY');
            const hSepHeight = document.getElementById('hSepHeight');
            const hSepColor = document.getElementById('hSepColor');
            const hSepPen = document.getElementById('hSepPen');
            
            if (hSepY) hSepY.value = shape.y || 200;
            if (hSepHeight) hSepHeight.value = shape.h || 2;
            if (hSepColor) hSepColor.value = shape.color || '#000000';
            if (hSepPen) hSepPen.value = shape.pen || '1';
            
            // New h_separator properties
            const hSepTag = document.getElementById('hSepTag');
            const hSepVisible = document.getElementById('hSepVisible');
            
            if (hSepTag) hSepTag.value = shape.tag || '';
            if (hSepVisible) {
                const visible = shape.visible !== undefined ? shape.visible : true;
                hSepVisible.setAttribute('data-value', visible.toString());
                hSepVisible.textContent = visible ? 'TRUE' : 'FALSE';
            }
        }
    } else {
        // No shape selected - show default values for the dropdown selection
        const shapeType = document.getElementById('shapeType').value;
        updatePropertyVisibility(shapeType);
        
        // Set default values based on shape type
        if (shapeType === 'ellipse' || shapeType === 'rectangle') {
            document.getElementById('borderColor').value = '#000000';
            document.getElementById('fillColor').value = '#ff0000';
            document.getElementById('borderStyle').value = '1';
            document.getElementById('positionX').value = 50;
            document.getElementById('positionY').value = 50;
            document.getElementById('shapeWidth').value = 100;
            document.getElementById('shapeHeight').value = 100;
            
            // Default values for new ellipse/rectangle properties  
            const shapeTag = document.getElementById('shapeTag');
            const shapeVisible = document.getElementById('shapeVisible');
            
            if (shapeTag) shapeTag.value = '';
            if (shapeVisible) {
                shapeVisible.setAttribute('data-value', 'true');
                shapeVisible.textContent = 'TRUE';
            }
        } else if (shapeType === 'line') {
            document.getElementById('borderColor').value = '#000000';
            document.getElementById('borderStyle').value = '1';
            document.getElementById('lineX1').value = 50;
            document.getElementById('lineY1').value = 50;
            document.getElementById('lineX2').value = 150;
            document.getElementById('lineY2').value = 150;
            
            // Default values for new line properties
            const lineTag = document.getElementById('lineTag');
            const lineVisible = document.getElementById('lineVisible');
            
            if (lineTag) lineTag.value = '';
            if (lineVisible) {
                lineVisible.setAttribute('data-value', 'true');
                lineVisible.textContent = 'TRUE';
            }
        } else if (shapeType === 'v_separator') {
            const vSepX = document.getElementById('vSepX');
            const vSepWidth = document.getElementById('vSepWidth');
            const vSepColor = document.getElementById('vSepColor');
            const vSepPen = document.getElementById('vSepPen');
            
            if (vSepX) vSepX.value = 300;
            if (vSepWidth) vSepWidth.value = 2;
            if (vSepColor) vSepColor.value = '#000000';
            if (vSepPen) vSepPen.value = '1';
            
            // Default values for new v_separator properties
            const vSepTag = document.getElementById('vSepTag');
            const vSepVisible = document.getElementById('vSepVisible');
            
            if (vSepTag) vSepTag.value = '';
            if (vSepVisible) {
                vSepVisible.setAttribute('data-value', 'true');
                vSepVisible.textContent = 'TRUE';
            }
        } else if (shapeType === 'h_separator') {
            const hSepY = document.getElementById('hSepY');
            const hSepHeight = document.getElementById('hSepHeight');
            const hSepColor = document.getElementById('hSepColor');
            const hSepPen = document.getElementById('hSepPen');
            
            if (hSepY) hSepY.value = 200;
            if (hSepHeight) hSepHeight.value = 2;
            if (hSepColor) hSepColor.value = '#000000';
            if (hSepPen) hSepPen.value = '1';
            
            // Default values for new h_separator properties
            const hSepTag = document.getElementById('hSepTag');
            const hSepVisible = document.getElementById('hSepVisible');
            
            if (hSepTag) hSepTag.value = '';
            if (hSepVisible) {
                hSepVisible.setAttribute('data-value', 'true');
                hSepVisible.textContent = 'TRUE';
            }
        }
    }
    
    // Update add button text based on selection state
    updateAddButtonText();
}

function updateAddButtonText() {
    const addBtn = document.querySelector('button[onclick="addShape()"]');
    if (addBtn) {
        if (selectedShapeId !== null) {
            addBtn.innerHTML = '📋 Copy Selected Shape';
            addBtn.style.backgroundColor = '#17a2b8'; // Blue for copy
        } else {
            addBtn.innerHTML = '+ Add New Shape';
            addBtn.style.backgroundColor = '#28a745'; // Green for new
        }
    }
}

function updatePropertyVisibility(shapeType) {
    const ellipseRectangleControls = document.querySelectorAll('.ellipse-rectangle-only');
    const lineControls = document.querySelectorAll('.line-only');
    const vSeparatorControls = document.querySelectorAll('.v-separator-only');
    const hSeparatorControls = document.querySelectorAll('.h-separator-only');
    
    // Hide all controls first
    ellipseRectangleControls.forEach(control => {
        control.classList.add('hide');
        control.style.display = 'none';
    });
    lineControls.forEach(control => {
        control.classList.remove('show');
        control.style.display = 'none';
    });
    vSeparatorControls.forEach(control => {
        control.classList.remove('show');
        control.style.display = 'none';
    });
    hSeparatorControls.forEach(control => {
        control.classList.remove('show');
        control.style.display = 'none';
    });
    
    if (shapeType === 'ellipse' || shapeType === 'rectangle') {
        // Show ellipse/rectangle controls (w, h)
        ellipseRectangleControls.forEach(control => {
            control.classList.remove('hide');
            // Use flex for row layout, block for regular controls
            if (control.classList.contains('control-row')) {
                control.style.display = 'flex';
            } else {
                control.style.display = 'block';
            }
        });
    } else if (shapeType === 'line') {
        // Show line controls (x1, y1, x2, y2) and border color
        lineControls.forEach(control => {
            control.classList.add('show');
            if (control.classList.contains('control-row')) {
                control.style.display = 'flex';
            } else {
                control.style.display = 'block';
            }
        });
    } else if (shapeType === 'v_separator') {
        // Show v_separator controls (x, w, color, pen)
        vSeparatorControls.forEach(control => {
            control.classList.add('show');
            control.style.display = 'block';
        });
    } else if (shapeType === 'h_separator') {
        // Show h_separator controls (y, h, color, pen)
        hSeparatorControls.forEach(control => {
            control.classList.add('show');
            control.style.display = 'block';
        });
    }
}

// Helper function to format shape properties for display
function formatShapeProperties(shape) {
    switch(shape.type) {
        case 'ellipse':
            const ellipseTag = shape.tag ? `,"${shape.tag}"` : ',';
            const ellipseVisible = shape.visible !== undefined ? (shape.visible ? ',1' : ',0') : ',1';
            return `ELLIPSE(${shape.x || 0},${shape.y || 0},${shape.w || 100},${shape.h || 100},"${shape.f1 || '#000000'}","${shape.f2 || '#ff0000'}",${shape.s || '1'}${ellipseTag}${ellipseVisible})`;
            
        case 'rectangle':
            const rectTag = shape.tag ? `,"${shape.tag}"` : ',';
            const rectVisible = shape.visible !== undefined ? (shape.visible ? ',1' : ',0') : ',1';
            return `RECT(${shape.x || 0},${shape.y || 0},${shape.w || 100},${shape.h || 100},"${shape.f1 || '#000000'}","${shape.f2 || '#ff0000'}",${shape.s || '1'}${rectTag}${rectVisible})`;
            
        case 'line':
            const tag = shape.tag ? `,"${shape.tag}"` : ',';
            const visible = shape.visible !== undefined ? (shape.visible ? ',1' : ',0') : ',1';
            return `LINE(${shape.x1 || 0},${shape.y1 || 0},${shape.x2 || 0},${shape.y2 || 0},"${shape.f || '#000000'}",${shape.s || '1'}${tag}${visible})`;
            
        case 'v_separator':
            const vSepTag = shape.tag ? `,"${shape.tag}"` : ',';
            const vSepVisible = shape.visible !== undefined ? (shape.visible ? ',1' : ',0') : ',1';
            return `V_SEPARATOR(${shape.x || 0},${shape.w || 2},"${shape.color || '#000000'}",${shape.pen || '1'}${vSepTag}${vSepVisible})`;
            
        case 'h_separator':
            const hSepTag = shape.tag ? `,"${shape.tag}"` : ',';
            const hSepVisible = shape.visible !== undefined ? (shape.visible ? ',1' : ',0') : ',1';
            return `H_SEPARATOR(${shape.y || 0},${shape.h || 2},"${shape.color || '#000000'}",${shape.pen || '1'}${hSepTag}${hSepVisible})`;
            
        default:
            return `${shape.type.toUpperCase()} (unknown format)`;
    }
}

// Helper function to get representative color(s) for shape preview
function getShapePreviewColor(shape) {
    switch(shape.type) {
        case 'ellipse':
        case 'rectangle':
            // For shapes with both border and fill, show fill color as primary
            return {
                primary: shape.f2 || '#ff0000',
                secondary: shape.f1 || '#000000',
                hasBorder: true
            };
            
        case 'line':
            return {
                primary: shape.f || '#000000',
                secondary: null,
                hasBorder: false
            };
            
        case 'v_separator':
        case 'h_separator':
            return {
                primary: shape.color || '#000000',
                secondary: null,
                hasBorder: false
            };
            
        default:
            return {
                primary: '#000000',
                secondary: null,
                hasBorder: false
            };
    }
}

function updateShapesList() {
    const container = document.getElementById('shapesList');
    container.innerHTML = '';
    
    // Show shapes in their natural order (as arranged by user)
    // No sorting here - let the user see and control the order directly
    
    // Add drop zone at the very top (before first item)
    if (shapes.length > 0) {
        const topDropZone = document.createElement('div');
        topDropZone.className = 'drop-zone';
        topDropZone.dataset.insertAtStart = 'true';
        
        // Add drop zone event listeners
        topDropZone.addEventListener('dragover', handleDropZoneDragOver);
        topDropZone.addEventListener('dragleave', handleDropZoneDragLeave);
        topDropZone.addEventListener('drop', handleDropZoneDrop);
        
        container.appendChild(topDropZone);
    }
    
    shapes.forEach((shape, index) => {
        const shapeItem = document.createElement('div');
        shapeItem.className = `shape-item ${shape.id === selectedShapeId ? 'selected' : ''}`;
        shapeItem.dataset.shapeId = shape.id;
        shapeItem.dataset.shapeIndex = index;
        
        // Get formatted properties and preview colors
        const shapeProperties = formatShapeProperties(shape);
        const colorInfo = getShapePreviewColor(shape);
        
        // Create color preview HTML
        let colorPreviewHTML;
        if (colorInfo.hasBorder && colorInfo.secondary) {
            // Show both fill and border colors for ellipse/rectangle
            colorPreviewHTML = `<span class="shape-preview dual-color" style="background-color: ${colorInfo.primary}; border: 2px solid ${colorInfo.secondary};"></span>`;
        } else {
            // Show single color for lines and separators
            colorPreviewHTML = `<span class="shape-preview" style="background-color: ${colorInfo.primary};"></span>`;
        }
        
        shapeItem.innerHTML = `
            <div class="shape-info" onclick="selectShape(${shape.id})">
                ${colorPreviewHTML}
                <span class="shape-details">${shapeProperties} #${shape.id}</span>
            </div>
            <button class="delete-btn" onclick="deleteShape(${shape.id})" ${shapes.length <= 1 ? 'disabled' : ''}>×</button>
        `;
        
        // Add drag functionality
        shapeItem.draggable = true;
        shapeItem.addEventListener('dragstart', handleShapeDragStart);
        shapeItem.addEventListener('dragend', handleShapeDragEnd);
        
        // Add improved edge-based space-opening drag functionality
        shapeItem.addEventListener('dragover', handleShapeItemDragOver);
        shapeItem.addEventListener('dragleave', handleShapeItemDragLeave);
        shapeItem.addEventListener('drop', handleShapeItemDrop);
        
        container.appendChild(shapeItem);
        
        // Add margin detector above the shape item (to trigger the drop zone above it)
        const topMarginDetector = document.createElement('div');
        topMarginDetector.className = 'margin-detector top';
        topMarginDetector.dataset.targetDropZoneIndex = index; // Points to drop zone above this item (accounting for top drop zone)
        
        // Add margin detector event listeners
        topMarginDetector.addEventListener('dragover', handleMarginDetectorDragOver);
        topMarginDetector.addEventListener('dragleave', handleMarginDetectorDragLeave);
        
        // Insert before the shape item
        container.insertBefore(topMarginDetector, shapeItem);
        
        // Add margin detector below the shape item (to trigger the drop zone below it)
        const bottomMarginDetector = document.createElement('div');
        bottomMarginDetector.className = 'margin-detector bottom';
        bottomMarginDetector.dataset.targetDropZoneIndex = index + 1; // Points to drop zone after this item
        
        // Add margin detector event listeners
        bottomMarginDetector.addEventListener('dragover', handleMarginDetectorDragOver);
        bottomMarginDetector.addEventListener('dragleave', handleMarginDetectorDragLeave);
        
        container.appendChild(bottomMarginDetector);
        
        // Add drop zone after each item (for dropping below it)
        const dropZone = document.createElement('div');
        dropZone.className = 'drop-zone';
        dropZone.dataset.insertAfterShapeId = shape.id;
        
        // Add drop zone event listeners
        dropZone.addEventListener('dragover', handleDropZoneDragOver);
        dropZone.addEventListener('dragleave', handleDropZoneDragLeave);
        dropZone.addEventListener('drop', handleDropZoneDrop);
        
        container.appendChild(dropZone);
    });
}

// Show status indicator briefly
function showStatusIndicator() {
    const indicator = document.getElementById('statusIndicator');
    indicator.classList.add('show');
    
    // Hide after 2 seconds
    setTimeout(() => {
        indicator.classList.remove('show');
    }, 3000);
}

// Sidebar toggle functionality
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
}

function downloadShapeList() {
    // Generate text content with all shapes without ID numbers
    let textContent = '';
    
    shapes.forEach((shape, index) => {
        if (index > 0) {
            textContent += '\n'; // Add newline between shapes
        }
        textContent += formatShapeProperties(shape);
    });
    
    // Create and download the file
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    // Generate filename with current timestamp
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5); // Remove milliseconds and replace colons/dots
    const filename = `shapes_${timestamp}.com.txt`;
    
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    // Show status indicator
    showStatusIndicator(`Shape list downloaded as ${filename}`);
}