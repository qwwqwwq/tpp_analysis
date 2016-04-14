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
                    var center = {x: 520, y: 385};

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
                            /*.attr("id", function(d, i) {
                             return d.properties.name.replace(/\s/g, '');
                             })*/
                            .on("click", function (d, i) {
                                markSelected(d3.select(this));
                            })
                            .attr("d", path);

                        svg.insert("path", ".graticule")
                            .datum(topojson.mesh(world, world.objects.countries, function (a, b) {
                                return a !== b;
                            }))
                            .attr("class", "boundary")
                            .attr("d", path);

                        var radialGradient = svg.append("defs")
                                .append("radialGradient")
                                .attr("id", "radial-gradient")
                                .attr("cx", "50%")
                                .attr("cy", "50%")
                                .attr("fx", "50%")
                                .attr("fy", "50%")
                                .attr("r", "50%")
                            ;

                        radialGradient.append("stop")
                            .attr("offset", "0%")
                            .attr("stop-color", "#99ccff");

                        radialGradient.append("stop")
                            .attr("offset", "100%")
                            .attr("stop-color", "#ffffff");
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
                        return {x: bounds[0][0] + bounds[1][0] / 2, y: bounds[0][1] + bounds[1][1] / 2};
                    }

                    function markSelected(element) {
                        //var element = d3.select('#' + countryName.replace(/\s/g, ''));
                        if (select1 === null) {
                            select1 = element;
                        } else if (select2 === null) {
                            select2 = element;
                            d3.select("svg")
                                .insert("path", ":first-child")
                                .attr("d", shapeConnector.shapeConnector(center, select1[0][0], select2[0][0]))
                                .attr("class", "connector")
                                .style("fill", "url(#radial-gradient)");

                            d3.select("svg")
                                .append("path")
                                .attr("d", shapeConnector.getBoundingBox(select1[0][0]))
                                .attr("class", "bbox");

                            d3.select("svg")
                                .append("path")
                                .attr("d", shapeConnector.getBoundingBox(select2[0][0]))
                                .attr("class", "bbox");


                            var center1 = shapeConnector.getBoundingCenter(select1[0][0]);
                            d3.select("svg")
                                .append("circle")
                                .attr("r", "5")
                                .attr("cx", center1.x)
                                .attr("cy", center1.y)
                                .attr("class", "dot");

                            var center2 = shapeConnector.getBoundingCenter(select2[0][0]);
                            d3.select("svg")
                                .append("circle")
                                .attr("r", "5")
                                .attr("cx", center2.x)
                                .attr("cy", center2.y)
                                .attr("class", "dot");

                            d3.select("svg")
                                .append("circle")
                                .attr("r", "5")
                                .attr("cx", center.x)
                                .attr("cy", center.y)
                                .attr("class", "dot");
                        } else {
                            select1.classed('selected', false);
                            select2.classed('selected', false);
                            d3.selectAll(".connector").remove();
                            d3.selectAll(".bbox").remove();
                            d3.selectAll(".dot").remove();
                            select2 = null;
                            select1 = element;
                        }
                        element.classed('selected', true)
                    }


                    angular.element($window).bind('resize', function () {
                        renderFromScope();
                    });

                    queue()
                        .defer(d3.json, "static/test.json")
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

