from typing import Any


class ApiException(Exception):
    def __init__(
        self,
        error_code: str,
        error_data: Any = None,
        detail: str = None,
        status_code: int | None = 400,
        headers: dict[str, str] | None = None,
        extra: dict[str, Any] | list[Any] | None = None,
    ) -> None:
        super().__init__()
        self.detail = detail
        self.status_code = status_code
        self.headers = headers
        self.extra = extra
        self.error_code = error_code
        self.error_data = error_data
