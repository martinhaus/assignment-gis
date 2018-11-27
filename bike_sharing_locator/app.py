from flask import Flask, render_template, request
import wb
from flask import jsonify

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/stands')
def stands():
    return jsonify(wb.get_all_stands())


@app.route('/bike_count/<stand_name>')
def bike_count(stand_name):
    return jsonify(wb.get_current_bike_count(stand_name))


@app.route('/stands/nearest')
def get_nearest_stands():
    not_empty = request.args.get('not_empty')
    lat = request.args.get('lat')
    lng = request.args.get('lng')
    return jsonify(wb.get_nearest_stands(lat, lng, not_empty))


@app.route('/stands/nearest/<street_name>')
def get_nearest_stands_by_street(street_name):
    not_empty = request.args.get('not_empty')
    return jsonify(wb.get_nearest_stands_by_street(street_name, not_empty))


@app.route('/stand/<stand_id>/paths')
def get_nearest_paths(stand_id):
    return jsonify(wb.get_nearest_bike_paths(stand_id))

@app.route('/districts/<district_name>')
def get_city_district_by_name(district_name):
    return jsonify(wb.get_city_district_by_name(district_name))

@app.route('/stands/district/<district_name>')
def get_stands_by_district_name(district_name):
    return jsonify(wb.get_stands_by_city_district(district_name))


if __name__ == '__main__':
    app.run()
