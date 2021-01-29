#!/bin/sh

if [ "" == "$1" ]; then
  echo A target directory is required.
  exit 1
fi

DEPS='yaml handlebars es6-promise-pool jsonpath-plus date-and-time react-inspector react-datepicker camelcase leaflet react-leaflet@2.8.0 gridlex just-handlerbars-helpers moment currencyformatter.js sprintf-js'
DEVDEPS='raw-loader to-js-identifier'

echo 'Copying runtime...'
rm -rf $1/lib
cp -R ./lib $1

echo 'Checking for existing app...'

if [ ! -d "$1/app" ]; then
  echo 'Creating new app...'
  mkdir $1/app
  cp ./examples/hello-world/* $1/app
else
  echo 'Found existing app...'
fi

echo 'Copying loader...'
cp ./loader/.extended-webpackrc.js $1
cp ./loader/build.js $1
cp ./loader/App.js $1/app
cp ./loader/index.js $1/nerdlets/*-nerdlet
cp ./loader/styles.scss $1/nerdlets/*-nerdlet

echo 'Installing prereqs...'
/bin/sh -c "cd $1; npm install --save-dev $DEVDEPS; npm install --save $DEPS"
