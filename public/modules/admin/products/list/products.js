const modal = document.getElementById("modal");
const openModal = document.getElementById("openModal");
const closeModal = document.getElementById("closeModal");

const productForm = document.getElementById("productForm");
const productTable = document.getElementById("productTable");

/* ABRIR MODAL */
openModal.addEventListener("click", () => {
  modal.classList.remove("hidden");
});

/* CERRAR MODAL */
closeModal.addEventListener("click", () => {
  modal.classList.add("hidden");
});

/* CERRAR SI DAN CLICK AFUERA */
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.add("hidden");
  }
});

/* AGREGAR PRODUCTO */
productForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const price = document.getElementById("price").value;
  const category = document.getElementById("category").value;
  const image = document.getElementById("image").value;

  const row = document.createElement("tr");

  row.innerHTML = `
    <td class="image-cell">
      <img src="${image}" class="product-img" onerror="this.src='https://placehold.co/400?text=No+Image'">
    </td>
    <td class="name-cell">${name}</td>
    <td class="price-cell">$${parseInt(price).toLocaleString()}</td>
    <td>${category}</td>
    <td class="actions-cell">
      <button class="delete-btn">
        <i class="fa-solid fa-trash"></i>
        Eliminar
      </button>
    </td>
  `;

  productTable.appendChild(row);

  addDeleteFunction(row.querySelector(".delete-btn"));

  productForm.reset();

  modal.classList.add("hidden");
});

/* ELIMINAR PRODUCTO */
function addDeleteFunction(button) {
  button.addEventListener("click", () => {
    button.closest("tr").remove();
  });
}

/* BOTONES YA EXISTENTES */
document.querySelectorAll(".delete-btn").forEach((button) => {
  addDeleteFunction(button);
});