# gunicorn.conf.py

workers = 4  # Adjust the number of worker processes based on your system's capabilities
worker_class = 'gthread'
max_requests = 1000  # You can adjust this number based on your application's needs
max_requests_jitter = 50  # This adds randomness to the number of requests to prevent all workers from restarting at the same time
timeout = 120  # Increase the timeout value if your application takes longer to respond
preload_app = True  # Preload the application before the worker processes are forked
max_memory_per_worker = 100 * 1024 * 1024  # Set the maximum memory per worker process (in bytes)
# Logging
loglevel = 'debug'
accesslog = '-'  # Log access to stdout
errorlog = '-'  # Log errors to stdout
worker_connections = 1000
threads = 2