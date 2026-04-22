let restaurants = [
  {
    name: "Burger",
    rating: 4.2,
    price: "$10",
    img: "https://avatars.mds.yandex.net/i?id=967212d84848aee6214af65c9b8a62901d9e7fcd-12365999-images-thumbs&n=13"
  },
  {
    name: "Pizza",
    rating: 4.5,
    price: "$20",
    img: "https://st.depositphotos.com/2075661/2160/i/950/depositphotos_21600207-stock-photo-pizza-hut-logo.jpg"
  },
  {
    name: "Sushi",
    rating: 4.8,
    price: "$18",
    img: "https://www.shutterstock.com/image-vector/sushi-vector-logo-design-captures-260nw-2307206709.jpg"
  },
  {
    name: "Cafe",
    rating: 4.3,
    price: "$5",
    img: "https://png.klev.club/uploads/posts/2024-04/176d614313_png-klev-club-jnjc-p-starbaks-logotip-png-12.png"
  }
];

let currentRotation = 0;
let lastPicked = null;

function drawWheel() {
  const wheel = document.getElementById("wheel");
  wheel.innerHTML = "";

  if (restaurants.length === 0) return;

  const angle = 360 / restaurants.length;

  restaurants.forEach((r, i) => {
    const slice = document.createElement("div");
    slice.className = "slice";
    slice.style.background = `hsl(${i * 60}, 70%, 60%)`;
    slice.style.transform = `rotate(${i * angle}deg) skewY(${90 - angle}deg)`;

    slice.innerHTML = `
      <span style="transform: skewY(-${90 - angle}deg) rotate(${angle/2}deg);">
        ${r.name}
      </span>
    `;

    wheel.appendChild(slice);
  });
}


function spinWheel() {
  if (restaurants.length === 0) return;

  let randomIndex;

 
  do {
    randomIndex = Math.floor(Math.random() * restaurants.length);
  } while (restaurants.length > 1 && restaurants[randomIndex].name === lastPicked);

  lastPicked = restaurants[randomIndex].name;

  const angle = 360 / restaurants.length;

  currentRotation += 360 * 5 + (360 - randomIndex * angle);

  document.getElementById("wheel").style.transform =
    `rotate(${currentRotation}deg)`;

  setTimeout(() => {
    showResult(restaurants[randomIndex]);
  }, 3000);
}


function showResult(r) {
  document.getElementById("result").textContent = "👉 " + r.name;

  document.getElementById("card").classList.remove("hidden");
  document.getElementById("img").src = r.img;
  document.getElementById("name").textContent = r.name;
  document.getElementById("rating").textContent = "⭐ " + r.rating;
  document.getElementById("price").textContent = "💰 " + r.price;

  saveHistory(r.name);

  try {
    new Audio("https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3").play();
  } catch (e) {}
}

function saveHistory(name) {
  let h = JSON.parse(localStorage.getItem("hist")) || [];
  h.unshift(name);
  h = h.slice(0, 5);
  localStorage.setItem("hist", JSON.stringify(h));
  renderHistory();
}

function renderHistory() {
  const el = document.getElementById("history");
  const h = JSON.parse(localStorage.getItem("hist")) || [];
  el.innerHTML = h.map(i => `<li>👉 ${i}</li>`).join("");
}

function loadNearby() {
  if (!navigator.geolocation) {
    alert("Геолокация қолдау көрсетпейді");
    return;
  }

  navigator.geolocation.getCurrentPosition(async pos => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    const query = `
      [out:json];
      node["amenity"="restaurant"](around:1500,${lat},${lon});
      out;
    `;

    const url =
      "https://overpass-api.de/api/interpreter?data=" +
      encodeURIComponent(query);

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (!data.elements || data.elements.length === 0) {
        alert("Жақын жерде ресторан табылмады 😢");
        return;
      }

      restaurants = data.elements.slice(0, 6).map(e => ({
        name: e.tags.name || "Restaurant",
        rating: "N/A",
        price: ["$", "$$", "$$$"][Math.floor(Math.random() * 3)],
        img: `https://source.unsplash.com/400x300/?food,${e.tags.name || "restaurant"}`
      }));

      drawWheel();
    } catch (err) {
      alert("Қате орын алды 😢");
      console.error(err);
    }
  });
}

drawWheel();
renderHistory();