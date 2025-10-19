// jquery-dashboard.js
$(document).ready(function() {
    const jobForm = $("#postJobForm");
    const jobContainer = $("#job-container");

    // Load jobs from localStorage
    function loadJobs() {
        const jobs = JSON.parse(localStorage.getItem("jobs")) || [];
        displayJobs(jobs);
    }

    function displayJobs(jobs) {
        if (!jobContainer.length) return;
        jobContainer.empty();

        if (jobs.length === 0) {
            jobContainer.html("<p>No jobs posted yet.</p>");
            return;
        }

        $.each(jobs, function(index, job) {
            const card = $(`
                <div class="job-card">
                    <h3>${job.title}</h3>
                    <p>${job.category} | ${job.location}</p>
                    <p>${job.description}</p>
                    <button onclick="editJob(${index})">Edit</button>
                    <button onclick="deleteJob(${index})">Delete</button>
                </div>
            `);
            jobContainer.append(card);
        });
    }

    // Post new job
    if (jobForm.length) {
        jobForm.on("submit", function(e) {
            e.preventDefault();

            const title = $("#title").val();
            const location = $("#location").val();
            const category = $("#category").val();
            const description = $("#description").val();

            const jobs = JSON.parse(localStorage.getItem("jobs")) || [];
            jobs.push({ title, location, category, description });
            localStorage.setItem("jobs", JSON.stringify(jobs));

            alert("Job posted successfully!");
            jobForm[0].reset();
            loadJobs();
        });
    }

    // Delete job
    window.deleteJob = function(index) {
        const jobs = JSON.parse(localStorage.getItem("jobs")) || [];
        jobs.splice(index, 1);
        localStorage.setItem("jobs", JSON.stringify(jobs));
        loadJobs();
    }

    // Edit job
    window.editJob = function(index) {
        const jobs = JSON.parse(localStorage.getItem("jobs")) || [];
        const job = jobs[index];

        $("#title").val(job.title);
        $("#location").val(job.location);
        $("#category").val(job.category);
        $("#description").val(job.description);

        jobs.splice(index, 1);
        localStorage.setItem("jobs", JSON.stringify(jobs));
        loadJobs();
    }

    loadJobs();
});