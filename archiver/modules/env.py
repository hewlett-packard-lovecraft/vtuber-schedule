""" load config from environment """

from os import environ
from dotenv import load_dotenv, find_dotenv

# Load variables from .env
load_dotenv(find_dotenv())

# set default values
SQLALCHEMY_DATABASE_URI = environ.get("SQLALCHEMY_DATABASE_URI") or "sqlite:///:memory:"
GOOGLE_API_KEY = environ.get("GOOGLE_API_KEY") or ""

VIDEOLIST_RSS_CHANNELS_PER_CRAWL = int(
    environ.get("VIDEOLIST_RSS_CHANNELS_PER_CRAWL") or "10"
)
