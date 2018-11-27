L.mapbox.accessToken = 'pk.eyJ1IjoibWFydGluaGF1cyIsImEiOiJjam9nM3V4cm0wMTBzM3ZxbHl3cHk2bXczIn0.sAHu5gaBVyxf4KsAFXy1Zw';

let map = L.mapbox.map('map', 'mapbox.streets').setView([48.145,17.107], 12);
let stands_layer = L.mapbox.featureLayer().addTo(map);
let greenIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
let blueIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

let markers = {};
let lines = [];
let district_layer;

function clear_all_markers() {
    for (let id in markers) {
        markers[id].setIcon(blueIcon);
    }
}

function clear_all_lines() {
    if(lines.length > 0) {
        for (let id in lines) {
            map.removeLayer(lines[id]);
        }
    }
}

function clear_district() {
    map.removeLayer(district_layer);
}

function clear_all() {
    clear_all_lines();
    clear_all_markers();
    clear_district();
}

function onMapClick(e) {
    clear_all();
    $.get("stands/nearest", {lat: e.latlng.lat, lng: e.latlng.lng, not_empty: $('#with_bikes_only').prop("checked")} , function (data) {
        $('#side_info').html('<div id="nearest_stations"></div>');
        mark_stands_with_distance(data);
    });
}

map.on('click', onMapClick);

function onStandClick(e) {
    let stand_name = this.options.title;
    let popup = this;

    $.get("bike_count/" + stand_name, function ( data ) {
        let bike_count = JSON.parse(data);
        popup.setPopupContent('<b>' + stand_name + '</b><br>available bicycles: ' + bike_count );
    });
}

function onStandRightClick() {
    clear_all_lines();

    let stand_id = this.options.id;
    var myStyle = {
        "color": "#ff7800",
        "weight": 5,
        "opacity": 0.65
    };
    $.get("stand/" + stand_id + '/paths', function (data) {

        data.forEach(function (line) {
            let new_layer = L.geoJson().addTo(map);
            lines.push(new_layer);
            new_layer.addData(JSON.parse(line));
        });
    })
}

function getByStreetName() {
    let name = $('#search_bar').val();
    $.get("stands/nearest/" + name, {not_empty: $('#with_bikes_only').prop("checked")},  function (data) {
        clear_all_markers();
        clear_all_lines();

        mark_stands_with_distance(data);
    });
}

function searchDistrict() {
    let name = $('#search_bar_district').val();
    getDistrictByName(name);
    getStandsByDistrictName(name);
}

// Get district from DB using given name
function getDistrictByName(name) {
    $.get('/districts/' +  name, function (data) {
        if (district_layer !== undefined) {
            clear_district();
        }
        district_layer = L.geoJson().addTo(map);
        district_layer.addData(JSON.parse(data));
    });
}

function getStandsByDistrictName(name) {
    $.get('/stands/district/' + name , function (data) {
        clear_all_markers();
        mark_stands(data);
    });
}

function mark_stands_with_distance(stands) {
    $('#side_info').html('<div id="nearest_stations"></div>');
    stands.forEach(function (stand) {
            $('#nearest_stations').append(stand[1] + '-' + stand[2] + " meters<br>");
            markers[stand[0]].setIcon(greenIcon);
    });
}

function mark_stands(stands) {
    $('#side_info').html('<div id="nearest_stations"></div>');
    stands.forEach(function (stand) {
            $('#nearest_stations').append(stand[1] + "<br>");
            markers[stand[0]].setIcon(greenIcon);
    });
}


jQuery(document).ready(function($){
    //Load all stands
    $.get( "stands", function( data ) {
      data.forEach(function (stand) {
          let coordinates = JSON.parse(stand[2]).coordinates;
          markers[stand[0]] = L.marker([coordinates[1], coordinates[0]], {id: stand[0], title: stand[1]})
              .on('click', onStandClick)
              .on('contextmenu', onStandRightClick)
              .addTo(stands_layer)
              .bindPopup('<b>' + stand[1] + '</b>');
      });
    });
});
