let map;
let county;
let point;
let countiesVT;

const start = () => {
  setButtons("start");
  map.removeLayer(countiesVT);
  point = generatePointVT();
  const marker = L.marker(point);
  map.setZoomAround(point, 18);
  map.flyTo(point, 18);
  marker.addTo(map).bindPopup("Guess my location!");
};

const giveUp = async () => {
  setButtons("giveup");
  const address = await fetchLocation(point);
  document.querySelector("#town").textContent =
    address.city ||
    address.town ||
    address.village ||
    address.hamlet ||
    "Not Found";
  document.querySelector("#county").textContent = address.county;
  document.querySelector("#latitude").textContent = `Latitude: ${Math.round(
    point[1] * 10000
  ) / 10000}`;
  document.querySelector("#longitude").textContent = `Longitude: ${Math.round(
    point[0] * 10000
  ) / 10000}`;
  countiesVT.addTo(map);
  map.flyTo([44, -72], 8);
};

const initializeMap = () => {
  map = L.map("map").setView([44, -72], 8);
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
  const [lon, lat] = point.reverse();
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse.php?format=json&lat=${lat}&lon=${lon}`
  );
  const json = await response.json();
  return json.address;
};

const moveView = direction => {
  const newPoint = point;
  switch (direction) {
    case "North":
      console.log(newPoint);
      newPoint[1] + 0.003;
      console.log(newPoint);
      break;
    case "South":
      newPoint[1] - 0.003;
      break;
    case "East":
      newPoint[0] + 0.003;
      break;
    case "West":
      newPoint[0] - 0.003;
      break;
  }
  map.panTo(newPoint);
};

const setButtons = clicked => {
  if (clicked === "start") {
    document.querySelector("#start").setAttribute("disabled", true);
    document.querySelector("#guess").removeAttribute("disabled");
    document.querySelector("#giveup").removeAttribute("disabled");
    document.querySelector("#quit").removeAttribute("disabled");
  } else if (clicked === "giveup") {
    document.querySelector("#giveup").setAttribute("disabled", true);
    document.querySelector("#guess").setAttribute("disabled", true);
    document.querySelector("#quit").setAttribute("disabled", true);
    document.querySelector("#start").removeAttribute("disabled");
  }
};

initializeMap();
