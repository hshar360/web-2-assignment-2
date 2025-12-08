//
// ============================================================
//   BROWSE FILTER STATE
// ============================================================
//

let browseFilters = {
    gender: [],
    category: [],
    size: [],
    color: []
};

let browseSort = "name"; // default sort



//
// ============================================================
//   GLOBAL STATE
// ============================================================
//

let products = [];           // All product data from JSON
let cart = [];               // Shopping cart (persisted in localStorage)
const DATA_KEY = "a2-products";
const CART_KEY = "a2-cart";

//
// ============================================================
//   VIEW SWITCHING SYSTEM (Required for SPA)
// ============================================================
//
function showView(viewId) {
    const views = document.querySelectorAll("article.view");

    for (let i = 0; i < views.length; i++) {
        views[i].classList.add("hidden");
    }

    document.getElementById(viewId).classList.remove("hidden");
}


//
// ============================================================
//   INITIALIZATION (runs when page loads)
// ============================================================
//
document.addEventListener("DOMContentLoaded", function () {
    loadProducts();
    loadCart();
    updateCartCount();

    // Home
    renderHomePage();

    // Browse
    setupBrowseEvents();

    // Cart Button
    document.querySelector("[data-view='cart']").addEventListener("click", function () {
        renderCartPage();
        showView("cart-view");
    });

    // Home button (optional but recommended)
    document.querySelector("[data-view='home']").addEventListener("click", function () {
        showView("home-view");
        renderHomePage();
    });

    // Browse button (already working)
    document.querySelector("[data-view='browse']").addEventListener("click", function () {
        showView("browse-view");
        renderBrowseResults();
    });

    // About dialog (if desired)
    setupAboutDialog();
});


function setupAboutDialog() {
  const dialog = document.getElementById("about-dialog");
  const openBtn = document.querySelector("[data-view='about']");
  const closeBtn = document.getElementById("about-close-button");

  const nameSpan = document.getElementById("about-student-name");
  const yearSpan = document.getElementById("about-year");
  const githubLink = document.getElementById("about-github-link");

  // Fill the dynamic values
  if (nameSpan) nameSpan.textContent = "Haniya Shareef";
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();
  if (githubLink) githubLink.href = "https://github.com/YOUR_USER/YOUR_REPO";

  // Open dialog
  if (openBtn && dialog) {
    openBtn.addEventListener("click", function (e) {
      e.preventDefault();
      dialog.showModal();
    });
  }

  // Close dialog
  if (closeBtn && dialog) {
    closeBtn.addEventListener("click", function () {
      dialog.close();
    });
  }
}



//
// ============================================================
//   FETCH + LOCALSTORAGE PRODUCT LOADING SYSTEM
// ============================================================
//
function loadProducts() {
    // 1. Check if products already exist in localStorage
    let stored = localStorage.getItem(DATA_KEY);

    if (stored) {
        // Already stored from earlier — use local copy (faster!)
        products = JSON.parse(stored);
        console.log("Loaded products from localStorage:", products.length);
    } else {
        // FIRST TIME → Fetch from API, then store locally
        console.log("Fetching product data from API...");

        fetch("https://gist.githubusercontent.com/rconnolly/d37a491b50203d66d043c26f33dbd798/raw/37b5b68c527ddbe824eaed12073d266d5455432a/clothing-compact.json")
            .then(function (response) {
                if (!response.ok) {
                    throw new Error("Network response was not ok: " + response.status);
                }
                return response.json();
            })
            .then(function (data) {
                products = data;

                // Save JSON to localStorage STRINGIFIED
                localStorage.setItem(DATA_KEY, JSON.stringify(products));

                console.log("Products fetched + saved to localStorage:", products.length);
            })
            .catch(function (err) {
                console.error("Error fetching product JSON:", err);
            });
    }
}

//
// ============================================================
//   CART SYSTEM (ALSO USING LOCALSTORAGE) — Lab 10 Style
// ============================================================
//
function loadCart() {
    let storedCart = localStorage.getItem(CART_KEY);

    if (storedCart) {
        cart = JSON.parse(storedCart);
    } else {
        cart = [];
    }
}

function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function updateCartCount() {
    let countEl = document.getElementById("cart-count");
    let totalQty = 0;

    for (let i = 0; i < cart.length; i++) {
        totalQty += cart[i].quantity;
    }

    countEl.textContent = totalQty;
}

//
// ============================================================
//   ADD TO CART (will be used later in Single Product & Browse)
// ============================================================
//
function addToCart(productId, size, color, qty) {
    qty = Number(qty);

    // Check if item already exists (same ID, size, color)
    let existing = cart.find(function (item) {
        return (
            item.id === productId &&
            item.size === size &&
            item.color === color
        );
    });

    if (existing) {
        existing.quantity += qty;
    } else {
        cart.push({
            id: productId,
            size: size,
            color: color,
            quantity: qty
        });
    }

    saveCart();
    updateCartCount();
    showToast("Item added to cart!");
}

//
// ============================================================
//   SIMPLE TOASTER NOTIFICATION (Lab 9b Style)
// ============================================================
//
function showToast(message) {
    // Create toast element
    let toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;

    document.body.appendChild(toast);

    // Fade-in effect
    setTimeout(function () {
        toast.classList.add("show");
    }, 10);

    // Remove after 2 seconds
    setTimeout(function () {
        toast.classList.remove("show");

        setTimeout(function () {
            toast.remove();
        }, 300);

    }, 2000);
}


//
// ============================================================
//   HOME PAGE RENDERING
// ============================================================
//

function renderHomePage() {
    // Wait until products are actually loaded
    if (products.length === 0) {
        // Data not yet loaded — try again after a short delay
        setTimeout(renderHomePage, 100);
        return;
    }

    // Select container
    const grid = document.querySelector("#home-view .featured-grid");

    // Clear existing placeholder items
    grid.innerHTML = "";

    // Pick 4 featured products
    let featured = products.slice(0, 4);

    featured.forEach(function (prod) {
        // Create card container
        let card = document.createElement("article");
        card.className = "featured-card";

        // Product title
        let title = document.createElement("h3");
        title.textContent = prod.name;

        // Price
        let price = document.createElement("p");
        price.textContent = "$" + prod.price.toFixed(2);

        // Button
        let btn = document.createElement("button");
        btn.type = "button";
        btn.className = "primary-btn";
        btn.textContent = "View Product";

        // When clicked → open Single Product view
        btn.addEventListener("click", function () {
            showSingleProduct(prod.id);
        });

        // Build card
        card.appendChild(title);
        card.appendChild(price);
        card.appendChild(btn);

        grid.appendChild(card);
    });
}

//
// ============================================================
//   SINGLE PRODUCT VIEW
// ============================================================
//

function showSingleProduct(productId) {
    // Find product by ID
    let product = products.find(function (p) {
        return p.id === productId;
    });

    if (!product) {
        console.error("Product not found:", productId);
        return;
    }

    // Populate all fields
    document.getElementById("product-name").textContent = product.name;
    document.getElementById("product-price").textContent = "$" + product.price.toFixed(2);
    document.getElementById("product-description").textContent = product.description;
    document.getElementById("product-material").textContent = product.material;
    document.getElementById("product-category").textContent = product.category;
    document.getElementById("product-gender").textContent = product.gender;

    // Sizes
    document.getElementById("product-sizes").textContent = product.sizes.join(", ");

    // Colors (names only)
    let colorNames = product.color.map(function (c) {
        return c.name;
    });
    document.getElementById("product-colors").textContent = colorNames.join(", ");

    // Reset quantity input
    document.getElementById("product-quantity").value = 1;

    // Build breadcrumb
    renderBreadcrumb(product);

    // Prepare Add to Cart handler
    setupAddToCartButton(product);

    // Render related products
    renderRelatedProducts(product);

    // Finally switch view
    showView("single-product-view");
}

//
// ============================================================
//   BROWSE EVENT SETUP
// ============================================================
//

function setupBrowseEvents() {
    //
    // 1. Filter checkboxes
    //
    const filterForm = document.getElementById("filter-form");
    filterForm.addEventListener("change", function () {
        updateFiltersFromForm();
        renderBrowseResults();
    });

    //
    // 2. Clear All button
    //
    const clearBtn = document.getElementById("clear-filters-btn");
    clearBtn.addEventListener("click", function () {
        clearAllFilters();
    });

    //
    // 3. Sort dropdown
    //
    document.getElementById("sort-by").addEventListener("change", function (e) {
        browseSort = e.target.value;
        renderBrowseResults();
    });
}

//
// ============================================================
//   UPDATE FILTER STATE
// ============================================================
//

function updateFiltersFromForm() {
    browseFilters = {
        gender: getCheckedValues("gender"),
        category: getCheckedValues("category"),
        size: getCheckedValues("size"),
        color: getCheckedValues("color")
    };
}

function getCheckedValues(name) {
    let checkboxes = document.querySelectorAll("input[name='" + name + "']:checked");
    let vals = [];

    for (let i = 0; i < checkboxes.length; i++) {
        vals.push(checkboxes[i].value);
    }

    return vals;
}

function clearAllFilters() {
    // Uncheck all checkboxes
    const checks = document.querySelectorAll("#filter-form input[type='checkbox']");
    for (let i = 0; i < checks.length; i++) {
        checks[i].checked = false;
    }

    // Reset filter state
    browseFilters = {
        gender: [],
        category: [],
        size: [],
        color: []
    };

    renderBrowseResults();
}


//
// ============================================================
//   MAIN BROWSE RESULTS RENDERER
// ============================================================
//

function renderBrowseResults() {
    if (products.length === 0) {
        setTimeout(renderBrowseResults, 100);
        return;
    }

    let results = products.slice();

    //
    // Apply each filter (AND logic)
    //

    // Gender
    if (browseFilters.gender.length > 0) {
        results = results.filter(function (p) {
            return browseFilters.gender.includes(p.gender);
        });
    }

    // Category
    if (browseFilters.category.length > 0) {
        results = results.filter(function (p) {
            return browseFilters.category.includes(p.category);
        });
    }

    // Size
    if (browseFilters.size.length > 0) {
        results = results.filter(function (p) {
            return p.sizes.some(function (s) {
                return browseFilters.size.includes(s);
            });
        });
    }

    // Color
    if (browseFilters.color.length > 0) {
        results = results.filter(function (p) {
            return p.color.some(function (c) {
                return browseFilters.color.includes(c.name);
            });
        });
    }

    //
    // Sorting
    //
    if (browseSort === "name") {
        results.sort(function (a, b) {
            return a.name.localeCompare(b.name);
        });
    } else if (browseSort === "price") {
        results.sort(function (a, b) {
            return a.price - b.price;
        });
    } else if (browseSort === "category") {
        results.sort(function (a, b) {
            return a.category.localeCompare(b.category);
        });
    }

    //
    // Display active filters
    //
    renderActiveFilters();

    //
    // Display results
    //
    const grid = document.getElementById("product-grid");
    const msg = document.getElementById("results-message");
    const count = document.getElementById("results-count");

    grid.innerHTML = "";
    msg.textContent = "";
    count.textContent = "Showing " + results.length + " products";

    if (results.length === 0) {
        msg.textContent = "No products match your filters.";
        return;
    }

    results.forEach(function (p) {
        grid.appendChild(createProductCard(p));
    });
}

function createProductCard(prod) {
    let card = document.createElement("article");
    card.className = "product-card";

    // Placeholder image
    let img = document.createElement("div");
    img.className = "product-img-placeholder";

    // Title
    let title = document.createElement("h3");
    title.textContent = prod.name;

    // Price
    let price = document.createElement("p");
    price.textContent = "$" + prod.price.toFixed(2);

    // View button
    let btn = document.createElement("button");
    btn.type = "button";
    btn.className = "secondary-btn";
    btn.textContent = "View";
    btn.addEventListener("click", function () {
        showSingleProduct(prod.id);
    });

    // Add to cart button (+)
    let addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "add-btn";
    addBtn.textContent = "+";
    addBtn.addEventListener("click", function () {
        let size = prod.sizes[0];
        let color = prod.color[0].name;
        addToCart(prod.id, size, color, 1);
    });
    


    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(price);
    card.appendChild(btn);
    card.appendChild(addBtn);

    return card;
}

function renderActiveFilters() {
    const container = document.getElementById("active-filters");
    container.innerHTML = "";

    let allFilters = [];

    for (let key in browseFilters) {
        browseFilters[key].forEach(function (val) {
            allFilters.push({ group: key, value: val });
        });
    }

    // If none → nothing to show
    if (allFilters.length === 0) {
        return;
    }

    allFilters.forEach(function (f) {
        let chip = document.createElement("span");
        chip.className = "filter-chip";
        chip.textContent = f.value + " ×";

        chip.addEventListener("click", function () {
            removeSingleFilter(f.group, f.value);
        });

        container.appendChild(chip);
    });
}

function removeSingleFilter(group, value) {
    browseFilters[group] = browseFilters[group].filter(function (v) {
        return v !== value;
    });

    // Uncheck relevant checkbox
    let selector = "input[name='" + group + "'][value='" + value + "']";
    let box = document.querySelector(selector);
    if (box) {
        box.checked = false;
    }

    renderBrowseResults();
}

document.querySelector("[data-view='browse']").addEventListener("click", function(){
    showView("browse-view");
    renderBrowseResults();
});

//
// ============================================================
//   CART PAGE RENDERING
// ============================================================
//

function renderCartPage() {
    const emptyMsg = document.getElementById("cart-empty-message");
    const cartMain = document.getElementById("cart-main");
    const tbody = document.getElementById("cart-items-body");

    tbody.innerHTML = "";

    if (cart.length === 0) {
        emptyMsg.classList.remove("hidden");
        cartMain.classList.add("hidden");
        updateCartSummary(0);
        return;
    }

    emptyMsg.classList.add("hidden");
    cartMain.classList.remove("hidden");

    let merchandiseTotal = 0;

    cart.forEach(function (item, index) {
        let product = products.find(function (p) {
            return p.id === item.id;
        });

        let subtotal = item.quantity * product.price;
        merchandiseTotal += subtotal;

        // Build table row
        let tr = document.createElement("tr");

        // Item name
        let tdName = document.createElement("td");
        tdName.textContent = product.name;

        // Color
        let tdColor = document.createElement("td");
        tdColor.textContent = item.color;

        // Size
        let tdSize = document.createElement("td");
        tdSize.textContent = item.size;

        // Price
        let tdPrice = document.createElement("td");
        tdPrice.textContent = "$" + product.price.toFixed(2);

        // Quantity with input field
        let tdQty = document.createElement("td");
        let qtyInput = document.createElement("input");
        qtyInput.type = "number";
        qtyInput.min = "1";
        qtyInput.value = item.quantity;
        qtyInput.addEventListener("change", function () {
            item.quantity = Number(qtyInput.value);
            saveCart();
            updateCartCount();
            renderCartPage();
        });
        tdQty.appendChild(qtyInput);

        // Subtotal
        let tdSubtotal = document.createElement("td");
        tdSubtotal.textContent = "$" + subtotal.toFixed(2);

        // Remove button
        let tdRemove = document.createElement("td");
        let btn = document.createElement("button");
        btn.textContent = "X";
        btn.className = "remove-btn";
        btn.addEventListener("click", function () {
            removeCartItem(index);
        });
        tdRemove.appendChild(btn);

        tr.appendChild(tdName);
        tr.appendChild(tdColor);
        tr.appendChild(tdSize);
        tr.appendChild(tdPrice);
        tr.appendChild(tdQty);
        tr.appendChild(tdSubtotal);
        tr.appendChild(tdRemove);

        tbody.appendChild(tr);
    });

    updateCartSummary(merchandiseTotal);
}

function removeCartItem(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartCount();
    renderCartPage();
}

//
// ============================================================
//   SUMMARY CALCULATIONS
// ============================================================
//

function updateCartSummary(merchTotal) {
    let method = document.querySelector("input[name='shipping-method']:checked").value;
    let destination = document.getElementById("shipping-destination").value;

    let shipping = calculateShipping(merchTotal, method, destination);
    let tax = calculateTax(merchTotal, shipping, destination);
    let total = merchTotal + shipping + tax;

    document.getElementById("summary-merchandise").textContent = "$" + merchTotal.toFixed(2);
    document.getElementById("summary-shipping").textContent = "$" + shipping.toFixed(2);
    document.getElementById("summary-tax").textContent = "$" + tax.toFixed(2);
    document.getElementById("summary-total").textContent = "$" + total.toFixed(2);
}


function calculateShipping(merchTotal, method, dest) {
    if (merchTotal > 500) {
        return 0; // FREE SHIPPING
    }

    let costTable = {
        CA: { standard: 10, express: 25, priority: 35 },
        US: { standard: 15, express: 25, priority: 50 },
        INT: { standard: 20, express: 30, priority: 50 }
    };

    return costTable[dest][method];
}

function calculateTax(merchTotal, shipping, dest) {
    if (dest === "CA") {
        return (merchTotal + shipping) * 0.05;
    }
    return 0;
}

// Shipping method changed
let shipRadios = document.querySelectorAll("input[name='shipping-method']");
for (let i = 0; i < shipRadios.length; i++) {
    shipRadios[i].addEventListener("change", renderCartPage);
}

// Destination changed
document.getElementById("shipping-destination").addEventListener("change", renderCartPage);


document.getElementById("checkout-button").addEventListener("click", function () {
    if (cart.length === 0) {
        showToast("Your cart is empty.");
        return;
    }

    showToast("Order Completed!");
    cart = [];
    saveCart();
    updateCartCount();

    showView("home-view");
});

function showView(viewId) {
    const views = document.querySelectorAll("article.view");

    for (let i = 0; i < views.length; i++) {
        views[i].classList.add("hidden");
    }

    document.getElementById(viewId).classList.remove("hidden");
}

function renderBreadcrumb(product) {
    let bc = document.getElementById("breadcrumb-list");
    bc.innerHTML = "";

    let li1 = document.createElement("li");
    li1.textContent = "Home";
    bc.appendChild(li1);

    let li2 = document.createElement("li");
    li2.textContent = product.gender;
    bc.appendChild(li2);

    let li3 = document.createElement("li");
    li3.textContent = product.category;
    bc.appendChild(li3);

    let li4 = document.createElement("li");
    li4.textContent = product.name;
    bc.appendChild(li4);
}


function setupAddToCartButton(product) {
    const form = document.getElementById("add-to-cart-form");

    form.onsubmit = function (event) {
        event.preventDefault();

        let qty = Number(document.getElementById("product-quantity").value);
        let size = product.sizes[0];
        let color = product.color[0].name;

        addToCart(product.id, size, color, qty);

        showToast("Added to cart!");
    };
}

function renderRelatedProducts(product) {
    let container = document.getElementById("related-products");
    container.innerHTML = "";

    let related = products.filter(function (p) {
        return p.category === product.category && p.id !== product.id;
    });

    related.slice(0, 3).forEach(function (p) {
        let card = document.createElement("article");
        card.className = "related-card";

        let title = document.createElement("h3");
        title.textContent = p.name;

        let price = document.createElement("p");
        price.textContent = "$" + p.price.toFixed(2);

        let btn = document.createElement("button");
        btn.className = "secondary-btn";
        btn.textContent = "View Product";

        btn.addEventListener("click", function () {
            showSingleProduct(p.id);
        });

        card.appendChild(title);
        card.appendChild(price);
        card.appendChild(btn);

        container.appendChild(card);
    });
}


