    function sendMail(resumeUrl) {
    const data = {
        action: "submitForm",
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        linkedin: document.getElementById('linkedin').value.trim(),
        portfolio: document.getElementById('portfolio').value.trim(),
        coverLetter: document.getElementById('coverLetter').value.trim(),
        salaryExpectations: document.getElementById('salaryExpectations').value.trim(),
        reference: document.getElementById('reference').value.trim(),
        resumeUrl: resumeUrl || ""
    };

    fetch(SCRIPT_URL, {
        method: "POST",
        headers: {"Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(res => res.text())
    .then(response => {
        alert("Application submitted successfully!");
    document.getElementById('careerForm').reset();
    })
    .catch(err => {
        console.error("Form submission error:", err);
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
        const base64File = reader.result.split(',')[1];

    const data = {
        action: "uploadResume",
        filedata: base64File,
        filename: file.name,
        mimeType: file.type
        };

    fetch(SCRIPT_URL, {
        method: 'POST',
        headers: {"Content-Type": "application/json" },
        body: JSON.stringify(data)
        })
        .then(res => res.text())
        .then(response => {
            if (response.startsWith("Success")) {
                const urlMatch = response.match(/https?:\/\/[^\s]+/);
    const resumeUrl = urlMatch ? urlMatch[0] : "";
    onSuccess(resumeUrl);
            } else {
        onFailure("Upload failed: " + response);
            }
        })
        .catch(err => {
        console.error("Upload error:", err);
    onFailure("Upload error: " + err.message);
        });
    };

    reader.readAsDataURL(file);
}

    document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById('careerForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const resumeInput = document.getElementById('resume');
            const file = resumeInput.files[0];
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.disabled = true;

            if (!file) {
                alert("Please upload your resume.");
                if (submitBtn) submitBtn.disabled = false;
                return;
            }

            uploadResumeToDrive(file,
                function (resumeUrl) {
                    sendMail(resumeUrl);
                    if (submitBtn) submitBtn.disabled = false;
                },
                function (errorMsg) {
                    alert("Resume upload failed: " + errorMsg);
                    if (submitBtn) submitBtn.disabled = false;
                }
            );
        });
    }
});

    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx2E_MmaUwn65E22-qMgynRQdHVJ4ybFacvAfKRZYMHdZX_byDRculHin2uWlz4mYlH/exec";

