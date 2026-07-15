const fs = require('fs');
const { execSync } = require('child_process');

const oldCss = execSync('git show HEAD^^:app/globals.css').toString('utf8');
const currentCss = fs.readFileSync('app/globals.css', 'utf8');

const authIndex = oldCss.indexOf('.auth-page {');
const endAdminIndexStr = '/* =====================================================================';
let endAdminIndex = oldCss.indexOf(endAdminIndexStr, authIndex);

if (endAdminIndex === -1) {
    endAdminIndex = oldCss.indexOf('.app-container {', authIndex);
}

if (authIndex !== -1 && endAdminIndex !== -1) {
    const adminCss = oldCss.substring(authIndex, endAdminIndex);
    
    const insertIndex = currentCss.indexOf('.app-container {');
    if (insertIndex !== -1) {
        const newCss = currentCss.substring(0, insertIndex) + adminCss + "\n\n" + currentCss.substring(insertIndex);
        fs.writeFileSync('app/globals.css', newCss, 'utf8');
        console.log("Admin CSS restored successfully! Length:", adminCss.length);
    } else {
        console.log("Could not find .app-container in current CSS");
    }
} else {
    console.log("Could not find boundaries in old CSS", {authIndex, endAdminIndex});
}
