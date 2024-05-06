let map;
let marker;
let infoWindow;

let lat;
let lng;
let formattedAddress;

let streetNumber = "";
let streetName = "";
let neighborhood = "";
let province = "";
let country = "";
let postalCode = "";

async function initMap() {
  // Request needed libraries.
  //@ts-ignore
  const [{ Map }, { AdvancedMarkerElement }] = await Promise.all([
    google.maps.importLibrary("marker"),
    google.maps.importLibrary("places"),
  ]);

  // Initialize the map.
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 40.4380986, lng: -3.8443472 },
    zoom: 15,
    mapId: "4504f8b37365c3d0",
    mapTypeControl: false,
  });

  //@ts-ignore
  const placeAutocomplete = new google.maps.places.PlaceAutocompleteElement();

  //@ts-ignore
  placeAutocomplete.id = "place-autocomplete-input";

  const card = document.getElementById("place-autocomplete-card");

  //@ts-ignore
  card.appendChild(placeAutocomplete);
  // Create the marker and infowindow
  marker = new google.maps.marker.AdvancedMarkerElement({
    map,
  });
  infoWindow = new google.maps.InfoWindow({});

  const locationButton = document.createElement("button");
  locationButton.textContent = "Ubicación actual";
  locationButton.classList.add("custom-map-control-button");
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
  locationButton.addEventListener("click", () => {
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          new google.maps.Marker({
            position: pos,
            map,
            zoom: 8,
            title: "Location found.",
          });
          lat = position.coords.latitude;
          lng = position.coords.longitude;
          console.log(
            position.coords +
              " " +
              position.coords.latitude +
              " " +
              position.coords.longitude
          );
          map.setCenter(pos);
        },
        () => {
          handleLocationError(true, infoWindow, map.getCenter());
        }
      );
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }
  });
  function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
      browserHasGeolocation
        ? "Error: The Geolocation service failed."
        : "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(map);
  }

  // Add the gmp-placeselect listener, and display the results on the map.
  //@ts-ignore
  placeAutocomplete.addEventListener("gmp-placeselect", async ({ place }) => {
    await place.fetchFields({
      fields: [
        "displayName",
        "formattedAddress",
        "location",
        "addressComponents",
      ],
    });
    // If the place has a geometry, then present it on a map.
    if (place.viewport) {
      map.fitBounds(place.viewport);
    } else {
      map.setCenter(place.location);
      map.setZoom(17);
    }

    let addressComponents = place.addressComponents;

    console.log(addressComponents);

    addressComponents.forEach((component) => {
      if (component.types.includes("street_number")) {
        streetNumber = component.longText;
      }
      if (component.types.includes("route")) {
        streetName = component.longText;
      }
      if (
        component.types.includes("sublocality") ||
        component.types.includes("neighborhood")
      ) {
        neighborhood = component.longText;
      }
      if (component.types.includes("administrative_area_level_1")) {
        province = component.longText;
      }
      if (component.types.includes("country")) {
        country = component.longText;
      }
      if (component.types.includes("postal_code")) {
        postalCode = component.longText;
      }
    });

    let content = `<div id="infowindow-content">
        <span id="place-displayname" class="title">${place.displayName}</span><br />
        <span id="place-address">${place.formattedAddress}</span>
        <div>Street Number: ${streetNumber}</div>
        <div>Street Name: ${streetName}</div>
        <div>Neighborhood: ${neighborhood}</div>
        <div>Province: ${province}</div>
        <div>Country: ${country}</div>
    </div>`;
    lat = place.location.lat();
    lng = place.location.lng();
    formattedAddress = place.formattedAddress;

    console.log(`Formatted Address: ${place.formattedAddress}`);
    console.log(`Latitude: ${lat}`);
    console.log(`Longitude: ${lng}`);
    console.log(`Street Number: ${streetNumber}`);
    console.log(`Street Name: ${streetName}`);
    console.log(`Neighborhood: ${neighborhood}`);
    console.log(`Province: ${province}`);
    console.log(`Country: ${country}`);
    console.log(`Postal Code: ${postalCode}`);

    updateInfoWindow(content, place.location);
    marker.position = place.location;
  });
}

// Helper function to create an info window.
function updateInfoWindow(content, center) {
  infoWindow.setContent(content);
  infoWindow.setPosition(center);
  infoWindow.open({
    map,
    anchor: marker,
    shouldFocus: false,
  });
}

initMap();

const hoy = new Date(Date.now());

const fecha = hoy.toISOString();
const hora = hoy.getHours() + ":" + hoy.getMinutes() + ":" + hoy.getSeconds();
// Get Moth Name
const month = hoy.toLocaleString("default", { month: "long" });
// Get Day Name
const day = hoy.toLocaleString("default", { weekday: "long" });
// Get Year today
const year = hoy.getFullYear();
console.log(day + " " + month + " " + year);

console.log(fecha + " " + hora);

let checkButton = document.getElementById("check_button");
let insertText = document.getElementById("insert-text");

checkButton.addEventListener("click", function () {
  insertText.innerHTML =
    "Fecha: " +
    fecha +
    " Hora: " +
    hora +
    " Latitud: " +
    lat +
    " Longitud: " +
    lng +
    " Dirección: " +
    formattedAddress;

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    idProbabilidadEstacionamiento: 0,
    latitud: lat,
    longitud: lng,
    pais: country,
    ciudad: province,
    provincia: province,
    barrio: neighborhood,
    nombreVia: streetName + " " + streetNumber,
    codigoPostal: postalCode,
    fechaCompleta: fecha,
    año: year,
    nombreDiaSemana: day,
    nombreMes: month,
    horaInicio: hora,
    horaFin: hora,
    temperatura: 19.1,
    precipitacion: 0.3,
    densidadTrafico: null,
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  const url = "https://api-mappark.azurewebsites.net/api/machinelearning/ProbabilidadEstacionamiento";
  //const url = "http://localhost:9798/api/machinelearning/ProbabilidadEstacionamiento";

  fetch(url, requestOptions)
    .then((response) => response.text())
    .then((result) => {
      insertText.innerHTML += "<br>Probabilidad: " + result;
    })
    .catch((error) => console.error("Error:", error));
});
