#!/bin/sh

if [ "" == "$1" ]; then
  echo A target directory is required.
  exit 1
fi

if [ "" == "$2" ]; then
  echo A nerdpack name is required.
  exit 1
fi

NERDDIR="$1/$2"
DEPS='yaml handlebars es6-promise-pool jsonpath-plus date-and-time react-inspector react-datepicker camelcase leaflet react-leaflet@2.8.0 gridlex just-handlebars-helpers moment currencyformatter.js sprintf-js'
DEVDEPS='raw-loader to-js-identifier'

echo "Creating nerdpack $2..."
/bin/sh -c "cd $1; nr1 create --name $2 --type nerdpack"

echo "Adding drawer nerdlet..."
/bin/sh -c "cd $NERDDIR; nr1 create --name drawer --type nerdlet"

echo 'Copying runtime...'
rm -rf $NERDDIR/lib
cp -R ./lib $NERDDIR

echo 'Copying sample app...'
mkdir $NERDDIR/app
cp ./examples/hello-world/* $NERDDIR/app

echo 'Copying loader...'
cp ./loader/.extended-webpackrc.js $NERDDIR
cp ./loader/build.js $NERDDIR
cp ./loader/App.js $NERDDIR/app
cp ./loader/index.js $NERDDIR/nerdlets/$2-nerdlet
cp ./loader/styles.scss $NERDDIR/nerdlets/$2-nerdlet
cp ./loader/drawer-nr1.json $NERDDIR/nerdlets/drawer
cp ./loader/drawer.js $NERDDIR/nerdlets/drawer/index.js

#echo 'Installing prereqs...'
/bin/sh -c "cd $NERDDIR; npm install --save-dev $DEVDEPS; npm install --save $DEPS"
