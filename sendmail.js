function sendMail() {
    var form = document.getElementById('careerForm');
    const spinner = document.getElementById('loadingSpinner');

    // Optional: Basic client-side validation
    if (!form.checkValidity()) {
        alert("Please fill in all required fields.");
        return;
    }

    if (spinner) spinner.classList.remove('hidden'); // Show spinner

    emailjs.sendForm('service_jzzspeo', 'template_4s4af01', form)
        .then(function (response) {
            console.log('SUCCESS!', response.status, response.text);
            window.location.href = "thank-you1.html"; // Redirect on success
        }, function (error) {
            console.error('FAILED...', error);
            alert("Failed to send mail: " + error.text);
        })
        .finally(function () {
            if (spinner) spinner.classList.add('hidden'); // Hide spinner
        });
}