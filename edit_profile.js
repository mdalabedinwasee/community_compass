// edit_profile.js
let currentStep = 0;
const formSteps = document.querySelectorAll(".form-step");

function showStep(step) {
    formSteps.forEach((formStep, index) => {
        formStep.classList.toggle("active", index === step);
        formStep.setAttribute("aria-hidden", index !== step);
    });
    document.querySelectorAll(".step").forEach((stepEl, index) => {
        stepEl.classList.toggle("active", index === step);
    });
}

function nextStep() {
    if (currentStep < formSteps.length - 1 && validateStep(currentStep)) {
        currentStep++;
        showStep(currentStep);
    }
}

function prevStep() {
    if (currentStep > 0) {
        currentStep--;
        showStep(currentStep);
    }
}

function addEducation() {
    const educationFields = document.getElementById("educationFields");
    const newEntry = document.createElement("div");
    newEntry.classList.add("education-entry");
    newEntry.innerHTML = `
    <input type="text" name="institutionName[]" placeholder="Institution Name" required>
    <select name="educationLevel[]" required>
      <option value="">Select Education Level</option>
      <option>SSC</option>
      <option>HSC</option>
      <option>Bachelor's</option>
      <option>Master's</option>
      <option>PhD</option>
    </select>
    <input type="text" name="major[]" placeholder="Concentration or Major Group" required>
    <input type="text" name="result[]" placeholder="Result (GPA/Year)" required>
  `;
    educationFields.appendChild(newEntry);
}

function addExperience() {
    const experienceFields = document.getElementById("experienceFields");
    const newEntry = document.createElement("div");
    newEntry.classList.add("experience-entry");
    newEntry.innerHTML = `
    <input type="text" name="companyName[]" placeholder="Company Name">
    <input type="text" name="position[]" placeholder="Your Position">
    <input type="text" name="workLocation[]" placeholder="Location">
    <select name="jobType[]">
      <option value="">Select Job Type</option>
      <option>Full Time</option>
      <option>Part Time</option>
      <option>Internship</option>
      <option>Contract</option>
      <option>Remote</option>
    </select>
    <input type="number" name="startDate[]" placeholder="Start Year">
    <input type="number" name="endDate[]" placeholder="End Year">
  `;
    experienceFields.appendChild(newEntry);
}

function validateStep(step) {
    const currentFormStep = document.querySelectorAll(".form-step")[step];
    const inputs = currentFormStep.querySelectorAll("input[required], select[required], textarea[required]");
    let valid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = "red";
            valid = false;
        } else {
            input.style.borderColor = "#ccc";
        }
    });

    // Validate interests (Step 4)
    if (step === 3) {
        const interests = currentFormStep.querySelectorAll('input[name="interests"]:checked');
        if (interests.length === 0) {
            alert("Please select at least one interest.");
            valid = false;
        }
    }

    // Validate emergency contact (Step 7)
    if (step === 6) {
        const phone = currentFormStep.querySelector('input[name="emergencyContact"]');
        const phoneRegex = /^\+?\d{10,15}$/;
        if (!phoneRegex.test(phone.value.trim())) {
            phone.style.borderColor = "red";
            alert("Please enter a valid phone number (10-15 digits).");
            valid = false;
        }
    }

    return valid;
}

function collectFormData() {
    const form = document.getElementById("multiStepForm");
    const formData = new FormData(form);
    const data = {};

    // Basic Information
    data.fullName = formData.get("fullName");
    data.location = formData.get("location");
    data.communityUsername = formData.get("community_username");
    data.dob = formData.get("dob");
    data.gender = formData.get("gender");
    data.division = formData.get("division");
    data.postalCode = formData.get("postalCode");
    data.country = formData.get("country");
    data.aboutMe = formData.get("aboutMe");

    // Education
    data.education = [];
    const institutionNames = formData.getAll("institutionName[]");
    const educationLevels = formData.getAll("educationLevel[]");
    const majors = formData.getAll("major[]");
    const results = formData.getAll("result[]");
    for (let i = 0; i < institutionNames.length; i++) {
        data.education.push({
            institutionName: institutionNames[i],
            educationLevel: educationLevels[i],
            major: majors[i],
            result: results[i],
        });
    }

    // Work Experience
    data.experience = [];
    const companyNames = formData.getAll("companyName[]");
    const positions = formData.getAll("position[]");
    const workLocations = formData.getAll("workLocation[]");
    const jobTypes = formData.getAll("jobType[]");
    const startDates = formData.getAll("startDate[]");
    const endDates = formData.getAll("endDate[]");
    for (let i = 0; i < companyNames.length; i++) {
        data.experience.push({
            companyName: companyNames[i],
            position: positions[i],
            workLocation: workLocations[i],
            jobType: jobTypes[i],
            startDate: startDates[i],
            endDate: endDates[i],
        });
    }

    // Interests
    data.interests = formData.getAll("interests");

    // Skills
    data.softSkill = formData.get("softSkill");
    data.technicalSkill = formData.get("technicalSkill");

    // Dream Job
    data.dreamJob = formData.get("dreamJob");

    // Emergency Information
    data.emergencyInfo = {
        fullName: formData.get("emergencyFullName"),
        contact: formData.get("emergencyContact"),
        medicalConditions: formData.get("medicalConditions"),
        bloodType: formData.get("bloodType"),
        address: formData.get("address"),
        allergies: formData.get("allergies"),
        additionalInfo: formData.get("additionalInfo"),
    };

    return data;
}

function resetForm() {
    document.getElementById("multiStepForm").reset();
    currentStep = 0;
    showStep(currentStep);
    document.getElementById("educationFields").innerHTML = `
    <div class="education-entry">
      <input type="text" name="institutionName[]" placeholder="Institution Name" required>
      <select name="educationLevel[]" required>
        <option value="">Select Education Level</option>
        <option>SSC</option>
        <option>HSC</option>
        <option>Bachelor's</option>
        <option>Master's</option>
        <option>PhD</option>
      </select>
      <input type="text" name="major[]" placeholder="Concentration or Major Group" required>
      <input type="text" name="result[]" placeholder="Result (GPA/Year)" required>
    </div>
  `;
    document.getElementById("experienceFields").innerHTML = `
    <div class="experience-entry">
      <input type="text" name="companyName[]" placeholder="Company Name">
      <input type="text" name="position[]" placeholder="Your Position">
      <input type="text" name="workLocation[]" placeholder="Location">
      <select name="jobType[]">
        <option value="">Select Job Type</option>
        <option>Full Time</option>
        <option>Part Time</option>
        <option>Internship</option>
        <option>Contract</option>
        <option>Remote</option>
      </select>
      <input type="number" name="startDate[]" placeholder="Start Year">
      <input type="number" name="endDate[]" placeholder="End Year">
    </div>
  `;
}

function handleSubmit(event) {
    event.preventDefault();
    if (validateStep(currentStep)) {
        const data = collectFormData();
        // Save to localStorage (in a real app, save to backend)
        localStorage.setItem("profileInfo", JSON.stringify(data));
        localStorage.setItem("profileCompleted", "true");
        alert("Profile Created Successfully!");
        resetForm();
        window.location.href = "leader_dashboard.html";
    }
}

// Function to toggle hamburger menu for mobile
function setupHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
}

// Function to handle sign-out
function setupSignOut() {
    const signOutLink = document.getElementById('signout-link');
    if (signOutLink) {
        signOutLink.addEventListener('click', (event) => {
            event.preventDefault();
            localStorage.removeItem('userSession');
            alert('You have been signed out successfully.');
            window.location.href = 'signin.html';
        });
    }
}

// ***** NEW CODE: Pre-fill form with saved data *****
function preFillForm() {
    const savedData = JSON.parse(localStorage.getItem("profileInfo")) || {};

    // Step 1: Basic Information
    if (savedData.fullName) document.querySelector('input[name="fullName"]').value = savedData.fullName;
    if (savedData.location) document.querySelector('input[name="location"]').value = savedData.location;
    if (savedData.communityUsername) document.querySelector('input[name="community_username"]').value = savedData.communityUsername;
    if (savedData.dob) document.querySelector('input[name="dob"]').value = savedData.dob;
    if (savedData.gender) document.querySelector('select[name="gender"]').value = savedData.gender;
    if (savedData.division) document.querySelector('select[name="division"]').value = savedData.division;
    if (savedData.postalCode) document.querySelector('input[name="postalCode"]').value = savedData.postalCode;
    if (savedData.country) document.querySelector('input[name="country"]').value = savedData.country;
    if (savedData.aboutMe) document.querySelector('input[name="aboutMe"]').value = savedData.aboutMe;

    // Step 2: Education
    const educationFields = document.getElementById("educationFields");
    educationFields.innerHTML = ""; // Clear default entry
    if (savedData.education && savedData.education.length > 0) {
        savedData.education.forEach(edu => {
            const newEntry = document.createElement("div");
            newEntry.classList.add("education-entry");
            newEntry.innerHTML = `
        <input type="text" name="institutionName[]" placeholder="Institution Name" value="${edu.institutionName || ''}" required>
        <select name="educationLevel[]" required>
          <option value="">Select Education Level</option>
          <option value="SSC" ${edu.educationLevel === "SSC" ? "selected" : ""}>SSC</option>
          <option value="HSC" ${edu.educationLevel === "HSC" ? "selected" : ""}>HSC</option>
          <option value="Bachelor's" ${edu.educationLevel === "Bachelor's" ? "selected" : ""}>Bachelor's</option>
          <option value="Master's" ${edu.educationLevel === "Master's" ? "selected" : ""}>Master's</option>
          <option value="PhD" ${edu.educationLevel === "PhD" ? "selected" : ""}>PhD</option>
        </select>
        <input type="text" name="major[]" placeholder="Concentration or Major Group" value="${edu.major || ''}" required>
        <input type="text" name="result[]" placeholder="Result (GPA/Year)" value="${edu.result || ''}" required>
      `;
            educationFields.appendChild(newEntry);
        });
    } else {
        // Add a default empty entry
        educationFields.innerHTML = `
      <div class="education-entry">
        <input type="text" name="institutionName[]" placeholder="Institution Name" required>
        <select name="educationLevel[]" required>
          <option value="">Select Education Level</option>
          <option>SSC</option>
          <option>HSC</option>
          <option>Bachelor's</option>
          <option>Master's</option>
          <option>PhD</option>
        </select>
        <input type="text" name="major[]" placeholder="Concentration or Major Group" required>
        <input type="text" name="result[]" placeholder="Result (GPA/Year)" required>
      </div>
    `;
    }

    // Step 3: Work Experience
    const experienceFields = document.getElementById("experienceFields");
    experienceFields.innerHTML = ""; // Clear default entry
    if (savedData.experience && savedData.experience.length > 0) {
        savedData.experience.forEach(exp => {
            const newEntry = document.createElement("div");
            newEntry.classList.add("experience-entry");
            newEntry.innerHTML = `
        <input type="text" name="companyName[]" placeholder="Company Name" value="${exp.companyName || ''}">
        <input type="text" name="position[]" placeholder="Your Position" value="${exp.position || ''}">
        <input type="text" name="workLocation[]" placeholder="Location" value="${exp.workLocation || ''}">
        <select name="jobType[]">
          <option value="">Select Job Type</option>
          <option value="Full Time" ${exp.jobType === "Full Time" ? "selected" : ""}>Full Time</option>
          <option value="Part Time" ${exp.jobType === "Part Time" ? "selected" : ""}>Part Time</option>
          <option value="Internship" ${exp.jobType === "Internship" ? "selected" : ""}>Internship</option>
          <option value="Contract" ${exp.jobType === "Contract" ? "selected" : ""}>Contract</option>
          <option value="Remote" ${exp.jobType === "Remote" ? "selected" : ""}>Remote</option>
        </select>
        <input type="number" name="startDate[]" placeholder="Start Year" value="${exp.startDate || ''}">
        <input type="number" name="endDate[]" placeholder="End Year" value="${exp.endDate || ''}">
      `;
            experienceFields.appendChild(newEntry);
        });
    } else {
        // Add a default empty entry
        experienceFields.innerHTML = `
      <div class="experience-entry">
        <input type="text" name="companyName[]" placeholder="Company Name">
        <input type="text" name="position[]" placeholder="Your Position">
        <input type="text" name="workLocation[]" placeholder="Location">
        <select name="jobType[]">
          <option value="">Select Job Type</option>
          <option>Full Time</option>
          <option>Part Time</option>
          <option>Internship</option>
          <option>Contract</option>
          <option>Remote</option>
        </select>
        <input type="number" name="startDate[]" placeholder="Start Year">
        <input type="number" name="endDate[]" placeholder="End Year">
      </div>
    `;
    }

    // Step 4: Interests
    if (savedData.interests && savedData.interests.length > 0) {
        document.querySelectorAll('input[name="interests"]').forEach(checkbox => {
            checkbox.checked = savedData.interests.includes(checkbox.value);
        });
    }

    // Step 5: Skills
    if (savedData.softSkill) document.querySelector('input[name="softSkill"]').value = savedData.softSkill;
    if (savedData.technicalSkill) document.querySelector('input[name="technicalSkill"]').value = savedData.technicalSkill;

    // Step 6: Dream Job
    if (savedData.dreamJob) document.querySelector('input[name="dreamJob"]').value = savedData.dreamJob;

    // Step 7: Emergency Information
    if (savedData.emergencyInfo) {
        if (savedData.emergencyInfo.fullName) document.querySelector('input[name="emergencyFullName"]').value = savedData.emergencyInfo.fullName;
        if (savedData.emergencyInfo.contact) document.querySelector('input[name="emergencyContact"]').value = savedData.emergencyInfo.contact;
        if (savedData.emergencyInfo.medicalConditions) document.querySelector('textarea[name="medicalConditions"]').value = savedData.emergencyInfo.medicalConditions;
        if (savedData.emergencyInfo.bloodType) document.querySelector('select[name="bloodType"]').value = savedData.emergencyInfo.bloodType;
        if (savedData.emergencyInfo.address) document.querySelector('textarea[name="address"]').value = savedData.emergencyInfo.address;
        if (savedData.emergencyInfo.allergies) document.querySelector('textarea[name="allergies"]').value = savedData.emergencyInfo.allergies;
        if (savedData.emergencyInfo.additionalInfo) document.querySelector('textarea[name="additionalInfo"]').value = savedData.emergencyInfo.additionalInfo;
    }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    preFillForm(); // ***** NEW CODE: Call preFillForm to populate form with saved data *****
    showStep(currentStep);
    document.getElementById("multiStepForm").addEventListener("submit", handleSubmit);
    document.querySelectorAll(".signup-btn[data-action='next']").forEach(btn => btn.addEventListener("click", nextStep));
    document.querySelectorAll(".signup-btn[data-action='prev']").forEach(btn => btn.addEventListener("click", prevStep));
    document.querySelectorAll(".signup-btn[data-action='add-education']").forEach(btn => btn.addEventListener("click", addEducation));
    document.querySelectorAll(".signup-btn[data-action='add-experience']").forEach(btn => btn.addEventListener("click", addExperience));
    setupHamburgerMenu();
    setupSignOut();
});