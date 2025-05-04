// profile.js (Snippet)

document.getElementById("emergencyInfoForm").addEventListener("submit", (event) => {
    event.preventDefault();
  
    const emergencyInfo = {
      fullName: document.getElementById("full-name").value.trim(),
      emergencyContact: document.getElementById("emergency-contact").value.trim(),
      medicalConditions: document.getElementById("medical-conditions").value.trim(),
      bloodType: document.getElementById("blood-type").value,
      address: document.getElementById("address").value.trim(),
      allergies: document.getElementById("allergies").value.trim(),
      additionalInfo: document.getElementById("additional-info").value.trim(),
    };
  
    // Save to localStorage (in a real app, save to backend)
    localStorage.setItem("emergencyInfo", JSON.stringify(emergencyInfo));
    localStorage.setItem("profileCompleted", "true");
  
    alert("Emergency information saved successfully!");
    window.location.href = "leader_dashboard.html";
  });