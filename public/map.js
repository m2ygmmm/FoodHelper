const postcodeAlert = document.getElementById("postcodeAlert")
postcodeAlert.style.display = 'none'

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}


getLocation()


var coordsArr;
var convertedCoords;

function showPosition(position) {
  var currentLat = position.coords.latitude;
  var currentLong = position.coords.longitude;
  coordsArr = [currentLong, currentLat];
  convertedCoords = mapboxgl.LngLat.convert(coordsArr);
  mapboxgl.accessToken = 'pk.eyJ1IjoibTJ5Z21tbSIsImEiOiJjbGV2amg1dHgxMGJmM3lzMGoxdWI3bHJyIn0.bO-oCwcFX7RQC84zXZE-GA';
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/navigation-day-v1',
    zoom: 11,
    center: convertedCoords
  });


  function loadMap() {
    map.on('load', async () => {
      const res = await fetch('map', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        }
      });
      const data = await res.json();
      data.forEach((location) => {
        console.log(location)
        const lat = location.location.coordinates[0];
        const lon = location.location.coordinates[1];
        const marker = new mapboxgl.Marker({
          color: '#6e8c68',
          draggable: false,
        })
          .setLngLat([lon, lat])
          .setPopup(new mapboxgl.Popup().setHTML('<div class="card"><div class="card-body"><h5 class="card-title">' + location.locationName + '</h5><h6 class="card-subtitle mb-2 text-muted">' + location.postcode + '</h6><ul class="list-group list-group-flush"><li class="list-group-item">Type: ' + location.type + '</li><li class="list-group-item">Contact Number: ' + location.number + '</li><li class="list-group-item">Mainly serves: ' + location.served + '</li>  <li class="list-group-item"><button type="button" onclick="onRate(' + location.codeNum + ',' + 1 + ')" class="btn btn-default px-3" id="likeBtn"><i class="bi bi-hand-thumbs-up" id="likeButton" aria-hidden="true">' + location.likes.length + '</i></button><button type="button" class="btn btn-default px-3" onclick="onRate(' + location.codeNum + ',' + 0 + ')" ><i class="bi bi-hand-thumbs-down" id="dislikeButton" aria-hidden="true">' + location.dislikes.length + '</i></button></li><li class="list-group-item"><a href="/location/' + location._id + '" class="btn btn-primary btn-sm">More</a></li></ul></div></div>'))
          .addTo(map);
      });

    })
  }

  loadMap();


  document.getElementById('fly').addEventListener('click', () => {
    postcode = document.getElementById("postcode").value
    fetch('https://api.postcodes.io/postcodes/' + postcode + '/validate')
      .then((response) => response.json())
      .then((data => {
        if (data.result === false) {
          postcodeAlert.style.display = 'block'
        }
        else {
          postcodeAlert.style.display = 'none'
          fetch('https://api.postcodes.io/postcodes?q=' + postcode)
            .then((response) => response.json())
            .then(data => {
              const lat = data.result[0].latitude
              const lon = data.result[0].longitude
              map.flyTo({
                center: [lon, lat],
                essential: true,
                zoom: 14
              });
            })
        }
      }))



  });

  document.getElementById('currentLocation').addEventListener('click', () => {
    var currentLat = position.coords.latitude;
    var currentLong = position.coords.longitude;
    coordsArr = [currentLong, currentLat];
    map.flyTo({
      center: [currentLong, currentLat],
      essential: true,
      zoom: 11
    })
  })

}

function onRate(locationName, ratingType) {
  fetch('/liked', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ locationName, ratingType })
  })
    .then(function (response) {
      if (response.ok) {
        if (ratingType === 1) {
          var htmlBtn = document.getElementById('likeButton')
          htmlBtn.className = 'bi bi-hand-thumbs-up-fill';
        }
        else {
          var htmlBtn = document.getElementById('dislikeButton')
          htmlBtn.className = 'bi bi-hand-thumbs-down-fill';
        }
        location.reload();
        return;
      }
      throw new Error('Request failed.');
    })
    .catch(function (error) {
      console.log(error);
    });
}













