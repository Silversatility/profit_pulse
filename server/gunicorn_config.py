bind = "127.0.0.1:8000"  # make sure the port matches the nginx config
workers = 4
timeout = 120
capture_output = True
pidfile = "server/gunicorn.pid"
daemon = False
worker_class = "gevent"
