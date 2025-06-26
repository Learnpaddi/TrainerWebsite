//function sendMail() {
  //  var form = document.getElementById('careerForm');
    //const spinner = document.getElementById('loadingSpinner');

    // Optional: Basic client-side validation
    //if (!form.checkValidity()) {
      //  alert("Please fill in all required fields.");
        //return;
    //}

    //if (spinner) spinner.classList.remove('hidden'); // Show spinner

//    emailjs.sendForm('service_jzzspeo', 'template_4s4af01', form)
  //      .then(function (response) {
    //        console.log('SUCCESS!', response.status, response.text);
      //      window.location.href = "thank-you1.html"; // Redirect on success
        //}, function (error) {
      //      console.error('FAILED...', error);
       //     alert("Failed to send mail: " + error.text);
       // })
       // .finally(function () {
        //    if (spinner) spinner.classList.add('hidden'); // Hide spinner
       // });
//}
//

function sendMail() {
    const spinner = document.getElementById('loadingSpinner');
    spinner.classList.remove("hidden");

    const params = {
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        linkedin: document.getElementById("linkedin").value,
        course: document.getElementById("course").value,
        college: document.getElementById("college").value,
        passingYear: document.getElementById("passingYear").value,
        percentage: document.getElementById("percentage").value,
        technicalSkills: document.getElementById("technicalSkills").value,
        effectiveSkills: document.getElementById("effectiveSkills").value,
        salaryExpectations: document.getElementById("salaryExpectations").value,
        reference: document.getElementById("reference").value,
    };

    emailjs.send("service_jzzspeo", "template_4s4af01", params)
        .then(function (res) {
            alert("Application submitted successfully!");
            spinner.classList.add("hidden");
        }, function (err) {
            alert("Failed to send application. Please try again.");
            spinner.classList.add("hidden");
        });
}
