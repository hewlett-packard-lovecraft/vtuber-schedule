""" Seed database with JSON """

from pathlib import Path
import json
from typing import Dict
from sqlalchemy.orm import sessionmaker

from .pydantic_classes import Organization as Org_data
from db.connect import engine, Session, SQLALCHEMY_DATABASE_URI
from db.models import Organization, Group, Channel, Base


def to_organization(json_dict: Dict, Session: sessionmaker) -> None:
    """deserialize json dict to Organization object"""
    org_data = Org_data(**json_dict)
    org = Organization(name=org_data.name)

    print("Adding organization", org_data.name)

    for group_name, channels in org_data.groups.items():
        group = Group(name=group_name)
        print("Adding group", group_name, "to", org_data.name)

        for channel_data in channels:
            channel = Channel(
                name=channel_data.name,
                youtube_url=channel_data.youtube,
                youtube_id=channel_data.channelId,
                twitter=channel_data.twitter,
                avatar=channel_data.img,
            )
            print("Adding channel", channel_data.name, "to group", group_name)

            group.channels.append(channel)

        org.groups.append(group)

    with Session.begin() as session:
        session.add(org)


def main() -> None:
    """Create tables, iterate through each file in ./json/ and create each Organization"""
    print("Seeding", SQLALCHEMY_DATABASE_URI)

    Base.metadata.create_all(engine, checkfirst=True)
    print("Created tables")

    json_dir = Path(".", "db", "seed", "json")

    if json_dir.is_dir() is False:
        print("JSON directory is empty or doesn't exist")
        return

    for file in json_dir.iterdir():
        print(f"Deserializing {file}")
        to_organization(json.load(file.open()), Session)

    print("Seeded", SQLALCHEMY_DATABASE_URI)


if __name__ == "__main__":
    main()
