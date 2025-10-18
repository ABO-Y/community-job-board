// jquery-jobs.js
$(document).ready(function() {
    const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const approvedJobs = jobs.filter(job => job.status === 'approved');

    function displayJobs(jobList) {
        const $container = $('#job-list');
        $container.empty();

        if (jobList.length === 0) {
            $container.html('<p>No jobs found matching your criteria.</p>');
            return;
        }

        $.each(jobList, function(index, job) {
            const $card = $(`
                <div class="job-card">
                    <h3>${job.title}</h3>
                    <div class="job-meta">
                        <span>${job.category}</span>  
                        <span>${job.location}</span>
                    </div>
                    <p>${job.description}</p>
                    <div class="job-footer">
                        <span class="status open">Open</span>
                        <a href="job-details.html?id=${index}" class="btn small">View Details</a>
                    </div>
                </div>
            `);
            
            $container.append($card);
        });
    }

    // Search functionality
    $('#search-btn').on('click', function() {
        const keyword = $('#keyword').val().toLowerCase();
        const category = $('#category').val();

        const filtered = approvedJobs.filter(job => 
            job.title.toLowerCase().includes(keyword) && 
            (category === '' || job.category === category)
        );
        
        displayJobs(filtered);
    });

    // Initial display
    displayJobs(approvedJobs);
});