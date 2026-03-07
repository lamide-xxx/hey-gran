from fastapi import FastAPI

app = FastAPI(title="Hey Gran Backend")

@app.get("/")
def root():
    return {"message": "Hey Gran backend running"}