//jquery-applications.js
$(document).ready(function(){
    const applications = JSON.parse(localStorage.getItem('applications')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    //Grouping applications based on job title
    const grouped = {};
    $.each(applications, function(index, app){
        if (!grouped[app.jobTitle]) grouped[app.jobTitle] = [];
        grouped[app.jobTitle].push(app);
    });

    //Render applications
    function renderApplications(filterJob = '', searchTerm = '') {
        const $container = $('#applications-list');
        $container.empty();

        if (applications.length === 0) {
            $container.html('<p>NO applications received yet.</p>');
            return;
        }

        let output = ''

        $.each(grouped, function(jobTitle, apps) {
            //Filters by job title
            if (filterJob && jobTitle !== filterJob) return;

            //Filters by search term
            const filteredApps = apps.filter(app =>
                app.name.toLowerCase().includes(searchTerm) ||
                app.email.toLowerCase().includes(searchTerm)
            );

            if (filteredApps.length === 0) return;

            output += `
            <div class="application-group">
            <h3>${jobTitle}</h3>
            `;

            $.each(filteredApps, function(index, app) {
                output += `
                <div class="application-card">
                <p><strong>Name:</strong> ${app.name}</p>
                <p><strong>Email:</strong> ${app.email}</p> 
                <p><strong>Date:</strong> ${app.date}</p>
                <p><strong>Message:</strong> ${app.message}</p>
                <button class="btn small delete-application" data-job="${jobTitle}" data-index="${index}">
                Delete
                </button>
                </div>
                `;
            });

            output += `</div>`;
        });

        $container.html(output || '<p>No matching applications found.</p>');
    }

    //Filter events
    $('#jobFilter').on('change', function() {
        renderApplications($(this).val(), $('#searchTerm').val().toLowerCase());

    });

    //Delete application
    $(document).on('click', '.delete-application', function() {
        const jobTitle = $(this).data('job');
        const index = $(this).data('index');

        if (confirm('Are you sure you want to delete this application>')) {
            const appIndex = applications.findIndex(app =>
                app.jobTitle === jobTitle &&
                app.email === grouped[jobTitle][index].email
            );

            if (appIndex > -1) {
                applications.splice(appIndex, 1);
                localStorage.setItem('applications', JSON.stringify(applications));

                location.reload(); //Refreshes to update view
            }
        }
    });

    //Initial render
    renderApplications()

});