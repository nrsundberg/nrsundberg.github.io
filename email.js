var encEmail = "bm9haHN1bmRiZXJnQGdtYWlsLmNvbQ==";
const form = document.getElementById("contact");
form.setAttribute("href", "mailto:".concat(atob(encEmail)));