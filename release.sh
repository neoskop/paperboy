#!/usr/bin/env bash
set -e

if [[ "$#" != "1" ]] || [[ ! "$1" =~ ^(patch|minor|major)$ ]]; then
  echo "Usage: $0 patch|minor|major"
  exit 1
fi

if [[ `git status --porcelain` ]]; then
  echo -e "The repository has changes. Commit first...\033[0;31mAborting!\033[0m"
  exit 1
fi

git pull --rebase

cd paperboy-core
npm i
npm run build
npm version $1
version=`cat package.json | jq -r .version`
npm publish

cd ../paperboy-cli
cat package.json | jq ".version = \"$version\" | .dependencies.\"@neoskop/paperboy\" = \"$version\"" > package.json.new
mv package.json.new package.json
npm i

sed -i.bak "s/version('[[:digit:]]\+\.[[:digit:]]\+\.[[:digit:]]\+')/version('$version')/g" paperboy-cli.js
rm -rf paperboy-cli.js.bak
npm publish

cd ../paperboy-push-service
cat package.json | jq ".version = \"$version\"" > package.json.new
mv package.json.new package.json
npm i
npm run build
npm publish
cd ../

git add .
git commit -m "chore(): Bump version to ${version}."
git tag ${version}
git push origin $version
git pull --rebase
git push
