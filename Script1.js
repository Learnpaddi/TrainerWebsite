document.addEventListener("DOMContentLoaded", function () {
    const toggleBtn = document.querySelector(".mobile-menu-toggle");
    const mobileMenu = document.getElementById("mobile-menu");

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
            tooglebtn.setAttribute("aria-expanded", "false");
        });
    });
});

// Show/hide job details
    document.querySelectorAll('.job-link').forEach(function(link) {
        link.addEventListener('click', function () {
            document.querySelectorAll('.job-details').forEach(function (d) { d.style.display = 'none'; });
            var jobId = link.getAttribute('data-job');
            document.getElementById('job-' + jobId).style.display = 'block';
        });
        });

    // Modal logic
    var modal = document.getElementById('applyModal');
    var closeModal = document.getElementById('closeModal');
    document.querySelectorAll('.apply-btn').forEach(function(btn) {
        btn.addEventListener('click', function () {
            document.getElementById('jobTitle').textContent = btn.getAttribute('data-role');
            document.getElementById('formPosition').value = btn.getAttribute('data-role');
            modal.style.display = 'block';
        });
        });
    closeModal.onclick = function() {modal.style.display = 'none'; }
    window.onclick = function(event) { if (event.target == modal) {modal.style.display = 'none'; } }