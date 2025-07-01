from instagrapi import Client

def get_last_post(cl: Client, username: str):
    user_id = cl.user_id_from_username(username)
    medias = cl.user_medias(user_id, amount=1)
    if medias:
        latest_media = medias[0]
        post_url = f"https://www.instagram.com/p/{latest_media.code}/"
        return post_url
    else:
        return None