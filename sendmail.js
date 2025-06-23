function sendMail() {
    var form = document.getElementById('careerForm');
    emailjs.sendForm('service_jzzspeo', 'template_4s4af01', form)
        .then(function(response) {
            alert("Mail sent successfully!");
            form.reset();
        }, function(error) {
            alert("Failed to send mail: " + error.text);
        });
}

document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById('careerForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            sendMail();
        });
    }
});
