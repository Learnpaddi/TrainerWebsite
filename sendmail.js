function sendMail() {
    var form = document.getElementById('careerForm');
    var fileInput = document.getElementById('resume');
    var file = fileInput.files[0];

    if (!file) {
        alert("Please upload a resume.");
        return;
    }

    var reader = new FileReader();

    reader.onload = function () {
        var base64File = reader.result.split(',')[1]; // remove data mime part

        fetch('1ZD_bn5hjaO7EkZ2qgUIdAg5mzmsuAUeWthDhvPVK0Qc_9l_cyUI6YiRX', {
            method: 'POST',
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                filedata: base64File,
                filename: file.name,
                mimeType: file.type
            })
        })
        .then(res => res.text())
        .then(uploadResult => {
            if (uploadResult.startsWith("Success")) {
                // Now send the email
                emailjs.sendForm('service_jzzspeo', 'template_4s4af01', form)
                    .then(() => {
                        window.location.href = "thank-you1.html";
                    }, error => {
                        alert("Email failed: " + error.text);
                    });
            } else {
                alert("File upload failed: " + uploadResult);
            }
        });
    };

    reader.readAsDataURL(file);
}
