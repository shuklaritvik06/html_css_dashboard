document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const employeeIdInput = document.getElementById("employeeId");
  const passwordInput = document.getElementById("password");
  const employeeIdError = document.getElementById("employeeIdError");
  const passwordError = document.getElementById("passwordError");
  const globalError = document.getElementById("globalError");
  const togglePasswordBtn = document.getElementById("togglePassword");

  const registerForm = document.getElementById("registerForm");
  const firstNameInput = document.getElementById("firstName");
  const lastNameInput = document.getElementById("lastName");
  const emailInput = document.getElementById("email");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const addressInput = document.getElementById("address");
  const contactNumberInput = document.getElementById("contactNumber");

  const firstNameError = document.getElementById("firstNameError");
  const lastNameError = document.getElementById("lastNameError");
  const emailError = document.getElementById("emailError");
  const confirmPasswordError = document.getElementById("confirmPasswordError");
  const addressError = document.getElementById("addressError");
  const contactNumberError = document.getElementById("contactNumberError");

  const toggleConfirmPasswordBtn = document.getElementById(
    "toggleConfirmPassword",
  );

  const logoutBtn = document.getElementById("logoutButton");

  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener("click", () => {
      const type =
        passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);
      const eyeIcon = togglePasswordBtn.querySelector("i");
      eyeIcon.classList.toggle("fa-eye");
      eyeIcon.classList.toggle("fa-eye-slash");
    });
  }

  if (toggleConfirmPasswordBtn) {
    toggleConfirmPasswordBtn.addEventListener("click", () => {
      const type =
        confirmPasswordInput.getAttribute("type") === "password"
          ? "text"
          : "password";
      confirmPasswordInput.setAttribute("type", type);
      const eyeIcon = toggleConfirmPasswordBtn.querySelector("i");
      eyeIcon.classList.toggle("fa-eye");
      eyeIcon.classList.toggle("fa-eye-slash");
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (globalError) {
        globalError.textContent = "";
        globalError.classList.add("hidden");
        globalError.classList.remove("text-green-600");
        globalError.classList.add("text-red-600");
      }
      const validationConfig = [
        {
          field: employeeIdInput,
          errorElement: employeeIdError,
          rules: {
            required: true,
          },
        },
        {
          field: passwordInput,
          errorElement: passwordError,
          rules: {
            required: true,
          },
        },
      ];

      const isFormValid = validateForm(validationConfig);
      if (!isFormValid) return;

      loginEmployee();
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const validationConfig = [
        {
          field: firstNameInput,
          errorElement: firstNameError,
          rules: {
            required: true,
            type: "name",
            minLength: 2,
            maxLength: 50,
          },
        },
        {
          field: lastNameInput,
          errorElement: lastNameError,
          rules: {
            required: true,
            type: "name",
            minLength: 2,
            maxLength: 50,
          },
        },
        {
          field: emailInput,
          errorElement: emailError,
          rules: {
            required: true,
            type: "email",
          },
        },
        {
          field: passwordInput,
          errorElement: passwordError,
          rules: {
            required: true,
            type: "password",
            strongPassword: true,
            maxLength: 30,
            minLength: 8,
          },
        },
        {
          field: confirmPasswordInput,
          errorElement: confirmPasswordError,
          rules: {
            required: true,
            type: "confirmPassword",
            matchWith: passwordInput,
          },
        },
        {
          field: addressInput,
          errorElement: addressError,
          rules: {
            required: true,
            minLength: 10,
            maxLength: 200,
          },
        },
        {
          field: contactNumberInput,
          errorElement: contactNumberError,
          rules: {
            required: true,
            type: "contactNumber",
          },
        },
      ];
      if (globalError) {
        globalError.textContent = "";
        globalError.classList.add("hidden");
        globalError.classList.remove("text-green-600");
        globalError.classList.add("text-red-600");
      }
      const isFormValid = validateForm(validationConfig);
      if (isFormValid) {
        registerEmployee();
      }
    });
  }
  function loginEmployee() {
    const employees = JSON.parse(localStorage.getItem("employees") || "[]");
    const employee = employees.find(
      (emp) => emp.employeeId === employeeIdInput.value,
    );
    if (employee && employee.password === passwordInput.value) {
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          employeeId: employee.employeeId,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          lastLogin: new Date().toISOString(),
        }),
      );
      showSuccessAndRedirect("Login successful. Redirecting...");
    } else {
      showGlobalError("Invalid employee ID or password");
      passwordInput.value = "";
    }
  }
  function registerEmployee() {
    const employees = JSON.parse(localStorage.getItem("employees") || "[]");
    const emailExists = employees.some((emp) => emp.email === emailInput.value);
    if (emailExists) {
      showGlobalError("Email already registered");
      return;
    }
    const employeeId = generateEmployeeId();
    const newEmployee = {
      employeeId,
      firstName: firstNameInput.value.trim(),
      lastName: lastNameInput.value.trim(),
      email: emailInput.value.trim(),
      password: passwordInput.value,
      address: addressInput.value.trim(),
      contactNumber: contactNumberInput.value.trim(),
      createdAt: new Date().toISOString(),
    };
    employees.push(newEmployee);
    localStorage.setItem("employees", JSON.stringify(employees));
    showSuccessAndRedirect(
      `Registration successful. Your Employee ID is ${employeeId}`,
    );
    registerForm.reset();
  }

  function showGlobalError(message) {
    if (globalError) {
      globalError.textContent = message;
      globalError.classList.remove("hidden");
      globalError.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function showSuccessAndRedirect(message) {
    if (globalError) {
      globalError.textContent = message;
      globalError.classList.remove("hidden");
      globalError.classList.remove("text-red-600");
      globalError.classList.add("text-green-600");

      setTimeout(
        () => {
          window.location.href = loginForm ? "dashboard.html" : "login.html";
        },
        loginForm ? 2000 : 3000,
      );
    }
  }
  function handleLogout() {
    localStorage.removeItem("currentUser");
    const path = window.location.pathname;
    const segments = path.split("/");
    const baseSegments = segments.slice(
      0,
      segments.findIndex((seg) => seg === "pages") || segments.length - 1,
    );
    const basePath = baseSegments.join("/");
    window.location.href = basePath + "/login.html";
  }
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }
});
