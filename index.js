const lat = 26;
const lng = 100;
const init_zoom = 2.5;

const map = L.map('map', {zoomSnap: 0.5, zoomControl: false, attributionControl: false}).setView([lat,lng], init_zoom);
tiles = L.tileLayer('https://maps.geoapify.com/v1/tile/osm-liberty/{z}/{x}/{y}.png?apiKey=2d48a66bc8f54e8cbd300d2c48ce012d', {
  attribution: 'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | <a href="https://openmaptiles.org/" target="_blank">© OpenMapTiles</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap</a> contributors',
  maxZoom: 20, id: 'osm-bright'
});
tiles.addTo(map);

$(document).ready(function () {
    map.invalidateSize();
});

// var southWest = L.latLng(-89.98155760646617, -180),
// northEast = L.latLng(89.99346179538875, 180);
var southWest = L.latLng(-90, -173.3),
northEast = L.latLng(90, 186.7);
var bounds = L.latLngBounds(southWest, northEast);

map.setMaxBounds(bounds);
map.on('drag', function() {
    map.panInsideBounds(bounds, { animate: false });
});

map.options.minZoom = 2.5;
map.fire('zoomend');
// map.options.worldCopyJump = true;

L.Control.zoomHome = L.Control.extend({
    options: {
        position: 'topleft',
        zoomInText: '+',
        zoomInTitle: 'Zoom in',
        zoomOutText: '-',
        zoomOutTitle: 'Zoom out',
        zoomHomeText: '<i class="fa fa-home" style="line-height:1.65;"></i>',
        zoomHomeTitle: 'Zoom home'
    },

    onAdd: function (map) {
        var controlName = 'gin-control-zoom',
            container = L.DomUtil.create('div', controlName + ' leaflet-bar'),
            options = this.options;

        this._zoomInButton = this._createButton(options.zoomInText, options.zoomInTitle,
        controlName + '-in', container, this._zoomIn);
        this._zoomHomeButton = this._createButton(options.zoomHomeText, options.zoomHomeTitle,
        controlName + '-home', container, this._zoomHome);
        this._zoomOutButton = this._createButton(options.zoomOutText, options.zoomOutTitle,
        controlName + '-out', container, this._zoomOut);

        this._updateDisabled();
        map.on('zoomend zoomlevelschange', this._updateDisabled, this);

        return container;
    },

    onRemove: function (map) {
        map.off('zoomend zoomlevelschange', this._updateDisabled, this);
    },

    _zoomIn: function (e) {
        this._map.zoomIn(e.shiftKey ? 3 : 1);
    },

    _zoomOut: function (e) {
        this._map.zoomOut(e.shiftKey ? 3 : 1);
    },

    _zoomHome: function (e) {
        map.setView([lat, lng], init_zoom);
    },

    _createButton: function (html, title, className, container, fn) {
        var link = L.DomUtil.create('a', className, container);
        link.innerHTML = html;
        link.href = '#';
        link.title = title;

        L.DomEvent.on(link, 'mousedown dblclick', L.DomEvent.stopPropagation)
            .on(link, 'click', L.DomEvent.stop)
            .on(link, 'click', fn, this)
            .on(link, 'click', this._refocusOnMap, this);

        return link;
    },

    _updateDisabled: function () {
        var map = this._map,
            className = 'leaflet-disabled';

        L.DomUtil.removeClass(this._zoomInButton, className);
        L.DomUtil.removeClass(this._zoomOutButton, className);

        if (map._zoom === map.getMinZoom()) {
            L.DomUtil.addClass(this._zoomOutButton, className);
        }
        if (map._zoom === map.getMaxZoom()) {
            L.DomUtil.addClass(this._zoomInButton, className);
        }
    }
});
// add the new control to the map
var zoomHome = new L.Control.zoomHome();
zoomHome.addTo(map);

L.control.scale().addTo(map); // Adding scale control to the map

var cMap = "";

function cHashMap(json) {
    var lCMap = d3.group(json, j => j.country);
    getCHashMap(lCMap);
}

function getCHashMap(data) {
    cMap = data;
}

d3.json("population.json").then(cHashMap);

// const country_borders = fetchJSON("ting copy 2.json");

function getColor(d) {
    // d = parseFloat(d);
    return d > 1000000000 ? '#FF0000' :
        d > 100000000  ? '#FFA07A' :
        d > 50000000  ? '#FF8800' :
        d > 25000000  ? '#FFCC00' :
        d > 10000000   ? '#FFFF00' :
        d > 1000000 ? '#FFFFB6':
        d > 0 ? '#C4F2F8' : '#5A5A5A';
}

// L.geoJSON(country_borders).addTo(map);
d3.json("ting.json").then(function (json){
	function style(feature) {
		return {
            fillColor: cMap.get(feature.properties.GEOUNIT) ? getColor(cMap.get(feature.properties.GEOUNIT)[0].population) : getColor(0),
			weight: 1,
			opacity: 0.4,
			color: 'white',
			fillOpacity: 0.5
		};
	}
	L.geojson = L.geoJson(json, {
		onEachFeature: onEachFeature,
		style : style
	}).addTo(map);

	function onEachFeature(feature, layer){
		layer.on({
			click : onCountryClick,
			mouseover : onCountryHighLight,
			mouseout : onCountryMouseOut
		});
	}
});

/**
 * Callback for mouse out of the country border. Will take care of the ui aspects, and will call
 * other callbacks after done.
 * @param e the event
 */
function onCountryMouseOut(e){
	L.geojson.resetStyle(e.target);
//	$("#countryHighlighted").text("No selection");

	var countryName = e.target.feature.properties.name;
	var countryCode = e.target.feature.properties.iso_a2;
//callback when mouse exits a country polygon goes here, for additional actions
}

/**
 * Callback for when a country is clicked. Will take care of the ui aspects, and it will call
 * other callbacks when done
 * @param e
 */
function onCountryClick(e){
	document.getElementById("country-name").textContent = e.target.feature.properties.GEOUNIT;
	const img = document.getElementById("country-flag");
    const pop = document.getElementById("country-pop");
	if (img) {
		img.src = "./flags/" + e.target.feature.properties.ISO_A2_EH + ".svg";
        pop.textContent = "Population: " + (cMap.get(e.target.feature.properties.GEOUNIT) ? (cMap.get(e.target.feature.properties.GEOUNIT)[0].population).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : "No Data");
	}
	else {
		const parent1 = document.getElementById("flag-image-cell");
        const parent2 = document.getElementById("card-contents");
		const img_child = document.createElement("img");
        img_child.id = "country-flag";
        const pop = document.createElement("p");
        pop.id = "country-pop";
		img_child.src = "./flags/" + e.target.feature.properties.ISO_A2_EH + ".svg";
        pop.textContent = "Population: " + (cMap.get(e.target.feature.properties.GEOUNIT) ? (cMap.get(e.target.feature.properties.GEOUNIT)[0].population).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : "No Data");
		parent1.appendChild(img_child);
        parent2.appendChild(pop);
	}
}

/**
 * Callback for when a country is highlighted. Will take care of the ui aspects, and it will call
 * other callbacks after done.
 * @param e
 */
function onCountryHighLight(e){
	var layer = e.target;

	layer.setStyle({
		weight: 2,
		color: '#666',
		dashArray: '',
		fillOpacity: 0.7
	});

	if (!L.Browser.ie && !L.Browser.opera) {
		layer.bringToFront();
	}

	var countryName = e.target.feature.properties.name;
	var countryCode = e.target.feature.properties.iso_a2;
//callback when mouse enters a country polygon goes here, for additional actions
}

// function checkIt(data) {
//     var countriesByName = d3.group(data, d => d.country);
//     countriesByName = Object.fromEntries(countriesByName);
//     //console.log(countriesByName)
//     var data = JSON.stringify(countriesByName);
//     console.log(new Map(JSON.parse(data)));
//     console.log(data);
//     var data = JSON.parse(data);
   
//     function makePie() {
//         function myfunc(data) {
//             var obj = [];
//             for (var i in data) {
//                 console.log(data[i][0]);
//                 obj.push(data[i][0].country+': '+ 
//                             data[i][0].population+ "<br>");
//             }
//             document.getElementById("left").innerHTML=obj.toString();
//         }
//         var data1 = myfunc(data)
//     }
//     makePie();
// };

// d3.json("population.json").then(checkIt);

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
    grades = [0, 1000000, 10000000, 25000000, 50000000, 100000000, 1000000000],
    labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        if(grades[i] == 0) {
            div.innerHTML += '<i style="background:' + getColor(grades[i]) + '"></i> ' + "No Data" + '<br>';
        }
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (grades[i + 1] ? '&ndash;' + grades[i + 1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '<br>' : '+');
}

return div;
};

legend.addTo(map);