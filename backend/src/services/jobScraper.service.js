const axios = require('axios');
const JobAlert = require('../models/JobAlert');

const scrapeJobs = async () => {
    try {
        console.log('Starting job fetcher (Arbeitnow API)...');

        // Arbeitnow is a completely free public job board API — no auth required, no scraping
        const response = await axios.get('https://arbeitnow.com/api/job-board-api', {
            headers: { 'Accept': 'application/json' }
        });

        if (!response.data || !response.data.data || !Array.isArray(response.data.data)) {
            console.log('No valid data returned from Arbeitnow API.');
            return;
        }

        const jobs = response.data.data;
        let addedCount = 0;

        for (const job of jobs) {
            const sourceUrl = job.url ? String(job.url) : null;
            if (!sourceUrl) continue;

            try {
                const [, created] = await JobAlert.findOrCreate({
                    where: { sourceUrl },
                    defaults: {
                        title: job.title || 'Unknown Title',
                        company: job.company_name || 'Unknown Company',
                        location: job.location || 'Remote',
                        type: job.remote ? 'Remote' : (job.job_types?.[0] || 'Full-time'),
                        description: job.description ? job.description.substring(0, 500) : '',
                        postedAt: job.created_at ? new Date(job.created_at * 1000) : new Date()
                    }
                });
                if (created) addedCount++;
            } catch (dbError) {
                console.error('Error saving job to DB:', dbError.message);
            }
        }

        console.log(`Job fetcher done. Added ${addedCount} new jobs out of ${jobs.length} found.`);

    } catch (error) {
        console.error('Job Fetcher Error:', error.message);
    }
};

module.exports = { scrapeJobs };

