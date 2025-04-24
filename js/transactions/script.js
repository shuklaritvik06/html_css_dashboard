document.addEventListener("DOMContentLoaded", () => {
  const transactionForm = document.getElementById("transactionForm");
  const transactionTypeSelect = document.getElementById("transactionType");
  const customerSsnIdInput = document.getElementById("customerSsnId");
  const customerNameInput = document.getElementById("customerName");
  const accountIdInput = document.getElementById("accountId");
  const destinationAccountIdInput = document.getElementById(
    "destinationAccountId",
  );
  const destinationAccountContainer = document.getElementById(
    "destinationAccountContainer",
  );
  const aadharCardNoInput = document.getElementById("aadharCardNo");
  const panCardNoInput = document.getElementById("panCardNo");
  const contactNumberInput = document.getElementById("contactNumber");
  const transactionDateInput = document.getElementById("transactionDate");
  const modeOfTransactionSelect = document.getElementById("modeOfTransaction");
  const amountInput = document.getElementById("amount");
  const addressInput = document.getElementById("address");
  const resetTransactionBtn = document.getElementById("resetTransactionBtn");
  const successModal = document.getElementById("successModal");
  const closeSuccessModal = document.getElementById("closeSuccessModal");
  const successModalTitle = document.getElementById("successModalTitle");
  const successModalMessage = document.getElementById("successModalMessage");

  const transactionTypeError = document.getElementById("transactionTypeError");
  const customerSsnIdError = document.getElementById("customerSsnIdError");
  const customerNameError = document.getElementById("customerNameError");
  const accountIdError = document.getElementById("accountIdError");
  const destinationAccountIdError = document.getElementById(
    "destinationAccountIdError",
  );
  const aadharCardNoError = document.getElementById("aadharCardNoError");
  const panCardNoError = document.getElementById("panCardNoError");
  const contactNumberError = document.getElementById("contactNumberError");
  const transactionDateError = document.getElementById("transactionDateError");
  const modeOfTransactionError = document.getElementById(
    "modeOfTransactionError",
  );
  const amountError = document.getElementById("amountError");
  const addressError = document.getElementById("addressError");

  const transactionList = document.getElementById("transactionList");
  const transactionCount = document.getElementById("transactionCount");
  const filterTransactions = document.getElementById("filterTransactions");
  const refreshTransactions = document.getElementById("refreshTransactions");

  const viewTransactionModal = document.getElementById("viewTransactionModal");
  const closeViewTransactionBtn = document.getElementById(
    "closeViewTransactionBtn",
  );
  const deleteTransactionModal = document.getElementById(
    "deleteTransactionModal",
  );
  const confirmDeleteTransactionBtn = document.getElementById(
    "confirmDeleteTransactionBtn",
  );
  const cancelDeleteTransactionBtn = document.getElementById(
    "cancelDeleteTransactionBtn",
  );

  let currentTransactionId = null;

  function setDefaultDate() {
    const today = new Date().toISOString().split("T")[0];
    if (transactionDateInput) transactionDateInput.value = today;
  }

  function initForm() {
    if (document.getElementById("transactionId")) {
      document.getElementById("transactionId").value = generateTransactionId();
    }
    setDefaultDate();

    if (transactionTypeSelect) {
      transactionTypeSelect.addEventListener(
        "change",
        handleTransactionTypeChange,
      );
    }

    if (customerSsnIdInput) {
      customerSsnIdInput.addEventListener("blur", populateCustomerDetails);
    }
  }

  function findCustomerBySSN(ssnId) {
    const customers = JSON.parse(localStorage.getItem("customers") || "[]");
    return customers.find((customer) => customer.id === ssnId);
  }

  function findCustomerByAccountNumber(accountNumber) {
    const customers = JSON.parse(localStorage.getItem("customers") || "[]");
    return customers.find(
      (customer) => customer.accountNumber === accountNumber,
    );
  }

  function populateCustomerDetails() {
    const ssnId = customerSsnIdInput.value;
    if (!ssnId) return;
    const customer = findCustomerBySSN(ssnId);
    if (customer) {
      customerNameInput.value = customer.customerName || customer.name;
      accountIdInput.value = customer.accountNumber;
      if (aadharCardNoInput) aadharCardNoInput.value = customer.aadhaarCardNo;
      if (panCardNoInput) panCardNoInput.value = customer.panCardNo;
      if (contactNumberInput) contactNumberInput.value = customer.contactNumber;
      if (addressInput) addressInput.value = customer.address;
    }
  }

  function handleTransactionTypeChange() {
    if (transactionTypeSelect.value === "transfer") {
      destinationAccountContainer.classList.remove("hidden");
      destinationAccountIdInput.setAttribute("required", "true");
    } else {
      destinationAccountContainer.classList.add("hidden");
      destinationAccountIdInput.removeAttribute("required");
    }
  }

  function resetForm() {
    if (!transactionForm) return;

    transactionForm.reset();
    if (document.getElementById("transactionId")) {
      document.getElementById("transactionId").value = generateTransactionId();
    }
    setDefaultDate();

    if (destinationAccountContainer) {
      destinationAccountContainer.classList.add("hidden");
    }

    const errorElements = document.querySelectorAll("[id$='Error']");
    errorElements.forEach((element) => {
      element.textContent = "";
      element.classList.add("hidden");
    });
  }

  function showSuccessModal(
    title = "Success!",
    message = "Transaction Processed Successfully",
  ) {
    if (successModal) {
      if (successModalTitle) successModalTitle.textContent = title;
      if (successModalMessage) successModalMessage.textContent = message;
      successModal.classList.remove("hidden");
    }
  }

  function hideSuccessModal() {
    if (successModal) successModal.classList.add("hidden");
  }

  function validateCustomerExists(ssnId) {
    const customer = findCustomerBySSN(ssnId);

    if (!customer) {
      customerSsnIdError.textContent =
        "Customer with this SSN ID does not exist";
      customerSsnIdError.classList.remove("hidden");
      return false;
    }

    return true;
  }

  function validateAccountExists(accountNumber) {
    const customer = findCustomerByAccountNumber(accountNumber);

    if (!customer) {
      accountIdError.textContent = "Account number does not exist";
      accountIdError.classList.remove("hidden");
      return false;
    }

    return true;
  }

  function validateDestinationAccountExists(accountNumber) {
    const customer = findCustomerByAccountNumber(accountNumber);

    if (!customer) {
      destinationAccountIdError.textContent =
        "Destination account number does not exist";
      destinationAccountIdError.classList.remove("hidden");
      return false;
    }

    return true;
  }

  function validateSufficientBalance(accountNumber, amount) {
    const customer = findCustomerByAccountNumber(accountNumber);

    if (!customer) return false;

    if (customer.accountBalance < Number.parseFloat(amount)) {
      amountError.textContent = "Insufficient balance in account";
      amountError.classList.remove("hidden");
      return false;
    }

    return true;
  }

  function validateAccountTransfer(sourceAccount, destinationAccount, amount) {
    if (!validateAccountExists(sourceAccount)) return false;
    if (!validateDestinationAccountExists(destinationAccount)) return false;
    if (!validateSufficientBalance(sourceAccount, amount)) return false;

    if (sourceAccount === destinationAccount) {
      destinationAccountIdError.textContent =
        "Source and destination accounts cannot be the same";
      destinationAccountIdError.classList.remove("hidden");
      return false;
    }

    return true;
  }

  function updateCustomerBalance(accountNumber, amount, isCredit) {
    const customers = JSON.parse(localStorage.getItem("customers") || "[]");
    const customerIndex = customers.findIndex(
      (c) => c.accountNumber === accountNumber,
    );

    if (customerIndex === -1) return;

    if (isCredit) {
      customers[customerIndex].accountBalance += Number.parseFloat(amount);
    } else {
      customers[customerIndex].accountBalance -= Number.parseFloat(amount);
    }

    localStorage.setItem("customers", JSON.stringify(customers));
  }

  function processTransaction(transactionData) {
    const transactions = JSON.parse(
      localStorage.getItem("transactions") || "[]",
    );

    let transactionDirection = "debit";
    if (transactionData.transactionType === "deposit") {
      transactionDirection = "credit";
      updateCustomerBalance(
        transactionData.accountId,
        transactionData.amount,
        true,
      );
    } else if (transactionData.transactionType === "withdrawal") {
      transactionDirection = "debit";
      updateCustomerBalance(
        transactionData.accountId,
        transactionData.amount,
        false,
      );
    } else if (transactionData.transactionType === "transfer") {
      transactionDirection = "debit";
      updateCustomerBalance(
        transactionData.accountId,
        transactionData.amount,
        false,
      );
      updateCustomerBalance(
        transactionData.destinationAccountId,
        transactionData.amount,
        true,
      );

      const destinationTransaction = {
        id: generateTransactionId(),
        transactionType: "transfer",
        customerSsnId: transactionData.customerSsnId,
        customerName: transactionData.customerName,
        accountId: transactionData.destinationAccountId,
        sourceAccountId: transactionData.accountId,
        aadharCardNo: transactionData.aadharCardNo,
        panCardNo: transactionData.panCardNo,
        contactNumber: transactionData.contactNumber,
        transactionDate: transactionData.transactionDate,
        modeOfTransaction: transactionData.modeOfTransaction,
        amount: transactionData.amount,
        transactionDirection: "credit",
        address: transactionData.address,
        createdAt: new Date().toISOString(),
      };

      transactions.push(destinationTransaction);
    }

    transactions.push({
      ...transactionData,
      transactionDirection,
      createdAt: new Date().toISOString(),
    });

    localStorage.setItem("transactions", JSON.stringify(transactions));
    showSuccessModal();
    resetForm();
    loadTransactions();
  }

  function deleteTransaction(transactionId) {
    const transactions = JSON.parse(
      localStorage.getItem("transactions") || "[]",
    );
    const updatedTransactions = transactions.filter(
      (t) => t.id !== transactionId,
    );

    localStorage.setItem("transactions", JSON.stringify(updatedTransactions));
    showSuccessModal("Success!", "Transaction Deleted Successfully");
    hideDeleteModal();
    loadTransactions();
  }

  function loadTransactions() {
    const transactions = JSON.parse(
      localStorage.getItem("transactions") || "[]",
    );

    const filterValue = filterTransactions ? filterTransactions.value : "all";
    let filteredTransactions = transactions;
    if (filterValue !== "all") {
      filteredTransactions = transactions.filter(
        (transaction) => transaction.transactionType === filterValue,
      );
    }

    if (transactionCount) {
      transactionCount.textContent = filteredTransactions.length;
    }

    if (transactionList) {
      transactionList.innerHTML = "";

      if (filteredTransactions.length === 0) {
        transactionList.innerHTML = `
          <tr>
            <td colspan="9" class="px-6 py-4 text-center text-sm text-gray-500">
              No transactions found. Create a new transaction to get started.
            </td>
          </tr>
        `;
        return;
      }

      filteredTransactions.sort(
        (a, b) => new Date(b.transactionDate) - new Date(a.transactionDate),
      );

      filteredTransactions.forEach((transaction) => {
        const row = document.createElement("tr");
        row.className = "hover:bg-gray-50";

        const typeFormatted =
          transaction.transactionType.charAt(0).toUpperCase() +
          transaction.transactionType.slice(1);

        let amountClass = "text-gray-500";
        if (
          transaction.transactionType === "deposit" ||
          (transaction.transactionType === "transfer" &&
            transaction.transactionDirection === "credit")
        ) {
          amountClass = "text-green-600";
        } else if (
          transaction.transactionType === "withdrawal" ||
          (transaction.transactionType === "transfer" &&
            transaction.transactionDirection === "debit")
        ) {
          amountClass = "text-red-600";
        }

        const formattedAmount = Number.parseFloat(
          transaction.amount,
        ).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

        const modeFormatted = transaction.modeOfTransaction
          ? transaction.modeOfTransaction.charAt(0).toUpperCase() +
            transaction.modeOfTransaction.slice(1)
          : "";

        let transferDetails = "";
        if (transaction.transactionType === "transfer") {
          if (transaction.transactionDirection === "debit") {
            transferDetails = `To: ${transaction.destinationAccountId}`;
          } else {
            transferDetails = `From: ${transaction.sourceAccountId}`;
          }
        }

        row.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            ${new Date(transaction.transactionDate).toLocaleDateString("en-IN")}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            ${transaction.id}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            ${transaction.customerName}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            ${transaction.accountId}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            ${typeFormatted}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm ${amountClass}">
            ${transaction.transactionDirection === "credit" ? "+" : "-"}₹${formattedAmount}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            ${modeFormatted}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            ${transferDetails}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-right">
            <button class="text-cyan-600 hover:text-cyan-900 mr-3 view-transaction" data-id="${transaction.id}">
              <i class="fas fa-eye"></i>
            </button>
            <button class="text-red-600 hover:text-red-900 delete-transaction" data-id="${transaction.id}">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        `;
        transactionList.appendChild(row);
      });

      addTransactionActionListeners();
    }
  }

  function addTransactionActionListeners() {
    document.querySelectorAll(".view-transaction").forEach((button) => {
      button.addEventListener("click", function () {
        const transactionId = this.getAttribute("data-id");
        viewTransaction(transactionId);
      });
    });

    document.querySelectorAll(".delete-transaction").forEach((button) => {
      button.addEventListener("click", function () {
        const transactionId = this.getAttribute("data-id");
        showDeleteModal(transactionId);
      });
    });
  }

  function viewTransaction(transactionId) {
    const transactions = JSON.parse(
      localStorage.getItem("transactions") || "[]",
    );
    const transaction = transactions.find((t) => t.id === transactionId);

    if (!transaction) return;

    document.getElementById("viewTransactionId").textContent = transaction.id;
    document.getElementById("viewTransactionDate").textContent = new Date(
      transaction.transactionDate,
    ).toLocaleDateString("en-IN");
    document.getElementById("viewCustomerName").textContent =
      transaction.customerName;
    document.getElementById("viewAccountId").textContent =
      transaction.accountId;
    document.getElementById("viewTransactionType").textContent =
      transaction.transactionType.charAt(0).toUpperCase() +
      transaction.transactionType.slice(1);

    const formattedAmount = Number.parseFloat(
      transaction.amount,
    ).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    document.getElementById("viewAmount").textContent =
      `${transaction.transactionDirection === "credit" ? "+" : "-"}₹${formattedAmount}`;

    document.getElementById("viewModeOfTransaction").textContent =
      transaction.modeOfTransaction.charAt(0).toUpperCase() +
      transaction.modeOfTransaction.slice(1);
    document.getElementById("viewContactNumber").textContent =
      transaction.contactNumber;
    document.getElementById("viewCustomerSsnId").textContent =
      transaction.customerSsnId;
    document.getElementById("viewAddress").textContent = transaction.address;

    const viewDestinationAccountContainer = document.getElementById(
      "viewDestinationAccountContainer",
    );
    if (transaction.transactionType === "transfer") {
      viewDestinationAccountContainer.classList.remove("hidden");
      if (transaction.transactionDirection === "debit") {
        document.getElementById("viewDestinationAccountId").textContent =
          transaction.destinationAccountId;
      } else {
        document.getElementById("viewDestinationAccountId").textContent =
          transaction.sourceAccountId;
      }
    } else {
      viewDestinationAccountContainer.classList.add("hidden");
    }

    viewTransactionModal.classList.remove("hidden");
  }

  function hideViewModal() {
    viewTransactionModal.classList.add("hidden");
  }

  function showDeleteModal(transactionId) {
    currentTransactionId = transactionId;
    deleteTransactionModal.classList.remove("hidden");
  }

  function hideDeleteModal() {
    deleteTransactionModal.classList.add("hidden");
    currentTransactionId = null;
  }

  initForm();
  loadTransactions();

  if (resetTransactionBtn) {
    resetTransactionBtn.addEventListener("click", resetForm);
  }

  if (closeSuccessModal) {
    closeSuccessModal.addEventListener("click", hideSuccessModal);
  }

  if (filterTransactions) {
    filterTransactions.addEventListener("change", loadTransactions);
  }

  if (refreshTransactions) {
    refreshTransactions.addEventListener("click", loadTransactions);
  }

  if (closeViewTransactionBtn) {
    closeViewTransactionBtn.addEventListener("click", hideViewModal);
  }

  if (cancelDeleteTransactionBtn) {
    cancelDeleteTransactionBtn.addEventListener("click", hideDeleteModal);
  }

  if (confirmDeleteTransactionBtn) {
    confirmDeleteTransactionBtn.addEventListener("click", () => {
      if (currentTransactionId) {
        deleteTransaction(currentTransactionId);
      }
    });
  }

  if (transactionForm) {
    transactionForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const validationConfig = [
        {
          field: transactionTypeSelect,
          errorElement: transactionTypeError,
          rules: { required: true },
        },
        {
          field: customerSsnIdInput,
          errorElement: customerSsnIdError,
          rules: { required: true, type: "ssnId" },
        },
        {
          field: customerNameInput,
          errorElement: customerNameError,
          rules: { required: true, type: "name" },
        },
        {
          field: accountIdInput,
          errorElement: accountIdError,
          rules: { required: true, type: "accountNumber" },
        },
        {
          field: aadharCardNoInput,
          errorElement: aadharCardNoError,
          rules: { required: true, type: "aadharCard" },
        },
        {
          field: panCardNoInput,
          errorElement: panCardNoError,
          rules: { required: true, type: "panCard" },
        },
        {
          field: contactNumberInput,
          errorElement: contactNumberError,
          rules: { required: true, type: "contactNumber" },
        },
        {
          field: transactionDateInput,
          errorElement: transactionDateError,
          rules: { required: true, type: "date" },
        },
        {
          field: modeOfTransactionSelect,
          errorElement: modeOfTransactionError,
          rules: { required: true },
        },
        {
          field: amountInput,
          errorElement: amountError,
          rules: { required: true, type: "amount", min: 1 },
        },
        {
          field: addressInput,
          errorElement: addressError,
          rules: { required: true },
        },
      ];

      if (transactionTypeSelect.value === "transfer") {
        validationConfig.push({
          field: destinationAccountIdInput,
          errorElement: destinationAccountIdError,
          rules: { required: true, type: "accountNumber" },
        });
      }

      const isFormValid = validateForm(validationConfig);
      if (!isFormValid) return;

      if (!validateCustomerExists(customerSsnIdInput.value)) return;
      if (!validateAccountExists(accountIdInput.value)) return;

      if (transactionTypeSelect.value === "withdrawal") {
        if (!validateSufficientBalance(accountIdInput.value, amountInput.value))
          return;
      }

      if (transactionTypeSelect.value === "transfer") {
        const isTransferValid = validateAccountTransfer(
          accountIdInput.value,
          destinationAccountIdInput.value,
          amountInput.value,
        );
        if (!isTransferValid) return;
      }

      const transactionData = {
        id: document.getElementById("transactionId").value,
        transactionType: transactionTypeSelect.value,
        customerSsnId: customerSsnIdInput.value,
        customerName: customerNameInput.value,
        accountId: accountIdInput.value,
        aadharCardNo: aadharCardNoInput.value,
        panCardNo: panCardNoInput.value,
        contactNumber: contactNumberInput.value,
        transactionDate: transactionDateInput.value,
        modeOfTransaction: modeOfTransactionSelect.value,
        amount: amountInput.value,
        address: addressInput.value,
      };

      if (transactionTypeSelect.value === "transfer") {
        transactionData.destinationAccountId = destinationAccountIdInput.value;
      }

      processTransaction(transactionData);
    });
  }
});
