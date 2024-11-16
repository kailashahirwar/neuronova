import os
from dstack_sdk import AsyncTappdClient, DeriveKeyResponse, TdxQuoteResponse
from fastapi import FastAPI
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
    
@app.get("/tdxquote")
async def tdxquote():
    client = AsyncTappdClient()
    a = np.array([1,2,3]*256)
    # tdxQuote = await client.tdx_quote('test')
    tdxQuote = await client.tdx_quote(a.tobytes())
    
    assert isinstance(tdxQuote, TdxQuoteResponse)
    return {"tdxQuote": tdxQuote}