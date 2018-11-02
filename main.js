let map;
let point;
let countiesVT;
let score = 0;
let trail = [];
let paths = [];

const start = () => {
  setButtons("start");
  map.removeLayer(countiesVT);
  point = generatePointVT();
  const marker = L.marker(point);
  map.setZoomAround(point, 18);
  map.flyTo(point, 18);
  marker.addTo(map).bindPopup("Guess my location!");
  Array.from(document.querySelector("#info").children).forEach(
    el => (el.textContent = `${el.id}: ?`)
  );
  score += 100;
  document.querySelector("#score").textContent = `score: ${score}`;
  map._handlers.forEach(handler => handler.disable());
};

const giveUp = async () => {
  setButtons("giveup");
  const { county, city, town, village, hamlet } = await fetchLocation(point);
  const [, latEl, lonEl, countyEl, townEl] = Object.values(
    document.querySelector("#info").childNodes
  ).filter(node => node.id);
  townEl.textContent = city || town || village || hamlet || "Not Found";
  countyEl.textContent = county;
  latEl.textContent = `Latitude: ${Math.round(point[1] * 10000) / 10000}`;
  lonEl.textContent = `Longitude: ${Math.round(point[0] * 10000) / 10000}`;
  countiesVT.addTo(map);
  map.flyTo([44, -72], 8);
  map._handlers.forEach(handler => handler.enable());
  score -= 100;
  document.querySelector("#score").textContent = `score: ${score}`;
};

const guess = async () => {
  setButtons("guess");
  const { county } = await fetchLocation(point);
  console.log(county);
  document.querySelector("#counties").style.display = "flex";
  const counties = document.querySelectorAll(".county");
  for (let guessedCounty of counties) {
    guessedCounty.addEventListener("click", event => {
      matchGuess(county, event);
    });
  }
};
const quit = () => {
  setButtons("quit");
  map.flyTo([44, -72], 8);
  countiesVT.addTo(map);
  score -= 100;
  document.querySelector("#score").textContent = `score: ${score}`;
};

const matchGuess = county => {
  if (`${event.target.textContent} County` === county) {
    map.flyTo([44, -72], 8);
    alert(`You Win! You scored ${score} points!`);
    document.querySelector("#score").textContent = `score: ${score}`;
    setButtons("quit");
  } else {
    alert("That is not correct, keep guessing!");
    event.target.innerHTML = `<del>${event.target.textContent}</del>`;
    score -= 10;
    document.querySelector("#score").textContent = `Score: ${score}`;
  }
};

const initializeMap = () => {
  document.querySelector("#score").textContent = `score: 0`;
  map = L.map("map", { zoomControl: false }).setView([44, -72], 8);
  L.geoJSON(borderData, { fillOpacity: 0 }).addTo(map);
  L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      attribution:
        "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
    },
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: "mapbox.streets"
    }
  ).addTo(map);
  countiesVT = L.geoJSON(countyData, { fillOpacity: 0 });
};

const generatePointVT = () => {
  const coordRange = {
    maxLat: 45.2,
    minLat: 42.5,
    maxLon: -70.7,
    minLon: -74.3
  };
  let point = coordRand(coordRange);
  while (!leafletPip.pointInLayer(point, countiesVT).length) {
    point = coordRand(coordRange);
  }
  return point.reverse();
};

const coordRand = coordRange => {
  const lat =
    Math.random() * (coordRange.maxLat - coordRange.minLat) + coordRange.minLat;
  const lon =
    Math.random() * (coordRange.maxLon - coordRange.minLon) + coordRange.minLon;
  return [lon, lat];
};

const fetchLocation = async point => {
  const [lat, lon] = point;
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse.php?format=json&lat=${lat}&lon=${lon}`
  );
  const json = await response.json();
  return json.address;
};

const moveView = () => {
  const newPoint = Object.values(map.getCenter());
  trail[0] = point;
  trail.push(newPoint);
  const direction = event.target.id;
  switch (direction) {
    case "N":
      newPoint[0] += 0.003;
      break;
    case "S":
      newPoint[0] -= 0.003;
      break;
    case "E":
      newPoint[1] += 0.003;
      break;
    case "W":
      newPoint[1] -= 0.003;
      break;
    case "home":
      map.panTo(point);
      trail = [];
      paths.forEach(path => map.removeLayer(path));
      paths = [];
      return;
  }
  map.panTo(newPoint);
  score -= 1;
  document.querySelector("#score").textContent = `score: ${score}`;

  path = L.polyline(trail, { dashArray: "30 10 ", color: "white" });
  path.addTo(map);
  paths.push(path);
};

const setButtons = clicked => {
  const [start, guess, giveup, quit] = Object.values(
    document.querySelector("#game-controls").childNodes
  ).filter(node => node.id);
  if (clicked === "start") {
    start.setAttribute("disabled", true);
    guess.removeAttribute("disabled");
    giveup.removeAttribute("disabled");
    quit.removeAttribute("disabled");
  } else if (clicked === "giveup") {
    giveup.setAttribute("disabled", true);
    guess.setAttribute("disabled", true);
    quit.setAttribute("disabled", true);
    start.removeAttribute("disabled");
  } else if (clicked === "guess") {
    start.setAttribute("disabled", true);
    guess.setAttribute("disabled", true);
    giveup.removeAttribute("disabled");
    quit.removeAttribute("disabled");
  } else if (clicked === "quit") {
    start.removeAttribute("disabled");
    guess.setAttribute("disabled", true);
    giveup.setAttribute("disabled", true);
    quit.setAttribute("disabled", true);
  }
};

initializeMap();
