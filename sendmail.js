function sendMail() {
    const data = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        linkedin: document.getElementById('linkedin').value,
        portfolio: document.getElementById('portfolio').value,
        coverLetter: document.getElementById('coverLetter').value,
        salaryExpectations: document.getElementById('salaryExpectations').value,
        reference: document.getElementById('reference').value
    };

    fetch("https://script.google.com/macros/s/AKfycbx2E_MmaUwn65E22-qMgynRQdHVJ4ybFacvAfKRZYMHdZX_byDRculHin2uWlz4mYlH/exec", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(res => res.text())
        .then(response => {
            alert("Application submitted successfully!");
        })
        .catch(err => {
            console.error("Error:", err);
            alert("There was an error submitting the form.");
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

        fetch('https://script.google.com/macros/s/AKfycbx2E_MmaUwn65E22-qMgynRQdHVJ4ybFacvAfKRZYMHdZX_byDRculHin2uWlz4mYlH/exec', {
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