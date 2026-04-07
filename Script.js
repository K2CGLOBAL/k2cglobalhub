// Products with realistic images and stock
let products = [
  {id:1, name:"Solar Fan", price:69000, qty:1, stock:5,
   img:"https://images.unsplash.com/photo-1592861952997-0a18b95c6780?auto=format&fit=crop&w=200&q=80"},
  {id:2, name:"Stainless Pot Set 6pcs", price:79000, qty:1, stock:3,
   img:"https://images.unsplash.com/photo-1615332020243-7c04f3f918b1?auto=format&fit=crop&w=200&q=80"},
  {id:3, name:"Aluminum Pot Set 14pcs", price:59000, qty:1, stock:7,
   img:"https://images.unsplash.com/photo-1587202372775-f40a1625d13b?auto=format&fit=crop&w=200&q=80"}
];

let cart = [];

// Display Products
function displayProducts(){
  let productsDiv = document.getElementById("products");
  productsDiv.innerHTML = "";
  products.forEach(p=>{
    let div = document.createElement("div");
    div.className="product";
    div.innerHTML=`
      <img src="${p.img}" alt="${p.name}" />
      <h3>${p.name}</h3>
      <p>₦${p.price.toLocaleString()}</p>
      ${p.stock === 0 ? '<span style="color:red; font-weight:bold;">SOLD OUT</span>' : `<button onclick="addToCart(${p.id})">Add to Cart</button>`}
    `;
    productsDiv.appendChild(div);
  });
}
displayProducts();

// Add to Cart with stock check
function addToCart(id){
  let product = products.find(p=>p.id===id);
  if(product.stock === 0){
    alert(`${product.name} is sold out!`);
    return;
  }
  
  let cartItem = cart.find(c=>c.id===id);
  if(cartItem){
    if(cartItem.qty < product.stock){
      cartItem.qty +=1;
    } else {
      alert(`Only ${product.stock} ${product.name} available!`);
      return;
    }
  } else {
    cart.push({...product});
  }
  displayCart();
}

// Display Cart
function displayCart(){
  let cartDiv = document.getElementById("cart-items");
  cartDiv.innerHTML = "";
  let total = 0;
  cart.forEach(item=>{
    total += item.price * item.qty;
    let div = document.createElement("div");
    div.innerHTML = `${item.name} x ${item.qty} - ₦${(item.price*item.qty).toLocaleString()}`;
    cartDiv.appendChild(div);
  });
  document.getElementById("total").innerText = total.toLocaleString();
}

// Checkout
document.getElementById('checkout').onclick = function(){
  if(cart.length === 0){ alert("Cart is empty!"); return; }

  let customerName = document.getElementById("cust-name").value;
  let customerPhone = document.getElementById("cust-phone").value;
  if(!customerName || !customerPhone){ alert("Please enter your name and phone number"); return; }

  let total = cart.reduce((sum,item)=>sum + item.price*item.qty, 0);
  let orderDetails = cart.map(item=>`${item.name} (x${item.qty})`).join(", ");

  let handler = PaystackPop.setup({
    key: 'pk_test_1224eb0ed84251c2ca7babe4c33be28d5949783f', 
    email: 'customer@email.com',
    amount: total * 100,
    currency: "NGN",
    ref: ''+Math.floor((Math.random()*1000000000)+1),

    callback: function(response){
      let pickupCode = "K2C-" + Math.floor(100000 + Math.random()*900000);

      // Send Email
      emailjs.send("service_kdnvhka","template_ju31uki",{
        name: customerName,
        phone: customerPhone,
        items: orderDetails,
        total: "₦" + total.toLocaleString(),
        pickup_code: pickupCode
      });

      // Open WhatsApp
      let yourNumber = "2348134153644";
      let whatsappLink = `https://wa.me/${yourNumber}?text=${encodeURIComponent(
        `New Order!\nName: ${customerName}\nPhone: ${customerPhone}\nItems: ${orderDetails}\nTotal: ₦${total.toLocaleString()}\nPickup Code: ${pickupCode}`
      )}`;
      window.open(whatsappLink, "_blank");

      // Show Success Page
      document.body.innerHTML = `
      <div style="text-align:center; padding:30px;">
        <h2>✅ Payment Successful!</h2>
        <h1>${pickupCode}</h1>
        <p>Show this code when picking up your item</p>
      </div>`;

      // Update stock
      cart.forEach(item=>{
        let product = products.find(p=>p.id===item.id);
        product.stock -= item.qty;
      });
      cart = [];
      displayProducts();
    },

    onClose: function(){ alert("Payment cancelled"); }
  });

  handler.openIframe();
}
