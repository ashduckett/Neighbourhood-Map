
var Location = function(title, latitude, longitude, searchTerm, relevance) {
	this.title = title;
	this.latitude = latitude;
	this.longitude = longitude;
	this.searchTerm = searchTerm;
	this.relevance = relevance;
}

Location.prototype.getTitle = function() {
	return this.title;
}

Location.prototype.getSearchTerm = function() {
	return this.searchTerm;
}

Location.prototype.getLatLngLiteral = function() {
	return {
		lat: this.latitude,
		lng: this.longitude
	}
}

Location.prototype.getRelevance = function() {
	return this.relevance;
}

var LocationSet = function(locations) {
	this.locationSet = [];

	for(var i = 0; i < locations.length; i++) {
		this.locationSet.push(locations[i]);
	}
}

LocationSet.prototype.getLocationCount = function() {
	return this.locationSet.length;
}

LocationSet.prototype.getLocationArrayForGoogleMaps = function() {
	var result = [];

	for(var i = 0; i < this.locationSet.length; i++) {
		result.push({title: this.locationSet[i].getTitle(), location: {lat: this.locationSet[i].latitude, lng: this.locationSet[i].longitude}, id: i});
	}
	return result;
}

LocationSet.prototype.getLocationsAsArray = function() {
	return this.locationSet;
}


var Model = function() {
	// No knockout requred here. We're just initialising the map and this will also be handy
	// for the initial state of the list of locations.
	this.locationSet = new LocationSet([
		new Location('178 Vallance Road', 51.524026, -0.06396, 'Bethnal Green', 'The Kray Twins\'s childhood home.'),
		new Location('The Blind Beggar',  51.520052, -0.056939, 'The Blind Beggar', 'The location where Ronnie shot George Cornell.'),
		new Location('Pellicci\'s Café', 51.52649, -0.063428, 'Bethnal Green', 'A favourite haunt of the Kray\'s in Bethnal Green'),
		new Location('Esmerelda\'s Barn', 51.501943, -0.156234, 'Esmeralda\'s Barn', 'Now a five star hotel called the Berkely, this was once a Knightsbridge club owned by the Kray twins from 1960 to 1963 when it was closed.'),
		new Location('Bow Street Magistrates\' Court', 51.527344, -0.023625, 'Bow Street Magistrates\' Court', 'The Krays were among numerous famous defendants to appear at Bow Street during its 266 year existence. It closed in 2006.'),
		new Location('The Tower of London', 51.508112, -0.075949, 'Tower of London', 'In 1952, the twins were among the last prisoners to be held at the tower. They had failed to report for national service'),
		new Location('The Royal Oak', 51.529547, -0.069298, 'The Royal Oak, Bethnal Green', 'The Krays weren\'t known to have frequented this Columbia Road pub, but it appears in both Legend and the 1990 film \'The Krays\'.'),
		new Location('Repton Boy\'s Club', 51.524215, -0.065311, 'Cheshire Street', 'This club is where the twins trained to box. It\'s been running since 1984.'),
		new Location('The Carpenter\'s Arms', 51.523962, -0.067356, 'Cheshire Street', 'Purchased by the twins in 1967 as a gift for their mother, Violet.'),
		new Location('The Speakeasy Club', 51.516436, -0.141724, 'The Speakeasy Club', 'This club at 48 Margaret Street was there until 1970. A lifelong friend of the twins Laurie O\'Leary became manager in 1968.'),
		new Location('Turners Old Star', 51.505372, -0.059403, 'Wapping', 'Not a pub the twins frequented, but this pub can be seen in the film \'Legend\'.'),
		new Location('The Ivy House', 51.458296, -0.052114, 'The Ivy House', 'Not a pub the twins frequented, but this pub can be seen in the film \'Legend\'.'),		
		new Location('97 Evering Road', 51.558621, -0.067523, 'Jack McVitie', 'Jack "the Hat" McVite was murdered by Reggie Kray in 1967 at this basement flat in Stoke Newington.'),
		new Location('Wiliton Music Hall', 51.510701, -0.066897, 'Wilton\'s Music Hall', 'This music hall appears in the 1990 film \'The Krays\'.'),
		new Location('St Matthews\'s Church', 51.525074, -0.06693, 'St Matthew\'s, Bethnal Green', 'The funeral services for both twins were held at this 18th-century church on Hereford Street.')
	]);
};

Model.prototype.getLocationSetAsArray = function() {
	return this.locationSet.getLocationArrayForGoogleMaps();
}

Model.prototype.getLocations = function() {
	return this.locationSet.getLocationsAsArray();
}




var ViewModel = function() {

	// This model contains all our locations
	var model = new Model();

	// Initialise the map and get it to show, based on the locations in our model
	var mapView = new MapView();

	mapView.init(model.getLocations());



	// Now I want an observable array to store all of the items in the list view
	// This will be about our only use of knockout...I think?
	this.listViewListings = ko.observableArray(model.getLocationSetAsArray());

	this.animateMarker = function(listLocation) {
        mapView.animateMarker(listLocation.id);
	}



};

function kickOff() {
	var viewModel = new ViewModel();
	ko.applyBindings(viewModel);
}

var MapView = function() {
	this.markers = [];
}

MapView.prototype.animateMarker = function(id) {
	for(var i = 0; i < this.markers.length; i++) {
		this.markers[i].setAnimation(null);
	}

	// Grab the marker identified by id and animate it
	var marker = this.getMarkerById(id);
    marker.setAnimation(google.maps.Animation.BOUNCE);	
}

MapView.prototype.getMarkerById = function(id) {
	return this.markers[id];
}

MapView.prototype.getAllMarkers = function() {
	return this.markers;
}

MapView.prototype.init = function(locations) {
	var map;
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 40.7413549, lng: -73.9980244},
		zoom: 13
	});

	var largeInfoWindow = new google.maps.InfoWindow();
	var bounds = new google.maps.LatLngBounds();



	for(var i = 0; i < locations.length; i++) {
		var location = locations[i];

		var position = location.getLatLngLiteral();
		var title = location.getTitle();

		var marker = new google.maps.Marker({
			map: map,
			position: position,
			title: title,
			animation: google.maps.Animation.DROP,
			id: i
		});

		bounds.extend(marker.position);

		// Stash this for later as it'll be useful for identifying markers
		// during event handling from the list
		this.markers[marker.id] = marker;
		var context = this;

		marker.addListener('click', (function(location) {
			return function() {
				context.animateMarker(this.id);
				populateInfoWindow(this, largeInfoWindow, location.getSearchTerm(), location.relevance);
			}
		})(location));



		map.fitBounds(bounds);
	}
};

function populateInfoWindow(marker, infoWindow, searchTerm, relevance) {
	// Check to make sure the infoWindow is not already opened on this marker
	if(infoWindow.marker != marker) {
		infoWindow.marker = marker;

		var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + searchTerm +
 		'&format=json&callback=wikiCallback';

		$.ajax({
			url: wikiUrl,
			dataType: "jsonp",
			success: function(response) {
				// This gets the text we want
				var articleText = response[2][0];
				var articleLink = response[3][0];

				infoWindow.setContent('<div><strong>' + marker.title + '</strong></div><div><p>' + articleText + 
					'</p><p>' + relevance + '</p></div><p><a href="' + articleLink + '">Find out more about ' + marker.title + ' here.</a>');
				infoWindow.open(map, marker);
		}});

		infoWindow.addListener('closeClick', function() {
			infoWindow.setMarker(null);
		});
	}
}