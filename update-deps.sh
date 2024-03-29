#!/bin/bash
set -e

bold() {
  local BOLD='\033[1m'
  local NC='\033[0m'
  printf "${BOLD}${1}${NC}"
}

info() {
  local BLUE='\033[1;34m'
  local NC='\033[0m'
  printf "[${BLUE}INFO${NC}] $1\n"
}

error() {
  local RED='\033[1;31m'
  local NC='\033[0m'
  printf "[${RED}ERROR${NC}] $1\n"
}

warn() {
  local ORANGE='\033[1;33m'
  local NC='\033[0m'
  printf "[${ORANGE}WARN${NC}] $1\n"
}

check_commands() {
  for command in $@; do
    if ! command -v $command >/dev/null; then
      echo -e "Install $(bold $command)"
      exit 1
    fi
  done
}

get_tags() {
  i=0
  has_more=""
  while [[ $has_more != "null" ]]; do
    i=$((i + 1))
    answer=$(curl -s "https://hub.docker.com/v2/repositories/$1/tags/?page_size=100&page=$i")
    result=$(echo "$answer" | jq -r '.results | map(.name) | .[]')
    has_more=$(echo "$answer" | jq -r '.next')
    if [[ ! -z "${result// /}" ]]; then results="${results}\n${result}"; fi
  done
  echo -e "$results"
}

get_node_lts_tags() {
  local NODE_TAGS=$(get_tags library/node | grep '^[0-9]*\.[0-9]*\.[0-9]*' | grep '\-buster\-slim$' | sort -V)
  for tag in $NODE_TAGS; do
    if [[ "$tag" =~ ^[0-9]+ ]] && [ -n "$(echo "${BASH_REMATCH[0]}" | awk '! ($0 % 2)')" ]; then
      echo "$tag"
    fi
  done
}

check_commands npm jq yq ncu

for dir in cli core push-service; do
  cd paperboy-$dir/
  rm package-lock.json
  ncu -u
  npm i
  cd - &>/dev/null
done

echo "Will use the following new image versions:"
NODE_LATEST_TAG=$(get_node_lts_tags | tail -n 1)
echo "  - Node: $(bold $NODE_LATEST_TAG)"
NATS_LATEST_TAG=$(get_tags library/nats | grep '^[0-9]*\.[0-9]*\.[0-9]*-scratch$' | sort -V | tail -n 1)
NATS_LATEST_VERSION=$(get_tags library/nats | grep '^[0-9]*\.[0-9]*\.[0-9]*$' | sort -V | tail -n 1)
echo "  - NATS: $(bold $NATS_LATEST_TAG)"
sed -i "1 s/^.*$/FROM node:$NODE_LATEST_TAG/" paperboy-core/Dockerfile
sed -E -i "s/^FROM node:(.+)\s+AS\s+(.+)/FROM node:$NODE_LATEST_TAG AS \2/g" paperboy-push-service/Dockerfile
yq eval -i ".services.queue.image=\"nats:$NATS_LATEST_TAG\"" docker-compose.yml
yq eval -i ".nats.version=\"$NATS_LATEST_VERSION\"" paperboy-helm/values.yaml
