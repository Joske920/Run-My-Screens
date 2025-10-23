# Run-My-Screens

A web-based graphics simulator that replicates the UI functionality of Siemens 840D SL and similar machine control systems. This application provides a comprehensive canvas-based drawing environment with shape management, property editing, and real-time manipulation capabilities.

## 🎯 Features

### **Core Functionality**
- **Interactive Canvas**: Dynamic drawing surface with customizable dimensions and background colors
- **Shape Creation & Management**: Support for multiple geometric shapes with full property control
- **Real-time Editing**: Live property updates with immediate visual feedback
- **Persistent Storage**: Automatic saving and loading of projects using browser localStorage
- **Drag & Drop Interface**: Intuitive panel management and shape reordering

### **Supported Shape Types**
1. **Ellipse**: Configurable width, height, position, border/fill colors, and border styles
2. **Rectangle**: Adjustable dimensions, positioning, colors, and border properties
3. **Line**: Customizable start/end points, colors, and line styles (solid, dashed, dotted)
4. **V_Separator**: Vertical separators spanning full canvas height with adjustable position and styling
5. **H_Separator**: Horizontal separators spanning full canvas width with positioning controls

### **Canvas Management**
- **Resizable Canvas**: Adjustable width (100-1000px) and height (100-800px)
- **Background Customization**: Color picker for canvas background
- **Export Functionality**: Download canvas as PNG image
- **Clear & Reset**: Complete canvas clearing and settings reset options

### **Shape Manipulation**
- **Visual Selection**: Click shapes to select with visual handles for editing
- **Drag & Move**: Click and drag shapes to reposition them on canvas
- **Resize Controls**: Corner handles for ellipses/rectangles, endpoint controls for lines
- **Keyboard Navigation**: Arrow keys for precise shape positioning
- **Z-Order Management**: Automatic layering system (rectangles → ellipses → separators → lines)

### **Smart Shape Creation**
- **Context-Aware Adding**: 
  - When no shape selected: Creates new shape using current property panel values
  - When shape selected: Copies selected shape with 20px offset for visibility
- **Property Panel Integration**: All shape properties can be pre-configured before creation
- **Bounds Checking**: Automatic constraint to keep shapes within canvas boundaries

### **Advanced Properties Panel**
- **Dynamic Controls**: Property fields change based on selected shape type
- **Real-time Updates**: Immediate canvas updates when properties are modified
- **Comprehensive Styling**: 
  - Border colors and styles (solid, dashed, dotted, dashed-dotted)
  - Fill colors for closed shapes
  - Line weights and pen styles for separators
  - Precise positioning controls

### **Shape List Management**
- **Visual Overview**: List view showing all shapes with color previews and formatted properties
- **Drag & Drop Reordering**: Change shape drawing order by dragging items in the list
- **Selection Integration**: Click shapes in list to select them on canvas
- **Delete Controls**: Remove individual shapes (with protection against deleting the last shape)

### **Panel System**
- **Draggable Panels**: Three main panels (Canvas, Shape List, Properties) can be reordered
- **Flexible Layout**: Panels automatically adjust sizing (Canvas: 50%, Shape List: 40%, Properties: 20%)
- **Persistent Layout**: Panel arrangement is saved and restored between sessions

### **User Interface**
- **Collapsible Sidebar**: Settings panel with gear icon toggle
- **Status Indicator**: Visual confirmation of auto-save functionality
- **Responsive Design**: Adapts to different screen sizes while maintaining functionality
- **Professional Styling**: Clean, modern interface optimized for productivity

## 🚀 Getting Started

### **Local Development**
1. Clone the repository:
   ```bash
   git clone https://github.com/Joske920/Run-My-Screens.git
   cd Run-My-Screens
   ```

2. Start a local web server:
   ```bash
   # Using Python 3
   python3 -m http.server 8080
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8080
   ```

3. Open your browser to `http://localhost:8080`

### **Usage Guide**

#### **Creating Shapes**
1. Use the Shape Type dropdown to select desired shape
2. Adjust properties in the Properties panel (position, size, colors, etc.)
3. Click "Add New Shape" to create the shape
4. Or select an existing shape and click the button to copy it

#### **Editing Shapes**
1. Click any shape on the canvas or in the Shape List to select it
2. Modify properties in the Properties panel for real-time updates
3. Drag shapes on the canvas to reposition them
4. Use corner/endpoint handles to resize shapes
5. Use arrow keys for precise 1-pixel movements

#### **Canvas Management**
1. Click the gear icon (⚙️) to open the sidebar
2. Adjust canvas dimensions and background color
3. Use "Refresh Canvas", "Clear Canvas", or "Download Canvas" as needed
4. "Reset All Settings" clears everything and reloads the page

#### **Shape Organization**
1. Drag shapes in the Shape List to reorder them
2. Use the delete button (×) to remove unwanted shapes
3. Shapes are automatically layered by type for optimal visibility

## 🛠 Technical Details

### **Architecture**
- **Pure Web Technologies**: HTML5 Canvas, CSS3, Vanilla JavaScript
- **No Dependencies**: Self-contained application with no external libraries
- **Local Storage**: Automatic state persistence using browser localStorage
- **Event-Driven**: Responsive interaction handling for smooth user experience

### **Shape Data Format**
Each shape is stored as an object with type-specific properties:
```javascript
// Ellipse/Rectangle
{id: 1, type: "ellipse", x: 50, y: 50, w: 100, h: 100, f1: "#000000", f2: "#ff0000", s: "1"}

// Line
{id: 2, type: "line", x1: 50, y1: 50, x2: 150, y2: 150, f: "#000000", s: "1"}

// V_Separator
{id: 3, type: "v_separator", x: 300, w: 2, color: "#000000", pen: "1"}

// H_Separator
{id: 4, type: "h_separator", y: 200, h: 2, color: "#000000", pen: "1"}
```

### **Browser Compatibility**
- Modern browsers with HTML5 Canvas support
- Chrome, Firefox, Safari, Edge (latest versions)
- Local storage enabled for state persistence

## 📝 File Structure

```
Run-My-Screens/
├── index.html          # Main application HTML
├── script.js           # Core application logic
├── styles.css          # Complete styling and layout
└── README.md          # This documentation
```

## 🤝 Contributing

Maybe later.

## 📄 License

This project simulates Siemens 840D SL functionality for educational and development purposes.
