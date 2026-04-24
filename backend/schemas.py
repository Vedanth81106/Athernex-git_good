from pydantic import BaseModel
from datetime import datetime
from typing import Any, Dict, List

# this is so that users can create jobs without needing ids
class JobCreate(BaseModel):
    script: str
    target_url: str
    strip_config: dict

class JobResponse(BaseModel): # sent to fe
    job_id: int
    script: str
    target_url: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True #fastapi basically converts sqlalchemy object to json object and then returns it to client

class SelectorBase(BaseModel):
#selector id is auto created by db
    job_id: int
    intent: str
    selector: str
    last_success_dom: List[Any] # aom is a dict(eg: {"role:button","name:login"})

class SelectorResponse(SelectorBase):
    selector_id: int
    updated_at: datetime

    model_config = {"from_attributes": True}

class HealLogBase(BaseModel):
    # no heal log id either
    job_id: int #link to job id
    intent: str
    old_selector: str
    new_selector: str
    current_dom: List[Any]
    healed_by: str
    confidence: float

#this schema is required to validate the incoming request body sent by middlware when it calls POST /heal
class HealRequest(BaseModel):
    job_id: int
    intent: str
    old_selector: str
    current_dom: List[Any]

class HealLogResponse(BaseModel):
    job_id: int
    intent: str
    new_selector: str
    confidence: float
    healed_by: str

    model_config = {"from_attributes": True}

class StatusUpdate(BaseModel):
    status: str