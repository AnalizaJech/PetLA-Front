import os
from flask import current_app, g
from pymongo import MongoClient


def get_db():
    if 'mongo_client' not in g:
        uri = current_app.config['MONGO_URI']
        g.mongo_client = MongoClient(uri)
    dbname = current_app.config['MONGO_DB']
    return g.mongo_client[dbname]


def close_db(e=None):
    client = g.pop('mongo_client', None)
    if client is not None:
        client.close()


def init_db(app):
    app.teardown_appcontext(close_db)
