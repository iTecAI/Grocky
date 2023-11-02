import logging

class EndpointFilter(logging.Filter):
    """Filter class to exclude specific endpoints from log entries."""

    def __init__(self, excluded_endpoints: list[str]) -> None:
        """
        Initialize the EndpointFilter class.

        Args:
            excluded_endpoints: A list of endpoints to be excluded from log entries.
        """
        self.excluded_endpoints = excluded_endpoints

    def filter(self, record: logging.LogRecord) -> bool:
        """
        Filter out log entries for excluded endpoints.

        Args:
            record: The log record to be filtered.

        Returns:
            bool: True if the log entry should be included, False otherwise.
        """
        return record.args and len(record.args) >= 3 and record.args[2] not in self.excluded_endpoints
    
class ErrorFilter(logging.Filter):
    def __init__(self) -> None:
        self.error_match = ["Unexpected ASGI message 'websocket.close', after sending 'websocket.close'."]

    def filter(self, record: logging.LogRecord) -> bool:
        return (record.exc_info and not record.exc_info[1].args[0] in self.error_match) or not record.exc_info