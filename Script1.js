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

    const testimonials = document.querySelectorAll('.testimonial-card');
    const testimonialsContainer = document.querySelector('.testimonials-container');
    let currentTestimonial = 0;

    // Create dots container
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'testimonial-controls';
    testimonialsContainer.after(dotsContainer);

    // Create dots for each testimonial
    testimonials.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.className = 'testimonial-dot';
        dot.addEventListener('click', () => showTestimonial(index));
        dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.testimonial-dot');

    function showTestimonial(index) {
        testimonials.forEach(card => {
            card.classList.remove('active');
        });
        dots.forEach(dot => {
            dot.classList.remove('active');
        });

        testimonials[index].classList.add('active');
        dots[index].classList.add('active');
    }

    function nextTestimonial() {
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
        showTestimonial(currentTestimonial);
    }

    // Show first testimonial
    showTestimonial(0);

    // Auto advance testimonials every 5 seconds
    setInterval(nextTestimonial, 5000);
});
