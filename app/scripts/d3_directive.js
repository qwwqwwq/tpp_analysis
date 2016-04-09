'use strict';

angular.module('d3Directives').directive(
    'd3Map',
    ['$window', '$compile', 'd3', 'queue', 'topojson', 'tppProjection', 'shapeConnector',
        function ($window, $compile, d3, queue, topojson, tppProjection, shapeConnector) {
        return {
            restrict: 'A',
            scope: true,
            link: function (scope, element, attr) {

                var world;
                var select1 = null, select2 = null;
                var center = {x: 479, y: 310};

                function renderFromScope() {
                    d3.select("svg").remove();

                    var width = 1450,
                        height = 750;

                    var projection = tppProjection
                        .scale(1070)
                        .translate([width / 2, height / 2]);

                    //center = {x: width / 2, y: height / 2};

                    var path = d3.geo.path()
                        .projection(projection);

                    var svg = d3.select("#map").append("svg")
                        .attr("width", width)
                        .attr("height", height);

                    svg.append("rect")
                        .attr("width", width)
                        .attr("height", height);

                    svg.append("path")
                        .datum({type: "Sphere"})
                        .attr("class", "sphere")
                        .attr("d", path);

                    svg.append("g")
                        .selectAll("path")
                        .data(topojson.feature(world, world.objects.countries).features)
                        .enter()
                        .append("path")
                        .attr("class", "mesh")
                        .attr("id", function(d, i) {
                            return d.properties.name.replace(/\s/g, '');
                        })
                        .on("click", function(d, i) {
                            console.log(d.properties.name);
                            console.log(d3.geo.path().bounds(d));
                            markSelected(d.properties.name, getCentroid(d));
                        })
                        .attr("d", path);

                    svg.insert("path", ".graticule")
                        .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
                        .attr("class", "boundary")
                        .attr("d", path);
                }

                function toggleSelected(element) {
                    if (element.classed('selected')) {
                        element.classed('selected', false);
                    } else {
                        element.classed('selected', true);
                    }
                }

                function getCentroid(d) {
                    var bounds = d3.geo.path().bounds(d);
                    return {x: bounds[0][0] + bounds[1][0]/2, y: bounds[0][1] + bounds[1][1]/2};
                }

                function markSelected(countryName, centroid) {
                    var element = d3.select('#' + countryName.replace(/\s/g, ''));
                    if (select1 === null) {
                        select1 = element;
                    } else if (select2 === null) {
                        select2 = element;
                        d3.select("svg")
                            .append("path")
                            .attr("d", shapeConnector(center, select1[0][0], select2[0][0]))
                            .attr("class", "connector");
                    } else {
                        select1.classed('selected', false);
                        select2.classed('selected', false);
                        d3.selectAll(".connector").remove();
                        select2 = null;
                        select1 = element;
                    }
                    element.classed('selected', true)
                }


                angular.element($window).bind('resize', function() {
                   renderFromScope();
                });

                queue()
                    .defer(d3.json, "static/tpp-50m.json")
                    .awaitAll(ready);

                function ready(error, data) {
                    if (error) {
                        console.error(error);
                    }
                    world = data[0];
                    renderFromScope();
                }
            }
        };
    }]
);

