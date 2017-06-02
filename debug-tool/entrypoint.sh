#!/bin/bash

# export app configuration
echo "CONFIG_FILE = '$FAQ_DEBUG_CONFIG'" >> /usr/src/${module}/settings.cfg

# assign folder permission
find /usr/src/${module} -type d -exec chmod 755 {} \;
# assign file permission
find /usr/src/${module} -type f -exec chmod 644 {} \;

# Start nginx in background
nohup service nginx restart &

# Start the flask
python3.6 /usr/src/${module}/webServer.py $FAQ_DEBUG_CONFIG $FAQ_DEBUG_DEBUG
