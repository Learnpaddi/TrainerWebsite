document.addEventListener("DOMContentLoaded", function () {
    const toggleBtn = document.querySelector(".mobile-menu-toggle");
    const mobileMenu = document.getElementById("mobile-menu");

    toggleBtn.addEventListener("click", function () {
        mobileMenu.classList.toggle("show");

        // Update accessibility attribute
        const expanded = toggleBtn.getAttribute("aria-expanded") === "true";
        toggleBtn.setAttribute("aria-expanded", String(!expanded));
    });
});