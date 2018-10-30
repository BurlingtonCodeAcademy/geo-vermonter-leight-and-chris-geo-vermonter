let map;
let county;
let pointInfo;

const start = () => {
  setButtons("start");
  const { point } = generatePointVT();
  const marker = L.marker(point);
  map.setZoomAround(point, 18);
  marker.addTo(map).bindPopup("Guess my location!");
};

const giveUp = () => {
  setButtons("giveup");
  document.querySelector("#latitude").textContent = pointInfo.point[0];
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
};

const generatePointVT = () => {
  const countiesVT = L.geoJSON(countyData, { fillOpacity: 0 });
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
  county = leafletPip.pointInLayer(point, countiesVT)[0].feature.properties
    .NAME;
  return (pointInfo = { point: point.reverse(), county });
};

const coordRand = coordRange => {
  const lat =
    Math.random() * (coordRange.maxLat - coordRange.minLat) + coordRange.minLat;
  const lon =
    Math.random() * (coordRange.maxLon - coordRange.minLon) + coordRange.minLon;
  return [lon, lat];
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
