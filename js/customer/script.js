document.addEventListener("DOMContentLoaded", () => {
  const customerForm = document.getElementById("customerForm");
  const customerModal = document.getElementById("customerModal");
  const viewCustomerModal = document.getElementById("viewCustomerModal");
  const deleteModal = document.getElementById("deleteModal");
  const successModal = document.getElementById("successModal");
  const successModalMessage = document.getElementById("successModalMessage");
  const closeSuccessModal = document.getElementById("closeSuccessModal");
  const addCustomerBtn = document.getElementById("addCustomerBtn");
  const cancelCustomerBtn = document.getElementById("cancelCustomerBtn");
  const closeViewBtn = document.getElementById("closeViewBtn");
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
  const searchCustomerInput = document.getElementById("searchCustomer");
  const filterCustomerSelect = document.getElementById("filterCustomer");
  const refreshCustomersBtn = document.getElementById("refreshCustomers");
  const customerList = document.getElementById("customerList");
  const customerCount = document.getElementById("customerCount");

  let currentCustomerId = null;

  function init() {
    loadCustomers();
    setupEventListeners();
  }

  function setupEventListeners() {
    addCustomerBtn.addEventListener("click", openAddCustomerModal);
    cancelCustomerBtn.addEventListener("click", closeCustomerModal);
    closeViewBtn.addEventListener("click", closeViewCustomerModal);
    cancelDeleteBtn.addEventListener("click", closeDeleteModal);
    confirmDeleteBtn.addEventListener("click", deleteCustomer);
    closeSuccessModal.addEventListener("click", closeSuccessMessageModal);
    customerForm.addEventListener("submit", handleCustomerFormSubmit);
    searchCustomerInput.addEventListener(
      "input",
      debounce(filterCustomers, 300),
    );
    filterCustomerSelect.addEventListener("change", filterCustomers);
    refreshCustomersBtn.addEventListener("click", loadCustomers);
    window.addEventListener("click", (e) => {
      if (e.target === customerModal) closeCustomerModal();
      if (e.target === viewCustomerModal) closeViewCustomerModal();
      if (e.target === deleteModal) closeDeleteModal();
      if (e.target === successModal) closeSuccessMessageModal();
    });
  }

  function debounce(func, delay) {
    let timeout;
    return function () {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), delay);
    };
  }

  function generateSSNId() {
    return "SSN" + Math.floor(10000000 + Math.random() * 90000000);
  }

  function generateAccountNumber() {
    return "ACC" + Math.floor(10000000 + Math.random() * 90000000);
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN");
  }

  function capitalizeWords(str) {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function loadCustomers() {
    const customers = JSON.parse(localStorage.getItem("customers") || "[]");
    renderCustomers(customers);
  }

  function filterCustomers() {
    const searchTerm = searchCustomerInput.value.toLowerCase();
    const filterValue = filterCustomerSelect.value;
    const customers = JSON.parse(localStorage.getItem("customers") || "[]");
    const filteredCustomers = customers.filter((customer) => {
      if (filterValue !== "all" && customer.status !== filterValue) {
        return false;
      }
      if (searchTerm) {
        const searchFields = [
          customer.customerName,
          customer.accountNumber,
          customer.id,
          customer.email,
          customer.contactNumber,
        ];
        return searchFields.some(
          (field) =>
            field && field.toString().toLowerCase().includes(searchTerm),
        );
      }
      return true;
    });
    renderCustomers(filteredCustomers);
  }

  function renderCustomers(customers) {
    if (!customerList) return;
    customerList.innerHTML = "";
    if (customers.length === 0) {
      customerList.innerHTML = `
              <tr>
                <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">
                  No customers found. Create a new customer to get started.
                </td>
              </tr>
            `;
      if (customerCount) {
        customerCount.textContent = "0";
      }
      return;
    }
    customers.forEach((customer) => {
      const row = document.createElement("tr");
      row.className = "hover:bg-gray-50";

      const statusClass =
        customer.status === "active"
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800";

      row.innerHTML = `
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ${customer.id}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${customer.customerName}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${customer.accountNumber}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${formatCurrency(customer.accountBalance)}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                  ${capitalizeWords(customer.status)}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  <button class="view-customer-btn text-cyan-600 hover:text-cyan-900" data-id="${customer.id}">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="edit-customer-btn text-cyan-600 hover:text-cyan-900" data-id="${customer.id}">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="delete-customer-btn text-red-600 hover:text-red-900" data-id="${customer.id}">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </td>
            `;
      customerList.appendChild(row);
    });
    if (customerCount) {
      customerCount.textContent = customers.length;
    }
    addCustomerActionListeners();
  }

  function addCustomerActionListeners() {
    document.querySelectorAll(".view-customer-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const customerId = this.getAttribute("data-id");
        viewCustomer(customerId);
      });
    });

    document.querySelectorAll(".edit-customer-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const customerId = this.getAttribute("data-id");
        openEditCustomerModal(customerId);
      });
    });

    document.querySelectorAll(".delete-customer-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const customerId = this.getAttribute("data-id");
        openDeleteModal(customerId);
      });
    });
  }

  function openAddCustomerModal() {
    document.getElementById("modal-title").textContent = "Add New Customer";
    customerForm.reset();

    const ssnId = generateSSNId();
    const accountNumber = generateAccountNumber();

    const customerIdField = document.getElementById("customerId");
    const accountNumberField = document.getElementById("accountNumber");

    customerIdField.value = ssnId;
    accountNumberField.value = accountNumber;

    customerIdField.setAttribute("readonly", "true");
    customerIdField.classList.add("bg-gray-100");
    accountNumberField.setAttribute("readonly", "true");
    accountNumberField.classList.add("bg-gray-100");

    const today = new Date().toISOString().split("T")[0];
    document.getElementById("dateOfBirth").max = today;

    customerModal.classList.remove("hidden");
  }

  function openEditCustomerModal(customerId) {
    const customers = JSON.parse(localStorage.getItem("customers") || "[]");
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return;

    document.getElementById("modal-title").textContent = "Edit Customer";

    const customerIdField = document.getElementById("customerId");
    const accountNumberField = document.getElementById("accountNumber");

    customerIdField.value = customer.id;
    accountNumberField.value = customer.accountNumber;

    customerIdField.setAttribute("readonly", "true");
    customerIdField.classList.add("bg-gray-100");
    accountNumberField.setAttribute("readonly", "true");
    accountNumberField.classList.add("bg-gray-100");

    document.getElementById("customerName").value = customer.customerName;
    document.getElementById("ifscCode").value = customer.ifscCode;
    document.getElementById("accountBalance").value = customer.accountBalance;
    document.getElementById("aadhaarCardNo").value = customer.aadhaarCardNo;
    document.getElementById("panCardNo").value = customer.panCardNo;
    document.getElementById("dateOfBirth").value = customer.dateOfBirth;
    document.getElementById("gender").value = customer.gender;
    document.getElementById("maritalStatus").value = customer.maritalStatus;
    document.getElementById("email").value = customer.email;
    document.getElementById("contactNumber").value = customer.contactNumber;
    document.getElementById("status").value = customer.status;
    document.getElementById("address").value = customer.address;

    customerModal.classList.remove("hidden");
  }

  function closeCustomerModal() {
    customerModal.classList.add("hidden");
    customerForm.reset();

    const customerIdField = document.getElementById("customerId");
    const accountNumberField = document.getElementById("accountNumber");

    customerIdField.removeAttribute("readonly");
    customerIdField.classList.remove("bg-gray-100");
    accountNumberField.removeAttribute("readonly");
    accountNumberField.classList.remove("bg-gray-100");
  }

  function showSuccessModal(message) {
    successModalMessage.textContent = message;
    successModal.classList.remove("hidden");
  }

  function closeSuccessMessageModal() {
    successModal.classList.add("hidden");
  }

  function handleCustomerFormSubmit(e) {
    e.preventDefault();

    const customerId = document.getElementById("customerId").value;
    const customers = JSON.parse(localStorage.getItem("customers") || "[]");
    const existingCustomerIndex = customers.findIndex(
      (c) => c.id === customerId,
    );
    const isExistingCustomer = existingCustomerIndex !== -1;

    const customerData = {
      id: customerId,
      accountNumber: document.getElementById("accountNumber").value,
      ifscCode: document.getElementById("ifscCode").value,
      accountBalance: parseFloat(
        document.getElementById("accountBalance").value,
      ),
      customerName: document.getElementById("customerName").value,
      aadhaarCardNo: document.getElementById("aadhaarCardNo").value,
      panCardNo: document.getElementById("panCardNo").value,
      dateOfBirth: document.getElementById("dateOfBirth").value,
      gender: document.getElementById("gender").value,
      maritalStatus: document.getElementById("maritalStatus").value,
      email: document.getElementById("email").value,
      contactNumber: document.getElementById("contactNumber").value,
      status: document.getElementById("status").value,
      address: document.getElementById("address").value,
      createdAt: isExistingCustomer
        ? customers[existingCustomerIndex].createdAt
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isExistingCustomer) {
      customers[existingCustomerIndex] = customerData;
      localStorage.setItem("customers", JSON.stringify(customers));
      showSuccessModal("Customer updated successfully");
    } else {
      customers.push(customerData);
      localStorage.setItem("customers", JSON.stringify(customers));
      showSuccessModal("Customer added successfully");
    }

    loadCustomers();
    closeCustomerModal();
  }

  function viewCustomer(customerId) {
    const customers = JSON.parse(localStorage.getItem("customers") || "[]");
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return;

    document.getElementById("viewCustomerId").textContent = customer.id;
    document.getElementById("viewCustomerName").textContent =
      customer.customerName;
    document.getElementById("viewAccountNumber").textContent =
      customer.accountNumber;
    document.getElementById("viewIfscCode").textContent = customer.ifscCode;
    document.getElementById("viewAccountBalance").textContent = formatCurrency(
      customer.accountBalance,
    );
    document.getElementById("viewStatus").textContent = capitalizeWords(
      customer.status,
    );
    document.getElementById("viewAadhaarCardNo").textContent =
      customer.aadhaarCardNo;
    document.getElementById("viewPanCardNo").textContent = customer.panCardNo;
    document.getElementById("viewDateOfBirth").textContent = formatDate(
      customer.dateOfBirth,
    );
    document.getElementById("viewGender").textContent = capitalizeWords(
      customer.gender,
    );
    document.getElementById("viewMaritalStatus").textContent = capitalizeWords(
      customer.maritalStatus,
    );
    document.getElementById("viewEmail").textContent = customer.email;
    document.getElementById("viewContactNumber").textContent =
      customer.contactNumber;
    document.getElementById("viewAddress").textContent = customer.address;

    viewCustomerModal.classList.remove("hidden");
  }

  function closeViewCustomerModal() {
    viewCustomerModal.classList.add("hidden");
  }

  function openDeleteModal(customerId) {
    currentCustomerId = customerId;
    deleteModal.classList.remove("hidden");
  }

  function closeDeleteModal() {
    deleteModal.classList.add("hidden");
    currentCustomerId = null;
  }

  function deleteCustomer() {
    if (!currentCustomerId) return;

    const customers = JSON.parse(localStorage.getItem("customers") || "[]");
    const updatedCustomers = customers.filter(
      (c) => c.id !== currentCustomerId,
    );

    localStorage.setItem("customers", JSON.stringify(updatedCustomers));
    closeDeleteModal();
    showSuccessModal("Customer deleted successfully");
    loadCustomers();
  }

  init();
});
