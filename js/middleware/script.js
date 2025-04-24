function checkAuthenticated() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const path = window.location.pathname;

  const segments = path.split("/");
  const baseSegments = segments.slice(
    0,
    segments.findIndex((seg) => seg === "pages") || segments.length - 1,
  );
  const basePath = baseSegments.join("/");

  const isAuthPage =
    path.endsWith("/login.html") || path.endsWith("/register.html");

  if (currentUser && isAuthPage) {
    window.location.href = basePath + "/dashboard.html";
  }

  if (!currentUser && !isAuthPage) {
    window.location.href = basePath + "/login.html";
  }
}

checkAuthenticated();
