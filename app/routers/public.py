from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, Request, Body, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from pydantic import BaseModel
from jose import jwt, JWTError

from app.db import get_db
from app.models import Share, FileRecord
from app.auth import verify_password
from app.logging_utils import log_event
# Reuse config from main/auth (should be in config file)
SECRET_KEY = "supersecretkeychangedthisinproduction" 
ALGORITHM = "HS256"

router = APIRouter(prefix="/public")

class ShareUnlockRequest(BaseModel):
    password: str

class PublicFile(BaseModel):
    filename: str
    token: str # Signed URL token

class PublicShareResponse(BaseModel):
    locked: bool
    files: List[PublicFile] = []

def create_download_token(file_id: int):
    expire = datetime.utcnow() + timedelta(minutes=60) # Link valid for 1 hour
    to_encode = {"sub": str(file_id), "exp": expire, "type": "download"}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@router.get("/share/{public_id}", response_model=PublicShareResponse)
async def get_share_status(request: Request, public_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Share).where(Share.public_id == public_id).options(selectinload(Share.files)))
    share = result.scalars().first()
    
    if not share:
        raise HTTPException(status_code=404, detail="Share not found")
    
    if share.expires_at and share.expires_at < datetime.utcnow():
         raise HTTPException(status_code=410, detail="Link expired")

    if share.password_hash:
        log_event("download", {
            "event": "share_access",
            "public_id": public_id,
            "status": "locked_waiting_password"
        }, request)
        return PublicShareResponse(locked=True)
    
    # Not locked, return files
    files = []
    for f in share.files:
        token = create_download_token(f.id)
        files.append(PublicFile(filename=f.filename, token=token))

    log_event("download", {
        "event": "share_access",
        "public_id": public_id,
        "status": "success"
    }, request)

    return PublicShareResponse(locked=False, files=files)

@router.post("/share/{public_id}/unlock", response_model=PublicShareResponse)
async def unlock_share(
    request: Request,
    public_id: str, 
    body: ShareUnlockRequest = Body(...),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Share).where(Share.public_id == public_id).options(selectinload(Share.files)))
    share = result.scalars().first()
    
    if not share:
        raise HTTPException(status_code=404, detail="Share not found")
    
    if share.expires_at and share.expires_at < datetime.utcnow():
        raise HTTPException(status_code=410, detail="Link expired")

    if share.password_hash:
        if not body.password or not verify_password(body.password, share.password_hash):
             log_event("download", {
                 "event": "unlock_attempt",
                 "public_id": public_id,
                 "status": "failure_incorrect_password"
             }, request)
             raise HTTPException(status_code=401, detail="Incorrect Password")

    log_event("download", {
        "event": "unlock_attempt",
        "public_id": public_id,
        "status": "success"
    }, request)

    files = []
    for f in share.files:
        token = create_download_token(f.id)
        files.append(PublicFile(filename=f.filename, token=token))

    return PublicShareResponse(locked=False, files=files)

@router.get("/file/{token}")
async def download_file(request: Request, token: str, db: AsyncSession = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        file_id = int(payload.get("sub"))
        token_type = payload.get("type")
        if token_type != "download":
            raise HTTPException(status_code=401, detail="Invalid token type")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired download link")
        
    result = await db.execute(select(FileRecord).where(FileRecord.id == file_id))
    file_record = result.scalars().first()
    
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")
    
    log_event("download", {
        "event": "file_download",
        "filename": file_record.filename,
        "file_id": file_record.id
    }, request)
        
    return FileResponse(file_record.file_path, filename=file_record.filename)
