function generateId(prefix = "") {
  return (
    prefix + Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
  );
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function generateSSNId() {
  const prefix = "SSN";
  const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
  return `${prefix}${randomDigits}`;
}

function generateAccountNumber() {
  const bankCode = "2025";
  const branchCode = Math.floor(1000 + Math.random() * 9000).toString();
  const accountDigits = Math.floor(
    10000000 + Math.random() * 90000000,
  ).toString();
  return `${bankCode}${branchCode}${accountDigits}`;
}

function generateTransactionId() {
  const prefix = "TXN";
  const timestamp = new Date().getTime().toString().slice(-6);
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${timestamp}${randomDigits}`;
}

function generateLoanId() {
  const prefix = "LOAN";
  const year = new Date().getFullYear().toString().slice(-2);
  const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}${year}${month}${randomDigits}`;
}

function generateEmployeeId() {
  const prefix = "EMP";
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}${randomDigits}`;
}
