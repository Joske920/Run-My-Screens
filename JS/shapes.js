function getShapeZOrder(shapeType) {
    return SHAPE_Z_ORDER[shapeType] || 0; // Default to 0 if type not found
}

// Sort shapes array by z-order for proper rendering
function sortShapesByZOrder() {
    shapes.sort((a, b) => {
        const aZOrder = a.zOrder !== undefined ? a.zOrder : getShapeZOrder(a.type);
        const bZOrder = b.zOrder !== undefined ? b.zOrder : getShapeZOrder(b.type);
        
        // Primary sort by z-order
        if (aZOrder !== bZOrder) {
            return aZOrder - bZOrder;
        }
        
        // Secondary sort by creation order (id) for shapes with same z-order
        return a.id - b.id;
    });
}

// Get shapes sorted by z-order in reverse (for hit testing - top to bottom)
function getShapesByZOrderReverse() {
    const sortedShapes = [...shapes];
    return sortedShapes.sort((a, b) => {
        const aZOrder = a.zOrder !== undefined ? a.zOrder : getShapeZOrder(a.type);
        const bZOrder = b.zOrder !== undefined ? b.zOrder : getShapeZOrder(b.type);
        
        // Primary sort by z-order (reverse for hit testing)
        if (aZOrder !== bZOrder) {
            return bZOrder - aZOrder;
        }
        
        // Secondary sort by creation order (reverse)
        return b.id - a.id;
    });
}
