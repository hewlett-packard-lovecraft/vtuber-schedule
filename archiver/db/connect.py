"""Create SQLAlchemy engine and sessionmaker """

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from modules.env import SQLALCHEMY_DATABASE_URI


engine = create_engine(SQLALCHEMY_DATABASE_URI)
Session = sessionmaker(engine, future=True)
