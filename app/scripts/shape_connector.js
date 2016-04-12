(function () {
    'use strict';
    angular.module('shapeConnector')
        .factory('shapeConnector', [function () {

            function shapeConnector(connectorCentroid, pathA, pathB) {
                var minorA, minorB, majorA, majorB, pointsA, pointsB;

                var pathACentroid = getBoundingCenter(pathA);
                var pathBCentroid = getBoundingCenter(pathB);

                pointsA = choosePoints(pathACentroid,
                    getPoints(pathA),
                    connectorCentroid);
                pointsB = choosePoints(pathBCentroid,
                    getPoints(pathB),
                    connectorCentroid);


                if (dist(pointsA[0], connectorCentroid) > dist(pointsA[1], connectorCentroid)) {
                    minorA = pointsA[0];
                    majorA = pointsA[1];
                } else {
                    minorA = pointsA[1];
                    majorA = pointsA[0];
                }
                if (dist(pointsB[0], connectorCentroid) > dist(pointsB[1], connectorCentroid)) {
                    minorB = pointsB[0];
                    majorB = pointsB[1];
                } else {
                    minorB = pointsB[1];
                    majorB = pointsB[0];
                }

                return "M" + pathPoint(minorA) +
                    "C" + pathPoint(halfwayPoint(minorA, connectorCentroid))
                    + pathPoint(halfwayPoint(minorB, connectorCentroid))
                    + pathPoint(minorB) +
                    "L" + pathPoint(majorB) +
                    "C" + pathPoint(connectorCentroid)
                    + pathPoint(connectorCentroid)
                    + pathPoint(majorA) + "Z";
            }

            function pathPoint(p) {
                return p.x + " " + p.y + " ";
            }

            function halfwayPoint(pointA, pointB) {
                return {x: (pointA.x + pointB.x) / 2, y: (pointA.y + pointB.y) / 2}
            }

            function getPoints(path) {
                var pathData = path.getPathData();
                var currentSegment, L;
                var points = [];
                for (var i = 0; i < pathData.length; i++) {
                    currentSegment = pathData[i];
                    L = currentSegment.values.length;
                    if (L >= 2) {
                        var x = currentSegment.values[L - 2],
                            y = currentSegment.values[L - 1];
                        points.push({x: x, y: y});
                    }
                }
                return points;
            }

            function getBoundingBoxPoints(path) {
                var points = getPoints(path);
                var x0, y0, x1, y1, point;
                x0 = y0 = Infinity;
                x1 = y1 = -Infinity;
                for (var i = 0; i < points.length; i++) {
                    point = points[i];
                    if (point.x < x0) {
                        x0 = point.x;
                    }

                    if (point.y < y0) {
                        y0 = point.y;
                    }

                    if (point.x > x1) {
                        x1 = point.x;
                    }

                    if (point.y > y1) {
                        y1 = point.y;
                    }
                }
                return [[x0, y0], [x1, y1]];

            }

            function getBoundingCenter(path) {
                var bbox = getBoundingBoxPoints(path);
                var out =  {x: (bbox[0][0] + bbox[1][0]) / 2, y: (bbox[0][1] + bbox[1][1]) / 2};
                console.log(out);
                console.log(bbox);
                return out;
            }

            function choosePoints(shapeCentroid,
                                  shapePoints,
                                  connectorCentroid) {
                var closestLeftIdx = -1,
                    closestLeftScore = Infinity,
                    closestRightIdx = -1,
                    closestRightScore = Infinity;
                for (var i = 0; i < shapePoints.length; i++) {
                    var score = Math.abs(getAngle(shapePoints[i], connectorCentroid, shapeCentroid) - (Math.PI / 2));
                    if (determinant(connectorCentroid, shapeCentroid, shapePoints[i]) < 0) {
                        if (score < closestLeftScore) {
                            closestLeftIdx = i;
                            closestLeftScore = score;
                        }
                    } else {
                        if (score < closestRightScore) {
                            closestRightIdx = i;
                            closestRightScore = score;
                        }
                    }
                }

                //TODO: last ditch guess
                if (closestLeftIdx === -1) {
                    closestLeftIdx = 0;
                }

                if (closestRightIdx == -1) {
                    closestRightIdx = shapePoints.length / 2;
                }

                return [shapePoints[closestLeftIdx], shapePoints[closestRightIdx]];
            }

            function getSlope(pointA, pointB) {
                return (pointA.y - pointB.y) / (pointA.x - pointB.x);
            }

            function getParallelSlope(pointA, pointB) {
                return -1 / getSlope(pointA, pointB);
            }

            function dist(pointA, pointB) {
                return Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2));
            }

            function getAngle(pathPoint, connectorCentroid, shapeCentroid) {
                var numerator = Math.pow(dist(pathPoint, connectorCentroid), 2) + Math.pow(dist(pathPoint, shapeCentroid), 2) -
                    Math.pow(dist(connectorCentroid, shapeCentroid), 2);
                var denominator = 2 * Math.pow(dist(pathPoint, connectorCentroid), 2) * Math.pow(dist(pathPoint, shapeCentroid), 2);
                return Math.acos(numerator / denominator);
            }

            function determinant(connectorCentroid, shapeCentroid, queryPoint) {
                return ((shapeCentroid.x - queryPoint.x) *
                ((queryPoint.y - connectorCentroid.y) - (shapeCentroid.y - connectorCentroid.y)) *
                (queryPoint.x - connectorCentroid.x));
            }

            function boundingBox(path) {
                var bbox = getBoundingBoxPoints(path);
                var width = bbox[1][0] - bbox[0][0];
                var height = bbox[1][1] - bbox[0][1];
                var upperLeft = {x: bbox[0][0], y: bbox[0][1]};
                var upperRight = {x: bbox[1][0], y: bbox[0][1]};
                var lowerRight = {x: bbox[1][0], y: bbox[1][1]};
                var lowerLeft = {x: bbox[0][0], y: bbox[1][1]};

                return "M" + pathPoint(upperLeft) +
                        "L" + pathPoint(upperRight) +
                        "L" + pathPoint(lowerRight) +
                        "L" + pathPoint(lowerLeft) +
                        "L" + pathPoint(upperLeft) + "Z";
            }

            return {
                shapeConnector: shapeConnector,
                getBoundingBoxPoints: getBoundingBoxPoints,
                getBoundingCenter: getBoundingCenter,
                getBoundingBox: boundingBox
            };

        }])
}());