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
    #warning with full directory path
    print("Warning: '" + current_dir + "/ui/build' directory does not exist. Static files will not be served.")
    # Show the contents of the current folder

print("Contents of the current folder:")
for item in os.listdir(current_dir):
    item_path = os.path.join(current_dir, item)
    if os.path.isdir(item_path):
        print(f"Directory: {item}")
        #print python code to do  os.path.exists(item_path)
        print(f"Does {item_path} exist? {os.path.exists(item_path)}")
        print(f"Contents of directory {item}:")
        for sub_item in os.listdir(item_path):
            print(f"  - {sub_item}")
    else:
        print(f"File: {item}")