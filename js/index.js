let map;
let marker;
let infoWindow;

let lat;
let lng;
let formattedAddress;

let streetNumber = "";
let streetName = "";
let neighborhood = "";
let city = "";
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
    center: { lat: 40.4779299, lng: -3.7193656 },
    zoom: 16,
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
          map.setCenter(pos);
          map.setZoom(17);
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
      if (component.types.includes("locality")) {
        city = component.longText;
      }
    });

    let content = `<div id="infowindow-content">
        <span id="place-displayname" class="title">${place.displayName}</span><br />
        <span id="place-address">${place.formattedAddress}</span>
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
    console.log(`City: ${city}`);
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
let insertText = document.getElementById("result");


checkButton.addEventListener("click", function () {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  let temp = 0;
  let prec = 0;

  

  const requestOptionsWeather = {
    method: "GET",
    redirect: "follow"
  };

  fetch(`https://api.openweathermap.org/data/2.5/weather?lon=${lng}&appid=c21d7ba2d8ef43693ff881476b0877ab&lat=${lat}&units=metric`, requestOptionsWeather)
    .then((response) => response.text())
    .then((result) => {
      result = JSON.parse(result);
      console.log(result);
      temp = result.main.temp;
      console.log(temp);
      prec = result.rain ? result.rain["1h"] : 0;
      console.log(prec);
    })
    .catch((error) => console.error(error));

  const raw = JSON.stringify({
    // idProbabilidadEstacionamiento: 0,
    // latitud: lat,
    // longitud: lng,
    pais: country,
    ciudad: city,
    provincia: province,
    barrio: neighborhood,
    nombrevia: streetName + " " + streetNumber,
    codigoPostal: postalCode,
    fecha: fecha,
    ano: year,
    dia: 0,
    nombreDiaSemana: day,
    nombreMes: month,
    HoraInicio: hora,
    HoraFin: hora,
    // temperatura: temp,
    // precipitacion: prec,
    Densidad: null,
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
      let color = result == 'Alta' ? 'success' : result == 'Media' ? 'warning' : 'danger';
      insertText.innerHTML = `<div class="card">
                  <div class="card-body">
                    <h5 class="card-title p-2">Probabilidad <b class="text-${color}">${result}</b></h5>
                    <hr>
                    <p class="card-text">${streetName + ", " + streetNumber + ", " + postalCode + ", " + city}</p>
                  </div>
                </div></br>`;
    })
    .catch((error) => console.error("Error:", error));
});


