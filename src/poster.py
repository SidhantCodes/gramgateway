import os, glob, logging
from instagrapi import Client

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s - %(message)s')


OUTPUT_FOLDER = 'pics'
POSTED_LIST_FILE = 'pics.txt'

HASHTAGS = "\n\n\n\n\n#ArtofVisuals #InstaPhotography #CreativeStudio #ExploreToCreate #DigitalArtist #MinimalDesign #TypographyLove #ContentCreator #ExplorePage"

def load_posted_pics():
    """Loads the list of previously posted image filenames from a text file, returning them as a list. If the file does not exist or cannot be read, returns an empty list.Loads the list of previously posted image filenames from a text file, returning them as a list. If the file does not exist or cannot be read, returns an empty list."""
    try:
        with open(POSTED_LIST_FILE, "r", encoding="utf8") as f:
            return f.read().splitlines()
    except Exception:
        return []

def save_posted_pic(pic):
    """Appends the given image filename to the list of posted images in the text file to keep track of uploaded posts."""
    with open(POSTED_LIST_FILE, "a", encoding="utf8") as f:
        f.write(pic + "\n")

def post_new_image(cl: Client, posted_pic_list):
    """Scans the output folder for unposted JPG images, uploads the first unposted image to Instagram with a generated caption, and records it in the posted list. Returns True if a post was successfully uploaded, otherwise False."""
    pics = sorted(glob.glob(os.path.join(OUTPUT_FOLDER, "*.jpg")))

    for pic in pics:
        if pic in posted_pic_list:
            continue

        pic_name = os.path.basename(pic)
        caption = os.path.splitext(pic_name)[0].replace("_", " ") + HASHTAGS

        try:
            cl.photo_upload(pic, caption)
            save_posted_pic(pic)
            return True
        except Exception as e:
            return False
        
    return False
