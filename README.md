# Run-My-Screens

A web-based graphics simulator that replicates the UI functionality of Siemens 840D SL and similar machine control systems. This application provides a comprehensive canvas-based drawing environment with shape management, property editing, real-time manipulation capabilities, and advanced features like undo/redo, shape visibility controls, and graphic logic programming interface.

## 🎯 Features

### **Core Functionality**
- **Interactive Canvas**: Dynamic drawing surface with customizable dimensions and background colors
- **Shape Creation & Management**: Support for multiple geometric shapes with full property control
- **Real-time Editing**: Live property updates with immediate visual feedback
- **Persistent Storage**: Automatic saving and loading of projects using browser localStorage
- **Drag & Drop Interface**: Intuitive panel management and shape reordering
- **Undo/Redo System**: Complete action history with keyboard shortcuts (Ctrl+Z/Ctrl+Y)
- **Shape Visibility Controls**: Toggle individual shape visibility with boolean controls
- **Graphic Logic Interface**: Integrated multi-line code editor for logic programming
- **Export Capabilities**: Download shape list as .com.txt files and canvas screenshots

### **Supported Shape Types**
1. **Ellipse**: Configurable width, height, position, border/fill colors, border styles, tag, and visibility
2. **Rectangle**: Adjustable dimensions, positioning, colors, border properties, tag, and visibility
3. **Line**: Customizable start/end points, colors, line styles (solid, dashed, dotted), tag, and visibility
4. **V_Separator**: Vertical separators spanning full canvas height with adjustable position, styling, tag, and visibility
5. **H_Separator**: Horizontal separators spanning full canvas width with positioning controls, tag, and visibility

All shapes now include:
- **Tag Property**: String identifier for shape labeling and reference
- **Visibility Control**: Boolean toggle to show/hide shapes on canvas
- **Enhanced Properties**: Standardized property order matching text export format

### **Canvas Management**
- **Resizable Canvas**: Adjustable width (100-1000px) and height (100-800px)
- **Background Customization**: Color picker for canvas background
- **Export Functionality**: Download canvas as PNG image and shape list as .com.txt
- **Clear & Reset**: Complete canvas clearing and settings reset options
- **Undo/Redo Controls**: Visual buttons with keyboard shortcuts for action history
- **Graphic Logic Panel**: Integrated code editor below canvas for logic programming

### **Shape Manipulation**
- **Visual Selection**: Click shapes to select with visual handles for editing
- **Drag & Move**: Click and drag shapes to reposition them on canvas (with undo tracking)
- **Resize Controls**: Corner handles for ellipses/rectangles, endpoint controls for lines (with undo tracking)
- **Keyboard Navigation**: Arrow keys for precise shape positioning
- **Z-Order Management**: Automatic layering system (rectangles → ellipses → separators → lines)
- **Visibility Toggle**: Individual shape visibility controls without affecting selection
- **Action History**: All manipulations tracked for undo/redo functionality

### **Smart Shape Creation**
- **Context-Aware Adding**: 
  - When no shape selected: Creates new shape using current property panel values
  - When shape selected: Copies selected shape with 20px offset for visibility
- **Property Panel Integration**: All shape properties can be pre-configured before creation
- **Bounds Checking**: Automatic constraint to keep shapes within canvas boundaries

### **Advanced Properties Panel**
- **Dynamic Controls**: Property fields change based on selected shape type
- **Real-time Updates**: Immediate canvas updates when properties are modified (with undo tracking)
- **Comprehensive Styling**: 
  - Border colors and styles (solid, dashed, dotted, dashed-dotted)
  - Fill colors for closed shapes
  - Line weights and pen styles for separators
  - Precise positioning controls
- **Universal Properties**: All shapes support tag (string) and visible (boolean) properties
- **Toggle Controls**: Visual toggle buttons for boolean properties (TRUE/FALSE)
- **Property Order**: UI property display matches text export format for consistency

### **Shape List Management**
- **Visual Overview**: List view showing all shapes with color previews and formatted properties
- **Drag & Drop Reordering**: Change shape drawing order by dragging items in the list (with undo tracking)
- **Selection Integration**: Click shapes in list to select them on canvas
- **Delete Controls**: Remove individual shapes (with protection against deleting the last shape)
- **Text Format Display**: Shows shapes in exportable text format (e.g., ELLIPSE(x,y,w,h,"f1","f2",s,"tag",visible))
- **Visibility Indicators**: Visual indication of hidden shapes in the list

### **Panel System**
- **Draggable Panels**: Three main panels (Canvas with Logic, Shape List, Properties) can be reordered
- **Integrated Canvas Panel**: Canvas and Graphic Logic editor combined in single resizable panel
- **Flexible Layout**: Panels automatically adjust sizing with responsive design
- **Persistent Layout**: Panel arrangement is saved and restored between sessions
- **Expandable Logic Editor**: Multi-line textarea expands to fill available space

### **User Interface**
- **Collapsible Sidebar**: Settings panel with gear icon toggle and export controls
- **Status Indicator**: Visual confirmation of auto-save functionality and user actions
- **Responsive Design**: Adapts to different screen sizes while maintaining functionality
- **Professional Styling**: Clean, modern interface optimized for productivity
- **Modular Architecture**: Organized CSS and JavaScript modules for maintainability
- **Keyboard Shortcuts**: Undo (Ctrl+Z) and Redo (Ctrl+Y) support

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
2. Adjust properties in the Properties panel (position, size, colors, tag, visibility, etc.)
3. Click "Add New Shape" to create the shape
4. Or select an existing shape and click the button to copy it
5. All shape creation actions are tracked for undo/redo

#### **Editing Shapes**
1. Click any shape on the canvas or in the Shape List to select it
2. Modify properties in the Properties panel for real-time updates (with undo tracking)
3. Drag shapes on the canvas to reposition them (with undo tracking)
4. Use corner/endpoint handles to resize shapes (with undo tracking)
5. Use arrow keys for precise 1-pixel movements
6. Toggle visibility using the Visible button without affecting selection
7. Add or modify tags for shape identification
8. Use Ctrl+Z/Ctrl+Y for undo/redo operations

#### **Canvas Management**
1. Click the gear icon (⚙️) to open the sidebar
2. Adjust canvas dimensions and background color
3. Use "Refresh Canvas", "Clear Canvas", or "Screenshot Canvas to png" as needed
4. Click "Download Shape List (.com.txt)" to export all shapes in text format
5. Use the Graphic Logic textarea below the canvas for code/logic entry
6. "Reset All Settings" clears everything and reloads the page

#### **Shape Organization**
1. Drag shapes in the Shape List to reorder them (with undo tracking)
2. Use the delete button (×) to remove unwanted shapes (with undo tracking)
3. Shapes are automatically layered by type for optimal visibility
4. Use visibility toggles to show/hide shapes without removing them
5. All organization actions support undo/redo functionality

## 🛠 Technical Details

### **Architecture**
- **Pure Web Technologies**: HTML5 Canvas, CSS3, Vanilla JavaScript
- **No Dependencies**: Self-contained application with no external libraries
- **Modular Design**: Organized into specialized JavaScript and CSS modules
- **Local Storage**: Automatic state persistence using browser localStorage
- **Event-Driven**: Responsive interaction handling for smooth user experience
- **Undo/Redo System**: State snapshot management with action history tracking

### **Shape Data Format**
Each shape is stored as an object with type-specific properties including universal tag and visibility:
```javascript
// Ellipse/Rectangle (with tag and visibility)
{id: 1, type: "ellipse", x: 50, y: 50, w: 100, h: 100, f1: "#000000", f2: "#ff0000", s: "1", tag: "myEllipse", visible: true}

// Line (with tag and visibility)
{id: 2, type: "line", x1: 50, y1: 50, x2: 150, y2: 150, f: "#000000", s: "1", tag: "myLine", visible: true}

// V_Separator (with tag and visibility)
{id: 3, type: "v_separator", x: 300, w: 2, color: "#000000", pen: "1", tag: "vSep1", visible: true}

// H_Separator (with tag and visibility)
{id: 4, type: "h_separator", y: 200, h: 2, color: "#000000", pen: "1", tag: "hSep1", visible: true}
```

### **Export Text Format**
Shapes are exported in standardized text format:
```
ELLIPSE(50,50,100,100,"#000000","#ff0000",1,"myEllipse",1)
RECT(50,50,100,100,"#000000","#ff0000",1,"myRect",1)
LINE(50,50,150,150,"#000000",1,"myLine",1)
V_SEPARATOR(300,2,"#000000",1,"vSep1",1)
H_SEPARATOR(200,2,"#000000",1,"hSep1",1)
```

### **Browser Compatibility**
- Modern browsers with HTML5 Canvas support
- Chrome, Firefox, Safari, Edge (latest versions)
- Local storage enabled for state persistence

## 📝 File Structure

```
Run-My-Screens/
├── index.html              # Main application HTML
├── README.md              # This documentation
├── CSS/                   # Modular CSS architecture
│   ├── main.css          # CSS import coordinator
│   ├── base.css          # Base styles and layout
│   ├── sidebar.css       # Sidebar and settings panel
│   ├── panels.css        # Draggable panel system
│   ├── canvas.css        # Canvas and graphic logic styles
│   ├── controls.css      # Form controls and UI elements
│   ├── dragDrop.css      # Drag and drop interactions
│   └── visibility.css    # Show/hide and animation styles
└── JS/                    # Modular JavaScript architecture
    ├── main.js           # Application initialization
    ├── appState.js       # Global state management
    ├── constants.js      # Application constants
    ├── utils.js          # Utility functions
    ├── canvasDrawing.js  # Canvas rendering and drawing
    ├── shapeOperations.js # Shape creation and manipulation
    ├── uiControls.js     # UI updates and controls
    ├── eventHandlers.js  # Event handling and bindings
    ├── undoRedo.js       # Undo/redo system
    ├── dragDrop.js       # Drag and drop functionality
    └── storage.js        # Local storage operations
```

## 🤝 Contributing

Maybe later.

## 📄 License

This project simulates Siemens 840D SL functionality for educational and development purposes.
