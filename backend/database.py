from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, scoped_session
from config import Config

engine = create_engine(
    Config.SQLALCHEMY_DATABASE_URI, 
    connect_args={"check_same_thread": False} if "sqlite" in Config.SQLALCHEMY_DATABASE_URI else {}
)

db_session = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

Base = declarative_base()
Base.query = db_session.query_property()

def init_db():
    import app.models.user
    import app.models.honeytoken
    import app.models.security_event
    import app.models.alert
    import app.models.activity_log
    import app.models.system_settings
    Base.metadata.create_all(bind=engine)
