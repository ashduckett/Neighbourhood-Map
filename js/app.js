
var Location = function(title, latitude, longitude) {
	this.title = title;
	this.latitude = latitude;
	this.longitude = longitude;
}

Location.prototype.getTitle = function() {
	return title;
}

Location.prototype.getLatLngLiteral = function() {
	return {
		lat: this.latitude,
		lng: this.longitude
	}
}

var ViewModel = function() {








	// End model here
};





function initMap() {
	var map;
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 40.7413549, lng: -73.9980244},
		zoom: 13
	});

		// Create model here
	var locations = [
		{title: '178 Vallance Road', location: {lat: 51.524026, lng: -0.06396}},
		{title: 'The Blind Beggar', location: {lat: 51.520052, lng: -0.056939}},
		{title: 'Pellicci\'s Café', location: {lat: 51.52649, lng: -0.063428}},
		{title: 'Esmarelda\'s Barn', location: {lat: 51.501943, lng: -0.156234}},
		{title: 'Bow Majistrates Court', location: {lat: 51.527344, lng: -0.023625}},
		{title: 'The Tower of London', location: {lat: 51.508112, lng: -0.075949}},
		{title: 'The Royal Oak', location: {lat: 51.529547, lng: -0.069298}},
		{title: 'Repton Boy\'s Club', location: {lat: 51.524215, lng: -0.065311}},
		{title: 'The Carpenter\'s Arms', location: {lat: 51.523962, lng: -0.067356}},
		{title: 'The Speakeasy Club', location: {lat: 51.516436, lng: -0.141724}},
		{title: 'Turners Old Star', location: {lat: 51.505372, lng: -0.059403}},
		{title: 'The Ivy House', location: {lat: 51.458296, lng: -0.052114}},
		{title: '97 Evering Road', location: {lat: 51.558621, lng: -0.067523}},
		{title: 'Wiliton Music Hall', location: {lat: 51.510701, lng: -0.066897}},
		{title: 'The Tower of London', location: {lat: 51.525074, lng: -0.06693}},
	];
	


	var largeInfoWindow = new google.maps.InfoWindow();
	var bounds = new google.maps.LatLngBounds();

	for(var i = 0; i < locations.length; i++) {
		var position = locations[i].location;
		var title = locations[i].title;

		var marker = new google.maps.Marker({
			map: map,
			position: position,
			title: title,
			animation: google.maps.Animation.DROP,
			id: i
		});

		bounds.extend(marker.position);

		//markers.push(marker);

		marker.addListener('click', function() {
			populateInfoWindow(this, largeInfoWindow);
		});

		map.fitBounds(bounds);

		function populateInfoWindow(marker, infoWindow) {
			// Check to make sure the infoWindow is not already opened on this marker
			if(infoWindow.marker != marker) {
				infoWindow.marker = marker;
				infoWindow.setContent('<div>' + marker.title + '</div>');
				infoWindow.open(map, marker);

				infoWindow.addListener('closeClick', function() {
					infoWindow.setMarker(null);
				});
			}
		}
	}

}