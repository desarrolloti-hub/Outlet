const modal = document.getElementById("modal");
const openModal = document.getElementById("openModal");
const closeModal = document.getElementById("closeModal");

const orderForm = document.getElementById("orderForm");
const ordersTable = document.getElementById("ordersTable");

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

/* ELIMINAR PEDIDO */
function addDeleteFunction(button) {
  button.addEventListener("click", () => {
    button.closest("tr").remove();
  });
}

/* COMPLETAR PEDIDO */
function addCompleteFunction(button) {
  button.addEventListener("click", () => {
    const row = button.closest("tr");
    const status = row.querySelector(".status");

    if (status.classList.contains("pending")) {
      status.textContent = "Completado";
      status.classList.remove("pending");
      status.classList.add("completed");
      
      // Cambiar estilo del botón visualmente
      button.style.opacity = "0.5";
      button.disabled = true;
    }
  });
}

/* BOTONES EXISTENTES */
document.querySelectorAll(".delete-btn").forEach((button) => {
  addDeleteFunction(button);
});

document.querySelectorAll(".complete-btn").forEach((button) => {
  addCompleteFunction(button);
});

/* AGREGAR PEDIDO */
orderForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const client = document.getElementById("client").value;
  const product = document.getElementById("product").value;
  const total = document.getElementById("total").value;

  const orderId = "#" + Math.floor(Math.random() * 9000 + 1000);

  const row = document.createElement("tr");

  row.innerHTML = `
    <td class="id-cell">${orderId}</td>
    <td class="client-cell">${client}</td>
    <td class="product-cell">${product}</td>
    <td class="total-cell">$${parseInt(total).toLocaleString()}</td>
    <td>
      <span class="status pending">Pendiente</span>
    </td>
    <td class="actions-cell">
      <div class="actions">
        <button class="complete-btn">
          <i class="fa-solid fa-check"></i>
          Completar
        </button>
        <button class="delete-btn">
          <i class="fa-solid fa-trash"></i>
          Eliminar
        </button>
      </div>
    </td>
  `;

  ordersTable.appendChild(row);

  addDeleteFunction(row.querySelector(".delete-btn"));
  addCompleteFunction(row.querySelector(".complete-btn"));

  orderForm.reset();
  modal.style.display = "none";
});