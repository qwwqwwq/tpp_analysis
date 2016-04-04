'use strict';

angular.module('d3Directives').directive(
    'd3Map',
    ['$window', '$compile', 'd3', 'queue', 'topojson', 'tppProjection',
        function ($window, $compile, d3, queue, topojson, tppProjection) {
        return {
            restrict: 'A',
            scope: true,
            link: function (scope, element, attr) {

                var world;

                function renderFromScope() {
                    d3.select("svg").remove();

                    var width = 1450,
                        height = 750;

                    var projection = tppProjection
                        .scale(1070)
                        .translate([width / 2, height / 2]);

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

                    svg.on("click", function() {
                        console.log(projection.invert(d3.mouse(this)));
                    });

                    svg.append("g")
                        .selectAll("path")
                        .data(topojson.feature(world, world.objects.countries).features)
                        .enter()
                        .append("path")
                        .attr("class", "mesh")
                        .attr("fill", "#000000")
                        .attr("d", path);

                    svg.insert("path", ".graticule")
                        .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
                        .attr("class", "boundary")
                        .attr("d", path);
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

