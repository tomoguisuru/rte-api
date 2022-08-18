#!/bin/sh

CONTAINER_FIRST_STARTUP="CONTAINER_FIRST_STARTUP"

if [ ! -e /$CONTAINER_FIRST_STARTUP ]; then
  touch /$CONTAINER_FIRST_STARTUP
  echo "-- First container startup --"

  {
    npm run db:create
  } && {
    npm run db:migrate
  } && {
    npm run db:seed
  }
fi

npm run dev
