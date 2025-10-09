#!/bin/bash

# Auto-run cron job every minute
while true; do
  echo "🔄 Running cron job at $(date)"
  curl -s http://localhost:3000/api/cron/check-schedules > /dev/null
  sleep 60
done
