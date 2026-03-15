const { sequelize } = require('./src/config/database'); sequelize.query('TRUNCATE TABLE \\\" "Applications\\\ CASCADE;').then(() = console.log('Fixed'); process.exit(0); });  
