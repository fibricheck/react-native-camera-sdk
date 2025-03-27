#!/bin/sh
version="$(yarn version -v)"; echo "{ \"version\":\"$version\" }" > package-version.json