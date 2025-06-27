document.addEventListener("DOMContentLoaded", function () {
    // Mobile menu toggle
    const toggleBtn = document.querySelector(".mobile-menu-toggle");
    const mobileMenu = document.getElementById("mobile-menu");

    if (toggleBtn && mobileMenu) {
        toggleBtn.addEventListener("click", function () {
            mobileMenu.classList.toggle("show");
            // Update accessibility attribute
            const expanded = toggleBtn.getAttribute("aria-expanded") === "true";
            toggleBtn.setAttribute("aria-expanded", String(!expanded));
        });

        const menulinks = mobileMenu.querySelectorAll("a");
        menulinks.forEach(link => {
            link.addEventListener("click", () => {
                mobileMenu.classList.remove("show");
                toggleBtn.setAttribute("aria-expanded", "false");
            });
        });
    }

    // Show/hide job details
    document.querySelectorAll('.job-link').forEach(function (link) {
        link.addEventListener('click', function () {
            document.querySelectorAll('.job-details').forEach(function (d) { d.style.display = 'none'; });
            var jobId = link.getAttribute('data-job');
            var jobDetail = document.getElementById('job-' + jobId);
            if (jobDetail) jobDetail.style.display = 'block';
        });
    });

    // Modal logic for iframe form
    var modal = document.getElementById('applyModal');
    var closeModal = document.getElementById('closeModal');
    var iframe = document.getElementById('careersFormIframe');

    document.querySelectorAll('.apply-btn').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            // Optionally, you can pass the job title as a query param
            var role = btn.getAttribute('data-role');
            iframe.src = "careers1.html?role=" + encodeURIComponent(role);
            modal.style.display = 'flex';
        });
    });

    closeModal.onclick = function () {
        modal.style.display = 'none';
        iframe.src = ""; // Unload form for privacy
    };

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = 'none';
            iframe.src = "";
        }
    };
});

document.querySelectorAll('.job-link').forEach(function (link) {
    link.addEventListener('click', function () {
        // Collapse all
        document.querySelectorAll('.program-card').forEach(function (card) {
            card.classList.remove('active');
        });
        // Expand the clicked one
        this.closest('.program-card').classList.add('active');
    });
});