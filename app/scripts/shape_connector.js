(function () {
    'use strict';
    angular.module('shapeConnector')
        .factory('shapeConnector', [function () {

            function calculateBeziers(connectorCentroid, pathA, pathACentroid, pathB, pathBCentroid) {
                var majorBezier, minorBezier, minorA, minorB, majorA, majorB, pointsA, pointsB;

                pointsA = choosePoints(pathACentroid,
                    getPoints(pathA),
                    connectorCentroid);
                pointsB = choosePoints(pathBCentroid,
                    getPoints(pathB),
                    connectorCentroid);


                if (dist(pointsA[0], pointsB[1]) > dist(pointsA[1], pointsB[0])) {
                    minorA = pointsA[1];
                    minorB = pointsB[0];
                    majorA = pointsA[0];
                    majorB = pointsB[1];
                } else {
                    minorA = pointsA[0];
                    minorB = pointsB[1];
                    majorA = pointsA[1];
                    majorB = pointsB[0];

                }

                minorBezier = {
                    pointOrigin: minorA,
                    controlPoint1: halfwayPoint(minorA, connectorCentroid),
                    controlPoint2: halfwayPoint(minorB, connectorCentroid),
                    pointDestination: minorB
                };
                majorBezier = {
                    pointOrigin: majorA,
                    controlPoint1: connectorCentroid,
                    controlPoint2: connectorCentroid,
                    pointDestination: majorB
                };
            }

            function halfwayPoint(pointA, pointB) {
                return {x: (pointA.x + pointB.x)/2, y: (pointA.y + pointB.y)/2}
            }

            function getPoints(path) {
                var pathData = path.getPathData();
                var currentSegment, L;
                var points = [];
                for (var i = 0; i < pathData.length; i++) {
                    currentSegment = pathData[i];
                    L = currentSegment.length;
                    if (L >= 2) {
                        var x = currentSegment.values[L - 2],
                            y = currentSegment.values[L - 1];
                        points.push({x: x, y: y});
                    }
                }
                return points;
            }

            function choosePoints(shapeCentroid,
                                  shapePoints,
                                  connectorCentroid) {
                var slope = getParallelSlope(shapeCentroid, connectorCentroid);
                var closestLeftIdx = -1,
                    closestLeftScore = Math.POSITIVE_INFINITY,
                    closestRightIdx = -1,
                    closestRightScore = Math.POSITIVE_INFINITY;
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

        }])
}());