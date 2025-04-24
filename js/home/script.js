document.addEventListener("DOMContentLoaded", () => {
  const customers = JSON.parse(localStorage.getItem("customers") || "[]");
  const transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
  const loans = JSON.parse(localStorage.getItem("loans") || "[]");
  document.getElementById("totalCustomers").textContent = customers.length;
  document.getElementById("totalTransactions").textContent =
    transactions.length;
  document.getElementById("activeLoans").textContent = loans.filter(
    (l) => l.status === "approved",
  ).length;
  document.getElementById("totalBalance").textContent =
    `₹${customers.reduce((sum, c) => sum + c.accountBalance, 0).toLocaleString()}`;
});
