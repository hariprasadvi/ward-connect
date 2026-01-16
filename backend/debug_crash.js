const fs = require('fs');
try {
    require('./server');
} catch (e) {
    let msg = e.stack || e.toString();
    fs.writeFileSync('crash.log', msg);
    console.log("Crash log written.");
}
