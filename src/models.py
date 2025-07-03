from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class MCPRequest(BaseModel):
    jsonrpc: str = "2.0"
    id: Optional[str] = None
    method: str
    params: Optional[Dict[str, Any]] = None

class MCPResponse(BaseModel):
    jsonrpc: str = "2.0"
    id: Optional[str] = None
    result: Optional[Dict[str, Any]] = None
    error: Optional[Dict[str, Any]] = None

class ImageProcessRequest(BaseModel):
    filename: str
    custom_caption: Optional[str] = None
    watermark_text: Optional[str] = "©PnC"
    watermark_opacity: Optional[int] = 128

class BatchProcessRequest(BaseModel):
    filenames: List[str]
    watermark_text: Optional[str] = "©PnC"
    watermark_opacity: Optional[int] = 128

class InstagramLoginRequest(BaseModel):
    username: str
    password: str

class InstagramPostRequest(BaseModel):
    filename: str
    custom_caption: Optional[str] = None