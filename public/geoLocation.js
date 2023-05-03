document.getElementById("lat").style.display = 'none';
document.getElementById("lon").style.display = 'none';
const postcodeAlert = document.getElementById("postcodeAlert")
const postcodeInput = document.getElementById("postcode");
const locationInput = document.getElementById('locationName');
const priceInput = document.getElementById('price');
const submitBtn = document.getElementById('submitBtn');

postcodeAlert.style.display = 'none'
var isclicked = false;


function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
  isclicked = true;
}

function showPosition(position) {
  console.log(position.coords.latitude)
  fetch('http://api.postcodes.io/postcodes?lon=' + position.coords.longitude + '&lat=' + position.coords.latitude)
    .then((response) => response.json())
    .then(data => {
      var postcode = data.result[0].postcode;
      console.log(postcode)
      postcodeInput.value = postcode;
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      document.getElementById("lat").value = lat;
      document.getElementById("lon").value = lon;
      postcodeAlert.style.display = 'none'
    })
}

function onlyOne(checkbox) {
  var checkboxes = document.getElementsByName('check')
  checkboxes.forEach((item) => {
    if (item !== checkbox) item.checked = false
  })
  var checkboxes2 = document.getElementsByName('check2')
  checkboxes2.forEach((item) => {
    if (item !== checkbox) item.checked = false
  })
}

postcodeInput.onkeyup = function () {
  enterPostocde()
};

function enterPostocde() {
  isclicked = true;
  postcode = document.getElementById("postcode").value
  fetch('https://api.postcodes.io/postcodes/' + postcode + '/validate')
    .then((response) => response.json())
    .then((data => {
      if (data.result === false) {
        postcodeAlert.style.display = 'block'
        submitBtn.disabled = true;
      }
      else {
        fetch('https://api.postcodes.io/postcodes?q=' + postcode)
          .then((response) => response.json())
          .then(data => {
            const lat = data.result[0].latitude
            const lon = data.result[0].longitude
            document.getElementById("lat").value = lat;
            document.getElementById("lon").value = lon;
            postcodeAlert.style.display = 'none'
            submitBtn.disabled = false;
          })
      }
    }))

}





