import os
from dotenv import load_dotenv
from instagrapi import Client

load_dotenv()

def login():
    """Uses the instagrapi to login to the user's accounts and creates a session.json which can be reused later to login directly without having to execute this method and hence prevent possible flagging as a bot."""
    username = os.getenv("IG_USERNAME")
    password = os.getenv("IG_PASSWORD")    
    print(username)
    print(password)
    cl = Client()
    cl.login(username, password)
    cl.dump_settings("session.json")
