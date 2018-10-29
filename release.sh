#!/usr/bin/env bash
set -e

if [[ "$#" != "1" ]] || [[ ! "$1" =~ ^(patch|minor|major)$ ]]; then
  echo "Usage: $0 patch|minor|major"
  exit 1
fi

cd paperboy-core
npm i
npm run build
npm version $1
version=`cat package.json | jq -r .version`
npm publish

cd ../paperboy-source-magnolia
cat package.json | jq ".version = \"$version\" | .devDependencies.\"@neoskop/paperboy\" = \"$version\"" > package.json.new
mv package.json.new package.json
npm i
npm run build
npm publish

cd ../paperboy-cli
cat package.json | jq ".version = \"$version\" | .dependencies.\"@neoskop/paperboy\" = \"$version\" | .dependencies.\"@neoskop/paperboy-source-magnolia\" = \"$version\"" > package.json.new
npm i

# if command -v perl; then
#   perl -pie "s/version\('[0-9]+\.[0-9]+\.[0-9]+'\)/version('$version')/g" paperboy-cli.js
# else
#   echo -e "Since you don't seem to have \033[1mperl\033[0m installed, please bump the version \033[1mpaperboy-cli.js\033[0m to \033[1m$version\033[0m manually"
# fi

mv package.json.new package.json
npm publish

cd ../paperboy-push-service
cat package.json | jq ".version = \"$version\"" > package.json.new
mv package.json.new package.json
npm i
npm run build
npm publish