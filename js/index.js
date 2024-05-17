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
let geolocationError = false;


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


  function createMarker(marker, position){
    if (marker) {
      marker.setMap(null); // Elimina el marcador anterior
    }
    marker = new google.maps.Marker({ // Crea un nuevo marcador
      position: position,
      map: map,
    });
    return marker;
  }

  async function fetchAddress(position) {
    try {
      let response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.lat},${position.lng}&key=AIzaSyD1PJSnTpauRdZYlOx8TJ_XaP2lUrpkEn8`);
      let data = await response.json();

      // Restablece las variables de la dirección
      streetNumber = "";
      streetName = "";
      neighborhood = "";
      city = "";
      province = "";
      country = "";
      postalCode = "";

      let addressComponents = data.results[0].address_components;
      addressComponents.forEach((component) => {
        if (component.types.includes("street_number")) {
          streetNumber = component.long_name;
        }
        if (component.types.includes("route")) {
          streetName = component.long_name;
        }
        if (
          component.types.includes("sublocality") ||
          component.types.includes("neighborhood")
        ) {
          neighborhood = component.long_name;
        }
        if (component.types.includes("administrative_area_level_1")) {
          province = component.long_name;
        }
        if (component.types.includes("country")) {
          country = component.long_name;
        }
        if (component.types.includes("postal_code")) {
          postalCode = component.long_name;
        }
        if (component.types.includes("locality")) {
          city = component.long_name;
        }
      });
      return data.results[0].formatted_address;
    } catch (error) {
      console.error(error);
    }
  };
  

  function handleInfoWindow(formattedAddress, marker){
    if (infoWindow) {
      infoWindow.close(); // Cierra el cuadro de información anterior
    }
    // Aquí es donde actualizarías el contenido de la ventana de información
    let content = `<span id="place-displayname" class="title">${formattedAddress}</span>`;
    infoWindow = new google.maps.InfoWindow({ // Crea un nuevo cuadro de información
      content: content,
    });
    infoWindow.open(map, marker);
  }

  async function updateMarkerAndInfoWindow(marker, pos) {
    geolocationError=false
    marker = createMarker(marker, pos);
    const formattedAddress = await fetchAddress(pos);
    handleInfoWindow(formattedAddress, marker);
    
    return marker
  }

  const locationButton = document.createElement("button");
  locationButton.textContent = "Ubicación actual";
  locationButton.classList.add("custom-map-control-button");
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
  locationButton.addEventListener("click", async () => {
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          map.setCenter(pos);
          map.setZoom(17);

          marker = await updateMarkerAndInfoWindow(marker, pos);
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


  if (navigator.permissions) {
    // Comprueba el estado del permiso de geolocalización
    navigator.permissions.query({name:'geolocation'}).then(function(result) {
      if (result.state == 'granted') {
        // El permiso de geolocalización está activado, llama a locationButton.click()
        locationButton.click();
        return
      }
    })
  }



  function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
      browserHasGeolocation
        ? "Error: Servicio de geolocalización fallido. Por favor, asegúrese de aprobar los permisos del navegador para acceder a su ubicación."
        : "Error: Su navegador no soporta la geolocalización."
    );
    infoWindow.open(map);
    geolocationError = true;
  }

  // Agrega un listener para el evento 'click' en el mapa
  map.addListener('click', async function(event) {

    
    const pos = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };
    
    marker = await updateMarkerAndInfoWindow(marker, pos);
  });

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

    
    const pos = {
      lat: place.location.lat(),
      lng: place.location.lng()
    };
    
    marker = await updateMarkerAndInfoWindow(marker, pos);

    if (place.viewport) {
      map.fitBounds(place.viewport);
    } else {
      map.setCenter(place.location);
      map.setZoom(17);
    }

    

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

  if (geolocationError) {
    insertText.innerHTML = `<div class="card">
      <div class="card-body">
      <h5 class="card-title p-2">Error: verifique la dirección seleccionada y vuelva a intentarlo.</b></h5>
      </div>
      </div></br>`;
    return;
  }

  insertText.innerHTML = '';

  // Mostrar el spinner
  document.getElementById('spinner').style.display = 'block';

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

    console.log("Codigo postal: "+postalCode);

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
    Densidad: 0,
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
    .then((response) => {
      return response.text()
    })
    .then((result) => {

      // Ocultar el spinner
      document.getElementById('spinner').style.display = 'none';

      if (result == 'Alta'|| result =='Media' || result =='Baja') {

        let address = '';
        if (streetName) {
            address += streetName;
        }
        if (streetNumber) {
            address += (address ? ', ' : '') + streetNumber;
        }
        if (postalCode) {
            address += (address ? ', ' : '') + postalCode;
        }
        if (city) {
            address += (address ? ', ' : '') + city;
        }

        let color = result == 'Alta' ? 'success' : result == 'Media' ? 'warning' : 'danger';
        insertText.innerHTML = `<div class="card">
        <div class="card-body">
        <h5 class="card-title p-2">Probabilidad <b class="text-${color}">${result}</b></h5>
        <hr>
        <p class="card-text">${address}</p>
        </div>
        </div></br>`;
      } else {
        insertText.innerHTML = `<div class="card">
        <div class="card-body">
        <h5 class="card-title p-2">Error: verifique la dirección seleccionada y vuelva a intentarlo.</b></h5>
        </div>
        </div></br>`;
      }
    })
    .catch((error) => {
      // ocultar el spinner incluso si hay un error
      document.getElementById('spinner').style.display = 'none';
      console.error("Error:", error);
    });
});