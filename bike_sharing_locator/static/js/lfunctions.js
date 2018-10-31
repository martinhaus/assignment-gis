var greenIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

var blueIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

let markers = {};
let lines = [];

function clear_all_markers() {
    for (let id in markers) {
        markers[id].setIcon(blueIcon);
    }
}

function clear_all_lines() {
    for (let id in lines) {
        map.removeLayer(lines[id]);
    }
}


let map = L.map('map').setView([48.145, 17.107], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


let popup = L.popup();

function onMapClick(e) {
    clear_all_markers();
    $.get("stands/nearest", {lat: e.latlng.lat, lng: e.latlng.lng, not_empty: $('#with_bikes_only').prop("checked")} , function (data) {
        $('#side_info').html('<div id="nearest_stations"></div>');
        data.forEach(function (stand) {
            $('#nearest_stations').append(stand[1] + '-' + stand[2] + " meters<br>");
            markers[stand[0]].setIcon(greenIcon);
        });
    })

}

map.on('click', onMapClick);


jQuery(document).ready(function($){
    //Load all stands
    $.get( "stands", function( data ) {
      data.forEach(function (stand) {
          let coordinates = JSON.parse(stand[2]).coordinates;

          markers[stand[0]] = L.marker([coordinates[1], coordinates[0]], {id: stand[0], title: stand[1]})
              .on('click', onStandClick)
              .on('contextmenu', onStandRightClick)
              .addTo(map)
              .bindPopup('<b>' + stand[1] + '</b>');
      })
    });
});

function onStandClick(e) {
    let stand_name = this.options.title;
    let popup = this;

    $.get("bike_count/" + stand_name, function ( data ) {
        let bike_count = JSON.parse(data);
        popup.setPopupContent('<b>' + stand_name + '</b><br>available bicycles: ' + bike_count );
    })
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
            // lines.push(L.geoJson(JSON.parse(line)).addTo(map));
        });



        // myLayer.addData(data);
    })
}

function getByStreetName() {
    let name = $('#search_bar').val();
    $.get("stands/nearest/" + name, {not_empty: $('#with_bikes_only').prop("checked")},  function (data) {
        clear_all_markers();
        $('#side_info').html('<div id="nearest_stations"></div>');
        data.forEach(function (stand) {
            $('#nearest_stations').append(stand[1] + '-' + stand[2] + " meters<br>");
            markers[stand[0]].setIcon(greenIcon);
        });
    })
}