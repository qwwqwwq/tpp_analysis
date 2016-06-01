'use strict';

angular.module('d3Directives').directive(
    'd3Map',
    ['$window', '$compile', 'd3', 'queue', 'topojson', 'tppProjection', 'shapeConnector',
        function ($window, $compile, d3, queue, topojson, tppProjection, shapeConnector) {
            return {
                restrict: 'E',
                scope: true,
                link: function (scope, element, attr) {

                    var world;
                    var select1 = null, select2 = null;
                    var width = 840,
                        height = 750;
                    var center = {x: width / 2, y: height / 2};
                    var sections = 50;

                    function getNumber(string) {
                        return +string.replace(/[^0-9.]/g,'');
                    }

                    function getNumberArray(arr) {
                        var out = [];
                        arr.forEach(function(x) {
                            out.push(getNumber(x));
                        });
                        return out;
                    }

                    function getOrientation(tipCenter, center) {
                        var piOver2 = Math.PI / 2;
                        var angle = shapeConnector.getAngle(center, {x: 0, y: 0}, tipCenter);
                        var determinant = shapeConnector.determinant({x: 0, y: 0}, {x: width, y: height}, tipCenter);
                        if (angle < piOver2 && determinant < 0) {
                            return "top";
                        } else if (angle >= piOver2 && angle <= Math.PI && determinant < 0) {
                            return "right";
                        } else if (angle < piOver2 && determinant >= 0) {
                            return "left";
                        } else {
                            return "bottom";
                        }
                    }

                    function getTipSegment(position, orientation, width, height, tipCoeff) {
                        if (position !== orientation) {
                            return '';
                        }
                        if (orientation == 'top') {
                            return ('L' + ((width / 2) - (width * tipCoeff)) + ' ' + height +
                            'L' + (width / 2) + ' ' + (height + (tipCoeff * height)) +
                            'L' + ((width / 2) + (width * tipCoeff)) + ' ' + height);
                        } else if (orientation == 'right') {
                            return ('L' + 0 + ' ' + ((height / 2) - (height * tipCoeff)) +
                            'L' + (0 - (width * tipCoeff)) + ' ' + (height / 2) +
                            'L' + 0 + ' ' + ((height / 2) + (height * tipCoeff)));
                        } else if (orientation == 'bottom') {
                            return ('L' + ((width / 2) + (width * tipCoeff)) + ' ' + 0 +
                            'L' + (width / 2) + ' ' + (0 - (tipCoeff * height)) +
                            'L' + ((width / 2) - (width * tipCoeff)) + ' ' + 0);
                        } else if (orientation == 'left') {
                            return ('L' + width + ' ' + ((height / 2) + (height * tipCoeff)) +
                            'L' + (width + (width * tipCoeff)) + ' ' + (height / 2) +
                            'L' + width + ' ' + ((height / 2) - (height * tipCoeff)));
                        }
                    }

                    function appendTooltipShape(selection, width, height, x, y, orientation, cornerRadius, data, year) {

                        var transX, transY;
                        var tipCoeff = 0.125;

                        if (orientation == 'bottom') {
                            transX = x - (width / 2);
                            transY = y + (tipCoeff * height);
                        } else if (orientation == 'top') {
                            transX = x - (width / 2);
                            transY = y - height - (tipCoeff * height);
                        } else if (orientation == 'right') {
                            transX = x + (tipCoeff * height);
                            transY = y - height / 2;
                        } else {
                            transX = x - width - (tipCoeff * height);
                            transY = y - height / 2;
                        }


                        var d = 'M' + (0 + cornerRadius) + ' ' + height +
                            getTipSegment('top', orientation, width, height, tipCoeff) +
                            'L' + (width - cornerRadius) + ' ' + height +
                            'Q' + width + ' ' + height + ' ' + width + ' ' + (height - cornerRadius) +
                            getTipSegment('left', orientation, width, height, tipCoeff) +
                            'L' + width + ' ' + (0 + cornerRadius) +
                            'Q' + width + ' ' + 0 + ' ' + (width - cornerRadius) + ' ' + 0 +
                            getTipSegment('bottom', orientation, width, height, tipCoeff) +
                            'L' + (0 + cornerRadius) + ' ' + 0 +
                            'Q' + 0 + ' ' + 0 + ' ' + 0 + ' ' + (0 + cornerRadius) +
                            getTipSegment('right', orientation, width, height, tipCoeff) +
                            'L' + 0 + ' ' + (height - cornerRadius) +
                            'Q' + 0 + ' ' + height + ' ' + (0 + cornerRadius) + ' ' + height +
                            'Z';

                        var g = selection.append('g')
                            .attr('class', 'tooltip-group')
                            .attr('transform', 'translate(' + transX + ',' + transY + ')');

                        g.append('path')
                            .attr('d', d)
                            .attr("class", "svg-tooltip");
                        g.append("text")
                            .text(data[year])
                            .style("stroke", "white")
                            .style("fill", "white")
                            .style("text-anchor", "middle")
                            .attr("x", width / 2)
                            .attr("y", height / 4);

                        appendSparkline(g, getNumberArray(data), width, height, year);
                    }

                    function renderFromScope() {
                        d3.select("#mapSvg").remove();

                        var projection = tppProjection
                            .scale(900)
                            .translate([width / 1.5, height / 2.2]);

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
                            .attr("name", function(d, i) {
                             return d.properties.name;
                            })
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
                    function appendSparkline(selection, data, width, height, year) {
                        var domain = d3.extent(data);
                        console.log(domain);
                        var x = d3.scale.linear().domain([0, data.length]).range([width * 0.1, width * 0.9]);
                        var y = d3.scale.linear().domain(domain).range([height * 0.9, height * 0.7]);

                        var line = d3.svg.line()
                            .x(function (d, i) {
                                return x(i);
                            })
                            .y(function (d, i) {
                                return y(d);
                            });

                        selection
                            .append("path")
                            .attr("d", line(data))
                            .attr("class", "sparkline");
                        selection
                            .append("circle")
                            .attr("r", 2)
                            .attr("cx", x(year))
                            .attr("cy", y(data[year]))
                            .attr("class", "sparkline-point");
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
                                .style("stroke", function (d, i) {
                                    return color(i / sections);
                                })
                                .style("fill", function (d, i) {
                                    return color(i / sections);
                                })
                                .attr("d", function (d) {
                                    return d;
                                })
                                .attr("class", "connector");

                            /*
                            d3.select("#mapSvg")
                                .append("path")
                                .attr("d", shapeConnector.getBoundingBox(select1[0][0]))
                                .attr("class", "bbox");

                            d3.select("#mapSvg")
                                .append("path")
                                .attr("d", shapeConnector.getBoundingBox(select2[0][0]))
                                .attr("class", "bbox");*/


                            var center1 = shapeConnector.getBoundingCenter(select1[0][0]);
                            /*d3.select("#mapSvg")
                                .append("circle")
                                .attr("r", "5")
                                .attr("cx", center1.x)
                                .attr("cy", center1.y)
                                .attr("class", "dot");*/


                            var center2 = shapeConnector.getBoundingCenter(select2[0][0]);
                            /*d3.select("#mapSvg")
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
                                .attr("class", "dot");*/

                            console.log(shapeConnector.getAngle(center, {x: 0, y: 0}, center1));
                            console.log(center, {x: 0, y: 0}, center1);
                            console.log(shapeConnector.getAngle(center, {x: 0, y: 0}, center2));
                            console.log(center, {x: 0, y: 0}, center2);

                            appendTooltipShape(d3.select("#mapSvg"),
                                100,
                                100,
                                center1.x,
                                center1.y,
                                getOrientation(center1, center),
                                5,
                                scope.$parent.data[select1[0][0].attributes.name.nodeValue],
                                4
                            );

                            appendTooltipShape(d3.select("#mapSvg"),
                                100,
                                100,
                                center2.x,
                                center2.y,
                                getOrientation(center2, center),
                                5,
                                scope.$parent.data[select2[0][0].attributes.name.nodeValue],
                                4
                            );


                        } else {
                            select1.classed('selected', false);
                            select2.classed('selected', false);
                            d3.selectAll(".connector").remove();
                            d3.selectAll(".bbox").remove();
                            d3.selectAll(".dot").remove();
                            d3.selectAll(".info").remove();
                            d3.selectAll(".tooltip-group").remove();
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

