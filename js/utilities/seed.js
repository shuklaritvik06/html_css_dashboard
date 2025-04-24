function initializeStorage() {
  const defaults = {
    customers: [],
    transactions: [],
    loans: [],
    employees: [],
  };
  Object.keys(defaults).forEach((key) => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(defaults[key]));
    }
  });
}

initializeStorage();
