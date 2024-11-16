import os
from dstack_sdk import AsyncTappdClient, DeriveKeyResponse, TdxQuoteResponse
from fastapi import FastAPI, Request
import numpy as np

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "The World! Call /derivekey or /tdxquote"}

@app.get("/derivekey")
async def derivekey():
    client = AsyncTappdClient()
    deriveKey = await client.derive_key('/', 'test')
    assert isinstance(deriveKey, DeriveKeyResponse)
    asBytes = deriveKey.toBytes()
    assert isinstance(asBytes, bytes)
    limitedSize = deriveKey.toBytes(32)
    return {"deriveKey": asBytes.hex(), "derive_32bytes": limitedSize.hex()}
    
@app.post("/tdxquote")
async def tdxquote(request:Request):
    client = AsyncTappdClient()
    # tdxQuote = await client.tdx_quote('test')
    data:bytes = await request.body()
    tdxQuote = await client.tdx_quote(data)
    
    assert isinstance(tdxQuote, TdxQuoteResponse)
    return {"tdxQuote": tdxQuote}