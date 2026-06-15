import os
import uuid
from datetime import datetime, timezone

import boto3
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Helsinki Service Directory")

TABLE_NAME = os.environ.get("TABLE_NAME", "ha-web-items")
REGION = os.environ.get("AWS_DEFAULT_REGION", "eu-north-1")

dynamodb = boto3.resource("dynamodb", region_name=REGION)
table = dynamodb.Table(TABLE_NAME)


class ItemCreate(BaseModel):
    name: str
    description: str = ""
    category: str = ""


class ItemUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    category: str | None = None


@app.get("/health")
def health():
    return {"status": "healthy", "service": "ha-web-service", "region": REGION}


@app.get("/items")
def list_items():
    response = table.scan(Limit=100)
    return {"items": response.get("Items", []), "count": response.get("Count", 0)}


@app.get("/items/{item_id}")
def get_item(item_id: str):
    response = table.get_item(Key={"id": item_id})
    item = response.get("Item")
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@app.post("/items", status_code=201)
def create_item(item: ItemCreate):
    record = {
        "id": str(uuid.uuid4()),
        "name": item.name,
        "description": item.description,
        "category": item.category,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    table.put_item(Item=record)
    return record


@app.put("/items/{item_id}")
def update_item(item_id: str, item: ItemUpdate):
    existing = table.get_item(Key={"id": item_id}).get("Item")
    if not existing:
        raise HTTPException(status_code=404, detail="Item not found")

    updates = {k: v for k, v in item.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    expr_parts = []
    expr_values = {}
    expr_names = {}
    for i, (key, val) in enumerate(updates.items()):
        expr_parts.append(f"#{key} = :v{i}")
        expr_values[f":v{i}"] = val
        expr_names[f"#{key}"] = key

    table.update_item(
        Key={"id": item_id},
        UpdateExpression="SET " + ", ".join(expr_parts),
        ExpressionAttributeValues=expr_values,
        ExpressionAttributeNames=expr_names,
    )
    return {**existing, **updates}


@app.delete("/items/{item_id}")
def delete_item(item_id: str):
    table.delete_item(Key={"id": item_id})
    return {"deleted": item_id}
