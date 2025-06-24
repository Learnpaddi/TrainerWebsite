// JavaScript source code

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById('contact-form');
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
        .then(function(response) {
            // Redirect or show a thank you message
            window.location.href = "thank-you.html";
        }, function(error) {
            alert("There was an error sending your message. Please try again later.");
        });
    });
});
