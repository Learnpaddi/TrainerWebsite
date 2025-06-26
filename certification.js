// Ceritication
    let certificationCount = 1;

    function addCertification() {
        certificationCount++;

    const container = document.getElementById('certificationContainer');

    const div = document.createElement('div');
    div.className = "certification-block border p-4 rounded-lg shadow-sm";

    div.innerHTML = `
    <h4 class="font-semibold text-gray-600 mb-3">Certification ${certificationCount}</h4>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Certification Name</label>
            <input type="text" name="CertificationName[]" class="w-full px-4 py-2 form-input" placeholder="e.g. Google UX Design">
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Issued By</label>
            <input type="text" name="IssuedBy[]" class="w-full px-4 py-2 form-input" placeholder="e.g. Google">
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
            <input type="month" name="IssueDate[]" class="w-full px-4 py-2 form-input">
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Certificate URL (optional)</label>
            <input type="url" name="CertificateURL[]" class="w-full px-4 py-2 form-input" placeholder="https://example.com/certificate">
        </div>
    </div>
        `;

        container.appendChild(div);
    }
//experience
    let experienceCount = 1;

    function addExperience() {
        experienceCount++;

    const container = document.getElementById('experienceContainer');

    const div = document.createElement('div');
    div.className = "experience-block border p-4 rounded-lg shadow-sm";

    div.innerHTML = `
    <h4 class="font-semibold text-gray-600 mb-3">Experience ${experienceCount}</h4>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Job Title / Role</label>
            <input type="text" name="JobTitle[]" class="w-full px-4 py-2 form-input" placeholder="e.g. Backend Engineer">
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input type="text" name="CompanyName[]" class="w-full px-4 py-2 form-input" placeholder="e.g. ABC Ltd">
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">From</label>
            <input type="month" name="FromDate[]" class="w-full px-4 py-2 form-input">
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input type="month" name="ToDate[]" class="w-full px-4 py-2 form-input">
        </div>
        <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Key Responsibilities / Achievements</label>
            <textarea name="Responsibilities[]" rows="4" class="w-full px-4 py-2 form-textarea" placeholder="Describe your work..."></textarea>
        </div>
    </div>
    `;

    container.appendChild(div);
    }