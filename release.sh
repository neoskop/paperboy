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

cd paperboy-core
npm i
npm run build
npm version $1
version=$(cat package.json | jq -r .version)
npm publish

cd ../paperboy-cli
cat package.json | jq ".version = \"$version\" | .dependencies.\"@neoskop/paperboy\" = \"$version\"" >package.json.new
mv package.json.new package.json
npm i

sed -i.bak "s/version([\"'][[:digit:]]\+\.[[:digit:]]\+\.[[:digit:]]\+[\"'])/version(\"$version\")/g" paperboy-cli.js
rm -rf paperboy-cli.js.bak
npm publish

cd ../paperboy-push-service
cat package.json | jq ".version = \"$version\"" >package.json.new
mv package.json.new package.json
npm i
npm run build
npm publish
docker build -t neoskop/paperboy-push-service:$version .
docker build -t neoskop/paperboy-push-service:latest .
docker push neoskop/paperboy-push-service:$version
docker push neoskop/paperboy-push-service:latest

cd ../paperboy-helm
yq eval -i ".version=\"$version\"" ./Chart.yaml
yq eval -i ".appVersion=\"$version\"" ./Chart.yaml
yq eval -i ".image.tag=\"$version\"" ./values.yaml

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

HELM_CHARTS_DIR=../helm-charts
[ -d $HELM_CHARTS_DIR ] || git clone git@github.com:neoskop/helm-charts.git $HELM_CHARTS_DIR
cd $HELM_CHARTS_DIR
./update-index.sh
cd - &>/dev/null
