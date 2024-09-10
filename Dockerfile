# Stage 1: Build the React app
FROM node:lts AS react-builder

# Set the working directory for the React app
WORKDIR /app/ui

# Copy the React app files
COPY app/ui /app/ui

# Install dependencies and build the React app
RUN npm install && npm run build

# Stage 2: Build the Python app
FROM python:3.9

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Copy the built React app from the previous stage
COPY --from=react-builder /app/ui/build /app/ui/build

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Define environment variable
ENV PORT=8000

# Run the application with increased timeout and workers
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--timeout-keep-alive", "75", "--workers", "4"]