(function () {
    'use strict';
    angular.module('tppProjection')
        .factory('tppProjection', ['d3',
            function (d3) {
                var ε = 1e-6;
                var scaleFactor = 0.8;
                var scale = 150;
                var translation;

                var projections = {
                    // EPSG:102028
                    southAsia: d3.geo.conicEqualArea()
                        .rotate([0, 0])
                        .center([125, -15])
                        .parallels([7, -32]),
                    japan: d3.geo.conicEqualArea()
                        .rotate([0, 45, 45])
                        .center([(122.38 + 157.65) / 2, (17.09 + 46.05) / 2])
                        .parallels([46, 17]),
                    northAmerica: d3.geo.albers(),
                    southAmerica: d3.geo.conicEqualArea()
                        .rotate([0, -20, 0])
                        .center([(-122.19 + -25.28) / 2, (-59.87 + 32.72) / 2])
                        .parallels([0, -59]),
                    // EPSG: 3577
                    australia: d3.geo.conicEqualArea()
                        .rotate([-45, -45, 0])
                        .center([132, -27])
                        .parallels([-18, -36])
                };

                var constants = {
                    southAsia: {
                        clipXCenter: -0.5,
                        clipYCenter: 0.3,
                        clipYMin: -0.4,
                        clipYMax: 0.1,
                        clipXMin: -1,
                        clipXMax: -0.4,
                        centerLongitude: 125,
                        centerLatitude: -15,
                        scale: 0.6
                    },
                    japan: {
                        clipXCenter: -0.4,
                        clipYCenter: -0.2,
                        clipYMin: -0.5,
                        clipYMax: -0.2,
                        clipXMin: -0.4,
                        clipXMax: -0.175,
                        scale: 0.5
                    },
                    northAmerica: {
                        clipXCenter: +0.1,
                        clipYCenter: -0.2,
                        clipYMin: -1,
                        clipYMax: -0.05,
                        clipXMin: -0.175,
                        clipXMax: 0.3,
                        centerLongitude: -0.6,
                        centerLatitude: 38.7,
                        scale: 0.25
                    },
                    southAmerica: {
                        clipXCenter: 0,
                        clipYCenter: 0.05,
                        clipYMin: -0.05,
                        clipYMax: 0.5,
                        clipXMin: -0.1,
                        clipXMax: 0.3,
                        scale: 0.3
                    },
                    australia: {
                        clipXCenter: -0.5,
                        clipYCenter: 0.4,
                        clipYMin: 0.1,
                        clipYMax: 0.5,
                        clipXMin: -1,
                        clipXMax: -0.25,
                        scale: 0.3
                    }
                };

                var points = {};

                var point,
                    pointStream = {
                        point: function (x, y) {
                            point = [x, y];
                        }
                    };

                function transPacificPartnership(coordinates) {
                    var x = coordinates[0], y = coordinates[1];
                    point = null;
                    for (var country in points) {
                        points[country](x, y);
                        if (point) {
                            break;
                        }
                    }
                    return point;
                }

                function inBox(x, y, country) {
                    return y >= constants[country].clipYMin && y < constants[country].clipYMax &&
                        x >= constants[country].clipXMin && x < constants[country].clipXMax;
                }

                transPacificPartnership.invert = function (coordinates) {
                    var x = (coordinates[0] - translation[0]) / scaleFactor,
                        y = (coordinates[1] - translation[1]) / scaleFactor;

                    for (var country in projections) {
                        if (projections.hasOwnProperty(country)) {
                            if (inBox(x, y, country)) {
                                return projections[country].invert(coordinates)
                            }
                        }
                    }
                };

                // A naïve multi-projection stream.
                // The projections must have mutually exclusive clip regions on the sphere,
                // as this will avoid emitting interleaving lines and polygons.
                transPacificPartnership.stream = function (stream) {
                    var streams = {};
                    d3.keys(projections).forEach(
                        function (x) {
                            streams[x] = projections[x].stream(stream);
                        });
                    return {
                        point: function (x, y) {
                            d3.values(streams).forEach(
                                function (stream) {
                                    stream.point(x, y);
                                }
                            );
                        },
                        sphere: function () {
                            d3.values(streams).forEach(
                                function (stream) {
                                    stream.sphere();
                                }
                            );
                        },
                        lineStart: function () {
                            d3.values(streams).forEach(
                                function (stream) {
                                    stream.lineStart();
                                }
                            );
                        },
                        lineEnd: function () {
                            d3.values(streams).forEach(
                                function (stream) {
                                    stream.lineEnd();
                                }
                            );
                        },
                        polygonStart: function () {
                            d3.values(streams).forEach(
                                function (stream) {
                                    stream.polygonStart();
                                }
                            );
                        },
                        polygonEnd: function () {
                            d3.values(streams).forEach(
                                function (stream) {
                                    stream.polygonEnd();
                                }
                            );
                        }
                    };
                };

                transPacificPartnership.precision = function (_) {
                    if (!arguments.length) return projections.southAsia.precision();
                    d3.values(projections).forEach(
                        function (proj) {
                            proj.precision(_);
                        }
                    );
                    return transPacificPartnership;
                };

                transPacificPartnership.scale = function (_) {
                    if (!arguments.length) return scaleFactor * scale;
                    d3.keys(projections).forEach(
                        function (x) {
                            projections[x].scale(_ * constants[x].scale);
                        }
                    );
                    scale = _;
                    return transPacificPartnership.translate(projections.southAsia.translate());
                };

                transPacificPartnership.translate = function (_) {
                    if (!arguments.length) return projections.southAsia.translate();
                    var k = (scale * scaleFactor), x = +_[0], y = +_[1];

                    d3.keys(projections).forEach(
                        function (country) {
                            points[country] = projections[country]
                                .translate([
                                    x + constants[country].clipXCenter * k,
                                    y + constants[country].clipYCenter * k])
                                .clipExtent([
                                    [x + constants[country].clipXMin * k + ε, y + constants[country].clipYMin * k + ε],
                                    [x + constants[country].clipXMax * k - ε, y + constants[country].clipYMax * k - ε]
                                ])
                                .stream(pointStream).point;
                        }
                    );

                    return transPacificPartnership;
                };

                return transPacificPartnership.scale(1070);
            }
        ]
    );
}());