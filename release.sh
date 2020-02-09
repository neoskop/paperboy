#!/usr/bin/env bash
set -e

function check_command() {
  if ! command -v $1 >/dev/null; then
    echo -e "Install \033[1m$1\033[0m"
    exit 1
  fi
}

check_command mvn
check_command jq
check_command yq
check_command yarn
check_command npm
check_command docker

if [[ "$#" != "1" ]] || [[ ! "$1" =~ ^(patch|minor|major)$ ]]; then
  echo "Usage: $0 patch|minor|major"
  exit 1
fi

if [[ $(git status --porcelain) ]]; then
  echo -e "The repository has changes. Commit first...\033[0;31mAborting!\033[0m"
  exit 1
fi

git pull --rebase

cd paperboy-project-generator
yarn
npm version $1
npm publish

cd ../paperboy-core
yarn
yarn build
npm version $1
version=$(cat package.json | jq -r .version)
npm publish

cd ../paperboy-magnolia-module
mvn versions:set -DnewVersion=${version} -DgenerateBackupPoms=false
mvn deploy

cd ../paperboy-docker
sed -i "s/ENV PAPERBOY_VERSION=[[:digit:]]\+\.[[:digit:]]\+\.[[:digit:]]\+/ENV PAPERBOY_VERSION=$version/" Dockerfile

cd ../paperboy-cli
cat package.json | jq ".version = \"$version\" | .dependencies.\"@neoskop/paperboy\" = \"$version\"" >package.json.new
mv package.json.new package.json
yarn

sed -i.bak "s/version('[[:digit:]]\+\.[[:digit:]]\+\.[[:digit:]]\+')/version('$version')/g" paperboy-cli.js
rm -rf paperboy-cli.js.bak
npm publish

cd ../paperboy-push-service
cat package.json | jq ".version = \"$version\"" >package.json.new
mv package.json.new package.json
yarn
yarn build
npm publish
docker build -t neoskop/paperboy-push-service:$version .
docker build -t neoskop/paperboy-push-service:latest .
docker push neoskop/paperboy-push-service:$version
docker push neoskop/paperboy-push-service:latest

cd ../paperboy-helm
yq w -i ./Chart.yaml version $version
yq w -i ./Chart.yaml appVersion $version
yq w -i ./values.yaml image.tag $version

cd ../
git add .
git commit -m "chore: Bump version to ${version}."
git tag ${version}
git push origin $version
git pull --rebase
git push

helm package paperboy-helm --destination .deploy
cr upload -o neoskop -r paperboy -p .deploy
git checkout gh-pages
cr index -i ./index.yaml -p .deploy -o neoskop -r paperboy -c https://neoskop.github.io/paperboy/
git add index.yaml
git commit -m "chore: Bump version to ${version}."
git push
git checkout master
rm -rf .deploy/
