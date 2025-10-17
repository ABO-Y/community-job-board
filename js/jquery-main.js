<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

//main code for jQuery
$(document).ready(function(){
    console.log("Community Job Board jQuery frontend loaded.");

    //Example: Fetch jobs from backend (when is ready)
    async function fetchJobs() {
        try {
            const response = await fetch("/api/jobs"); // adjust URL when backend is ready
            if(response.ok) {
                const data = await response.json();
                console.log("Jobs loaded", data);
            }
        } catch (error) {
            console.error("Error fetching jobs:", error);
        }
    }
});