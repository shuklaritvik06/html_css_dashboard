function validateField(field, errorElement, validationRules = {}) {
  const value = field?.value?.trim() || "";
  const patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    employeeId: /^EMP\d{5}$/,
    ssnId: /^SSN\d{8}$/,
    contactNumber: /^\d{10}$/,
    aadharCard: /^\d{12}$/,
    panCard: /^[A-Z]{5}\d{4}[A-Z]$/,
    accountNumber: /^ACC\d{8}$/,
    ifscCode: /^[A-Z]{4}\d{6}$/,
    amount: /^\d+(\.\d{1,2})?$/,
    name: /^[A-Za-z\s.'-]+$/,
    password:
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]{8,30}$/,
  };

  if (validationRules.required && !value) {
    return fieldError("This field is required", field, errorElement);
  }

  switch (validationRules.type) {
    case "employeeId":
      if (!patterns.employeeId.test(value)) {
        return fieldError(
          "Please enter a valid employee id",
          field,
          errorElement,
        );
      }
      break;
    case "accountNumber":
      if (!patterns.accountNumber.test(value)) {
        return fieldError(
          "Please enter a valid account number",
          field,
          errorElement,
        );
      }
      break;
    case "ifscCode":
      if (!patterns.ifscCode.test(value)) {
        return fieldError(
          "Please enter a valid ifsc code",
          field,
          errorElement,
        );
      }
      break;
    case "ssnId":
      if (!patterns.ssnId.test(value)) {
        return fieldError("Please enter a valid ssn id", field, errorElement);
      }
      break;
    case "email":
      if (!patterns.email.test(value)) {
        return fieldError(
          "Please enter a valid email address",
          field,
          errorElement,
        );
      }
      break;
    case "password":
      if (value.length < 8) {
        return fieldError(
          "Password must be at least 8 characters",
          field,
          errorElement,
        );
      }
      if (value.length > 30) {
        return fieldError(
          "Password must be at max 30 characters",
          field,
          errorElement,
        );
      }
      if (!patterns.password.test(value) && validationRules.strongPassword) {
        return fieldError(
          "Password must include uppercase, lowercase, number and special character",
          field,
          errorElement,
        );
      }
      break;
    case "confirmPassword":
      if (value !== validationRules.matchWith?.value) {
        return fieldError("Passwords do not match", field, errorElement);
      }
      break;
    case "contactNumber":
      if (!patterns.contactNumber.test(value)) {
        return fieldError(
          "Contact number must be 10 digits",
          field,
          errorElement,
        );
      }
      break;
    case "aadharCard":
      if (!patterns.aadharCard.test(value)) {
        return fieldError("Aadhar card must be 12 digits", field, errorElement);
      }
      break;
    case "panCard":
      if (!patterns.panCard.test(value)) {
        return fieldError("Invalid PAN card format", field, errorElement);
      }
      break;
    case "name":
      if (!patterns.name.test(value)) {
        return fieldError("Please enter a valid name", field, errorElement);
      }
      break;
    case "amount":
      if (!patterns.amount.test(value)) {
        return fieldError("Please enter a valid amount", field, errorElement);
      }
      if (validationRules.min && parseFloat(value) < validationRules.min) {
        return fieldError(
          `Amount must be at least ${validationRules.min}`,
          field,
          errorElement,
        );
      }
      if (validationRules.max && parseFloat(value) > validationRules.max) {
        return fieldError(
          `Amount cannot exceed ${validationRules.max}`,
          field,
          errorElement,
        );
      }
      break;
    case "date":
      const dateValue = new Date(value);
      if (isNaN(dateValue.getTime())) {
        return fieldError("Please enter a valid date", field, errorElement);
      }
      if (
        validationRules.minDate &&
        dateValue < new Date(validationRules.minDate)
      ) {
        return fieldError(
          "Date cannot be before " +
            new Date(validationRules.minDate).toLocaleDateString(),
          field,
          errorElement,
        );
      }
      if (
        validationRules.maxDate &&
        dateValue > new Date(validationRules.maxDate)
      ) {
        return fieldError(
          "Date cannot be after " +
            new Date(validationRules.maxDate).toLocaleDateString(),
          field,
          errorElement,
        );
      }
      break;
  }
  if (validationRules.minLength && value.length < validationRules.minLength) {
    return fieldError(
      `Must be at least ${validationRules.minLength} characters`,
      field,
      errorElement,
    );
  }
  if (validationRules.maxLength && value.length > validationRules.maxLength) {
    return fieldError(
      `Cannot exceed ${validationRules.maxLength} characters`,
      field,
      errorElement,
    );
  }
  if (validationRules.pattern && !validationRules.pattern.test(value)) {
    return fieldError(
      validationRules.message || "Invalid format",
      field,
      errorElement,
    );
  }
  if (validationRules.readOnly && validationRules.originalValue !== value) {
    return fieldError("This field cannot be modified", field, errorElement);
  }
  if (errorElement) {
    field.classList.remove("border-red-500");
    errorElement.textContent = "";
    errorElement.classList.add("hidden");
  }
  return true;
}

function fieldError(message, field, errorElement) {
  let isValid = false;
  if (errorElement) {
    field.classList.add("border-red-500");
    errorElement.textContent = message;
    errorElement.classList.remove("hidden");
  }
  return isValid;
}

function validateForm(fieldsConfig) {
  let isFormValid = true;
  for (const config of fieldsConfig) {
    const { field, errorElement, rules } = config;
    const isFieldValid = validateField(field, errorElement, rules);
    if (!isFieldValid) {
      isFormValid = false;
    }
  }
  return isFormValid;
}
