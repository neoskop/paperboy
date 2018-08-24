#!/usr/bin/env bash
set -e
pattern="s/paperboy start/$@/g"
perl -p -i -e ''"$pattern"'' /home/node/supervisord.conf

if [ -n "$SERVE_DIR" ]; then
  pattern="s#/app/dist#/app/$SERVE_DIR#g"
  perl -p -i -e ''"$pattern"'' /home/node/nginx.conf
fi

/usr/bin/supervisord -c /home/node/supervisord.conf