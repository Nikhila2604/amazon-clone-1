document.addEventListener("DOMContentLoaded", () => {

  console.log("Script Loaded");

  /* ===============================
     🔥 PRODUCT PAGE LOADING
  ================================ */
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  console.log("Product ID:", productId);

  const productListContainer = document.getElementById("productList");
  const cartItemsContainer = document.getElementById("cartItems");

  if (productListContainer) {
    loadProductList(productListContainer);
  }

  if (cartItemsContainer) {
    renderCartPage();
  }

  if (productId !== null) {

    fetch("./products.json")
      .then(res => res.json())
      .then(data => {

        console.log("JSON DATA:", data);

        const product = data.find(p => p.id == Number(productId));
        console.log("FOUND PRODUCT:", product);

        if (!product) {
          console.error("Product not found!");
          return;
        }

        /* ===============================
           BASIC DETAILS
        ================================ */

        // Title
        document.querySelector(".product-title").innerText = product.title;

        // Brand
        document.getElementById("productBrand").innerText =
          "Visit the " + product.brand + " Store";

        // Rating
        document.getElementById("productRating").innerText =
          product.rating + " ★★★★★";

        document.getElementById("productReviews").innerText =
          "(" + product.reviewCount + ")";

        document.getElementById("productBadge").innerText =
          product.badge;

        /* ===============================
           PRICE
        ================================ */
        document.getElementById("productPrice").innerText = product.price;
        document.getElementById("buyBoxPrice").innerText = product.price;

        document.getElementById("productMrp").innerText = product.mrp;
        document.getElementById("productDiscount").innerText =
          "-" + product.discountPercent + "%";

        /* ===============================
           STOCK + DELIVERY
        ================================ */
        document.getElementById("productStock").innerText = product.stock;
        document.getElementById("deliveryText").innerText = product.deliveryText;
        document.getElementById("productSeller").innerText = product.seller || "Amazon.in";

        /* ===============================
           MAIN IMAGE
        ================================ */
        document.getElementById("mainProductImage").src = product.mainImage;

        /* ===============================
           THUMBNAILS
        ================================ */
        const thumbContainer = document.getElementById("productThumbnails");

        if (thumbContainer) {
          thumbContainer.innerHTML = "";

          product.images.forEach(img => {
            const image = document.createElement("img");
            image.src = img;
            image.width = 60;

            image.onclick = () => {
              document.getElementById("mainProductImage").src = img;
            };

            thumbContainer.appendChild(image);
          });
        }

        /* ===============================
           VARIANTS
        ================================ */
        if (product.variantImages) {

          // Variant 1
          document.getElementById("variantImg1").src = product.variantImages[0];
          document.getElementById("variantPrice1").innerText =
            "₹" + product.variantPrices[0];
          document.getElementById("variantMrp1").innerText =
            "₹" + product.variantMrp[0];

          document.getElementById("variant1").onclick = () => {
            document.getElementById("mainProductImage").src =
              product.variantImages[0];
          };

          // Variant 2
          document.getElementById("variantImg2").src = product.variantImages[1];
          document.getElementById("variantPrice2").innerText =
            "₹" + product.variantPrices[1];
          document.getElementById("variantMrp2").innerText =
            "₹" + product.variantMrp[1];

          document.getElementById("variant2").onclick = () => {
            document.getElementById("mainProductImage").src =
              product.variantImages[1];
          };
        }

        /* ===============================
           ABOUT
        ================================ */
        const aboutList = document.getElementById("aboutList");

        if (aboutList) {
          aboutList.innerHTML = "";

          product.about.forEach(item => {
            const li = document.createElement("li");
            li.innerText = item;
            aboutList.appendChild(li);
          });
        }

        /* ===============================
           SPECIFICATIONS
        ================================ */
        const specs = document.getElementById("productSpecs");

        if (specs) {
          specs.innerHTML = "";

          for (let key in product.specifications) {
            const div = document.createElement("div");
            div.innerHTML =
              `<span>${key}</span><span>${product.specifications[key]}</span>`;
            specs.appendChild(div);
          }
        }

        /* ===============================
           ADD TO CART
        ================================ */
        const addBtn = document.querySelector(".add-cart");

        if (addBtn) {
          addBtn.onclick = () => addToCart(product.id);
        }

      })
      .catch(err => console.error("Error loading product:", err));
  }

});

function loadProductList(container) {
  fetch("./products.json")
    .then(res => res.json())
    .then(data => {
      container.innerHTML = "";

      data.forEach(product => {
        const stars = Array.from({ length: 5 }, (_, index) =>
          index < Math.round(product.rating)
            ? '<i class="fa-solid fa-star"></i>'
            : '<i class="fa-regular fa-star"></i>'
        ).join("");

        const card = document.createElement("div");
        card.className = "product-list-card";
        card.innerHTML = `
          <a class="card-image-link" href="product.html?id=${product.id}">
            <img src="${product.mainImage}" alt="${product.title}">
          </a>
          <div class="card-info">
            <p class="product-brand">${product.brand}</p>
            <p class="card-title">${product.title}</p>
            <div class="card-meta">
              <span class="card-rating">${stars} <span>${product.rating.toFixed(1)}</span></span>
              <span class="review-count">(${product.reviewCount})</span>
            </div>
            <p class="card-delivery">${product.deliveryText}</p>
            <p class="card-price">₹${product.price}</p>
            <button class="card-add-btn" onclick="addToCart(${product.id})">Add to Cart</button>
          </div>
        `;
        container.appendChild(card);
      });
    })
    .catch(err => console.error("Error loading product list:", err));
}

function renderCartPage() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartItems = document.getElementById("cartItems");
  const totalItems = document.getElementById("totalItems");
  const subtotal = document.getElementById("subtotal");

  if (!cartItems || !totalItems || !subtotal) return;

  if (cart.length === 0) {
    cartItems.innerHTML = "<p>Your cart is empty.</p>";
    totalItems.innerText = "0";
    subtotal.innerText = "0";
    const savingsEl = document.getElementById("totalSavings");
    const shipEl = document.getElementById("shippingEstimate");
    if (savingsEl) savingsEl.innerText = "0";
    if (shipEl) shipEl.innerText = "-";
    return;
  }

  let totalQuantity = 0;
  let totalPrice = 0;
  let totalSavings = 0;

  cartItems.innerHTML = "";

  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    const itemSavings = (item.mrp || item.price) - item.price;
    totalQuantity += item.quantity;
    totalPrice += itemTotal;
    totalSavings += itemSavings * item.quantity;

    const card = document.createElement("div");
    card.className = "cart-item";
    card.innerHTML = `
      <div class="cart-item-image">
        <img src="${item.image}" alt="${item.title}" width="120">
      </div>
      <div class="cart-item-details">
        <h3>${item.title}</h3>
        <p>₹${item.price} x ${item.quantity} = ₹${itemTotal}</p>
        <div class="quantity-controls">
          <button onclick="updateQty(${item.id}, -1)">-</button>
          <span>${item.quantity}</span>
          <button onclick="updateQty(${item.id}, 1)">+</button>
        </div>
        <button class="remove-btn" onclick="removeItem(${item.id})">Remove</button>
      </div>
    `;
    cartItems.appendChild(card);
  });

  totalItems.innerText = totalQuantity;
  subtotal.innerText = totalPrice;
  const savingsEl = document.getElementById("totalSavings");
  const shipEl = document.getElementById("shippingEstimate");
  if (savingsEl) savingsEl.innerText = totalSavings;
  if (shipEl) shipEl.innerText = "Tomorrow, if ordered within 2 hrs";
}


/* ===============================
   ADD TO CART
================================ */
function addToCart(productId) {

  fetch("./products.json")
    .then(res => res.json())
    .then(data => {

      const product = data.find(p => p.id == productId);
      if (!product) return;

      let cart = JSON.parse(localStorage.getItem("cart")) || [];

      const existing = cart.find(item => item.id == productId);

      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({
          id: product.id,
          title: product.title,
          price: product.price,
          mrp: product.mrp,
          image: product.mainImage,
          quantity: 1
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));

      alert("Added to Cart");
    });
}


/* ===============================
   UPDATE QUANTITY
================================ */
function updateQty(id, change) {

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const item = cart.find(p => p.id == id);
  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    cart = cart.filter(p => p.id != id);
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  location.reload();
}


/* ===============================
   REMOVE ITEM
================================ */
function removeItem(id) {

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  cart = cart.filter(item => item.id !== id);

  localStorage.setItem("cart", JSON.stringify(cart));

  location.reload();
}