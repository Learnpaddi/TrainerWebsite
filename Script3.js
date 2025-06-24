< !--Make sure this script is included BEFORE script3.js-- >
    <script src="https://cdn.emailjs.com/dist/email.min.js"></script>

document.addEventListener("DOMContentLoaded", function () {
    emailjs.init("qctLaXnoFtBONFYNO"); // Your public key

    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        emailjs.send("service_jzzspeo", "template_d9cf8hs", {
            name: form.name.value,
            phone: form.phone.value,
            email: form.email.value,
            city: form.city.value,
            college: form.college.value,
            message: form.message.value
        })
        .then(function (response) {
            window.location.href = "thank-you.html";
        }, function (error) {
            alert("There was an error sending your message. Please try again later.");
            console.error("EmailJS error:", error); // Helpful for debugging
        });
    });
});
