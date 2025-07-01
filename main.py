import os
from src.login import login

session_file = "session.json"

# only execute the login function if the session.json file does not exist, to prevent instagram from detecting and flagging account as a bot!
if not os.path.exists(session_file):
    login()
