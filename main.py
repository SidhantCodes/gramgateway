from datetime import datetime
import time, os, logging, coloredlogs
from instagrapi import Client
from instagrapi.exceptions import LoginRequired
from src.process_image import process_input_images
from src.poster import load_posted_pics, post_new_image
from src.get_last_post import get_last_post
from src.dm import send_dm_all

# logging.basicConfig(level=30)
logger = logging.getLogger(__name__)
coloredlogs.install(level='DEBUG', logger=logger)

# USERNAME = os.getenv("IG_USERNAME")
USERNAME = "nothuman11140"
# PASSWORD = os.getenv("IG_PASSWORD")
PASSWORD = "Nexa@insta0110"


def login_to_instagram():
    cl = Client()
    session_file = "session.json"
    session = None
    login_via_session = False
    login_via_pw = False

    if os.path.exists(session_file) and os.path.getsize(session_file) > 0:
        logger.debug("Session file found, attempting session login...")
        session = cl.load_settings(session_file)

    if session:
        try:
            cl.set_settings(session)
            cl.login(USERNAME, PASSWORD)
            try:
                cl.get_timeline_feed()
            except LoginRequired:
                logger.warning("Session invalid, trying re-login...")
                old_session = cl.get_settings()
                cl.set_settings({})
                cl.set_uuids(old_session.get("uuids", {}))
                cl.login(USERNAME, PASSWORD)
            login_via_session = True
            logger.info("Logged in via session.")
        except Exception as e:
            logger.error(f"Session login failed: {e}")

    if not login_via_session:
        logger.debug("Attempting login via username and password...")
        try:
            cl.set_settings({})
            if cl.login(USERNAME, PASSWORD):
                cl.dump_settings(session_file)
                login_via_pw = True
                logger.info("Logged in via username and password.")
        except Exception as e:
            logger.error(f"Password login failed: {e}")

    if not login_via_pw and not login_via_session:
        raise Exception("Couldn't login user with either password or session")

    return cl

def main():
    logger.info('App started')
    try:
        cl = login_to_instagram()
        usernames = ["_sidhant22"]

        while True:
            try:
                logger.debug("Processing input images...")
                process_input_images()
                now = datetime.now()

                # Thursday 09:40
                if now.weekday() == 3 and now.hour == 10 and now.minute == 0:
                    logger.info("Scheduled time reached. Preparing to post...")
                    posted_pic_list = load_posted_pics()
                    success = post_new_image(cl, posted_pic_list)

                    if success:
                        logger.info("Image posted successfully.")
                        time.sleep(10)
                        last_post_url = get_last_post(cl=cl, username=USERNAME)
                        if last_post_url:
                            msg = f"Hey! Check out my latest post: {last_post_url}"
                            logger.info("Sending DMs with post URL...")
                            send_dm_all(cl=cl, usernames=usernames, message_text=msg)
                            logger.info("DMs sent successfully.")

                        time.sleep(60)
                    else:
                        logger.info("No new images to post.")
                        time.sleep(60)

                else:
                    if now.minute % 10 == 0 and now.second == 0:
                        logger.debug(f"Waiting... Current time: {now.strftime('%A %H:%M')}")
                    time.sleep(30)

            except Exception as e:
                logger.error(f"Error in main loop: {e}")
                time.sleep(60)

    except Exception as e:
        logger.critical(f"Fatal error: {e}")
        return 1

    return 0

if __name__ == "__main__":
    exit(main())
