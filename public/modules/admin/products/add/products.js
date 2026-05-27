const productForm = document.getElementById("productForm");

// Auto-generar slug desde el nombre (mejora opcional)
const nameInput = document.getElementById("name");
const slugInput = document.getElementById("slug");

nameInput.addEventListener("blur", () => {
    if (!slugInput.value) {
        const slug = nameInput.value
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
        slugInput.value = slug;
    }
});

productForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const product = {
        name: document.getElementById("name").value,
        slug: document.getElementById("slug").value,
        description: document.getElementById("description").value,
        brand: document.getElementById("brand").value,
        category: document.getElementById("category").value,
        subcategory: document.getElementById("subcategory").value,
        gender: document.getElementById("gender").value,
        salePrice: Number(document.getElementById("salePrice").value) || 0,
        purchasePrice: Number(document.getElementById("purchasePrice").value) || 0,
        discount: Number(document.getElementById("discount").value) || 0,
        mainImage: document.getElementById("mainImage").value,
        extraImages: document.getElementById("extraImages").value
            .split(",")
            .map(img => img.trim())
            .filter(img => img),
        colors: document.getElementById("colors").value
            .split(",")
            .map(c => c.trim())
            .filter(c => c),
        sizes: document.getElementById("sizes").value
            .split(",")
            .map(s => s.trim())
            .filter(s => s),
        material: document.getElementById("material").value,
        fitType: document.getElementById("fitType").value,
        composition: document.getElementById("composition").value,
        weight: Number(document.getElementById("weight").value) || 0,
        stock: Number(document.getElementById("stock").value) || 0
    };

    console.log("Producto creado:", product);
    
    // Mostrar mensaje de éxito con estilo
    alert("✨ ¡Producto agregado correctamente! ✨\n\nRevisa la consola para ver los datos.");
    
    productForm.reset();
});