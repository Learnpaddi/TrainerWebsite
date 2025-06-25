function sendMail() {
    var form = document.getElementById('careerForm');

    // Optional: Basic client-side validation
    if (!form.checkValidity()) {
        alert("Please fill in all required fields.");
        return;
    }

    emailjs.sendForm('service_jzzspeo', 'template_4s4af01', form)
        .then(function (response) {
            console.log('SUCCESS!', response.status, response.text);
            window.location.href = "thank-you1.html"; // Redirect on success
        }, function (error) {
            console.error('FAILED...', error);
            alert("Failed to send mail: " + error.text);
        });
}
// JavaScript source code
