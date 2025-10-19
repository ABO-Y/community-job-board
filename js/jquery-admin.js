//jquery-admin.js
$(document).ready(function(){
let jobs = JSON.parse(localStorage.getItem('jobs')) || [];

//Ensure all jobs have a status
jobs = jobs.map(job => ({ ...job, status: job.status || 'pending'}));
localStorage.setItem('jobs', JSON.stringify(jobs));

function loadAdminJobs() {
    const pendingJobs = jobs.filter(job => job.status === 'pending');
    const approvedJobs = jobs.filter(job => job.status === 'approved');

    displayJobSection('#pending-jobs', pendingJobs, true);
    displayJobSection('#approved-jobs', approvedJobs, false);

}

function displayJobSection(containerId, jobList, showApprove = true ) {
    const $container = $(containerId);
    $container.empty();

    if (jobList.length === 0) {
        $container.html('<p>No jobs found.</p>');
        return;
    }

    $.each(jobList, function(index, job) {
        const globalIndex = jobs.findIndex(j => j.title === job.title && j.employer === job.employer);

        const $card = $(`
            <div class="job-card">
                <h3>${job.title}</h3>
                <div class="job-card">
                    <span>${job.category}</span>
                    <span>${job.location}</span>
                    <span>Posted by: ${job.employer || 'Anonymous'}</span>

                </div>
                <p>${job.description}</p>
                <p>Status: <strong>${job.status}</strong></p>
                <div class="job-actions">
                    ${showApprove ?
                    `<button class="btn small approve-job" data-index="${globalIndex}">Approve</button>` : ''
                    }
                    <button class="btn small secondary delete-job" data-index="${globalIndex}">Delete</button>
                </div>
            </div>
        `);

        $container.append($card);
    });
}

//Aprove job
$(document).on('click', '.approve-job', function() {
    const index = $(this).data('index');
    jobs[index].status = 'approved';
    localStorage.setItem('jobs', JSON.stringify(jobs));
    loadAdminJobs();
    mockEmailAlert(jobs[index]);
    alert(`"${jobs[index].title}" has been approved!`);
});

//Delete job
$(document).on('click', '.delete-job', function() {
    const index = $(this).data('index');
    if (confirm('Are you sure you want to delete this job?')) {
        const deletedJob = setItem('jobs', JSON.stringify(jobs));
        loadAdminJobs();
        alert(`"${deletedJob.title}" was deleted`);
    }
});

//Mock email function
function mockEmailAlert(job) {
    console.log(`
        📨 Mock Email Sent
        -------------------------
        To: employer@example.com
        Subject: Job "${job.title}" Approved!
        Message: Congratulations! Your job post has been approved and is now live.
        
        `);
}

//Initial load
loadAdminJobs();
});
