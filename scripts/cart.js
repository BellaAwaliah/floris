document.addEventListener("DOMContentLoaded", () => {
    const cartKey = "florisCart";

    // Function to get cart from local storage
    function getCart() {
        return JSON.parse(localStorage.getItem(cartKey)) || [];
    }

    // Function to save cart to local storage
    function saveCart(cart) {
        localStorage.setItem(cartKey, JSON.stringify(cart));
    }

    // Function to update cart count in navbar
    function updateCartCount() {
        const cart = getCart();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        document.getElementById("cart-nav").textContent = `Cart (${totalItems})`;
    }

    // Function to render cart items
    function renderCartItems(containerId, isEditable) {
        const container = document.getElementById(containerId);
        const cart = getCart();
        if (!container) return;

        container.innerHTML = cart.length === 0
            ? "<p>Your cart is empty.</p>"
            : cart.map((item, index) => `
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <strong>${item.name}</strong>
                        <p>Price: Rp${item.price.toLocaleString()}</p>
                        <p>Quantity: ${item.quantity}</p>
                    </div>
                    ${isEditable ? `
                    <div>
                        <button class="btn btn-sm btn-secondary change-quantity" data-index="${index}" data-action="decrease">-</button>
                        <button class="btn btn-sm btn-secondary change-quantity" data-index="${index}" data-action="increase">+</button>
                        <button class="btn btn-sm btn-danger remove-item" data-index="${index}">Remove</button>
                    </div>` : ''}
                </div>
            `).join("");

        if (isEditable) {
            container.querySelectorAll(".change-quantity").forEach(button => {
                button.addEventListener("click", () => {
                    const index = parseInt(button.dataset.index);
                    const action = button.dataset.action;
                    changeQuantity(index, action);
                });
            });

            container.querySelectorAll(".remove-item").forEach(button => {
                button.addEventListener("click", () => {
                    const index = parseInt(button.dataset.index);
                    removeFromCart(index);
                });
            });
        }
    }

    // Function to change quantity
    function changeQuantity(index, action) {
        const cart = getCart();
        if (cart[index]) {
            if (action === "increase") {
                cart[index].quantity += 1;
            } else if (action === "decrease" && cart[index].quantity > 1) {
                cart[index].quantity -= 1;
            }
        }
        saveCart(cart);
        renderCartItems("cart-items", true);
        updateCartCount();
    }

    // Function to add item to cart
    function addToCart(id, name, price) {
        const cart = getCart();
        const itemIndex = cart.findIndex(item => item.id === id);
        if (itemIndex >= 0) {
            cart[itemIndex].quantity += 1;
        } else {
            cart.push({ id, name, price, quantity: 1 });
        }
        saveCart(cart);
        updateCartCount();
    }

    // Function to remove item from cart
    function removeFromCart(index) {
        const cart = getCart();
        cart.splice(index, 1);
        saveCart(cart);
        renderCartItems("cart-items", true);
        updateCartCount();
    }

    // Function to clear the cart
    function clearCart() {
        localStorage.removeItem(cartKey);
        updateCartCount();
        renderCartItems("cart-items", true);
    }

    // Event listeners for adding to cart
    document.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", () => {
            const id = button.dataset.id;
            const name = button.dataset.name;
            const price = parseFloat(button.dataset.price); // Assume price is in IDR
            addToCart(id, name, price);
        });
    });

    // Render cart items on cart.html
    if (document.getElementById("cart-items")) {
        renderCartItems("cart-items", true);
        document.getElementById("clear-cart").addEventListener("click", clearCart);
    }

    // Render cart items on checkout.html
    if (document.getElementById("checkout-items")) {
        renderCartItems("checkout-items", false);
    }

    // Handle checkout form submit
    const checkoutForm = document.getElementById("checkout-form");
    const submitButton = checkoutForm.querySelector("button[type='submit']");
    const loader = document.createElement("div");
    loader.classList.add("spinner-border", "text-primary");
    loader.setAttribute("role", "status");
    loader.innerHTML = `<span class="visually-hidden">Loading...</span>`;
    loader.style.display = "none"; // Initially hide loader
    const scriptURL = 'https://script.google.com/macros/s/AKfycbzaRaS4wPoKygkMXt2ZqJyDYLblZ7BDXJYIRVVJhUnoBQ-5BKYvTPqab8AY_-V0dYGA/exec'

    // Insert the loader next to the submit button
    submitButton.insertAdjacentElement("afterend", loader);

    if (checkoutForm) {
        checkoutForm.addEventListener("submit", (event) => {
            event.preventDefault(); // Prevent form submission

            // Show loader and hide submit button
            submitButton.style.display = "none";
            loader.style.display = "inline-block";

            fetch(scriptURL, { method: 'POST', body: new FormData(checkoutForm) })
                .then(response => {
                    alert("success!");

                    // Clear the cart and form
                    clearCart();

                    // Redirect to home
                    window.location.href = "index.html";
                }
                )
                .catch(error => {
                    alert("error: ", error.message);
                })

        });
    }

    // Update cart count on page load
    updateCartCount();
});
