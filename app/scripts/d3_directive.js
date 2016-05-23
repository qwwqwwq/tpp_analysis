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
                    var width = 840,
                        height = 750;
                    var center = {x: width/2, y: height/2};
                    var sections = 50;

                    function renderFromScope() {
                        d3.select("#mapSvg").remove();

                        var projection = tppProjection
                            .scale(1000)
                            .translate([width / 1.5, height / 2]);

                        var path = d3.geo.path()
                            .projection(projection);

                        var svg = d3.select("#map").append("svg")
                            .attr("id", "mapSvg")
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
                                renderSelected(d3.select(this));
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
                                .attr("r", "70%")
                            ;

                        radialGradient.append("stop")
                            .attr("offset", "0%")
                            .attr("stop-color", "#0077e6");

                        radialGradient.append("stop")
                            .attr("offset", "60%")
                            .attr("stop-color", "#cce6ff");

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

                    /**
                     * Return path element representing sparkline for data.
                     */
                    function getSparkline(data, width, height, year, center) {
                        var domain = d3.extent(data);
                        console.log(domain);
                        var x = d3.scale.linear().domain([0, data.length]).range([0, width]);
                        var y = d3.scale.linear().domain(domain).range([height, 0]);

                        var line = d3.svg.line()
                            .x(function(d, i) {
                                return x(i);
                            })
                            .y(function(d, i) {
                                return y(d);
                            });

                        d3.select("#mapSvg")
                            .append("path")
                            .attr("d", line(data))
                            .attr("class", "sparkline")
                            .attr("transform",
                            "translate(" + (center.x + 10) + "," + (center.y + 60) + ")");

                        d3.select("#mapSvg")
                            .append("circle")
                            .attr("r", 2)
                            .attr("cx", x(year))
                            .attr("cy", y(data[year]))
                            .attr("class", "sparkline-point")
                            .attr("transform",
                            "translate(" + (center.x + 10) + "," + (center.y + 60) + ")");
                    }

                    function renderSelected(element) {
                        //var element = d3.select('#' + countryName.replace(/\s/g, ''));
                        if (select1 === null) {
                            select1 = element;
                        } else if (select2 === null) {
                            select2 = element;

                            var color = d3.interpolateLab("#008000", "#c83a22");
                            var ds = shapeConnector.sectionedConnector(center, select1[0][0], select2[0][0], sections);

                            d3.select("#mapSvg")
                                .insert("g", ":first-child")
                                .attr("class", "connector")
                                .selectAll("path")
                                .data(ds)
                                .enter()
                                .append("path")
                                .style("stroke", function(d,i) {
                                    return color(i / sections);
                                })
                                .style("fill", function(d,i) {
                                    return color(i / sections);
                                })
                                .attr("d", function(d) {
                                    return d;
                                })
                                .attr("class", "connector");

                            d3.select("#mapSvg")
                                .append("path")
                                .attr("d", shapeConnector.getBoundingBox(select1[0][0]))
                                .attr("class", "bbox");

                            d3.select("#mapSvg")
                                .append("path")
                                .attr("d", shapeConnector.getBoundingBox(select2[0][0]))
                                .attr("class", "bbox");


                            var center1 = shapeConnector.getBoundingCenter(select1[0][0]);
                            d3.select("#mapSvg")
                                .append("circle")
                                .attr("r", "5")
                                .attr("cx", center1.x)
                                .attr("cy", center1.y)
                                .attr("class", "dot");



                            var center2 = shapeConnector.getBoundingCenter(select2[0][0]);
                            d3.select("#mapSvg")
                                .append("circle")
                                .attr("r", "5")
                                .attr("cx", center2.x)
                                .attr("cy", center2.y)
                                .attr("class", "dot");

                            d3.select("#mapSvg")
                                .append("circle")
                                .attr("r", "5")
                                .attr("cx", center.x)
                                .attr("cy", center.y)
                                .attr("class", "dot");

                            d3.select("#mapSvg")
                                .append("rect")
                                .attr("x", center1.x)
                                .attr("y", center1.y)
                                .attr("rx", 20)
                                .attr("ry", 20)
                                .attr("width", 100)
                                .attr("height", 100)
                                .attr("class", "svg-tooltip");

                            d3.select("#mapSvg")
                                .append("rect")
                                .attr("x", center2.x)
                                .attr("rx", 20)
                                .attr("ry", 20)
                                .attr("y", center2.y)
                                .attr("width", 100)
                                .attr("height", 100)
                                .attr("class", "svg-tooltip");

                            d3.select("#mapSvg")
                                .append("text")
                                .attr("x", center1.x + 50)
                                .attr("y", center1.y + 40)
                                .text(scope.$parent.data['Base Rate'])
                                .attr("class", "info");

                            getSparkline([1,2,3,4,3,2,1,4,6,8,9,4,3], 80, 30, 4, center1);

                        } else {
                            select1.classed('selected', false);
                            select2.classed('selected', false);
                            d3.selectAll(".connector").remove();
                            d3.selectAll(".bbox").remove();
                            d3.selectAll(".dot").remove();
                            d3.selectAll(".info").remove();
                            select2 = null;
                            select1 = element;
                        }
                        element.classed('selected', true)
                    }


                    angular.element($window).bind('resize', function () {
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

