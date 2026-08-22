import time
import ipaddress
import urllib.parse
from typing import Dict, Any
import httpx
from loguru import logger


class UptimeChecker:
    """
    Live deployment URL health, SSL, and latency checker with built-in SSRF protection.
    """

    BLOCKED_NETWORKS = [
        ipaddress.ip_network("127.0.0.0/8"),
        ipaddress.ip_network("10.0.0.0/8"),
        ipaddress.ip_network("172.16.0.0/12"),
        ipaddress.ip_network("192.168.0.0/16"),
        ipaddress.ip_network("169.254.0.0/16"),
        ipaddress.ip_network("::1/128"),
        ipaddress.ip_network("fc00::/7"),
        ipaddress.ip_network("fe80::/10"),
    ]

    @classmethod
    def is_ssrf_safe_url(cls, url: str) -> bool:
        """Validates that a URL does not target localhost or private/cloud-metadata networks."""
        try:
            parsed = urllib.parse.urlparse(url)
            if parsed.scheme not in ("http", "https"):
                return False
            
            hostname = parsed.hostname
            if not hostname:
                return False

            if hostname.lower() in ("localhost", "127.0.0.1", "0.0.0.0", "metadata.google.internal"):
                return False

            try:
                ip = ipaddress.ip_address(hostname)
                for blocked_net in cls.BLOCKED_NETWORKS:
                    if ip in blocked_net:
                        return False
            except ValueError:
                # Hostname is a domain name (e.g. team.vercel.app)
                pass

            return True
        except Exception:
            return False

    @classmethod
    async def check_url_health(cls, url: str, timeout_seconds: float = 10.0) -> Dict[str, Any]:
        """Checks live deployment reachability, HTTP status code, and round-trip latency."""
        if not cls.is_ssrf_safe_url(url):
            return {
                "url": url,
                "reachable": False,
                "status_code": None,
                "response_time_ms": None,
                "ssl_valid": False,
                "error": "URL blocked by SSRF protection policy (private/internal IP)",
            }

        start = time.perf_counter()
        try:
            async with httpx.AsyncClient(timeout=timeout_seconds, follow_redirects=True) as client:
                response = await client.get(url)
                latency_ms = round((time.perf_counter() - start) * 1000, 2)
                is_ok = 200 <= response.status_code < 400

                return {
                    "url": url,
                    "reachable": is_ok,
                    "status_code": response.status_code,
                    "response_time_ms": latency_ms,
                    "ssl_valid": url.startswith("https://"),
                    "server_header": response.headers.get("server"),
                    "error": None if is_ok else f"HTTP {response.status_code} returned",
                }
        except Exception as e:
            latency_ms = round((time.perf_counter() - start) * 1000, 2)
            logger.warning(f"[UptimeChecker] Health check failed for {url}: {e}")
            return {
                "url": url,
                "reachable": False,
                "status_code": None,
                "response_time_ms": latency_ms,
                "ssl_valid": False,
                "error": str(e),
            }
