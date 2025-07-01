import time

from instagrapi import Client



def send_dm_all(cl: Client, usernames, message_text: str):
    for username in usernames:
        try:
            user_id = cl.user_id_from_username(username)
            cl.direct_send(message_text, [user_id])
            print(f"Message sent to: @{username}")
        except Exception as e:
            print(f"Failed to send message to @{username}: {e}")
        time.sleep(10)  # Respect rate limits
