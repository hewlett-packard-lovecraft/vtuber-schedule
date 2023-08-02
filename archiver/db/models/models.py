""" SQLAlchemy model classess -- split this into multiple classes later """

from sqlalchemy import (
    Column,
    String,
    ForeignKey,
    DateTime,
    func,
    Boolean,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship, registry
from sqlalchemy.orm.decl_api import DeclarativeMeta


mapper_registry = registry()


class Base(metaclass=DeclarativeMeta):
    __abstract__ = True

    registry = mapper_registry
    metadata = mapper_registry.metadata

    __init__ = mapper_registry.constructor


class Organization(Base):
    """SQLAlchemy Organization model"""

    __tablename__ = "organization_table"

    name = Column(String, primary_key=True)
    groups = relationship("Group", back_populates="org", cascade="all, delete-orphan")


class Group(Base):
    """SQLAlchemy Group model"""

    __tablename__ = "group_table"

    name = Column(String, primary_key=True)
    org = relationship(Organization, back_populates="groups")
    org_name = Column(String, ForeignKey(Organization.name), nullable=False)

    channels = relationship(
        "Channel", back_populates="group", cascade="all, delete-orphan"
    )


class Channel(Base):
    """SQLAlchemy Channel model"""

    __tablename__ = "channel_table"

    name = Column(String)
    youtube_url = Column(String)
    youtube_id = Column(String, primary_key=True)
    twitter = Column(String)
    avatar = Column(String)
    time_updated = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    group = relationship(Group, back_populates="channels")
    group_name = Column(String, ForeignKey(Group.name), nullable=False)

    streams = relationship(
        "Stream", back_populates="channel", cascade="all, delete-orphan"
    )

    __table_args__ = (UniqueConstraint(name, youtube_url, youtube_id),)


class Stream(Base):
    """SQLAlchemy Stream model"""

    __tablename__ = "stream_table"

    title = Column(String)
    youtube_url = Column(String)
    youtube_id = Column(String, primary_key=True)
    thumbnail = Column(String)
    time_updated = Column(
        DateTime(timezone=True), default=func.now(), onupdate=func.now()
    )
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    live = Column(Boolean)

    channel: Channel = relationship(Channel, back_populates="streams")
    channel_name = Column(String, ForeignKey(Channel.name))

    __table_args__ = (UniqueConstraint(youtube_id, youtube_url),)
