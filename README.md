# contentscribe

## Installation Options

### 1. Docker

1. Install Docker on your system.
2. Clone the repository:
   ```
   git clone https://github.com/your-repo/contentscribe.git
   cd contentscribe
   ```
3. Build and run the Docker container:
   ```
   docker build -t contentscribe .
   docker run -p 8000:8000 contentscribe
   ```

### 2. Native Python and npm

#### Prerequisites
- Python 3.9+
- Node.js (LTS version)
- npm

#### Windows

1. Clone the repository:
   ```
   git clone https://github.com/your-repo/contentscribe.git
   cd contentscribe
   ```
2. Set up Python environment:
   ```
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Set up React app:
   ```
   cd app\ui
   npm install
   npm run build
   cd ..\..
   ```
4. Run the application:
   ```
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

#### Unix-based Systems (macOS/Linux)

1. Clone the repository:
   ```
   git clone https://github.com/your-repo/contentscribe.git
   cd contentscribe
   ```
2. Set up Python environment:
   ```
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
3. Set up React app:
   ```
   cd app/ui
   npm install
   npm run build
   cd ../..
   ```
4. Run the application:
   ```
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

The application will be available at http://localhost:8000
