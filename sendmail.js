function sendMail(resumeUrl) {
    const data = {
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

    fetch("https://script.google.com/macros/s/AKfycbx2E_MmaUwn65E22-qMgynRQdHVJ4ybFacvAfKRZYMHdZX_byDRculHin2uWlz4mYlH/exec", {method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
        .then(res => res.text())
        .then(response => {
            alert("Application submitted successfully!");
            document.getElementById('careerForm').reset();
            window.location.href = "thank-you1.html";
        })
        .catch(err => {
            console.error("Form submission error:", err);
            alert("There was an error submitting the form.");
        });

    return ContentService.createTextOutput("Success")
        .setMimeType(ContentService.MimeType.TEXT)
        .setHeader("Access-Control-Allow-Origin", "*");
}
