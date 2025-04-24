document.addEventListener("DOMContentLoaded", () => {
  const loanForm = document.getElementById("loanForm");
  const customerSsnIdInput = document.getElementById("customerSsnId");
  const loanTypeSelect = document.getElementById("loanType");
  const amountInput = document.getElementById("amount");
  const interestRateInput = document.getElementById("interestRate");
  const termInput = document.getElementById("term");
  const requestDateInput = document.getElementById("requestDate");
  const purposeInput = document.getElementById("purpose");
  const descriptionInput = document.getElementById("description");
  const resetLoanBtn = document.getElementById("resetLoanBtn");

  const successModal = document.getElementById("successModal");
  const closeSuccessModal = document.getElementById("closeSuccessModal");
  const loanDetailsModal = document.getElementById("loanDetailsModal");
  const editLoanModal = document.getElementById("editLoanModal");
  const deleteLoanModal = document.getElementById("deleteLoanModal");

  const filterSelect = document.getElementById("filterLoans");

  const customerSsnIdError = document.getElementById("customerSsnIdError");
  const loanTypeError = document.getElementById("loanTypeError");
  const amountError = document.getElementById("amountError");
  const interestRateError = document.getElementById("interestRateError");
  const termError = document.getElementById("termError");
  const requestDateError = document.getElementById("requestDateError");
  const purposeError = document.getElementById("purposeError");

  const closeLoanDetailsBtn = document.getElementById("closeLoanDetailsBtn");
  const approveLoanBtn = document.getElementById("approveLoanBtn");
  const rejectLoanBtn = document.getElementById("rejectLoanBtn");
  const saveLoanChangesBtn = document.getElementById("saveLoanChangesBtn");
  const cancelEditBtn = document.getElementById("cancelEditBtn");
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

  let currentLoanId = null;

  function findCustomerBySSN(ssnId) {
    const customers = JSON.parse(localStorage.getItem("customers") || "[]");
    return customers.find((customer) => customer.id === ssnId);
  }

  function setDefaultDate() {
    const today = new Date().toISOString().split("T")[0];
    requestDateInput.value = today;

    if (document.getElementById("editRequestDate")) {
      document.getElementById("editRequestDate").value = today;
    }
  }

  function initForm() {
    setDefaultDate();
    customerSsnIdInput.addEventListener("blur", () => {
      const ssnId = customerSsnIdInput.value;
      if (!ssnId) return;
      const customer = findCustomerBySSN(ssnId);
      if (customer) {
        if (document.getElementById("customerName")) {
          document.getElementById("customerName").value =
            customer.customerName || customer.name;
        }
        if (document.getElementById("accountId")) {
          document.getElementById("accountId").value = customer.accountNumber;
        }
      }
    });
  }

  function resetForm() {
    loanForm.reset();
    document.getElementById("loanId").value = "";
    setDefaultDate();

    const errorElements = loanForm.querySelectorAll("[id$='Error']");
    errorElements.forEach((element) => {
      element.textContent = "";
      element.classList.add("hidden");
    });
    const submitButton = loanForm.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.textContent = "Submit Loan Request";
    }
  }

  function showSuccessModal(message = "Loan Request Submitted Successfully") {
    const successModalTitle = document.getElementById("successModalTitle");
    if (successModalTitle) {
      successModalTitle.textContent = "Success!";
    }
    const successMessage = successModal.querySelector("p");
    if (successMessage) {
      successMessage.textContent = message;
    }
    successModal.classList.remove("hidden");
  }

  function hideSuccessModal() {
    successModal.classList.add("hidden");
  }

  function processLoanRequest(loanData) {
    const loans = JSON.parse(localStorage.getItem("loans") || "[]");
    const isEditing = loanData.id !== "";

    if (isEditing) {
      const loanIndex = loans.findIndex((loan) => loan.id === loanData.id);
      if (loanIndex !== -1) {
        loans[loanIndex] = {
          ...loans[loanIndex],
          ...loanData,
          updatedAt: new Date().toISOString(),
        };
      }
    } else {
      const newLoan = {
        ...loanData,
        id: generateLoanId(),
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      loans.push(newLoan);
    }
    localStorage.setItem("loans", JSON.stringify(loans));
    showSuccessModal(
      isEditing
        ? "Loan Request Updated Successfully"
        : "Loan Request Submitted Successfully",
    );
    resetForm();
    loadLoans();
  }

  function fieldError(message, field, errorElement) {
    field.classList.add("border-red-500");
    errorElement.textContent = message;
    errorElement.classList.remove("hidden");
  }

  function loadLoans() {
    const loans = JSON.parse(localStorage.getItem("loans") || "[]");
    const loanList = document.getElementById("loanList");
    const loanCount = document.getElementById("loanCount");
    const filterLoans = document.getElementById("filterLoans");

    let filteredLoans = loans;
    if (filterLoans && filterLoans.value !== "all") {
      filteredLoans = loans.filter((loan) => loan.status === filterLoans.value);
    }

    if (loanCount) {
      loanCount.textContent = filteredLoans.length;
    }

    if (loanList) {
      loanList.innerHTML = "";

      if (filteredLoans.length === 0) {
        loanList.innerHTML = `
          <tr>
            <td colspan="7" class="px-6 py-4 text-center text-sm text-gray-500">
              No loan applications found. Create a new loan request to get started.
            </td>
          </tr>
        `;
        return;
      }

      filteredLoans.sort(
        (a, b) => new Date(b.requestDate) - new Date(a.requestDate),
      );

      filteredLoans.forEach((loan) => {
        const row = document.createElement("tr");
        row.className = "hover:bg-gray-50";

        const loanTypeFormatted =
          loan.loanType.charAt(0).toUpperCase() + loan.loanType.slice(1);

        let statusClass = "";
        switch (loan.status) {
          case "pending":
            statusClass = "bg-yellow-100 text-yellow-800";
            break;
          case "approved":
            statusClass = "bg-green-100 text-green-800";
            break;
          case "active":
            statusClass = "bg-blue-100 text-blue-800";
            break;
          case "rejected":
            statusClass = "bg-red-100 text-red-800";
            break;
          case "closed":
            statusClass = "bg-gray-100 text-gray-800";
            break;
        }
        row.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
            ${loan.id}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            ${loan.customerName}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            ${loanTypeFormatted} Loan
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            ₹${Number.parseFloat(loan.amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            ${new Date(loan.requestDate).toLocaleDateString("en-IN")}
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
              ${loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div class="flex justify-end space-x-2">
              <button class="view-loan-btn text-cyan-600 hover:text-cyan-900" data-id="${loan.id}">
                <i class="fas fa-eye"></i>
              </button>
              ${
                loan.status === "pending"
                  ? `
                <button class="edit-loan-btn text-cyan-600 hover:text-cyan-900" data-id="${loan.id}">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="delete-loan-btn text-red-600 hover:text-red-900" data-id="${loan.id}">
                  <i class="fas fa-trash-alt"></i>
                </button>
              `
                  : ""
              }
            </div>
          </td>
        `;
        loanList.appendChild(row);
      });

      addLoanActionListeners();
    }
  }

  function addLoanActionListeners() {
    document.querySelectorAll(".view-loan-btn").forEach((button) => {
      button.addEventListener("click", function () {
        viewLoan(this.getAttribute("data-id"));
      });
    });

    document.querySelectorAll(".edit-loan-btn").forEach((button) => {
      button.addEventListener("click", function () {
        openEditModal(this.getAttribute("data-id"));
      });
    });

    document.querySelectorAll(".delete-loan-btn").forEach((button) => {
      button.addEventListener("click", function () {
        openDeleteModal(this.getAttribute("data-id"));
      });
    });
  }

  function viewLoan(loanId) {
    const loans = JSON.parse(localStorage.getItem("loans") || "[]");
    const loan = loans.find((l) => l.id === loanId);

    if (loan) {
      document.getElementById("viewLoanId").textContent = loan.id;
      document.getElementById("viewCustomerName").textContent =
        loan.customerName;
      document.getElementById("viewLoanType").textContent =
        loan.loanType.charAt(0).toUpperCase() +
        loan.loanType.slice(1) +
        " Loan";
      document.getElementById("viewStatus").textContent =
        loan.status.charAt(0).toUpperCase() + loan.status.slice(1);
      document.getElementById("viewAmount").textContent =
        `₹${Number.parseFloat(loan.amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      document.getElementById("viewInterestRate").textContent =
        `${loan.interestRate}%`;
      document.getElementById("viewTerm").textContent = `${loan.term} months`;
      document.getElementById("viewRequestDate").textContent = new Date(
        loan.requestDate,
      ).toLocaleDateString("en-IN");
      document.getElementById("viewPurpose").textContent = loan.purpose;
      document.getElementById("viewDescription").textContent =
        loan.description || "No additional details provided";

      const loanActionButtons = document.getElementById("loanActionButtons");

      if (loan.status === "pending") {
        loanActionButtons.classList.remove("hidden");
        approveLoanBtn.setAttribute("data-id", loan.id);
        rejectLoanBtn.setAttribute("data-id", loan.id);
      } else {
        loanActionButtons.classList.add("hidden");
      }

      loanDetailsModal.classList.remove("hidden");
    }
  }

  function openEditModal(loanId) {
    const loans = JSON.parse(localStorage.getItem("loans") || "[]");
    const loan = loans.find((l) => l.id === loanId);

    if (loan) {
      if (loan.status !== "pending") {
        showSuccessModal("Error: Only pending loans can be edited");
        return;
      }

      document.getElementById("editLoanId").value = loan.id;
      const editCustomerSsnIdField =
        document.getElementById("editCustomerSsnId");
      editCustomerSsnIdField.value = loan.customerSsnId;
      editCustomerSsnIdField.setAttribute("readonly", "true");
      editCustomerSsnIdField.classList.add("bg-gray-100");
      document.getElementById("editLoanType").value = loan.loanType;
      document.getElementById("editAmount").value = loan.amount;
      document.getElementById("editInterestRate").value = loan.interestRate;
      document.getElementById("editTerm").value = loan.term;
      document.getElementById("editRequestDate").value = loan.requestDate;
      document.getElementById("editPurpose").value = loan.purpose;
      document.getElementById("editDescription").value = loan.description || "";

      editLoanModal.classList.remove("hidden");
    }
  }

  function openDeleteModal(loanId) {
    currentLoanId = loanId;
    deleteLoanModal.classList.remove("hidden");
  }

  function deleteLoan(loanId) {
    const loans = JSON.parse(localStorage.getItem("loans") || "[]");
    const updatedLoans = loans.filter((loan) => loan.id !== loanId);

    localStorage.setItem("loans", JSON.stringify(updatedLoans));
    showSuccessModal("Loan has been deleted successfully");
    loadLoans();
  }

  function updateLoanStatus(loanId, status) {
    const loans = JSON.parse(localStorage.getItem("loans") || "[]");
    const loanIndex = loans.findIndex((loan) => loan.id === loanId);

    if (loanIndex !== -1) {
      loans[loanIndex].status = status;
      loans[loanIndex].updatedAt = new Date().toISOString();

      localStorage.setItem("loans", JSON.stringify(loans));
      loanDetailsModal.classList.add("hidden");
      showSuccessModal(`Loan has been ${status} successfully`);
      loadLoans();
    }
  }

  function saveEditedLoan() {
    const fieldsConfig = [
      {
        field: document.getElementById("editCustomerSsnId"),
        errorElement: document.getElementById("editCustomerSsnIdError"),
        rules: { required: true, type: "ssnId" },
      },
      {
        field: document.getElementById("editLoanType"),
        errorElement: document.getElementById("editLoanTypeError"),
        rules: { required: true },
      },
      {
        field: document.getElementById("editAmount"),
        errorElement: document.getElementById("editAmountError"),
        rules: { required: true, type: "amount", min: 1000 },
      },
      {
        field: document.getElementById("editInterestRate"),
        errorElement: document.getElementById("editInterestRateError"),
        rules: { required: true, type: "amount", min: 1, max: 20 },
      },
      {
        field: document.getElementById("editTerm"),
        errorElement: document.getElementById("editTermError"),
        rules: { required: true, min: 1, max: 36 },
      },
      {
        field: document.getElementById("editRequestDate"),
        errorElement: document.getElementById("editRequestDateError"),
        rules: { required: true, type: "date" },
      },
      {
        field: document.getElementById("editPurpose"),
        errorElement: document.getElementById("editPurposeError"),
        rules: { required: true, minLength: 3 },
      },
    ];
    const isValid = validateForm(fieldsConfig);
    if (isValid) {
      const loans = JSON.parse(localStorage.getItem("loans") || "[]");
      const originalLoan = loans.find(
        (l) => l.id === document.getElementById("editLoanId").value,
      );
      const customer = {
        id: originalLoan.customerId,
        customerName: originalLoan.customerName,
      };
      const loanData = {
        id: document.getElementById("editLoanId").value,
        customerId: customer.id,
        customerName: customer.customerName,
        customerSsnId: document.getElementById("editCustomerSsnId").value,
        loanType: document.getElementById("editLoanType").value,
        amount: document.getElementById("editAmount").value,
        interestRate: document.getElementById("editInterestRate").value,
        term: document.getElementById("editTerm").value,
        requestDate: document.getElementById("editRequestDate").value,
        purpose: document.getElementById("editPurpose").value,
        description: document.getElementById("editDescription").value,
      };
      const loanIndex = loans.findIndex((loan) => loan.id === loanData.id);
      if (loanIndex !== -1) {
        loans[loanIndex] = {
          ...loans[loanIndex],
          ...loanData,
          updatedAt: new Date().toISOString(),
        };

        localStorage.setItem("loans", JSON.stringify(loans));
        editLoanModal.classList.add("hidden");
        showSuccessModal("Loan has been updated successfully");
        loadLoans();
      }
    }
  }

  initForm();
  if (resetLoanBtn) {
    resetLoanBtn.addEventListener("click", resetForm);
  }
  if (closeSuccessModal) {
    closeSuccessModal.addEventListener("click", hideSuccessModal);
  }
  if (loanForm) {
    loanForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const fieldsConfig = [
        {
          field: customerSsnIdInput,
          errorElement: customerSsnIdError,
          rules: { required: true, type: "ssnId" },
        },
        {
          field: loanTypeSelect,
          errorElement: loanTypeError,
          rules: { required: true },
        },
        {
          field: amountInput,
          errorElement: amountError,
          rules: { required: true, type: "amount", min: 1000 },
        },
        {
          field: interestRateInput,
          errorElement: interestRateError,
          rules: { required: true, type: "amount", min: 1, max: 20 },
        },
        {
          field: termInput,
          errorElement: termError,
          rules: { required: true, min: 1, max: 36 },
        },
        {
          field: requestDateInput,
          errorElement: requestDateError,
          rules: { required: true, type: "date" },
        },
        {
          field: purposeInput,
          errorElement: purposeError,
          rules: { required: true, minLength: 3 },
        },
      ];
      const isValid = validateForm(fieldsConfig);
      if (isValid) {
        const customer = findCustomerBySSN(customerSsnIdInput.value);
        if (!customer) {
          fieldError(
            "Customer with this SSN ID does not exist",
            customerSsnIdInput,
            customerSsnIdError,
          );
          return;
        }
        const loanData = {
          id: document.getElementById("loanId").value,
          customerId: customer.id,
          customerName: customer.customerName || customer.name,
          customerSsnId: customerSsnIdInput.value,
          loanType: loanTypeSelect.value,
          amount: amountInput.value,
          interestRate: interestRateInput.value,
          term: termInput.value,
          requestDate: requestDateInput.value,
          purpose: purposeInput.value,
          description: descriptionInput.value,
        };
        processLoanRequest(loanData);
      }
    });
  }

  if (closeLoanDetailsBtn) {
    closeLoanDetailsBtn.addEventListener("click", () => {
      loanDetailsModal.classList.add("hidden");
    });
  }

  if (approveLoanBtn) {
    approveLoanBtn.addEventListener("click", function () {
      const loanId = this.getAttribute("data-id");
      updateLoanStatus(loanId, "approved");
    });
  }

  if (rejectLoanBtn) {
    rejectLoanBtn.addEventListener("click", function () {
      const loanId = this.getAttribute("data-id");
      updateLoanStatus(loanId, "rejected");
    });
  }

  if (saveLoanChangesBtn) {
    saveLoanChangesBtn.addEventListener("click", saveEditedLoan);
  }

  if (cancelEditBtn) {
    cancelEditBtn.addEventListener("click", () => {
      editLoanModal.classList.add("hidden");
    });
  }

  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", () => {
      deleteLoan(currentLoanId);
      deleteLoanModal.classList.add("hidden");
    });
  }

  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener("click", () => {
      deleteLoanModal.classList.add("hidden");
    });
  }

  if (filterSelect) {
    filterSelect.addEventListener("change", loadLoans);
  }

  if (document.getElementById("refreshLoans")) {
    document
      .getElementById("refreshLoans")
      .addEventListener("click", loadLoans);
  }

  loadLoans();
});
