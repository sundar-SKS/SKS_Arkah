"""
Entry point for the Solar EPC Manager backend API.

This FastAPI application includes a simple health endpoint and basic
security middleware such as CORS and rate limiting.  You should
extend this application with additional routers, models, and business
logic as your project grows.  See README.md for more details.
"""

from collections import defaultdict
from time import time
from typing import Dict, List

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp


class RateLimiterMiddleware(BaseHTTPMiddleware):
    """Simple in-memory rate limiter middleware.

    Limits the number of requests from a single IP address within a
    sliding window.  This implementation is intentionally simple and
    should be replaced with a more robust solution (e.g. Redis backed)
    for production environments.
    """

    def __init__(self, app: ASGIApp, max_requests: int = 60, window_sec: int = 60) -> None:
        super().__init__(app)
        self.max_requests = max_requests
        self.window_sec = window_sec
        self.requests: Dict[str, List[float]] = defaultdict(list)

    async def dispatch(self, request: Request, call_next):  # type: ignore[override]
        ip = request.client.host if request.client else "unknown"
        now = time()
        # drop timestamps outside the current window
        self.requests[ip] = [t for t in self.requests[ip] if now - t < self.window_sec]
        if len(self.requests[ip]) >= self.max_requests:
            return JSONResponse(status_code=429, content={"detail": "Too Many Requests"})
        self.requests[ip].append(now)
        return await call_next(request)


def create_app() -> FastAPI:
    """Construct and configure the FastAPI application."""
    app = FastAPI(title="Solar EPC Manager API", version="1.0.0")

    # Security and CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Adjust this for specific allowed origins in production
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )
    app.add_middleware(RateLimiterMiddleware, max_requests=60, window_sec=60)

    @app.get("/healthz", tags=["health"])
    async def healthz() -> Dict[str, str]:
        """Liveness probe endpoint for Kubernetes or load balancers."""
        return {"status": "ok"}

    return app


app = create_app()