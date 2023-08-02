""" Declare pydantic classes """

from typing import Dict, List
from pydantic import BaseModel


class Channel(BaseModel):
    """Channel dataclass for pydantic"""

    img: str
    name: str
    group: str
    channelId: str
    youtube: str
    twitter: str


class Organization(BaseModel):
    """Organizaton dataclass for pydantic"""

    name: str
    groups: Dict[str, List[Channel]]
