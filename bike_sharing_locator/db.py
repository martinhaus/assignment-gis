import psycopg2

def connect_to_db():

    conn_string = "host='localhost' dbname='gis' user='postgres' password='postgres'"
    conn = psycopg2.connect(conn_string)
    return conn.cursor()
