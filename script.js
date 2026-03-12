/* ============================================
   COMBINED JAVASCRIPT - LearnPaddi Website
   ============================================ */

// ========================================
// RIPPLE EFFECT MANAGER
// ========================================
function createRipple(event) {
    const button = event.currentTarget;
    const circle = document.createElement('span');

    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = diameter + 'px';
    circle.style.left = event.clientX - button.offsetLeft - radius + 'px';
    circle.style.top = event.clientY - button.offsetTop - radius + 'px';
    circle.classList.add('ripple');

    const ripple = button.querySelector('.ripple');
    if (ripple) ripple.remove();

    button.appendChild(circle);

    setTimeout(() => circle.remove(), 600);
}

// Add ripple effect to buttons
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.btn-primary, .btn-contact, .read-more-btn, .apply-btn');
    buttons.forEach(button => {
        button.addEventListener('click', createRipple);
    });
});

// ========================================
// ICON ANIMATIONS ON HOVER
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    const icons = document.querySelectorAll('.material-icons');

    icons.forEach(icon => {
        icon.addEventListener('mouseenter', function() {
            this.style.animation = 'iconPulse 0.6s ease-in-out';
        });

        icon.addEventListener('mouseleave', function() {
            this.style.animation = 'none';
        });
    });
});

// ========================================
// ENHANCED SCROLL STAGGER ANIMATIONS
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    const reveals = document.querySelectorAll('.reveal.stagger-1, .reveal.stagger-2, .reveal.stagger-3, .reveal.stagger-4, .reveal.stagger-5');

    reveals.forEach((element, index) => {
        const originalTransition = window.getComputedStyle(element).transition;
        element.style.transition = originalTransition + ', opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1) ' + (index * 0.1) + 's';
    });
});

// ========================================
// INTERACTIVE ELEMENT HOVER TRACKING
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    const interactiveElements = document.querySelectorAll('a, button, input[type="button"], input[type="submit"], .clickable');

    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.cursor = 'pointer';
        });

        element.addEventListener('mouseleave', function() {
            this.style.cursor = 'auto';
        });
    });
});

// ========================================
// CARD ENTRANCE ANIMATION ON LOAD
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.program-card, .team-member-card, .testimonial-card');

    cards.forEach(card => {
        card.style.animation = 'slideInUp 0.6s ease forwards';
    });
});

document.addEventListener("DOMContentLoaded", function () {
    
    // ========================================
    // MOBILE MENU TOGGLE
    // ========================================
    const toggleBtn = document.querySelector(".mobile-menu-toggle");
    const mobileMenu = document.getElementById("mobile-menu");

    if (toggleBtn && mobileMenu) {
        toggleBtn.addEventListener("click", function () {
            mobileMenu.classList.toggle("show");
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

    // ========================================
    // HEADER SCROLL EFFECT
    // ========================================
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // ========================================
    // SCROLL REVEAL ANIMATIONS
    // ========================================
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // ========================================
    // STATS COUNTER ANIMATION
    // ========================================
    const statNumbers = document.querySelectorAll('.stat-number');
    let statsAnimated = false;

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !statsAnimated) {
                statsAnimated = true;
                animateCounters();
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-item').forEach(item => statsObserver.observe(item));

    function animateCounters() {
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'));
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    stat.textContent = Math.floor(current) + '+';
                    requestAnimationFrame(updateCounter);
                } else {
                    stat.textContent = target + '+';
                }
            };

            updateCounter();
        });
    }

    // ========================================
    // FAQ ACCORDION
    // ========================================
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                    }
                });
                item.classList.toggle('active');
            });
        }
    });

// ========================================
    // PROGRAM CARDS - READ MORE MODAL
    // ========================================
    const programModal = document.getElementById('programModal');
    const programModalTitle = document.getElementById('programModalTitle');
    const programModalDetails = document.getElementById('programModalDetails');
    const programModalClose = document.querySelector('.program-modal-close');
    
    // Close modal function
    function closeProgramModal() {
        if (programModal) {
            programModal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }
    
    // Add click event to all read more buttons
    document.querySelectorAll('.read-more-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            // Get data from button attributes
            const title = btn.getAttribute('data-title');
            const details = btn.getAttribute('data-details');
            
            // Set modal content
            if (programModalTitle && programModalDetails && programModal) {
                programModalTitle.textContent = title || '';
                programModalDetails.textContent = details || '';
                
                // Show modal
                programModal.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
        });
    });
    
    // Close modal when clicking close button
    if (programModalClose) {
        programModalClose.addEventListener('click', closeProgramModal);
    }
    
    // Close modal when clicking outside
    if (programModal) {
        programModal.addEventListener('click', function(e) {
            if (e.target === programModal) {
                closeProgramModal();
            }
        });
    }
    
    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && programModal && programModal.classList.contains('show')) {
            closeProgramModal();
        }
    });

    // ========================================
    // JOB LISTINGS - EXPAND/COLLAPSE
    // ========================================
    document.querySelectorAll('.job-link').forEach(function (link) {
        link.addEventListener('click', function () {
            document.querySelectorAll('.program-card').forEach(function (card) {
                card.classList.remove('active');
            });
            this.closest('.program-card').classList.add('active');
        });
    });

    // ========================================
    // MODAL FOR APPLICATION FORM (Inline Form)
    // ========================================
    var modal = document.getElementById('applyModal');
    var closeModal = document.getElementById('closeModal');
    var jobTitleInput = document.getElementById('jobTitle');

    if (modal && closeModal) {
        document.querySelectorAll('.apply-btn').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                var role = btn.getAttribute('data-role');
                if (jobTitleInput) {
                    jobTitleInput.value = role;
                }
                modal.classList.add('show');
                document.body.style.overflow = 'hidden';
            });
        });

        closeModal.onclick = function () {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        };

        window.onclick = function (event) {
            if (event.target == modal) {
                modal.classList.remove('show');
                document.body.style.overflow = '';
            }
        };
    }

    // ========================================
    // TESTIMONIALS SLIDER
    // ========================================
    const testimonials = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.testimonial-dot');
    let current = 0;
    let autoSlideInterval;
    const slideDelay = 4000;

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

    if (testimonials.length > 0 && dots.length > 0) {
        dots.forEach((dot, idx) => {
            dot.addEventListener('click', () => {
                showTestimonial(idx);
                stopAutoSlide();
                startAutoSlide();
            });
        });

        showTestimonial(0);
        startAutoSlide();
    }

    // ========================================
    // SCROLL TO TOP BUTTON
    // ========================================
    const scrollToTopBtn = document.getElementById('scrollToTop');
    
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        });

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ========================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    // ========================================
    // 3D TILT EFFECT FOR CARDS
    // ========================================
    const tiltCards = document.querySelectorAll('.program-card, .team-member-card');
    
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });

    // ========================================
    // PARALLAX EFFECT (SUBTLE)
    // ========================================
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.backgroundPositionY = `${scrolled * 0.5}px`;
        }
    });

    // ========================================
    // KEYBOARD ACCESSIBILITY FOR MODALS
    // ========================================
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.querySelector('.modal.show');
            if (modal) {
                modal.classList.remove('show');
                document.body.style.overflow = '';
            }
        }
    });

    // ========================================
    // FORM SUBMISSION (Contact Form)
    // ========================================
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            
            // EmailJS integration
            if (typeof emailjs !== 'undefined') {
                emailjs.send("service_wf8q2fi", "template_wetb0ki", {
                    name: contactForm.name.value,
                    phone: contactForm.phone.value,
                    email: contactForm.email.value,
                    city: contactForm.city.value,
                    college: contactForm.college.value,
                    message: contactForm.message.value
                })
                .then(() => window.location.href = "thank-you.html")
                .catch((error) => {
                    alert("There was an error sending your message. Please try again later.");
                    console.error("EmailJS error:", error);
                });
            }
        });
    }
});

// ========================================
// CAREERS FORM - RESUME UPLOAD
// ========================================
document.addEventListener('DOMContentLoaded', function () {
    const resumeDropzone = document.getElementById('resumeDropzone');
    const resumeInput = document.getElementById('resume');
    const resumePreview = document.getElementById('resumePreview');
    const resumeFileName = document.getElementById('resumeFileName');
    const changeResumeBtn = document.getElementById('changeResume');

    if (resumeDropzone && resumeInput) {
        resumeDropzone.addEventListener('click', function () {
            resumeInput.click();
        });

        resumeInput.addEventListener('change', function () {
            if (this.files.length > 0) {
                const file = this.files[0];
                const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

                if (!validTypes.includes(file.type)) {
                    alert('Please upload a valid file type (PDF, DOC, DOCX)');
                    return;
                }

                if (file.size > 5 * 1024 * 1024) {
                    alert('File size should be less than 5MB');
                    return;
                }

                if (resumeFileName) resumeFileName.textContent = file.name;
                if (resumePreview) resumePreview.classList.remove('hidden');
            }
        });

        if (changeResumeBtn) {
            changeResumeBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                resumeInput.value = '';
                if (resumePreview) resumePreview.classList.add('hidden');
            });
        }

        // Drag and drop support
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            resumeDropzone.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            resumeDropzone.addEventListener(eventName, function() {
                this.classList.add('border-blue-500', 'bg-blue-50');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            resumeDropzone.addEventListener(eventName, function() {
                this.classList.remove('border-blue-500', 'bg-blue-50');
            }, false);
        });

        resumeDropzone.addEventListener('drop', function (e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files.length) {
                resumeInput.files = files;
                const event = new Event('change');
                resumeInput.dispatchEvent(event);
            }
        });
    }
});

// ========================================
// SEND MAIL FUNCTION
// ========================================
function sendMail() {
    const form = document.getElementById('careerForm');
    if (!form) return;

    if (!form.checkValidity()) {
        alert("Please fill in all required fields.");
        return;
    }

    if (typeof emailjs !== 'undefined') {
        emailjs.sendForm('service_wf8q2fi', 'template_z5a5vz9', form)
            .then(function (response) {
                console.log('SUCCESS!', response.status, response.text);
                window.location.href = "thank-you.html";
            }, function (error) {
                console.error('FAILED...', error);
                alert("Failed to send mail: " + error.text);
            });
    }
}

// ========================================
// ADD EXPERIENCE FUNCTION
// ========================================
let experienceCount = 1;

function addExperience() {
    experienceCount++;
    const container = document.getElementById('experienceContainer');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'experience-block border p-4 rounded-lg shadow-sm';
    div.innerHTML = `
        <h4 class="font-semibold text-gray-600 mb-3">Experience ${experienceCount}</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Job Title / Role</label>
                <input type="text" name="JobTitle[]" class="w-full px-4 py-2 form-input" placeholder="e.g. Backend Engineer">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input type="text" name="CompanyName[]" class="w-full px-4 py-2 form-input" placeholder="e.g. ABC Ltd">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">From</label>
                <input type="month" name="FromDate[]" class="w-full px-4 py-2 form-input">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">To</label>
                <input type="month" name="ToDate[]" class="w-full px-4 py-2 form-input">
            </div>
            <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Key Responsibilities / Achievements</label>
                <textarea name="Responsibilities[]" rows="4" class="w-full px-4 py-2 form-input" placeholder="Describe your work..."></textarea>
            </div>
        </div>
    `;
    container.appendChild(div);
}

// ========================================
// ADD CERTIFICATION FUNCTION
// ========================================
let certificationCount = 1;

function addCertification() {
    certificationCount++;
    const container = document.getElementById('certificationContainer');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'certification-block border p-4 rounded-lg shadow-sm';
    div.innerHTML = `
        <h4 class="font-semibold text-gray-600 mb-3">Certification ${certificationCount}</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Certification Name</label>
                <input type="text" name="CertificationName[]" class="w-full px-4 py-2 form-input" placeholder="e.g. Google UX Design">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Issued By</label>
                <input type="text" name="IssuedBy[]" class="w-full px-4 py-2 form-input" placeholder="e.g. Google">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                <input type="month" name="IssueDate[]" class="w-full px-4 py-2 form-input">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Certificate URL (optional)</label>
                <input type="url" name="CertificateURL[]" class="w-full px-4 py-2 form-input" placeholder="https://example.com/certificate">
            </div>
        </div>
    `;
    container.appendChild(div);
}

// ========================================
// PARTICLES FOR THANK YOU PAGE
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.particles');
    if (!container) return;

    const particleCount = 25;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (10 + Math.random() * 10) + 's';
        particle.style.width = (5 + Math.random() * 15) + 'px';
        particle.style.height = particle.style.width;
        particle.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        container.appendChild(particle);
    }
});

