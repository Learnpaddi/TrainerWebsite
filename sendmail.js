function sendMail() {
    let parms = {
        name: document.getElementById("firstName").value + " " + document.getElementById("lastName").value,
        email: document.getElementById("email").value,
        subject: "New Careers Application",
        message: document.getElementById("coverLetter").value,
    };

    emailjs.send("service_jzzspeo", "template_4s4af01", parms)
        .then(response => {
            alert("Mail sent successfully!");
            document.getElementById("careerForm").reset();
        })
        .catch(error => {
            alert("Failed to send mail: " + error);
        });
}
