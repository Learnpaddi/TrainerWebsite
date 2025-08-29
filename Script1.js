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
    if (!testimonials.length) {
        console.log('No testimonials found');
        return;
    }

    // Create dots
    const controls = document.createElement('div');
    controls.className = 'testimonial-controls';
    testimonials[0].parentNode.appendChild(controls);

    testimonials.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.className = 'testimonial-dot';
        dot.addEventListener('click', () => showTestimonial(i));
        controls.appendChild(dot);
    });

    const dots = controls.querySelectorAll('.testimonial-dot');
    let current = 0;
    let timer = null;

    function showTestimonial(idx) {
        // Hide all testimonials first
        testimonials.forEach((el, i) => {
            el.classList.remove('active');
            dots[i].classList.remove('active');
        });

        // Show the selected testimonial
        testimonials[idx].classList.add('active');
        dots[idx].classList.add('active');
        current = idx;
    }

    function nextTestimonial() {
        let next = (current + 1) % testimonials.length;
        showTestimonial(next);
    }

    function startAutoRotation() {
        if (timer) clearInterval(timer);
        timer = setInterval(nextTestimonial, 5000); // Change slide every 5 seconds
    }

    function stopAutoRotation() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    }

    // Add hover pause functionality
    const testimonialContainer = testimonials[0].parentNode;
    testimonialContainer.addEventListener('mouseenter', stopAutoRotation);
    testimonialContainer.addEventListener('mouseleave', startAutoRotation);

    // Initialize the first testimonial and start rotation
    showTestimonial(0);
    startAutoRotation();
});
