// UI control updates, property panel management, and sidebar functions

function updateShapeControls() {
    const shape = getShapeById(selectedShapeId);
    
    if (shape) {
        // Show properties of selected shape
        document.getElementById('shapeType').value = shape.type;
        document.getElementById('borderStyle').value = shape.s || '1';
        
        // Update property visibility and labels based on shape type
        updatePropertyVisibility(shape.type);
        
        if (shape.type === 'def') {
            // DEF: uses variableName, variableType, limits, defaultValue, toggle, and texts properties
            const defVariableName = document.getElementById('defVariableName');
            const defVariableType = document.getElementById('defVariableType');
            const defLimits = document.getElementById('defLimits');
            const defDefaultValue = document.getElementById('defDefaultValue');
            const defToggle = document.getElementById('defToggle');
            const defShortText = document.getElementById('defShortText');
            const defUnitText = document.getElementById('defUnitText');
            const defTooltip = document.getElementById('defTooltip');
            
            if (defVariableName) defVariableName.value = shape.variableName || '';
            if (defVariableType) {
                defVariableType.value = shape.variableType || 'I';
                // Update limits visibility based on variable type
                updateDefLimitsVisibility(shape.variableType || 'I');
            }
            if (defLimits) defLimits.value = shape.limits || '';
            if (defDefaultValue) defDefaultValue.value = shape.defaultValue || '';
            if (defToggle) defToggle.value = shape.toggle || '';
            
            // Populate individual text fields
            const defLongText = document.getElementById('defLongText');
            const defGraphicText = document.getElementById('defGraphicText');
            
            if (shape.texts) {
                if (defLongText) defLongText.value = shape.texts.longText || '';
                if (defShortText) defShortText.value = shape.texts.shortText || '';
                if (defGraphicText) defGraphicText.value = shape.texts.graphicText || '';
                if (defUnitText) defUnitText.value = shape.texts.unitText || '';
                if (defTooltip) defTooltip.value = shape.texts.tooltip || '';
            } else {
                if (defLongText) defLongText.value = '';
                if (defShortText) defShortText.value = '';
                if (defGraphicText) defGraphicText.value = '';
                if (defUnitText) defUnitText.value = '';
                if (defTooltip) defTooltip.value = '';
            }
            
            // Populate attribute fields
            const defDisplayMode = document.getElementById('defDisplayMode');
            const defDisplayOption = document.getElementById('defDisplayOption');
            const defUpdateRate = document.getElementById('defUpdateRate');
            const defToggleSymbol = document.getElementById('defToggleSymbol');
            const defInputMode = document.getElementById('defInputMode');
            const defAccessLevel = document.getElementById('defAccessLevel');
            const defAlignment = document.getElementById('defAlignment');
            const defFontSize = document.getElementById('defFontSize');
            const defLimitsCheck = document.getElementById('defLimitsCheck');
            const defChangeMethod = document.getElementById('defChangeMethod');
            const defEmptyInput = document.getElementById('defEmptyInput');
            
            if (shape.attributes) {
                if (defDisplayMode) defDisplayMode.value = shape.attributes.displayMode || '';
                if (defDisplayOption) defDisplayOption.value = shape.attributes.displayOption || '';
                if (defUpdateRate) defUpdateRate.value = shape.attributes.updateRate || '';
                if (defToggleSymbol) defToggleSymbol.value = shape.attributes.toggleSymbol || '';
                if (defInputMode) defInputMode.value = shape.attributes.inputMode || '';
                if (defAccessLevel) defAccessLevel.value = shape.attributes.accessLevel || '';
                if (defAlignment) defAlignment.value = shape.attributes.alignment || '';
                if (defFontSize) defFontSize.value = shape.attributes.fontSize || '';
                if (defLimitsCheck) defLimitsCheck.value = shape.attributes.limitsCheck || '';
                if (defChangeMethod) defChangeMethod.value = shape.attributes.changeMethod || '';
                if (defEmptyInput) defEmptyInput.value = shape.attributes.emptyInput || '';
            } else {
                if (defDisplayMode) defDisplayMode.value = '';
                if (defDisplayOption) defDisplayOption.value = '';
                if (defUpdateRate) defUpdateRate.value = '';
                if (defToggleSymbol) defToggleSymbol.value = '';
                if (defInputMode) defInputMode.value = '';
                if (defAccessLevel) defAccessLevel.value = '';
                if (defAlignment) defAlignment.value = '';
                if (defFontSize) defFontSize.value = '';
                if (defLimitsCheck) defLimitsCheck.value = '';
                if (defChangeMethod) defChangeMethod.value = '';
                if (defEmptyInput) defEmptyInput.value = '';
            }
            
            // Populate help display field
            const defHelpDisplay = document.getElementById('defHelpDisplay');
            if (defHelpDisplay) defHelpDisplay.value = shape.helpDisplay || '';
            
            // Populate system variable
            const defSystemVariable = document.getElementById('defSystemVariable');
            if (defSystemVariable) defSystemVariable.value = shape.systemVariable || '';
            
            // Populate short text position fields
            const defShortTextX = document.getElementById('defShortTextX');
            const defShortTextY = document.getElementById('defShortTextY');
            const defShortTextWidth = document.getElementById('defShortTextWidth');
            
            if (shape.shortTextPos) {
                if (defShortTextX) defShortTextX.value = shape.shortTextPos.x || 10;
                if (defShortTextY) defShortTextY.value = shape.shortTextPos.y || 20;
                if (defShortTextWidth) defShortTextWidth.value = shape.shortTextPos.width || 100;
            } else {
                if (defShortTextX) defShortTextX.value = 10;
                if (defShortTextY) defShortTextY.value = 20;
                if (defShortTextWidth) defShortTextWidth.value = 100;
            }
            
            // Populate IO field position fields
            const defIOFieldX = document.getElementById('defIOFieldX');
            const defIOFieldY = document.getElementById('defIOFieldY');
            const defIOFieldWidth = document.getElementById('defIOFieldWidth');
            const defIOFieldHeight = document.getElementById('defIOFieldHeight');
            
            if (shape.ioFieldPos) {
                if (defIOFieldX) defIOFieldX.value = shape.ioFieldPos.x || 50;
                if (defIOFieldY) defIOFieldY.value = shape.ioFieldPos.y || 40;
                if (defIOFieldWidth) defIOFieldWidth.value = shape.ioFieldPos.width || 120;
                if (defIOFieldHeight) defIOFieldHeight.value = shape.ioFieldPos.height || 25;
            } else {
                if (defIOFieldX) defIOFieldX.value = 50;
                if (defIOFieldY) defIOFieldY.value = 40;
                if (defIOFieldWidth) defIOFieldWidth.value = 120;
                if (defIOFieldHeight) defIOFieldHeight.value = 25;
            }
            
        // Format texts part
        let textsDisplay = '';
        if (shape.texts) {
            const textParts = [];
            if (shape.texts.longText) textParts.push(shape.texts.longText);
            if (shape.texts.shortText) textParts.push(shape.texts.shortText);
            if (shape.texts.graphicText) textParts.push(shape.texts.graphicText);
            if (shape.texts.unitText) textParts.push(shape.texts.unitText);
            if (shape.texts.tooltip) textParts.push(shape.texts.tooltip);
            
            if (textParts.length > 0) {
                textsDisplay = textParts.join(',');
            }
        }            // Validate default value against toggle options after loading
            validateDefaultValue();
        } else if (shape.type === 'ellipse' || shape.type === 'rectangle') {
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
    const defControls = document.querySelectorAll('.def-only');
    const ellipseRectangleControls = document.querySelectorAll('.ellipse-rectangle-only');
    const lineControls = document.querySelectorAll('.line-only');
    const vSeparatorControls = document.querySelectorAll('.v-separator-only');
    const hSeparatorControls = document.querySelectorAll('.h-separator-only');
    
    // Hide all controls first
    defControls.forEach(control => {
        control.classList.remove('show');
        control.style.display = 'none';
    });
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
    
    if (shapeType === 'def') {
        // Show DEF controls (variable name, variable type)
        defControls.forEach(control => {
            control.classList.add('show');
            control.style.display = 'block';
        });
        // Update limits visibility based on default or selected variable type
        const defVariableType = document.getElementById('defVariableType');
        if (defVariableType) {
            updateDefLimitsVisibility(defVariableType.value || 'I');
        }
    } else if (shapeType === 'ellipse' || shapeType === 'rectangle') {
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
        case 'def':
            const limitsText = shape.limits ? `/${shape.limits}` : '';
            const defaultText = shape.defaultValue ? `/${shape.defaultValue}` : '';
            const toggleText = shape.toggle ? `/${shape.toggle}` : '';
            
            // Format texts: longText,shortText,graphicText,unitText,tooltip (all 5 fields with quotes only when content exists)
            const texts = shape.texts || {};
            const textsArray = [
                texts.longText ? `"${texts.longText}"` : '',
                texts.shortText ? `"${texts.shortText}"` : '',
                texts.graphicText ? `"${texts.graphicText}"` : '',
                texts.unitText ? `"${texts.unitText}"` : '', 
                texts.tooltip ? `"${texts.tooltip}"` : ''
            ];
            const textsText = `/${textsArray.join(',')}`;
            
            // Format attributes: all 11 attribute types
            const attributes = shape.attributes || {};
            const attributesArray = [];
            if (attributes.displayMode) attributesArray.push(attributes.displayMode);
            if (attributes.displayOption) attributesArray.push(attributes.displayOption);
            if (attributes.updateRate) attributesArray.push(attributes.updateRate);
            if (attributes.toggleSymbol) attributesArray.push(attributes.toggleSymbol);
            if (attributes.inputMode) attributesArray.push(attributes.inputMode);
            if (attributes.accessLevel) attributesArray.push(attributes.accessLevel);
            if (attributes.alignment) attributesArray.push(attributes.alignment);
            if (attributes.fontSize) attributesArray.push(attributes.fontSize);
            if (attributes.limitsCheck) attributesArray.push(attributes.limitsCheck);
            if (attributes.changeMethod) attributesArray.push(attributes.changeMethod);
            if (attributes.emptyInput) attributesArray.push(attributes.emptyInput);
            const attributesText = attributesArray.length > 0 ? `/${attributesArray.join(',')}` : '';
            
            // Format help display file (with quotes if exists)
            const helpDisplayText = shape.helpDisplay ? `/"${shape.helpDisplay}"` : '/';
            
            // Format system variable (with quotes if exists)
            const systemVariableText = shape.systemVariable ? `/"${shape.systemVariable}"` : '/';
            
            // Format position properties from individual fields
            let shortTextPosText = '';
            if (shape.shortTextPos) {
                const x = shape.shortTextPos.x || 0;
                const y = shape.shortTextPos.y || 0;
                const w = shape.shortTextPos.width || 0;
                shortTextPosText = `/${x},${y},${w}`;
            }
            
            let ioFieldPosText = '';
            if (shape.ioFieldPos) {
                const x = shape.ioFieldPos.x || 0;
                const y = shape.ioFieldPos.y || 0;
                const w = shape.ioFieldPos.width || 0;
                const h = shape.ioFieldPos.height || 0;
                ioFieldPosText = `/${x},${y},${w},${h}`;
            }
            
            return `DEF ${shape.variableName || 'variable'} (${shape.variableType || 'I'}${limitsText}${defaultText}${toggleText}${textsText}${attributesText}${helpDisplayText}${systemVariableText}${shortTextPosText}${ioFieldPosText}/)`;
            
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
        case 'def':
            // DEF shapes get a neutral gray color for preview
            return {
                primary: '#6c757d',
                secondary: null,
                hasBorder: false
            };
            
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

// Function to show/hide limits field based on variable type
function updateDefLimitsVisibility(variableType) {
    const limitsGroup = document.getElementById('defLimitsGroup');
    if (!limitsGroup) return;
    
    // Limits are only available for types I (INTEGER), C (CHARACTER), and R (REAL)
    const supportsLimits = variableType === 'I' || 
                          variableType === 'C' || 
                          variableType === 'R' ||
                          variableType.startsWith('I') || // All INTEGER variants
                          variableType.startsWith('R['); // All REAL variants
    
    if (supportsLimits) {
        limitsGroup.style.display = 'block';
    } else {
        limitsGroup.style.display = 'none';
        // Clear limits value if type doesn't support it
        const defLimits = document.getElementById('defLimits');
        if (defLimits && selectedShapeId !== null) {
            const shape = getShapeById(selectedShapeId);
            if (shape && shape.type === 'def') {
                defLimits.value = '';
                shape.limits = '';
            }
        }
    }
}

// Function to parse toggle field and extract valid values
function parseToggleOptions(toggleText) {
    if (!toggleText || !toggleText.trim().startsWith('*')) {
        return [];
    }
    
    // Remove the leading * and trim
    const content = toggleText.substring(1).trim();
    
    if (!content) {
        // Just * means variable toggle field - no specific options
        return [];
    }
    
    const options = [];
    
    // Split by comma but handle quoted strings properly
    const parts = content.split(',');
    let currentPart = '';
    let inQuotes = false;
    
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i].trim();
        
        if (!inQuotes && part.includes('"')) {
            // Check if it's a complete quoted string
            if (part.match(/^"[^"]*"$/)) {
                // Complete quoted string
                options.push(part);
            } else if (part.startsWith('"')) {
                // Start of quoted string
                currentPart = part;
                inQuotes = true;
            }
        } else if (inQuotes) {
            // Continue building quoted string
            currentPart += ',' + part;
            if (part.endsWith('"')) {
                options.push(currentPart);
                currentPart = '';
                inQuotes = false;
            }
        } else {
            // Regular value or key=value pair
            if (part.includes('=')) {
                // Extended format like 1="On" - extract the key (before =)
                const key = part.split('=')[0].trim();
                options.push(key);
            } else {
                // Simple value
                options.push(part);
            }
        }
    }
    
    return options;
}

// Function to parse limits and extract min/max values
function parseLimits(limitsText) {
    if (!limitsText || !limitsText.trim()) {
        return null;
    }
    
    const parts = limitsText.split(',');
    if (parts.length !== 2) {
        return null;
    }
    
    let min = parts[0].trim();
    let max = parts[1].trim();
    
    // Handle quoted character limits like "A","F"
    if (min.startsWith('"') && min.endsWith('"') && max.startsWith('"') && max.endsWith('"')) {
        min = min.slice(1, -1); // Remove quotes
        max = max.slice(1, -1); // Remove quotes
        return { min, max, type: 'character' };
    }
    
    // Handle numeric limits
    const minNum = parseFloat(min);
    const maxNum = parseFloat(max);
    
    if (!isNaN(minNum) && !isNaN(maxNum)) {
        return { min: minNum, max: maxNum, type: 'numeric' };
    }
    
    return null;
}

// Function to validate default value against toggle options and limits
function validateDefaultValue() {
    const defDefaultValue = document.getElementById('defDefaultValue');
    const defToggle = document.getElementById('defToggle');
    const defLimits = document.getElementById('defLimits');
    
    if (!defDefaultValue) return;
    
    const defaultValue = defDefaultValue.value.trim();
    
    // Clear any existing error state
    defDefaultValue.classList.remove('input-error');
    
    // If no default value, no validation needed
    if (!defaultValue) {
        return;
    }
    
    let isValid = true;
    
    // Validate against toggle options if toggle is set
    if (defToggle) {
        const toggleText = defToggle.value.trim();
        if (toggleText) {
            const toggleOptions = parseToggleOptions(toggleText);
            
            // If there are specific toggle options, validate against them
            if (toggleOptions.length > 0) {
                let matchesToggle = false;
                
                for (const option of toggleOptions) {
                    // Remove quotes for comparison if present
                    const cleanOption = option.replace(/^"(.*)"$/, '$1');
                    const cleanDefault = defaultValue.replace(/^"(.*)"$/, '$1');
                    
                    if (cleanOption === cleanDefault || option === defaultValue) {
                        matchesToggle = true;
                        break;
                    }
                }
                
                if (!matchesToggle) {
                    isValid = false;
                }
            }
        }
    }
    
    // Validate against limits if limits are set
    if (defLimits && isValid) { // Only check limits if toggle validation passed
        const limitsText = defLimits.value.trim();
        if (limitsText) {
            const limits = parseLimits(limitsText);
            
            if (limits) {
                if (limits.type === 'character') {
                    // Character range validation
                    const cleanDefault = defaultValue.replace(/^"(.*)"$/, '$1');
                    if (cleanDefault.length === 1) {
                        const defaultChar = cleanDefault.charCodeAt(0);
                        const minChar = limits.min.charCodeAt(0);
                        const maxChar = limits.max.charCodeAt(0);
                        
                        if (defaultChar < minChar || defaultChar > maxChar) {
                            isValid = false;
                        }
                    } else {
                        isValid = false; // Not a single character
                    }
                } else if (limits.type === 'numeric') {
                    // Numeric range validation
                    const cleanDefault = defaultValue.replace(/^"(.*)"$/, '$1');
                    const defaultNum = parseFloat(cleanDefault);
                    
                    if (!isNaN(defaultNum)) {
                        if (defaultNum < limits.min || defaultNum > limits.max) {
                            isValid = false;
                        }
                    } else {
                        isValid = false; // Not a valid number
                    }
                }
            }
        }
    }
    
    // Apply error state if invalid
    if (!isValid) {
        defDefaultValue.classList.add('input-error');
    }
}