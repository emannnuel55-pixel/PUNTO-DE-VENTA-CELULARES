const fs = require('fs');

const path = 'app/globals.css';
let css = fs.readFileSync(path, 'utf8');

const startIndex = css.indexOf('/* ===== ESTILOS PREMIUM TIPO APPLE (STOREFRONT) ===== */');
const endIndex = css.indexOf('.app-container {');

if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
    // Remove the old CSS block
    const newCss = css.substring(0, startIndex) + css.substring(endIndex);
    fs.writeFileSync(path, newCss, 'utf8');
    console.log("Old CSS removed successfully!");
} else {
    console.log("Could not find start or end markers.");
}
