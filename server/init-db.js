const db = require('./db');

async function init() {
    try {
        console.log("Initializing database tables...");

        // Create Subscribers Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS job_subscribers (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Checked/Created table: job_subscribers");

        // Create Applications Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS job_applications (
                id SERIAL PRIMARY KEY,
                job_title VARCHAR(255) NOT NULL,
                company VARCHAR(255) NOT NULL,
                applicant_name VARCHAR(255) NOT NULL,
                applicant_email VARCHAR(255) NOT NULL,
                applicant_phone VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Checked/Created table: job_applications");

        console.log("Database initialization completed successfully.");
    } catch (err) {
        console.error("Error creating tables:", err);
    } finally {
        // End the pool to exit the process
        await db.pool.end();
    }
}

init();
