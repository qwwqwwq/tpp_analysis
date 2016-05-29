#!/bin/bash
aws s3 cp --recursive ./static s3://tpp-viz/static
aws s3 cp --recursive ./css s3://tpp-viz/css
aws s3 cp --recursive ./scripts s3://tpp-viz/scripts
aws s3 cp --recursive ./vendor s3://tpp-viz/vendor
aws s3 cp --recursive ./views s3://tpp-viz/views
aws s3 cp ./index.html s3://tpp-viz/index.html
