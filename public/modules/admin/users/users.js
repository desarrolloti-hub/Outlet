const modal = document.getElementById("modal");
const openModal = document.getElementById("openModal");
const closeModal = document.getElementById("closeModal");

const userForm = document.getElementById("userForm");
const userTable = document.getElementById("userTable");

/* ABRIR MODAL */
openModal.addEventListener("click", () => {
  modal.style.display = "flex";
});

/* CERRAR MODAL */
closeModal.addEventListener("click", () => {
  modal.style.display = "none";
});

/* CERRAR AFUERA */
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

/* ELIMINAR USUARIO */
function addDeleteFunction(button) {
  button.addEventListener("click", () => {
    button.closest("tr").remove();
  });
}

document.querySelectorAll(".delete-btn").forEach((button) => {
  addDeleteFunction(button);
});

/* AGREGAR USUARIO */
userForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const role = document.getElementById("role").value;
  const image = document.getElementById("image").value;

  const row = document.createElement("tr");

  // Determinar la clase del rol
  const roleClass = role === "Administrador" ? "admin" : "client";

  row.innerHTML = `
    <td class="image-cell">
      <img src="${image}" class="user-img" onerror="this.src='https://randomuser.me/api/portraits/lego/1.jpg'">
    </td>
    <td class="name-cell">${name}</td>
    <td class="email-cell">${email}</td>
    <td><span class="role-badge ${roleClass}">${role}</span></td>
    <td><span class="status active">Activo</span></td>
    <td class="actions-cell">
      <button class="delete-btn">
        <i class="fa-solid fa-trash"></i>
        Eliminar
      </button>
    </td>
  `;

  userTable.appendChild(row);

  addDeleteFunction(row.querySelector(".delete-btn"));

  userForm.reset();

  modal.style.display = "none";
});