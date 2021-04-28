//javascript.js
//set map options
var boxes = null;

var places = [];

var myLatLng = { lat: 34.02315999723999, lng: -118.2843875568803};
var mapOptions = {
    center: myLatLng,
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.ROADMAP
};

//create map
var map = new google.maps.Map(document.getElementById('googleMap'), mapOptions);

var service = new google.maps.places.PlacesService(map);

//create a DirectionsService object to use the route method and get a result for our request
var directionsService = new google.maps.DirectionsService();

//create a DirectionsRenderer object which we will use to display the route
var directionsDisplay = new google.maps.DirectionsRenderer();

//bind the DirectionsRenderer to the map
directionsDisplay.setMap(map);

routeBoxer = new RouteBoxer();

//define calcRoute function
function calcRoute(bestRouteIndex) {

    //create request
    var request = {
        origin: document.getElementById("from").value,
        destination: document.getElementById("to").value,
        travelMode: google.maps.TravelMode.WALKING, //WALKING, BYCYCLING, TRANSIT, DRIVING
        unitSystem: google.maps.UnitSystem.IMPERIAL,
        provideRouteAlternatives: true
    }

    // reference: https://stackoverflow.com/questions/18974512/how-to-display-alternative-route-using-google-map-api
    directionsService.route(
        request,
        function (response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                if(bestRouteIndex == -1){
                    for (var i = 0, len = response.routes.length; i < len; i++) {
                        console.log(response.routes)
                        new google.maps.DirectionsRenderer({
                            map: map,
                            directions: response,
                            routeIndex: i
                        });

                        // Box around the overview path of the first route
                        var path = response.routes[i].overview_path;
                        boxes = routeBoxer.box(path, 0.03);
                        drawBoxes();
                        findPlaces(0);
                    }
                }else{

                    const output = document.querySelector('#output');
                    output.innerHTML = "<div class='alert-info'>From: " + document.getElementById("from").value + ".<br />To: " + document.getElementById("to").value + ".<br /> Driving distance <i class='fas fa-road'></i> : " + response.routes[bestRouteIndex].legs[0].distance.text + ".<br />Duration <i class='fas fa-hourglass-start'></i> : " + response.routes[bestRouteIndex].legs[0].duration.text + ".</div>";
                    
                    new google.maps.DirectionsRenderer({
                        map: map,
                        directions: response,
                        routeIndex: bestRouteIndex
                    });
                }
            } else {
                $("#error").append("Unable to retrieve your route<br />");
            }
        }
    );
}

function calcPlaces(){
    BestRouteIndex = 0;
    maxPlaces = places[0];
    for(var i=1;i<places.length;i++){
        max = Math.max(maxPlaces,places[i]);
        if(maxPlaces != max){
            maxPlaces = max;
            BestRouteIndex = i;
        }
    }
    console.log(maxPlaces," : ",BestRouteIndex);

    map = new google.maps.Map(document.getElementById('googleMap'), mapOptions);

    //create a DirectionsService object to use the route method and get a result for our request
    directionsService = new google.maps.DirectionsService();
    //create a DirectionsRenderer object which we will use to display the route
    directionsDisplay = new google.maps.DirectionsRenderer();
    //bind the DirectionsRenderer to the map
    directionsDisplay.setMap(map);

    calcRoute(BestRouteIndex);
}



// Draw the array of boxes as polylines on the map
function drawBoxes() {
    boxpolys = new Array(boxes.length);
    for (var i = 0; i < boxes.length; i++) {
      boxpolys[i] = new google.maps.Rectangle({
        bounds: boxes[i],
        fillOpacity: 0,
        strokeOpacity: 1.0,
        strokeColor: '#000000',
        strokeWeight: 1,
        map: map
      });
    }
}

// Clear boxes currently on the map
function clearBoxes() {
    if (boxpolys != null) {
      for (var i = 0; i < boxpolys.length; i++) {
        boxpolys[i].setMap(null);
      }
    }
    boxpolys = null;
}


function findPlaces(searchIndex) {
    var request = {
      bounds: boxes[searchIndex],
    };

    service.nearbySearch(request, function(results, status) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
          console.log(results)
          places.push(results.length);
      } else {
          console.log("Some Error")
      }
    });
}



//create autocomplete objects for all inputs
var options = {
    types: ['(cities)']
}

var input1 = document.getElementById("from");
var autocomplete1 = new google.maps.places.Autocomplete(input1, options);

var input2 = document.getElementById("to");
var autocomplete2 = new google.maps.places.Autocomplete(input2, options);

// Ref
// https://stackoverflow.com/questions/17283826/how-to-to-get-places-e-g-gas-stations-along-route-between-origin-and-destinati

// https://github.com/sammy007-debug/Google-map-distance-api

// https://www.youtube.com/watch?v=BkGtNBrOhKU