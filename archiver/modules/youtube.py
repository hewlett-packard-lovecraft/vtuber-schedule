""" Create youtube_v3 resource object """

from .env import GOOGLE_API_KEY
from googleapiclient.discovery import build

DEVELOPER_KEY = GOOGLE_API_KEY
YOUTUBE_API_SERVICE_NAME = "youtube"
YOUTUBE_API_VERSION = "v3"

youtube = build(
    YOUTUBE_API_SERVICE_NAME, YOUTUBE_API_VERSION, developerKey=DEVELOPER_KEY
)
