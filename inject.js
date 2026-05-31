const fs = require('fs');
const tempApp = fs.readFileSync('temp_App.jsx', 'utf16le').split('\n');
const router = fs.readFileSync('client/src/AppRouter.jsx', 'utf8').split('\n');

const startIdx = tempApp.findIndex(l => l.includes('1. Initial Login Setup Overlay'));
let endIdx = -1;
for (let i = startIdx; i < tempApp.length; i++) {
  if (tempApp[i].includes('</header>') && tempApp[i+1].includes(');')) {
    endIdx = i + 1;
    break;
  }
}

if (startIdx === -1 || endIdx === -1) {
  console.error('Block not found in temp_App.jsx', startIdx, endIdx);
  process.exit(1);
}

// Clean up \r
const block = tempApp.slice(startIdx, endIdx + 1).map(l => l.replace('\r', '')).join('\n');

const routerReturnIdx = router.findIndex(l => l.includes('className=\"app-container\"'));
if (routerReturnIdx === -1) {
  console.error('Return not found in AppRouter.jsx');
  process.exit(1);
}

router.splice(routerReturnIdx - 1, 0, block);

fs.writeFileSync('client/src/AppRouter.jsx', router.join('\n'));
console.log('Successfully injected block into AppRouter.jsx');
