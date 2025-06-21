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

    // Modal logic
    var modal = document.getElementById('applyModal');
    var closeModal = document.getElementById('closeModal');
    var jobTitleSpan = document.getElementById('jobTitle');
    var formPosition = document.getElementById('formPosition');

    if (modal && closeModal && jobTitleSpan && formPosition) {
        document.querySelectorAll('.apply-btn').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                var role = btn.getAttribute('data-role');
                jobTitleSpan.textContent = role;
                formPosition.value = role;
                modal.style.display = 'flex'; // Use 'flex' if your CSS uses flex for centering
            });
        });

        closeModal.onclick = function () {
            modal.style.display = 'none';
        };

        window.onclick = function (event) {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        };
    }
});