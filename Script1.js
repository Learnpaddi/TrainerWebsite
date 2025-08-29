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

    if (modal && closeModal && iframe) {
        document.querySelectorAll('.apply-btn').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
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
    }

    // Testimonials logic
    const testimonials = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.testimonial-dot');
    let current = 0;
    let autoSlideInterval;
    const slideDelay = 4000; // 4 seconds

    function showTestimonial(index) {
        testimonials.forEach((t, i) => {
            t.classList.toggle('active', i === index);
        });
        dots.forEach((d, i) => {
            d.classList.toggle('active', i === index);
        });
        current = index;
    }

    function nextTestimonial() {
        let next = (current + 1) % testimonials.length;
        showTestimonial(next);
    }

    function startAutoSlide() {
        autoSlideInterval = setInterval(nextTestimonial, slideDelay);
    }

    function stopAutoSlide() {
        clearInterval(autoSlideInterval);
    }

    dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
            showTestimonial(idx);
            stopAutoSlide();
            startAutoSlide();
        });
    });

    // Show first testimonial by default
    showTestimonial(0);

    // Start auto-sliding
    startAutoSlide();
});
