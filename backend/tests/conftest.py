import pytest


@pytest.fixture(scope="session", autouse=True)
def setup_test_environment():
    """Setup test environment settings."""
    pass

