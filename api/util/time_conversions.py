from datetime import datetime
import zoneinfo

class Time:
    def __init__(self, init: datetime = None) -> None:
        if init:
            self.raw = init.astimezone(zoneinfo.ZoneInfo("UTC"))
        else:
            self.raw = datetime.utcnow()

    @property
    def utc(self) -> datetime:
        return self.raw
    
    @property
    def local(self) -> datetime:
        return self.raw.astimezone(datetime.now().astimezone().tzinfo)
