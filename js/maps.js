var map;
function initialize() {
  var mapOptions = {
    zoom: 10,
    center: new google.maps.LatLng(-33.45883238387461, -70.64077673515624),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);
}

google.maps.event.addDomListener(window, 'load', initialize);