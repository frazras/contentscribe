from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .routes import router as main_router
import os

app = FastAPI()

# Add CORS middleware to allow requests from localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(main_router, prefix="/api")

# Check if the 'ui/build' directory exists
current_dir = os.path.dirname(os.path.abspath(__file__))
if os.path.exists(current_dir + "/ui/build"):
    app.mount("/", StaticFiles(directory=current_dir + "/ui/build", html=True), name="static")
    print("Mounted / at " + current_dir + "/ui/build")
else:
    print("Warning: 'ui/build' directory does not exist. Static files will not be served.")