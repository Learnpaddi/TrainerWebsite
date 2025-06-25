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

function uploadResumeToDrive(file, onSuccess, onFailure) {
    if (!file) {
        alert("Please upload a resume.");
        return;
    }

    const reader = new FileReader();

    reader.onload = function () {
        const base64File = reader.result.split(',')[1]; // remove data:mime;base64, part

        fetch('https://script.google.com/macros/s/AKfycbxSKKm4QDCyyeXkDgKEPR2RVLEZQavEjvMbvQiKheKUrYAGMKNtQCt0E4_svrvyktexhA/exec', {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                filedata: base64File,
                filename: file.name,
                mimeType: file.type
            })
        })
        .then(res => res.text())
        .then(response => {
            if (response.startsWith("Success")) {
                onSuccess(); // proceed to email
            } else {
                onFailure(response);
            }
        })
        .catch(err => {
            onFailure("Upload error: " + err.message);
        });
    };

    reader.readAsDataURL(file);
}
