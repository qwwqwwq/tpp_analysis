(function () {
    'use strict';
    angular.module('shapeConnector')
        .factory('shapeConnector', ['Bezier', function (Bezier) {

            function indexOfMin(arr) {
                if (arr.length === 0) {
                    return -1;
                }

                var min = arr[0];
                var minIndex = 0;

                for (var i = 1; i < arr.length; i++) {
                    if (arr[i] < min) {
                        minIndex = i;
                        min = arr[i];
                    }
                }

                return minIndex;
            }

            /**
             * Return an array of path attributes representing "slices" of a bridge
             * between the two shapes.
             *
             * @param connectorCentroid
             * @param pathA
             * @param pathB
             * @param nSections
             * @returns Array{string}
             */
            function sectionedConnector(connectorCentroid, pathA, pathB, nSections) {
                var output = [];

                var beziers = shapeConnector(connectorCentroid, pathA, pathB);

                var lutMinor = beziers[0].getLUT(nSections);
                var lutMajor = beziers[1].getLUT(nSections);
                for (var i = 0; i < nSections; i++) {
                    var minorSection = beziers[0].split(i / nSections, (i + 1) / nSections);
                    var majorSection = beziers[1].split(i / nSections, (i + 1) / nSections);

                    output.push(("M" + pathPoint(lutMinor[i]) + "L" + pathPoint(lutMajor[i]) +
                    stripMove(majorSection.toSVG()) + "L" + pathPoint(lutMinor[i + 1]) +
                    stripMove(reverseBezier(minorSection).toSVG()) + "Z"));
                }

                return output;
            }

            /**
             * Toggle bezier between clockwise / counterclockwise
             * @param bezier {Bezier}
             * @returns {Bezier}
             */
            function reverseBezier(bezier) {
                var reversed = Object.create(Bezier.prototype);
                Bezier.apply(reversed, bezier.points.reverse());
                return reversed;
            }

            /**
             * Strip the first SVG path "move" command from a path string.
             */
            function stripMove(d) {
                var s = d + "";
                return s.substring(s.indexOf("C"));
            }

            /**
             * Return two Bezier curves forming a bridge between the
             * two shapes.
             *
             * @param connectorCentroid stroke will "bend" toward this point
             * @param pathA Path outline of shape A
             * @param pathB Path outline of shape B
             * @returns Array [{Bezier}, {Bezier}] minor and major bezier curves
             */
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

                function intersects(minorA, minorB, majorA, majorB) {
                    var intersections = new Bezier(minorA,
                        halfwayPoint(minorA, connectorCentroid),
                        halfwayPoint(minorB, connectorCentroid),
                        minorB).intersects(
                        new Bezier(
                            majorA, connectorCentroid, majorB
                        )
                    );
                    return !!intersections.length;
                }

                var distances = [
                    dist(pointsA[0], pointsB[0]),
                    dist(pointsA[0], pointsB[1]),
                    dist(pointsA[1], pointsB[0]),
                    dist(pointsA[1], pointsB[1])];

                var intersections = [intersects(pointsA[0], pointsB[0], pointsA[1], pointsB[1]),
                    intersects(pointsA[0], pointsB[1], pointsA[1], pointsB[0]),
                    intersects(pointsA[1], pointsB[0], pointsA[0], pointsB[1]),
                    intersects(pointsA[1], pointsB[1], pointsA[0], pointsB[0])];

                var minDistance = Infinity;
                var idx;
                for (var i = 0; i < distances.length; i++) {
                    if (!intersections[i]) {
                        if (distances[i] < minDistance) {
                            minDistance = distances[i];
                            idx = i;
                        }
                    }
                }


                if (idx == 0) {
                    minorA = pointsA[0];
                    minorB = pointsB[0];
                    majorA = pointsA[1];
                    majorB = pointsB[1];
                } else if (idx == 1) {
                    minorA = pointsA[0];
                    minorB = pointsB[1];
                    majorA = pointsA[1];
                    majorB = pointsB[0];
                } else if (idx == 2) {
                    minorA = pointsA[1];
                    minorB = pointsB[0];
                    majorA = pointsA[0];
                    majorB = pointsB[1];
                } else {
                    minorA = pointsA[1];
                    minorB = pointsB[1];
                    majorA = pointsA[0];
                    majorB = pointsB[0];
                }

                return [new Bezier(minorA,
                    halfwayPoint(minorA, connectorCentroid),
                    halfwayPoint(minorB, connectorCentroid),
                    minorB),
                    new Bezier(majorA,
                        connectorCentroid,
                        connectorCentroid,
                        majorB)];
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
                return {x: (bbox[0][0] + bbox[1][0]) / 2, y: (bbox[0][1] + bbox[1][1]) / 2};
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
                    console.log("last ditch");
                    closestLeftIdx = 0;
                }

                if (closestRightIdx == -1) {
                    console.log("last ditch");
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

            /**
             * Law of cosines
             *
             * arccos((P12^2 + P13^2 - P23^2) / (2 * P12 * P13))
             */
            function getAngle(pathPoint, connectorCentroid, shapeCentroid) {
                var numerator = Math.pow(dist(pathPoint, connectorCentroid), 2) + Math.pow(dist(pathPoint, shapeCentroid), 2) -
                    Math.pow(dist(connectorCentroid, shapeCentroid), 2);
                var denominator = 2 * dist(pathPoint, connectorCentroid) * dist(pathPoint, shapeCentroid);
                return Math.acos(numerator / denominator);
            }

            function determinant(connectorCentroid, shapeCentroid, queryPoint) {
                //(Bx - Ax) * (Y - Ay) - (By - Ay) * (X - Ax)
                return (shapeCentroid.x - connectorCentroid.x) *
                (queryPoint.y - connectorCentroid.y) - (shapeCentroid.y - connectorCentroid.y) *
                (queryPoint.x - connectorCentroid.x);
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
                getBoundingBox: boundingBox,
                sectionedConnector: sectionedConnector,
                getAngle: getAngle,
                determinant: determinant
            };

        }])
}());