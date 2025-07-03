from typing import Optional
import logging
from instagrapi import Client

logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def get_last_post(cl: Client, username: str):
    user_id = cl.user_id_from_username(username)
    medias = cl.user_medias(user_id, amount=1)
    if medias:
        latest_media = medias[0]
        post_url = f"https://www.instagram.com/p/{latest_media.code}/"
        return post_url
    else:
        return None
    
def get_last_post_url(cl: Client, username: str) -> Optional[str]:
    """Get the URL of the user's last post"""
    try:
        user_id = cl.user_id_from_username(username)
        medias = cl.user_medias(user_id, amount=1)
        if medias:
            media = medias[0]
            return f"https://instagram.com/p/{media.code}/"
        return None
    except Exception as e:
        logger.error(f"Error getting last post: {e}")
        return None
