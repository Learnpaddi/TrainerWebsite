function sendMail() {
    var form = document.getElementById('careerForm');
    emailjs.sendForm('service_jzzspeo', 'template_4s4af01', form)
        .then(function(response) {
            window.location.href = "thank-you.html"; // Redirect on success
        }, function(error) {
            alert("Failed to send mail: " + error.text);
        });
}