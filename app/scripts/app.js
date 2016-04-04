'use strict';

angular.module('d3', []);
angular.module('topojson', []);
angular.module('queue', []);
angular.module('data', ['d3', 'queue']);
angular.module('tppProjection', ['d3']);
angular.module('d3Directives', ['d3', 'queue', 'topojson', 'ui.bootstrap', 'data', 'tppProjection']);

var App = angular.module('App', ['d3Directives', 'ngRoute', 'ui.bootstrap'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .otherwise({
                redirectTo: '/'
            });
    }]);


App.controller('MapController', ['$scope', '$timeout', 'd3', '$routeParams', '$location', '$route',
    function ($scope, $timeout, d3, $routeParams, $location, $route) {
    }
]);

App.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/map', {
            templateUrl: 'views/map.html',
            controller: 'MapController',
            reloadOnSearch: false
        })
        .otherwise({
            redirectTo: '/map'
        });
}]);

