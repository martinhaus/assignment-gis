import json
import urllib.request
from db import connect_to_db


def get_current_bike_count(stand_name):
    req = urllib.request.Request('http://whitebikes.info/command.php?action=list&stand=' + stand_name)
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.readline().decode('utf-8'))
    return len(result['content'])


def get_all_stands():
    cursor = connect_to_db()
    cursor.execute("select osm_id, name, ST_AsGeoJSON(st_transform(way, 4326)) from planet_osm_point where amenity like 'bicycle_rental' and operator like 'WhiteBikes'")
    stands = cursor.fetchall()
    return stands


def get_nearest_stands(lat, lng, not_empty):
    cursor = connect_to_db()
    cursor.execute("SELECT osm_id, name, trunc(ST_Distance(way, st_transform( st_setsrid(st_makepoint({lng}, {lat}), 4326), 3857))) AS distance "
                   "FROM planet_osm_point "
                   "WHERE ST_DWithin(way, st_transform( st_setsrid(st_makepoint({lng}, {lat}), 4326), 3857), 2000) "
                   "AND amenity = 'bicycle_rental' and operator like 'WhiteBikes' "
                   "ORDER BY distance "
                   ";".format(lat=lat, lng=lng))

    stands = cursor.fetchall()

    if not_empty == 'true':
        stands_with_bikes = []

        for stand in stands:
            bike_count = get_current_bike_count(stand[1])
            if bike_count > 0:
                stands_with_bikes.append(stand)
        stands = stands_with_bikes

    return stands


def get_nearest_stands_by_street(street_name, not_empty = False):
    cursor = connect_to_db()
    cursor.execute("SELECT osm_id, name, distance FROM ("
                   "WITH RECURSIVE streets AS ("
                   "SELECT osm_id, name, way FROM planet_osm_line "
                   "WHERE upper(name) = upper('{street_name}')) "
                   "SELECT DISTINCT ON (p.osm_id) p.osm_id, p.name, p.way,  trunc(st_distance(st_setsrid(p.way, 4326), st_setsrid(l.way, 4326))) AS distance FROM planet_osm_point p, streets l "
                   "where p.amenity = 'bicycle_rental' AND p.operator = 'WhiteBikes' AND ST_DWithin(st_setsrid(p.way, 4326), st_setsrid(l.way, 4326), 1000)) unordered_stands "
                   "ORDER BY distance;"
                   ";".format(street_name=street_name))

    stands = cursor.fetchall()

    if not_empty == 'true':
        stands_with_bikes = []

        for stand in stands:
            bike_count = get_current_bike_count(stand[1])
            if bike_count > 0:
                stands_with_bikes.append(stand)
        stands = stands_with_bikes

    return stands


def get_nearest_bike_paths(stand_id):
    cursor = connect_to_db()
    cursor.execute("select st_asgeojson(st_transform(l.way,4326)) from planet_osm_point p, planet_osm_line l "
                   "where p.osm_id = {stand_id} and (l.bicycle = 'designated' or l.highway = 'cycleway') and ST_DWithin(st_setsrid(p.way, 4326), st_setsrid(l.way, 4326), 1000) "
                   ";".format(stand_id=stand_id))

    paths = cursor.fetchall()
    return paths
