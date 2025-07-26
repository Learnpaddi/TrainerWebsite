function sendMail() {
    var form = document.getElementById('careerForm');

    // Optional: Basic client-side validation
    if (!form.checkValidity()) {
        alert("Please fill in all required fields.");
        return;
    }

    emailjs.sendForm('service_wf8q2fi', 'template_z5a5vz9', form)
        .then(function (response) {
            console.log('SUCCESS!', response.status, response.text);
            window.location.href = "thank-you1.html"; // Redirect on success
        }, function (error) {
            console.error('FAILED...', error);
            alert("Failed to send mail: " + error.text);
        })
      
}