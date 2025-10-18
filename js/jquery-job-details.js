// jquery-job-details.js
$(document).ready(function() {

    //Fetch job ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = parseInt(urlParams.get('id'), 10);
    
    const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const approvedJobs = jobs.filter(job => job.status === 'approved');
    const job = approvedJobs[jobId];

    // Display job details
    if (job) {
        $('#job-details').html(`
            <div class="job-card details">
                <h2>${job.title}</h2>
                <p><strong>Category:</strong> ${job.category}</p>
                <p><strong>Location:</strong> ${job.location}</p>
                <p><strong>Posted by:</strong> ${job.employer || 'Anonymous'}</p>
                <p><strong>Description:</strong></p>
                <p>${job.description}</p>
            </div>
        `);
    } else {
        $('#job-details').html('<p>Job not found or not approved yet.</p>');
        $('#application-section').hide();
    }

    // Handle application form submission
    $('#application-form').on('submit', function(e) {
        e.preventDefault();

        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            alert('Please login to apply for this job.');
            window.location.href = 'login.html';
            return;
        }

        const applications = JSON.parse(localStorage.getItem('applications')) || [];

        const newApp = {
            jobId,
            jobTitle: job.title,
            name: $('#applicant-name').val(),
            email: $('#applicant-email').val(),
            message: $('#applicant-message').val(),
            date: new Date().toLocaleString(),
            applicantId: currentUser.email
        };

        applications.push(newApp);
        localStorage.setItem('applications', JSON.stringify(applications));

        alert('✅ Application submitted successfully!');
        $(this)[0].reset();
    });

    // Pre-fill form if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        $('#applicant-name').val(currentUser.name);
        $('#applicant-email').val(currentUser.email);
    }
});