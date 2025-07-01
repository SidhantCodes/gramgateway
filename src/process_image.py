import os
import re
from PIL import Image, ImageOps, ImageDraw, ImageFont
from google import genai

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
INPUT_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'input_images')
OUTPUT_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'pics')
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

INSTAGRAM_SIZES = {
    'square': (1080, 1080),
    'landscape': (1080, 608),
    'portrait': (1080, 1350)
}

def generate_caption(prompt):
    """Generates an Instagram-style caption using Gemini LLM based on the description inferred from the image filename."""
    client = genai.Client(api_key=GEMINI_API_KEY)
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )
    if response:
        return response.text
    else:
        return None

def remove_hashtags(text):
    """Removes all hashtag phrases from the given text to keep the caption clean."""
    return re.sub(r'#\w+', '', text).strip()

def sanitize_filename(text):
    """Converts a string into a filesystem-safe filename by removing special characters and limiting length."""
    return "".join(c if c.isalnum() or c in (' ', '-', '_', '#') else '' for c in text).strip().replace(" ", "_")[:100]

def add_watermark(image, text="©PnC", opacity=128, margin=(20, 20), font_size=15):
    """Adds a semi-transparent watermark to the bottom-center of an image using a specified font."""
    if image.mode != 'RGBA':
        image = image.convert('RGBA')
    watermark_layer = Image.new('RGBA', image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(watermark_layer)
    font_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "fonts", "Heavitas.ttf")
    try:
        font = ImageFont.truetype(font_path, font_size)
    except IOError:
        font = ImageFont.load_default()
    text_size = draw.textbbox((0, 0), text, font=font)
    text_width = text_size[2] - text_size[0]
    text_height = text_size[3] - text_size[1]
    x = image.width - text_width - margin[0]
    y = image.height - text_height - margin[1]
    draw.text((x, y), text, font=font, fill=(255, 255, 255, opacity))
    watermarked = Image.alpha_composite(image, watermark_layer)
    return watermarked.convert('RGB')

def get_orientation(image):
    """Determines whether an image is square, landscape, or portrait based on its dimensions."""
    width, height = image.size
    ratio = width / height
    if 0.95 <= ratio <= 1.05:
        return 'square'
    elif width > height:
        return 'landscape'
    else:
        return 'portrait'

def resize_and_center(image, orientation):
    """Resizes an image and places it at the center of a white canvas sized for Instagram's standard dimensions."""
    target_width, target_height = INSTAGRAM_SIZES[orientation]
    
    if orientation == 'square':
        # For square images, just resize to exact dimensions without changing aspect ratio
        image = image.resize((target_width, target_height), Image.LANCZOS)
        return image
    elif orientation == 'landscape':
        new_width = target_width
        new_height = int((target_width / image.width) * image.height)
        image = image.resize((new_width, new_height), Image.LANCZOS)
    else:  # portrait
        new_height = target_height
        new_width = int((target_height / image.height) * image.width)
        image = image.resize((new_width, new_height), Image.LANCZOS)
    
    # Only create canvas for non-square images
    canvas = Image.new('RGB', (target_width, target_height), (255, 255, 255))
    offset_x = (target_width - image.width) // 2
    offset_y = (target_height - image.height) // 2
    canvas.paste(image, (offset_x, offset_y))
    return canvas

def process_input_images():
    """Processes all images in the input folder by watermarking, resizing, generating captions, saving with clean filenames, and removing originals."""
    for filename in os.listdir(INPUT_FOLDER):
        if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
            input_path = os.path.join(INPUT_FOLDER, filename)
            try:
                with Image.open(input_path) as img:
                    img = ImageOps.exif_transpose(img)
                    img = add_watermark(img)
                    orientation = get_orientation(img)
                    img = resize_and_center(img, orientation)


                    prompt = f"Write a cool Instagram caption for this photo described as {os.path.splitext(filename)[0]}\nOnly generate the caption nothing else."
                    caption = generate_caption(prompt)
                    if not caption:
                        raise ValueError("Caption generation failed")

                    caption = remove_hashtags(caption)
                    clean_name = sanitize_filename(caption)
                    output_filename = f"{clean_name}.jpg"
                    output_path = os.path.join(OUTPUT_FOLDER, output_filename)

                    img.save(output_path, format='JPEG', quality=95)

                os.remove(input_path)

            except Exception as e:
                print(e)