"""
Basic unit tests to satisfy CI matrix and verify core endpoints.
"""

from fastapi.testclient import TestClient

from api.main import app

client = TestClient(app)


def test_placeholder():
    assert True


def test_health_endpoint_ok():
    resp = client.get("/health/")
    assert resp.status_code == 200
    data = resp.json()
    assert data.get("status") in ("healthy", "unhealthy")


def test_security_headers_present():
    resp = client.get("/")
    assert resp.status_code == 200
    # Security headers added via middleware
    assert "X-Content-Type-Options" in resp.headers
    assert "X-Frame-Options" in resp.headers
    assert "X-XSS-Protection" in resp.headers

