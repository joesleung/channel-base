#!/bin/bash
if [ "$1" = "false" ]
# not a pull request, deploy to github pages
then ( cd docs
  git init
  git config user.name "o2team"
  git config user.email "o2team-ci@jd.com"
  git add .
  git commit -m "Deployed to Github Pages [skip ci]"
  git push --force --quiet "https://${GH_TOKEN}@${GH_REF}" master:gh-pages
)
fi