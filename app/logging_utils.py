import os
import json
from datetime import datetime
from fastapi import Request

LOGS_DIR = "logs"

def get_real_ip(request: Request) -> str:
    # Cloudflare header
    cf_ip = request.headers.get("CF-Connecting-IP")
    if cf_ip:
        return cf_ip
    
    # Standard proxy header
    x_forwarded_for = request.headers.get("X-Forwarded-For")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()
        
    # Fallback to direct client address
    return request.client.host if request.client else "unknown"

def log_event(event_type: str, details: dict, request: Request):
    os.makedirs(LOGS_DIR, exist_ok=True)
    
    log_file = os.path.join(LOGS_DIR, f"{event_type}.log")
    
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "ip": get_real_ip(request),
        "details": details
    }
    
    with open(log_file, "a") as f:
        f.write(json.dumps(log_entry) + "\n")
