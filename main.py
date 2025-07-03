import os, json, logging, uvicorn
from typing import Dict, Any, Optional
from datetime import datetime

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi_mcp import FastApiMCP

# Instagram imports
from instagrapi import Client
from instagrapi.exceptions import LoginRequired

from src.process_image import (
    generate_caption, 
    remove_hashtags, 
    sanitize_filename, 
    add_watermark, 
    get_orientation, 
    resize_and_center,
    INSTAGRAM_SIZES
)
from src.poster import (
    load_posted_pics,
    save_posted_pic,
    HASHTAGS
)

# import Pydantic models for MCP protocol
from src.models import MCPRequest, MCPResponse, ImageProcessRequest, BatchProcessRequest, InstagramLoginRequest, InstagramPostRequest

# Configure logging
logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="MCP Image Processing & Instagram Server",
    description="A Model Context Protocol server for image processing and Instagram posting",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure directories exist
os.makedirs("input_images", exist_ok=True)
os.makedirs("pics", exist_ok=True)
os.makedirs("fonts", exist_ok=True)

# Global Instagram client
instagram_client = None

USERNAME = os.getenv("IG_USERNAME")
PASSWORD = os.getenv("IG_PASSWORD")



# Instagram helper functions
def login_to_instagram(username: str, password: str) -> Client:
    """Login to Instagram and return authenticated client"""
    cl = Client()
    session_file = "session.json"
    session = None
    login_via_session = False
    login_via_pw = False
    
    # Try session login first
    if os.path.exists(session_file) and os.path.getsize(session_file) > 0:
        logger.debug("Session file found, attempting session login...")
        try:
            session = cl.load_settings(session_file)
            cl.set_settings(session)
            cl.login(username, password)
            
            # Test if session is valid
            try:
                cl.get_timeline_feed()
                login_via_session = True
                logger.info("Logged in via session.")
            except LoginRequired:
                logger.warning("Session invalid, trying re-login...")
                old_session = cl.get_settings()
                cl.set_settings({})
                cl.set_uuids(old_session.get("uuids", {}))
                cl.login(username, password)
                login_via_session = True
                logger.info("Re-logged in via session.")
        except Exception as e:
            logger.error(f"Session login failed: {e}")
    
    # Try password login if session failed
    if not login_via_session:
        logger.debug("Attempting login via username and password...")
        try:
            cl.set_settings({})
            if cl.login(username, password):
                cl.dump_settings(session_file)
                login_via_pw = True
                logger.info("Logged in via username and password.")
        except Exception as e:
            logger.error(f"Password login failed: {e}")
            raise Exception(f"Password login failed: {e}")
    
    if not login_via_pw and not login_via_session:
        raise Exception("Couldn't login user with either password or session")
    
    return cl


# MCP Protocol endpoints
@app.post("/mcp")
async def mcp_handler(request: MCPRequest):
    """Main MCP protocol handler"""
    try:
        if request.method == "initialize":
            return MCPResponse(
                id=request.id,
                result={
                    "protocolVersion": "2024-11-05",
                    "capabilities": {
                        "tools": {
                            "listChanged": True
                        }
                    },
                    "serverInfo": {
                        "name": "image-processor-instagram",
                        "version": "1.0.0"
                    }
                }
            )
        
        elif request.method == "tools/list":
            return MCPResponse(
                id=request.id,
                result={
                    "tools": [
                        {
                            "name": "process_image",
                            "description": "Process a single image with watermark, resize, and caption generation",
                            "inputSchema": {
                                "type": "object",
                                "properties": {
                                    "filename": {"type": "string", "description": "Name of the image file to process"},
                                    "custom_caption": {"type": "string", "description": "Optional custom caption"},
                                    "watermark_text": {"type": "string", "description": "Watermark text"},
                                    "watermark_opacity": {"type": "integer", "description": "Watermark opacity (0-255)"}
                                },
                                "required": ["filename"]
                            }
                        },
                        {
                            "name": "batch_process_images",
                            "description": "Process multiple images in batch",
                            "inputSchema": {
                                "type": "object",
                                "properties": {
                                    "filenames": {"type": "array", "items": {"type": "string"}},
                                    "watermark_text": {"type": "string"},
                                    "watermark_opacity": {"type": "integer"}
                                },
                                "required": ["filenames"]
                            }
                        },
                        {
                            "name": "instagram_login",
                            "description": "Login to Instagram account",
                            "inputSchema": {
                                "type": "object",
                                "properties": {
                                    "username": {"type": "string", "description": "Instagram username"},
                                    "password": {"type": "string", "description": "Instagram password"}
                                },
                                "required": ["username", "password"]
                            }
                        },
                        {
                            "name": "instagram_post",
                            "description": "Post a processed image to Instagram",
                            "inputSchema": {
                                "type": "object",
                                "properties": {
                                    "filename": {"type": "string", "description": "Name of the processed image file to post"},
                                    "custom_caption": {"type": "string", "description": "Optional custom caption (overrides filename-based caption)"}
                                },
                                "required": ["filename"]
                            }
                        },
                        {
                            "name": "instagram_post_next",
                            "description": "Post the next unposted image from the processed folder",
                            "inputSchema": {
                                "type": "object",
                                "properties": {}
                            }
                        },
                        {
                            "name": "instagram_status",
                            "description": "Check Instagram login status and account info",
                            "inputSchema": {
                                "type": "object",
                                "properties": {}
                            }
                        },
                        {
                            "name": "get_processed_images",
                            "description": "Get list of processed images ready for posting",
                            "inputSchema": {"type": "object", "properties": {}}
                        },
                        {
                            "name": "get_posted_images",
                            "description": "Get list of images that have been posted to Instagram",
                            "inputSchema": {"type": "object", "properties": {}}
                        }
                    ]
                }
            )
        
        elif request.method == "tools/call":
            tool_name = request.params.get("name")
            arguments = request.params.get("arguments", {})
            
            if tool_name == "process_image":
                result = await process_single_image(arguments)
            elif tool_name == "batch_process_images":
                result = await batch_process_images(arguments)
            elif tool_name == "instagram_login":
                result = await instagram_login_handler(arguments)
            elif tool_name == "instagram_post":
                result = await instagram_post_handler(arguments)
            elif tool_name == "instagram_post_next":
                result = await instagram_post_next_handler()
            elif tool_name == "instagram_status":
                result = await instagram_status_handler()
            elif tool_name == "get_processed_images":
                result = await get_processed_images()
            elif tool_name == "get_posted_images":
                result = await get_posted_images()
            else:
                raise ValueError(f"Unknown tool: {tool_name}")
            
            return MCPResponse(
                id=request.id,
                result={"content": [{"type": "text", "text": json.dumps(result, indent=2)}]}
            )
        
        else:
            return MCPResponse(
                id=request.id,
                error={"code": -32601, "message": f"Method not found: {request.method}"}
            )
    
    except Exception as e:
        logger.error(f"MCP handler error: {e}")
        return MCPResponse(
            id=request.id,
            error={"code": -32603, "message": f"Internal error: {str(e)}"}
        )

# Image upload endpoint
@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    """Upload an image to the input folder"""
    try:
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Save uploaded file
        file_path = os.path.join("input_images", file.filename)
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        logger.info(f"Uploaded image: {file.filename}")
        return {"message": "Image uploaded successfully", "filename": file.filename}
    
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Core processing functions
async def process_single_image(params: Dict[str, Any]) -> Dict[str, Any]:
    """Process a single image with the existing logic"""
    filename = params.get("filename")
    custom_caption = params.get("custom_caption")
    watermark_text = params.get("watermark_text", "©PnC")
    watermark_opacity = params.get("watermark_opacity", 128)
    
    if not filename:
        raise ValueError("Filename is required")
    
    input_path = os.path.join("input_images", filename)
    if not os.path.exists(input_path):
        raise ValueError(f"Image file not found: {filename}")
    
    try:
        from PIL import Image, ImageOps
        
        with Image.open(input_path) as img:
            # Apply existing processing logic
            img = ImageOps.exif_transpose(img)
            img = add_watermark(img, watermark_text, watermark_opacity)
            orientation = get_orientation(img)
            img = resize_and_center(img, orientation)
            
            # Generate caption
            if custom_caption:
                caption = custom_caption
            else:
                prompt = f"Write a cool Instagram caption for this photo described as {os.path.splitext(filename)[0]}\nOnly generate the caption nothing else."
                caption = generate_caption(prompt)
                if caption:
                    caption = remove_hashtags(caption)
                else:
                    caption = os.path.splitext(filename)[0].replace("_", " ")
            
            # Save processed image
            clean_name = sanitize_filename(caption)
            output_filename = f"{clean_name}.jpg"
            output_path = os.path.join("pics", output_filename)
            
            img.save(output_path, format='JPEG', quality=95)
            
            # Remove original
            os.remove(input_path)
            
            logger.info(f"Processed image: {filename} -> {output_filename}")
            
            return {
                "success": True,
                "original_filename": filename,
                "processed_filename": output_filename,
                "caption": caption,
                "orientation": orientation,
                "watermark": watermark_text,
                "message": "Image processed successfully"
            }
    
    except Exception as e:
        logger.error(f"Processing error for {filename}: {e}")
        return {
            "success": False,
            "filename": filename,
            "error": str(e)
        }

async def batch_process_images(params: Dict[str, Any]) -> Dict[str, Any]:
    """Process multiple images in batch"""
    filenames = params.get("filenames", [])
    watermark_text = params.get("watermark_text", "©PnC")
    watermark_opacity = params.get("watermark_opacity", 128)
    
    results = []
    for filename in filenames:
        result = await process_single_image({
            "filename": filename,
            "watermark_text": watermark_text,
            "watermark_opacity": watermark_opacity
        })
        results.append(result)
    
    successful = len([r for r in results if r.get("success")])
    
    return {
        "batch_results": results,
        "total_processed": len(filenames),
        "successful": successful,
        "failed": len(filenames) - successful
    }

# Instagram handler functions
async def instagram_login_handler(params: Dict[str, Any]) -> Dict[str, Any]:
    """Handle Instagram login"""
    global instagram_client
    
    username = params.get("username")
    password = params.get("password")
    
    if not username or not password:
        return {
            "success": False,
            "error": "Username and password are required"
        }
    
    try:
        instagram_client = login_to_instagram(username, password)
        
        # Get account info to verify login
        user_info = instagram_client.account_info()
        
        return {
            "success": True,
            "message": "Successfully logged in to Instagram",
            "account": {
                "username": user_info.username,
                "full_name": user_info.full_name,
                "follower_count": user_info.follower_count,
                "following_count": user_info.following_count,
                "media_count": user_info.media_count
            }
        }
    
    except Exception as e:
        logger.error(f"Instagram login error: {e}")
        return {
            "success": False,
            "error": str(e)
        }

async def instagram_post_handler(params: Dict[str, Any]) -> Dict[str, Any]:
    """Handle posting specific image to Instagram"""
    global instagram_client
    
    if not instagram_client:
        return {
            "success": False,
            "error": "Not logged in to Instagram. Please login first."
        }
    
    filename = params.get("filename")
    custom_caption = params.get("custom_caption")
    
    if not filename:
        return {
            "success": False,
            "error": "Filename is required"
        }
    
    # Check if file exists in pics folder
    pic_path = os.path.join("pics", filename)
    if not os.path.exists(pic_path):
        return {
            "success": False,
            "error": f"Image file not found: {filename}"
        }
    
    # Check if already posted
    posted_pics = load_posted_pics()
    if pic_path in posted_pics:
        return {
            "success": False,
            "error": "Image has already been posted"
        }
    
    try:
        # Generate caption
        if custom_caption:
            caption = custom_caption + HASHTAGS
        else:
            pic_name = os.path.basename(pic_path)
            caption = os.path.splitext(pic_name)[0].replace("_", " ") + HASHTAGS
        
        # Post to Instagram
        media = instagram_client.photo_upload(pic_path, caption)
        
        # Save to posted list
        save_posted_pic(pic_path)
        
        # Get post URL
        post_url = f"https://instagram.com/p/{media.code}/"
        
        logger.info(f"Successfully posted image: {filename}")
        
        return {
            "success": True,
            "message": "Image posted successfully to Instagram",
            "filename": filename,
            "caption": caption,
            "post_url": post_url,
            "media_id": media.id
        }
    
    except Exception as e:
        logger.error(f"Instagram post error: {e}")
        return {
            "success": False,
            "error": str(e)
        }

async def instagram_post_next_handler() -> Dict[str, Any]:
    """Post the next unposted image from processed folder"""
    global instagram_client
    
    if not instagram_client:
        return {
            "success": False,
            "error": "Not logged in to Instagram. Please login first."
        }
    
    try:
        import glob
        
        # Get all processed images
        pics = sorted(glob.glob(os.path.join("pics", "*.jpg")))
        posted_pics = load_posted_pics()
        
        # Find first unposted image
        for pic_path in pics:
            if pic_path not in posted_pics:
                filename = os.path.basename(pic_path)
                
                # Use the existing post handler
                result = await instagram_post_handler({"filename": filename})
                return result
        
        return {
            "success": False,
            "message": "No unposted images found"
        }
    
    except Exception as e:
        logger.error(f"Instagram post next error: {e}")
        return {
            "success": False,
            "error": str(e)
        }

async def instagram_status_handler() -> Dict[str, Any]:
    """Check Instagram login status"""
    global instagram_client
    
    if not instagram_client:
        return {
            "logged_in": False,
            "message": "Not logged in to Instagram"
        }
    
    try:
        # Try to get account info to verify connection
        user_info = instagram_client.account_info()
        
        return {
            "logged_in": True,
            "message": "Connected to Instagram",
            "account": {
                "username": user_info.username,
                "full_name": user_info.full_name,
                "follower_count": user_info.follower_count,
                "following_count": user_info.following_count,
                "media_count": user_info.media_count
            }
        }
    
    except Exception as e:
        logger.error(f"Instagram status error: {e}")
        return {
            "logged_in": False,
            "error": str(e),
            "message": "Connection to Instagram lost"
        }

async def get_processed_images() -> Dict[str, Any]:
    """Get list of processed images ready for posting"""
    try:
        pics_folder = "pics"
        if not os.path.exists(pics_folder):
            return {"processed_images": [], "count": 0}
        
        posted_pics = load_posted_pics()
        images = []
        
        for filename in os.listdir(pics_folder):
            if filename.lower().endswith('.jpg'):
                file_path = os.path.join(pics_folder, filename)
                file_stats = os.stat(file_path)
                is_posted = file_path in posted_pics
                
                images.append({
                    "filename": filename,
                    "size": file_stats.st_size,
                    "created": datetime.fromtimestamp(file_stats.st_ctime).isoformat(),
                    "modified": datetime.fromtimestamp(file_stats.st_mtime).isoformat(),
                    "posted": is_posted
                })
        
        # Sort by creation date, newest first
        images.sort(key=lambda x: x["created"], reverse=True)
        unposted_count = len([img for img in images if not img["posted"]])
        
        return {
            "processed_images": images,
            "total_count": len(images),
            "posted_count": len(images) - unposted_count,
            "unposted_count": unposted_count
        }
    
    except Exception as e:
        logger.error(f"Error getting processed images: {e}")
        return {"error": str(e), "processed_images": [], "count": 0}

async def get_posted_images() -> Dict[str, Any]:
    """Get list of images that have been posted"""
    try:
        posted_pics = load_posted_pics()
        return {
            "posted_images": [os.path.basename(pic) for pic in posted_pics],
            "count": len(posted_pics)
        }
    
    except Exception as e:
        logger.error(f"Error getting posted images: {e}")
        return {"error": str(e), "posted_images": [], "count": 0}

# Additional REST endpoints for direct access
@app.get("/images/processed")
async def list_processed_images():
    """REST endpoint to list processed images"""
    return await get_processed_images()

@app.get("/images/posted")
async def list_posted_images():
    """REST endpoint to list posted images"""
    return await get_posted_images()

@app.post("/process")
async def process_image_rest(request: ImageProcessRequest):
    """REST endpoint to process a single image"""
    result = await process_single_image(request.dict())
    return result

@app.post("/process/batch")
async def batch_process_rest(request: BatchProcessRequest):
    """REST endpoint to batch process images"""
    result = await batch_process_images(request.dict())
    return result

@app.post("/instagram/login")
async def instagram_login_rest(request: InstagramLoginRequest):
    """REST endpoint for Instagram login"""
    result = await instagram_login_handler(request.dict())
    return result

@app.post("/instagram/post")
async def instagram_post_rest(request: InstagramPostRequest):
    """REST endpoint to post to Instagram"""
    result = await instagram_post_handler(request.dict())
    return result

@app.post("/instagram/post/next")
async def instagram_post_next_rest():
    """REST endpoint to post next unposted image"""
    result = await instagram_post_next_handler()
    return result

@app.get("/instagram/status")
async def instagram_status_rest():
    """REST endpoint to check Instagram status"""
    result = await instagram_status_handler()
    return result

@app.get("/download/{filename}")
async def download_processed_image(filename: str):
    """Download a processed image"""
    file_path = os.path.join("pics", filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "MCP Image Processing & Instagram Server",
        "version": "1.0.0",
        "endpoints": {
            "mcp": "/mcp - Main MCP protocol endpoint",
            "upload": "/upload - Upload images",
            "process": "/process - Process single image",
            "batch_process": "/process/batch - Batch process images",
            "instagram_login": "/instagram/login - Login to Instagram",
            "instagram_post": "/instagram/post - Post to Instagram",
            "instagram_post_next": "/instagram/post/next - Post next unposted image",
            "instagram_status": "/instagram/status - Check Instagram status",
            "processed_images": "/images/processed - List processed images",
            "posted_images": "/images/posted - List posted images",
            "download": "/download/{filename} - Download processed image",
            "health": "/health - Health check"
        }
    }

mcp = FastApiMCP(app)
mcp.mount()

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )