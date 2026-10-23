from pydantic import BaseModel
from typing import List, Optional, Dict

class Block(BaseModel):
    id:str
    type:str
    params: Dict = {}
    activation: Optional[str] = None

class Augmentation(BaseModel):
    type: str
    params: Dict = {}

class Tower(BaseModel):
    name:str
    inputShape: List[int] = [3,224,224]
    blocks: List[Block] = []
    augmentations: List[Augmentation] = []