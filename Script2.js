document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('careerForm');
    const resumeDropzone = document.getElementById('resumeDropzone');
    const resumeInput = document.getElementById('resume');
    const resumePreview = document.getElementById('resumePreview');
    const resumeFileName = document.getElementById('resumeFileName');
    const changeResumeBtn = document.getElementById('changeResume');
    // Removed unused variables: loadingIndicator, successMessage, submitAnotherBtn


    // Resume upload handling
    resumeDropzone.addEventListener('click', function () {
        resumeInput.click();
    });

    resumeInput.addEventListener('change', function () {
        if (this.files.length > 0) {
            const file = this.files[0];
            const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

            if (!validTypes.includes(file.type)) {
                showError(document.getElementById('resumeError'), 'Please upload a valid file type (PDF, DOC, DOCX)');
                return;
            }

            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                showError(document.getElementById('resumeError'), 'File size should be less than 5MB');
                return;
            }

            resumeFileName.textContent = file.name;
            resumePreview.classList.remove('hidden');
            hideError(document.getElementById('resumeError'));
        }
    });

    changeResumeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        resumeInput.value = '';
        resumePreview.classList.add('hidden');
    });
    // 
    // Drag and drop support
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        resumeDropzone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        resumeDropzone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        resumeDropzone.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        resumeDropzone.classList.add('border-blue-500', 'bg-blue-50');
    }

    function unhighlight() {
        resumeDropzone.classList.remove('border-blue-500', 'bg-blue-50');
    }

    resumeDropzone.addEventListener('drop', function (e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length) {
            resumeInput.files = files;
            const event = new Event('change');
            resumeInput.dispatchEvent(event);
        }
    });

    // Form submission handler
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        // Add your form submission logic here
    });
});// JavaScript source code
