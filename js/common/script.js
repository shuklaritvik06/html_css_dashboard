document.addEventListener("DOMContentLoaded", () => {
  const emailSpan = document.getElementById("userEmail");

  try {
    const userData = localStorage.getItem("currentUser");
    const currentUser = JSON.parse(userData);

    if (currentUser && currentUser.email) {
      emailSpan.textContent = currentUser.email;
    } else {
      emailSpan.textContent = "Anonymous User";
    }
  } catch (error) {
    emailSpan.textContent = "Anonymous User";
  }
});
