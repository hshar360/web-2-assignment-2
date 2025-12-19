// filters lists
let browseFilters = {
    gender: [],
    category: [],
    size: [],
    color: []
};
let browseSort = "name";

// global vars
let products = [];
let cart = [];
const DATA_KEY = "a2-products";
const CART_KEY = "a2-cart";

// show view 
function showView(viewId){
    let all = document.querySelectorAll("article.view");
    for (let i=0;i<all.length;i++){
        all[i].classList.add("hidden");
    }
    let v = document.getElementById(viewId);
    if(v) v.classList.remove("hidden");
}

// DOMcontentLoaded
document.addEventListener("DOMContentLoaded", function(){

    loadProducts();
    loadCart();
    updateCartCount();

    // home btn
    let homeBtn = document.querySelector("[data-view='home']");
    if(homeBtn){
        homeBtn.addEventListener("click", function(){
            showView("home-view");
            renderHomePage();
        });
    }

    // browse btn
    let browseBtn = document.querySelector("[data-view='browse']");
    if(browseBtn){
        browseBtn.addEventListener("click", function(){
            showView("browse-view");
            renderBrowseResults();
        });
    }

    // cart btn
    let cartBtn = document.querySelector("[data-view='cart']");
    if(cartBtn){
        cartBtn.addEventListener("click", function(){
            renderCartPage();
            showView("cart-view");
        });
    }

    setupBrowseEvents();
    setupAboutDialog();

});

// about
function setupAboutDialog(){
    let dlg = document.getElementById("about-dialog");
    let openBtn = document.querySelector("[data-view='about']");
    let closeBtn = document.getElementById("about-close-button");

    
    let sName = document.getElementById("about-student-name");
    if(sName) sName.textContent = "Haniya Shareef";

    let y = document.getElementById("about-year");
    if(y) y.textContent = new Date().getFullYear();

    let g = document.getElementById("about-github-link");
    if(g) g.href = "https://github.com/hshar360/web-2-assignment-2";

    if(openBtn && dlg){
        openBtn.addEventListener("click", function(e){
            dlg.showModal();
        });
    }

    if(closeBtn && dlg){
        closeBtn.addEventListener("click", function(){
            dlg.close();
        });
    }
}

// load products 

function loadProducts(){
    let stored = localStorage.getItem(DATA_KEY);

    if(stored){
        products = JSON.parse(stored);
    } else {
        fetch("https://gist.githubusercontent.com/rconnolly/d37a491b50203d66d043c26f33dbd798/raw/37b5b68c527ddbe824eaed12073d266d5455432a/clothing-compact.json")
            .then(function(res){
                return res.json();
            })
            .then(function(data){
                products = data;
                localStorage.setItem(DATA_KEY, JSON.stringify(products));
                renderHomePage();
                renderBrowseResults();
            })
            .catch(function(err){
                console.log("error loading json?", err);
            });
    }
}

// Cart functions 
function loadCart(){
    let c = localStorage.getItem(CART_KEY);
    if(c){
        cart = JSON.parse(c);
    } else {
        cart = [];
    }
}

function saveCart(){
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function updateCartCount(){
    let c = 0;
    for(let i=0;i<cart.length;i++){
        c += cart[i].quantity;
    }
    let el = document.getElementById("cart-count");
    if(el) el.textContent = c;
}

function addToCart(id, size, color, qty){
    qty = Number(qty);
    let found = cart.find(function(it){
        return it.id === id && it.size===size && it.color===color;
    });

    if(found){
        found.quantity += qty;
    } else {
        cart.push({id:id, size:size, color:color, quantity:qty});
    }

    saveCart();
    updateCartCount();
    popMsg("Added to cart!");
}

// pop- message
function popMsg(msg){
    let t = document.createElement("div");
    t.className = "msg";
    t.textContent = msg;
    document.body.appendChild(t);

    setTimeout(function(){
        t.classList.add("show");
    }, 10);

    setTimeout(function(){
        t.classList.remove("show");
        setTimeout(function(){ t.remove(); }, 300);
    }, 2000);
}

// Home view
function renderHomePage(){
    if(products.length===0){
        setTimeout(renderHomePage, 120);
        return;
    }

    let grid = document.querySelector("#home-view .featured-grid");
    if(!grid) return;

    grid.innerHTML = "";

    let picks = products.slice(0,4);
    for(let i=0;i<picks.length;i++){
        let p = picks[i];

        let card = document.createElement("article");
        card.className = "featured-card";

        let h = document.createElement("h3");
        h.textContent = p.name;

        let pr = document.createElement("p");
        pr.textContent = "$" + p.price.toFixed(2);

        let b = document.createElement("button");
        b.textContent = "View Product";
        b.className = "primary-btn";

        b.addEventListener("click", function(){
            showSingleProduct(p.id);
        });

        card.appendChild(h);
        card.appendChild(pr);
        card.appendChild(b);

        grid.appendChild(card);
    }
}

// single product view

function showSingleProduct(id){
    let p = products.find(function(x){ return x.id===id; });

    if(!p){
        console.log("no product??", id);
        return;
    }

    document.getElementById("product-name").textContent = p.name;
    document.getElementById("product-price").textContent = "$"+p.price.toFixed(2);
    document.getElementById("product-description").textContent = p.description;
    document.getElementById("product-material").textContent = p.material;
    document.getElementById("product-category").textContent = p.category;
    document.getElementById("product-gender").textContent = p.gender;
    document.getElementById("product-sizes").textContent = p.sizes.join(", ");
    document.getElementById("product-colors").textContent = p.color.map(function(c){return c.name}).join(", ");

    document.getElementById("product-quantity").value = 1;

    renderBreadcrumb(p);
    setupAddToCartButton(p);
    renderRelatedProducts(p);

    showView("single-product-view");
}

// breadcrumb trail

function renderBreadcrumb(p){
    let bc = document.getElementById("breadcrumb-list");
    bc.innerHTML = "";

    let a = document.createElement("li");
    a.textContent = "Home";

    let b = document.createElement("li");
    b.textContent = p.gender;

    let c = document.createElement("li");
    c.textContent = p.category;

    let d = document.createElement("li");
    d.textContent = p.name;

    bc.appendChild(a);
    bc.appendChild(b);
    bc.appendChild(c);
    bc.appendChild(d);
}

// add to cart btn

function setupAddToCartButton(p){
    let form = document.getElementById("add-to-cart-form");
    form.onsubmit = function(ev){
        ev.preventDefault();
        let q = Number(document.getElementById("product-quantity").value);
        let size = p.sizes[0];
        let col = p.color[0].name;
        addToCart(p.id, size, col, q);
    };
}

// show related products

function renderRelatedProducts(p){
    let box = document.getElementById("related-products");
    box.innerHTML = "";

    let rel = products.filter(function(x){
        return x.category===p.category && x.id!==p.id;
    });

    rel.slice(0,3).forEach(function(r){
        let c = document.createElement("article");
        c.className = "related-card";

        let t = document.createElement("h3");
        t.textContent = r.name;

        let pr = document.createElement("p");
        pr.textContent = "$"+r.price.toFixed(2);

        let btn = document.createElement("button");
        btn.textContent = "View Product";
        btn.className = "secondary-btn";

        btn.addEventListener("click", function(){
            showSingleProduct(r.id);
        });

        c.appendChild(t);
        c.appendChild(pr);
        c.appendChild(btn);

        box.appendChild(c);
    });
}

// Browse view

function setupBrowseEvents(){
    let f = document.getElementById("filter-form");
    f.addEventListener("change", function(){
        updateFiltersFromForm();
        renderBrowseResults();
    });

    let clr = document.getElementById("clear-filters-btn");
    clr.addEventListener("click", function(){
        clearAllFilters();
    });

    let sort = document.getElementById("sort-by");
    sort.addEventListener("change", function(e){
        browseSort = e.target.value;
        renderBrowseResults();
    });
}

function updateFiltersFromForm(){
    browseFilters.gender = getCheckedValues("gender");
    browseFilters.category = getCheckedValues("category");
    browseFilters.size = getCheckedValues("size");
    browseFilters.color = getCheckedValues("color");
}

function getCheckedValues(n){
    let boxes = document.querySelectorAll("input[name='"+n+"']:checked");
    let arr = [];
    for(let i=0;i<boxes.length;i++){
        arr.push(boxes[i].value);
    }
    return arr;
}

function clearAllFilters(){
    let boxes = document.querySelectorAll("#filter-form input[type='checkbox']");
    for(let i=0;i<boxes.length;i++){
        boxes[i].checked = false;
    }
    browseFilters = {gender:[],category:[],size:[],color:[]};
    renderBrowseResults();
}

function renderBrowseResults(){
    if(products.length===0){
        setTimeout(renderBrowseResults, 120);
        return;
    }

    let list = products.slice();

    if(browseFilters.gender.length>0){
        list = list.filter(function(p){ return browseFilters.gender.includes(p.gender); });
    }
    if(browseFilters.category.length>0){
        list = list.filter(function(p){ return browseFilters.category.includes(p.category); });
    }
    if(browseFilters.size.length>0){
        list = list.filter(function(p){
            return p.sizes.some(function(s){ return browseFilters.size.includes(s); });
        });
    }
    if(browseFilters.color.length>0){
        list = list.filter(function(p){
            return p.color.some(function(c){ return browseFilters.color.includes(c.name); });
        });
    }

    if(browseSort==="name"){
        list.sort(function(a,b){return a.name.localeCompare(b.name);});
    } else if(browseSort==="price"){
        list.sort(function(a,b){return a.price - b.price;});
    } else if(browseSort==="category"){
        list.sort(function(a,b){return a.category.localeCompare(b.category);});
    }

    renderActiveFilters();

    let grid = document.getElementById("product-grid");
    let msg = document.getElementById("results-message");
    let cnt = document.getElementById("results-count");

    grid.innerHTML = "";
    msg.textContent = "";
    cnt.textContent = "Showing " + list.length + " products";

    if(list.length===0){
        msg.textContent = "No products match your filters.";
        return;
    }

    list.forEach(function(p){
        grid.appendChild(createProductCard(p));
    });
}

function createProductCard(p){
    let c = document.createElement("article");
    c.className = "product-card";

    let img = document.createElement("div");
    img.className = "product-img-placeholder";

    let t = document.createElement("h3");
    t.textContent = p.name;

    let pr = document.createElement("p");
    pr.textContent = "$"+p.price.toFixed(2);

    let v = document.createElement("button");
    v.className = "secondary-btn";
    v.textContent = "View";
    v.addEventListener("click", function(){
        showSingleProduct(p.id);
    });

    let add = document.createElement("button");
    add.className = "add-btn";
    add.textContent = "+";
    add.addEventListener("click", function(){
        addToCart(p.id, p.sizes[0], p.color[0].name, 1);
    });

    c.appendChild(img);
    c.appendChild(t);
    c.appendChild(pr);
    c.appendChild(v);
    c.appendChild(add);

    return c;
}

function renderActiveFilters(){
    let box = document.getElementById("active-filters");
    box.innerHTML = "";

    let all = [];
    for(let k in browseFilters){
        browseFilters[k].forEach(function(v){
            all.push({group:k, value:v});
        });
    }
    if(all.length===0) return;

    all.forEach(function(f){
        let chip = document.createElement("span");
        chip.className = "filter-chip";
        chip.textContent = f.value + " ×";
        chip.addEventListener("click", function(){
            removeSingleFilter(f.group, f.value);
        });
        box.appendChild(chip);
    });
}

function removeSingleFilter(group,val){
    browseFilters[group] = browseFilters[group].filter(function(x){return x!==val;});
    let sel = "input[name='"+group+"'][value='"+val+"']";
    let box = document.querySelector(sel);
    if(box) box.checked = false;
    renderBrowseResults();
}

// cart view

function renderCartPage(){
    let empty = document.getElementById("cart-empty-message");
    let main = document.getElementById("cart-main");
    let body = document.getElementById("cart-items-body");

    body.innerHTML = "";

    if(cart.length===0){
        empty.classList.remove("hidden");
        main.classList.add("hidden");
        updateCartSummary(0);
        return;
    }

    empty.classList.add("hidden");
    main.classList.remove("hidden");

    let merch = 0;

    cart.forEach(function(it, idx){
        let p = products.find(function(x){return x.id===it.id;});
        let sub = p.price * it.quantity;
        merch += sub;

        let tr = document.createElement("tr");

        let name = document.createElement("td");
        name.textContent = p.name;

        let color = document.createElement("td");
        color.textContent = it.color;

        let size = document.createElement("td");
        size.textContent = it.size;

        let price = document.createElement("td");
        price.textContent = "$"+p.price.toFixed(2);

        let qty = document.createElement("td");
        let inp = document.createElement("input");
        inp.type = "number";
        inp.min = "1";
        inp.value = it.quantity;
        inp.addEventListener("change", function(){
            it.quantity = Number(inp.value);
            saveCart();
            updateCartCount();
            renderCartPage();
        });
        qty.appendChild(inp);

        let subtotal = document.createElement("td");
        subtotal.textContent = "$" + sub.toFixed(2);

        let rm = document.createElement("td");
        let btn = document.createElement("button");
        btn.textContent = "X";
        btn.className = "remove-btn";
        btn.addEventListener("click", function(){
            removeCartItem(idx);
        });
        rm.appendChild(btn);

        tr.appendChild(name);
        tr.appendChild(color);
        tr.appendChild(size);
        tr.appendChild(price);
        tr.appendChild(qty);
        tr.appendChild(subtotal);
        tr.appendChild(rm);

        body.appendChild(tr);
    });

    updateCartSummary(merch);
}

function removeCartItem(idx){
    cart.splice(idx,1);
    saveCart();
    updateCartCount();
    renderCartPage();
}

function updateCartSummary(merch){
    let method = document.querySelector("input[name='shipping-method']:checked").value;
    let dest = document.getElementById("shipping-destination").value;

    let ship = calculateShipping(merch, method, dest);
    let tax = calculateTax(merch, ship, dest);
    let total = merch + ship + tax;

    document.getElementById("summary-merchandise").textContent = "$"+merch.toFixed(2);
    document.getElementById("summary-shipping").textContent = "$"+ship.toFixed(2);
    document.getElementById("summary-tax").textContent = "$"+tax.toFixed(2);
    document.getElementById("summary-total").textContent = "$"+total.toFixed(2);
}

function calculateShipping(m, method, dest){
    if(m > 500) return 0;
    let t = {
        CA:{standard:10,express:25,priority:35},
        US:{standard:15,express:25,priority:50},
        INT:{standard:20,express:30,priority:50}
    };
    return t[dest][method];
}

function calculateTax(m, s, dest){
    if(dest==="CA") return (m+s)*0.05;
    return 0;
}

let ship = document.querySelectorAll("input[name='shipping-method']");
for(let i=0;i<ship.length;i++){
    ship[i].addEventListener("change", renderCartPage);
}
document.getElementById("shipping-destination").addEventListener("change", renderCartPage);

document.getElementById("checkout-button").addEventListener("click", function(){
    if(cart.length===0){
        popMsg("Your cart is empty.");
        return;
    }
    popMsg("Order Completed!");
    cart = [];
    saveCart();
    updateCartCount();
    showView("home-view");
});
