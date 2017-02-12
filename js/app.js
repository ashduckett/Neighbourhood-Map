window.onload = function() {
	ko.applyBindings(new ViewModel());
};

// This represents each location
var Location = function(title, latitude, longitude, searchTerm, relevance, id) {
	// A title as displayed in the info window
	this.title = title;

	// Where to place the marker in the info window
	this.latitude = latitude;
	this.longitude = longitude;

	// A way of getting Wikipedia to spit back better results than just using the title
	this.searchTerm = searchTerm;

	// A bit added by me to show the user the relevance to the twins an area has that wikipedia might have missed.
	this.relevance = relevance;

	// Some identifier. Useful in marrying up the markers to the location objects.
	this.id = id;
};

Location.prototype.getTitle = function() {
	return this.title;
};

Location.prototype.getSearchTerm = function() {
	return this.searchTerm;
};

Location.prototype.getLatLngLiteral = function() {
	return {
		lat: this.latitude,
		lng: this.longitude
	};
};

Location.prototype.getRelevance = function() {
	return this.relevance;
};

var Model = function(viewModel) {

	// So we can talk to the octopus/controller
	this.viewModel = viewModel;
	// No knockout requred here. We're just initialising the map and this will also be handy
	// for the initial state of the list of locations.
	this.locations = [
		new Location('178 Vallance Road', 51.524026, -0.06396, 'Bethnal Green', 'The Kray Twins\'s childhood home.', 0),
		new Location('The Blind Beggar',  51.520052, -0.056939, 'The Blind Beggar', 'The location where Ronnie shot George Cornell.', 1),
		new Location('Pellicci\'s Cafe', 51.52649, -0.063428, 'Bethnal Green', 'A favourite haunt of the Kray\'s in Bethnal Green', 2),
		new Location('Esmerelda\'s Barn', 51.501943, -0.156234, 'Esmeralda\'s Barn', 'Now a five star hotel called the Berkely, this was once a Knightsbridge club owned by the Kray twins from 1960 to 1963 when it was closed.', 3),
		new Location('Bow Street Magistrates\' Court', 51.527344, -0.023625, 'Bow Street Magistrates\' Court', 'The Krays were among numerous famous defendants to appear at Bow Street during its 266 year existence. It closed in 2006.', 4),
		new Location('The Tower of London', 51.508112, -0.075949, 'Tower of London', 'In 1952, the twins were among the last prisoners to be held at the tower. They had failed to report for national service', 5),
		new Location('The Royal Oak', 51.529547, -0.069298, 'The Royal Oak, Bethnal Green', 'The Krays weren\'t known to have frequented this Columbia Road pub, but it appears in both Legend and the 1990 film \'The Krays\'.', 6),
		new Location('Repton Boy\'s Club', 51.524215, -0.065311, 'Cheshire Street', 'This club is where the twins trained to box. It\'s been running since 1984.', 7),
		new Location('The Carpenter\'s Arms', 51.523962, -0.067356, 'Cheshire Street', 'Purchased by the twins in 1967 as a gift for their mother, Violet.', 8),
		new Location('The Speakeasy Club', 51.516436, -0.141724, 'The Speakeasy Club', 'This club at 48 Margaret Street was there until 1970. A lifelong friend of the twins Laurie O\'Leary became manager in 1968.', 9),
		new Location('Turners Old Star', 51.505372, -0.059403, 'Wapping', 'Not a pub the twins frequented, but this pub can be seen in the film \'Legend\'.', 10),
		new Location('The Ivy House', 51.458296, -0.052114, 'The Ivy House', 'Not a pub the twins frequented, but this pub can be seen in the film \'Legend\'.', 11),		
		new Location('97 Evering Road', 51.558621, -0.067523, 'Jack McVitie', 'Jack "the Hat" McVite was murdered by Reggie Kray in 1967 at this basement flat in Stoke Newington.', 12),
		new Location('Wiliton Music Hall', 51.510701, -0.066897, 'Wilton\'s Music Hall', 'This music hall appears in the 1990 film \'The Krays\'.', 13),
		new Location('St Matthews\'s Church', 51.525074, -0.06693, 'St Matthew\'s, Bethnal Green', 'The funeral services for both twins were held at this 18th-century church on Hereford Street.', 14)
	];

	// A place to keep track of markers. Model of View? Individually I'd say view, but since I am keeping track of them they feel more modelly...no? Maybe they should be kept track of differently.
	// Also, the map stuff is generally done by google's api, so its view would have very little in it. Call it part of the model for google, but you can tell I'm kind of torn.
	this.markers = [];
};

Model.prototype.getLocations = function() {
	return this.locations;
};

Model.prototype.addMarker = function(key, value) {
	this.markers[key] = value;
};

Model.prototype.getMarkerById = function(id) {
	return this.markers[id];
};

Model.prototype.getMarkers = function() {
	return this.markers;
};
 
var ViewModel = function() {
	if (typeof google === 'undefined') {
		alert('Google object not initialised. Cannot continue.');
	} else {
		// This model contains all our locations
		this.model = new Model();
		this.mapView = new MapView(this);
		this.searchText = ko.observable();


		// Now I want an observable array to store all of the items in the list view
		// This will be about our only use of knockout...I think?
		
		// A master copy
		this.actualListViewListings = this.model.getLocations();

		// What's displayed in the list on the screen
		this.listViewListings = ko.observableArray(this.model.getLocations());
		

		var context = this;

		// This fires when someone types into the search field
		this.searchText.subscribe(function(newValue) {
			
			// A place to store Location objects that match the search
			var results = [];

			// If there is something in the search box
			if(newValue.trim() != '') {

				// Iterate over the original list of locations
				for(var i = 0; i < context.actualListViewListings.length; i++) {

					// Grab the title
					var title = context.actualListViewListings[i].title;
					
					// Case insensitive search of the new value for the current title
					var regularExp = new RegExp(newValue, 'i');
					var matches = regularExp.exec(title);

					// If there is a match, store the Location object in the results array, and
					// make show the marker is displayed for it
					if(matches != null) {
						results.push(context.actualListViewListings[i]);
						//context.getMarkerById(i).setMap(context.mapView.getMap());
						context.getMarkerById(i).setVisible(true);
					} else {
						// Otherwise hide the marker
						//context.getMarkerById(i).setMap(null);
						context.getMarkerById(i).setVisible(false);
					}
				}
				// Add the results to the displaying observable array
				context.listViewListings(results);
			} else {
				// Just display everything because no filter's applied
				context.listViewListings(context.actualListViewListings);


				var allMarkers = context.model.getMarkers();

				for(var i = 0; i < allMarkers.length; i++) {
					allMarkers[i].setVisible(true);
				}			
			}
		});


		// Initialise the map and get it to show, based on the locations in our model
		this.mapView.init(this.model.getLocations());

		var infoWindow = new google.maps.InfoWindow();
		// Method called by knockout to animate clicked marker and display information.
		this.animateMarker = function(listLocation) {
	       	var marker = this.model.getMarkerById(listLocation.id);
	       	this.mapView.populateInfoWindow(marker, listLocation.getSearchTerm(), listLocation.getRelevance(), infoWindow);
		}.bind(this);
	}
};

ViewModel.prototype.storeMarker = function(key, value) {
	this.model.addMarker(key, value);
};

ViewModel.prototype.getMarkerById = function(id) {
	return this.model.getMarkerById(id);
}

ViewModel.prototype.getMarkers = function() {
	return this.model.getMarkers();
}

var MapView = function(viewModel) {
	this.viewModel = viewModel;
	this.map = null;
}

MapView.prototype.getMap = function() {
	return this.map;
}

MapView.prototype.init = function(locations) {
	
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 0.0, lng: 0.0},	// Think this is london
		zoom: 13
	});

	this.map = map;

	var infoWindow = new google.maps.InfoWindow();
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
		
		this.viewModel.storeMarker(marker.id, marker);
		var context = this;


		// Sadly this can't be done with knockout since it won't track the markers
		marker.addListener('click', (function(location) {
			return function() {
				context.populateInfoWindow(this, location.getSearchTerm(), location.relevance, infoWindow);
			}
		})(location));
		map.fitBounds(bounds);
	}

	// Ensure markers are always displayed as screen is resized
	google.maps.event.addDomListener(window, 'resize', function() {
  		map.fitBounds(bounds);
	});


};

MapView.prototype.populateInfoWindow = function(marker, searchTerm, relevance, infoWindow) {
	
	// Check to see if an info window was displayed previously, and if it was, close it.
	if(this.infoWindow != null) {
    	this.infoWindow.close();
    }

    // Check to make sure the infoWindow is not already opened on this marker
	if(infoWindow.marker != marker) {
		
		// Stop all other animating markers
		for(var i = 0; i < this.viewModel.getMarkers().length; i++) {
			this.viewModel.getMarkers()[i].setAnimation(null);
		}

		var context = this;

		infoWindow.marker = marker;
		marker.setAnimation(google.maps.Animation.BOUNCE);	
		var wikiUrl = 'http://en.wikipedggia.org/w/api.php?action=opensearch&search=' + searchTerm +
 		'&format=json&callback=wikiCallback';

		$.ajax({
			url: wikiUrl,
			dataType: "jsonp",
			success: function(response) {
				// This gets the text we want
				var articleText = response[2][0];
				var articleLink = response[3][0];

				if(!articleText) {
					articleText = "Article text not found."
				}

				if(!articleLink) {
					articleLink = '<p>No link found.</p>';
				} else {
					articleLink = '<p><a href="' + articleLink + '">Find out more about ' + marker.title + ' here.</a></p>';
				}

				var sourcesHTML = '<p><em>Sources: <a href="http://www.telegraph.co.uk">The Telegraph</a> and <a href="https://en.wikipedia.org">Wikipedia</a>.</em></p>';

				infoWindow.setContent('<div><strong>' + marker.title + '</strong></div><div><p>' + articleText + 
					'</p><p>' + relevance + '</p>' + articleLink + sourcesHTML);
				
				infoWindow.open(map, marker);

				// Stash the info window so it can be closed when a new one pops up.
				context.infoWindow = infoWindow;
			},
			error: function() {
				infoWindow.setContent('<div>There appears to be a problem obtaining Wikipedia information. Try later.</div>');
				infoWindow.open(map, marker);
			}



	});
	}
}

function googleApiError() {
	window.alert('Error! The Google API has broken. Please try again later.')
}