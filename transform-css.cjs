const fs = require('fs');

const path = 'app/globals.css';
let css = fs.readFileSync(path, 'utf8');

// Find the section for the client app (starts at .app-container, ends before .app-toast)
const startIndex = css.indexOf('.app-container {');
const endIndex = css.indexOf('.app-toast {');

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find start or end markers");
    process.exit(1);
}

const beforeCss = css.substring(0, startIndex);
let clientCss = css.substring(startIndex, endIndex);
const afterCss = css.substring(endIndex);

// Define replacements
const replacements = [
    // Main background and text
    ['background: #030303;', 'background: #fbfbfd;'],
    ['color: #f5f5f7;', 'color: #1d1d1f;'],
    
    // Header
    ['background: rgba(3, 3, 3, 0.72);', 'background: rgba(255, 255, 255, 0.72);'],
    ['border-bottom: 1px solid rgba(255, 255, 255, 0.08);', 'border-bottom: 1px solid rgba(0, 0, 0, 0.08);'],
    
    // Text colors
    ['color: #fff;', 'color: #1d1d1f;'],
    ['color: #a1a1a6;', 'color: #86868b;'],
    ['color: #00f2fe;', 'color: #0071e3;'],
    
    // Gradients and buttons
    ['background: linear-gradient(135deg, rgba(0, 242, 254, 0.15) 0%, rgba(79, 172, 254, 0.15) 100%);', 'background: linear-gradient(135deg, rgba(0, 113, 227, 0.08) 0%, rgba(0, 113, 227, 0.15) 100%);'],
    ['background: linear-gradient(90deg, #00f2fe 0%, #4facfe 100%);', 'background: linear-gradient(90deg, #0071e3 0%, #0077ed 100%);'],
    ['border: 1px solid rgba(0, 242, 254, 0.2);', 'border: 1px solid rgba(0, 113, 227, 0.2);'],
    ['border-color: rgba(0, 242, 254, 0.25);', 'border-color: rgba(0, 113, 227, 0.25);'],
    ['color: #000;', 'color: #fff;'], // Button text should be white on the blue background
    
    // Cards and borders
    ['background: rgba(255, 255, 255, 0.02);', 'background: #ffffff;'],
    ['background: rgba(255, 255, 255, 0.04);', 'background: rgba(0, 0, 0, 0.04);'],
    ['background: rgba(255, 255, 255, 0.08);', 'background: rgba(0, 0, 0, 0.04);'],
    ['background: rgba(255, 255, 255, 0.15);', 'background: rgba(0, 0, 0, 0.08);'],
    ['background: rgba(255, 255, 255, 0.03);', 'background: #f5f5f7;'],
    
    ['border: 1px solid rgba(255, 255, 255, 0.08);', 'border: 1px solid rgba(0, 0, 0, 0.08);'],
    ['border: 1px solid rgba(255, 255, 255, 0.05);', 'border: 1px solid rgba(0, 0, 0, 0.06);'],
    ['border: 1px solid rgba(255, 255, 255, 0.12);', 'border: 1px solid rgba(0, 0, 0, 0.1);'],
    ['border-bottom: 1px solid rgba(255, 255, 255, 0.03);', 'border-bottom: 1px solid rgba(0, 0, 0, 0.06);'],
    ['border-top: 1px solid rgba(255, 255, 255, 0.04);', 'border-top: 1px solid rgba(0, 0, 0, 0.06);'],
    ['border-top: 1px solid rgba(255, 255, 255, 0.08);', 'border-top: 1px solid rgba(0, 0, 0, 0.08);'],
    ['border-bottom: 1px solid rgba(255, 255, 255, 0.1);', 'border-bottom: 1px solid rgba(0, 0, 0, 0.1);'],
    ['border-color: #ffffff;', 'border-color: #000000;'],
    
    // Category pill active state
    ['background: #ffffff;', 'background: #1d1d1f;'],
    ['color: #030303;', 'color: #ffffff;'],
    ['box-shadow: 0 4px 12px rgba(255, 255, 255, 0.15);', 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);'],
    
    // Shadows
    ['box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);', 'box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);'],
    ['box-shadow: 0 15px 35px rgba(0, 242, 254, 0.1);', 'box-shadow: 0 12px 32px rgba(0, 113, 227, 0.15);'],
    ['box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);', 'box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);'],
    
    // Images
    ['background: #080808;', 'background: #f5f5f7;'],
    
    // Modals
    ['background: rgba(18, 18, 20, 0.85);', 'background: rgba(255, 255, 255, 0.85);'],
    
    // Nav bar mobile
    ['background: rgba(10, 10, 10, 0.85);', 'background: rgba(255, 255, 255, 0.85);'],
    
    // Input fields
    ['background: rgba(0, 0, 0, 0.3) !important;', 'background: #f5f5f7 !important;'],
    ['border: 1px solid rgba(255, 255, 255, 0.12) !important;', 'border: 1px solid rgba(0, 0, 0, 0.1) !important;'],
    ['color: #fff !important;', 'color: #1d1d1f !important;'],
    
    // Hover overlay eye
    ['background: rgba(0, 0, 0, 0.6);', 'background: rgba(255, 255, 255, 0.7);'],
];

replacements.forEach(([search, replace]) => {
    clientCss = clientCss.split(search).join(replace);
});

// Fix specific text colors for titles (h2, h3) that might have been overwritten incorrectly
clientCss = clientCss.replace(/h2\s*{\s*font-size/g, 'h2 {\n  color: #1d1d1f;\n  font-size');
clientCss = clientCss.replace(/h3\s*{\s*font-size/g, 'h3 {\n  color: #1d1d1f;\n  font-size');

fs.writeFileSync(path, beforeCss + clientCss + afterCss, 'utf8');
console.log("CSS transformation complete!");
