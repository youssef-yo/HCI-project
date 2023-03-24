import logging
import os

from pymongo import MongoClient

from db.database import db


MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://devusername:devpassword@mongodb:27017/')


def connect_to_db():
    logging.info('Connecting to MongoDB...')

    db.client = MongoClient(MONGODB_URI)

    logging.info('Connection with MongoDB established.')


def close_db_connection():
    logging.info('Attempting to close the connection with MongoDB...')

    db.client.close()

    logging.info('Connection with MongoDB terminated.')