const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const forms = document.querySelectorAll(".contact-form");
const authTabs = document.querySelectorAll(".auth-tab");
const authForms = document.querySelectorAll(".auth-form");
const orderButtons = document.querySelectorAll(".order-plan");
const adminForm = document.querySelector(".admin-form");
const adminLogin = document.querySelector("#admin-login");
const adminPanel = document.querySelector("#admin-panel");
const adminOrders = document.querySelector("#admin-orders");
const adminTotal = document.querySelector("#admin-total");
const adminTotalValue = document.querySelector("#admin-total-value");
const emptyOrders = document.querySelector("#empty-orders");
const adminLogout = document.querySelector(".admin-logout");

const currentPage = window.location.pathname.split("/").pop() || "index.html";
const isLoginPage = currentPage === "login.html";
const isAdminPage = currentPage === "panel.html";
const usersKey = "hirolyUsers";
const sessionKey = "hirolySession";
const ordersKey = "hirolyOrders";
const adminSessionKey = "hirolyAdminSession";
const ownerEmail = "dueno@gmai.com";
const ownerPassword = "dueño1616";

const getUsers = () => JSON.parse(localStorage.getItem(usersKey) || "{}");
const saveUsers = (users) => localStorage.setItem(usersKey, JSON.stringify(users));
const getSession = () => JSON.parse(localStorage.getItem(sessionKey) || "null");
const getOrders = () => JSON.parse(localStorage.getItem(ordersKey) || "[]");
const saveOrders = (orders) => localStorage.setItem(ordersKey, JSON.stringify(orders));
const normalizeEmail = (email) => email.trim().toLowerCase();
const commonEmailTypos = {
  "gmai.com": "gmail.com",
  "gmial.com": "gmail.com",
  "gamil.com": "gmail.com",
  "hotmial.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "outlok.com": "outlook.com",
  "outloo.com": "outlook.com",
};

const getEmailError = (email) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const domain = email.split("@")[1] || "";

  if (!emailPattern.test(email)) {
    return "Ingresa un correo valido. Ejemplo: nombre@gmail.com";
  }

  if (commonEmailTypos[domain]) {
    return `Ese dominio parece estar mal escrito. Quisiste decir ${commonEmailTypos[domain]}?`;
  }

  return "";
};

if (!isLoginPage && !isAdminPage && !getSession()) {
  const next = encodeURIComponent(currentPage + window.location.search);
  window.location.href = `login.html?next=${next}`;
}

if (isAdminPage && localStorage.getItem(adminSessionKey) !== "active") {
  window.location.href = "login.html?next=panel.html";
}

if (isLoginPage && localStorage.getItem(adminSessionKey) === "active") {
  window.location.href = "panel.html";
}

if (isLoginPage && getSession()) {
  window.location.href = "index.html";
}

if (navLinks && getSession()) {
  const logoutButton = document.createElement("button");
  logoutButton.className = "nav-logout";
  logoutButton.type = "button";
  logoutButton.textContent = "Cerrar sesion";
  logoutButton.addEventListener("click", () => {
    localStorage.removeItem(sessionKey);
    window.location.href = "login.html";
  });
  navLinks.appendChild(logoutButton);
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      navLinks.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });
}

authTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.authTab;

    authTabs.forEach((item) => item.classList.toggle("is-active", item === tab));
    authForms.forEach((form) => {
      form.classList.toggle("is-active", form.dataset.authForm === target);
    });
  });
});

authForms.forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const status = form.querySelector(".auth-status");
    const formData = new FormData(form);
    const mode = form.dataset.authForm;
    const email = normalizeEmail(String(formData.get("email") || ""));
    const password = String(formData.get("password") || "");
    const users = getUsers();

    if (mode === "login" && email === ownerEmail && password === ownerPassword) {
      localStorage.setItem(adminSessionKey, "active");
      window.location.href = "panel.html";
      return;
    }

    if (mode === "register") {
      if (email === ownerEmail) {
        status.textContent = "Este correo pertenece al acceso del dueno. Inicia sesion.";
        return;
      }

      const emailError = getEmailError(email);

      if (emailError) {
        status.textContent = emailError;
        return;
      }

      if (users[email]) {
        status.textContent = "Ya estas usando esta cuenta.";
        return;
      }

      users[email] = {
        name: String(formData.get("name") || "Cliente"),
        email,
        password,
      };

      saveUsers(users);
      localStorage.setItem(sessionKey, JSON.stringify({ email, name: users[email].name }));
      window.location.href = "index.html";
      return;
    }

    const emailError = getEmailError(email);

    if (emailError) {
      status.textContent = emailError;
      return;
    }

    if (!users[email]) {
      status.textContent = "No existe una cuenta registrada con ese correo.";
      return;
    }

    if (users[email].password !== password) {
      status.textContent = "Contrasena incorrecta. Intenta nuevamente.";
      return;
    }

    localStorage.setItem(sessionKey, JSON.stringify({ email, name: users[email].name }));
    const params = new URLSearchParams(window.location.search);
    window.location.href = params.get("next") || "index.html";
  });
});

orderButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const session = getSession();

    if (!session) {
      window.location.href = "login.html?next=planes.html";
      return;
    }

    const order = {
      id: Date.now(),
      date: new Date().toLocaleString("es-CL"),
      customerName: session.name || "Cliente",
      customerEmail: session.email,
      plan: button.dataset.plan,
      price: Number(button.dataset.price),
      modules: Number(button.dataset.modules),
    };
    const orders = getOrders();

    orders.push(order);
    saveOrders(orders);

    const inlineStatus = button.closest(".plan")?.querySelector(".plan-inline-status");

    document.querySelectorAll(".plan-inline-status").forEach((status) => {
      status.textContent = "";
    });

    if (inlineStatus) {
      inlineStatus.textContent = `Pedido registrado: ${order.plan} - $${order.price} USD. Nos pondremos en contacto con usted por correo.`;
    }
  });
});

forms.forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formStatus = form.querySelector(".form-status");
    const mailTo = form.dataset.mailTo;

    if (mailTo) {
      const formData = new FormData(form);
      const entries = Array.from(formData.entries()).filter(([name]) => !name.startsWith("_"));
      const customerName = formData.get("name") || "Sin nombre";
      const subject = `Nueva consulta web de ${customerName}`;
      const labels = {
        name: "Nombre",
        email: "Correo",
        message: "Que quiere hacer",
      };
      const body = entries
        .map(([name, value]) => `${labels[name] || name}: ${value || "Sin informacion"}`)
        .join("\n");

      if (formStatus) {
        formStatus.textContent = "Se abrira el correo con todos los datos listos para enviar.";
      }

      window.location.href = `mailto:${mailTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      form.reset();
      return;
    }

    if (formStatus) {
      formStatus.textContent = "Consulta lista.";
    }

    form.reset();
  });
});

const renderAdminOrders = () => {
  if (!adminOrders) {
    return;
  }

  const orders = getOrders().sort((a, b) => b.id - a.id);
  const totalValue = orders.reduce((sum, order) => sum + Number(order.price || 0), 0);

  adminOrders.innerHTML = "";
  adminTotal.textContent = String(orders.length);
  adminTotalValue.textContent = `$${totalValue} USD`;
  emptyOrders.hidden = orders.length > 0;

  orders.forEach((order) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${order.date}</td>
      <td>${order.customerName}</td>
      <td>${order.customerEmail}</td>
      <td>${order.plan}</td>
      <td>${order.modules}</td>
      <td>$${order.price} USD</td>
      <td><button class="delete-order" type="button" data-order-id="${order.id}">Borrar</button></td>
    `;
    adminOrders.appendChild(row);
  });
};

if (adminOrders) {
  adminOrders.addEventListener("click", (event) => {
    const deleteButton = event.target.closest(".delete-order");

    if (!deleteButton) {
      return;
    }

    const orderId = Number(deleteButton.dataset.orderId);
    const updatedOrders = getOrders().filter((order) => Number(order.id) !== orderId);

    saveOrders(updatedOrders);
    renderAdminOrders();
  });
}

const showAdminPanel = () => {
  if (adminLogin && adminPanel) {
    adminLogin.hidden = true;
    adminPanel.hidden = false;
    renderAdminOrders();
  }
};

if (isAdminPage && localStorage.getItem(adminSessionKey) === "active") {
  showAdminPanel();
}

if (adminForm) {
  adminForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const status = adminForm.querySelector(".auth-status");
    const formData = new FormData(adminForm);
    const user = String(formData.get("admin-user") || "").trim();
    const password = String(formData.get("admin-password") || "");

    if (user === ownerEmail && password === ownerPassword) {
      localStorage.setItem(adminSessionKey, "active");
      showAdminPanel();
      return;
    }

    status.textContent = "Usuario o contrasena de admin incorrectos.";
  });
}

if (adminLogout) {
  adminLogout.addEventListener("click", () => {
    localStorage.removeItem(adminSessionKey);
    window.location.reload();
  });
}
