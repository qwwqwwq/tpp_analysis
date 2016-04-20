'use strict';

angular.module('d3', []);
angular.module('topojson', []);
angular.module('queue', []);
angular.module('shapeConnector', []);
angular.module('data', ['d3', 'queue']);
angular.module('tppProjection', ['d3']);
angular.module('d3Directives', ['d3', 'queue', 'topojson', 'ui.bootstrap', 'data', 'tppProjection', 'shapeConnector']);

var App = angular.module('App', ['d3Directives', 'ngRoute', 'ui.bootstrap', 'firebase'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .otherwise({
                redirectTo: '/'
            });
    }]);


App.controller('MapController', ['$scope', '$timeout', 'd3', '$routeParams', '$location', '$route', '$firebaseObject',
    function ($scope, $timeout, d3, $routeParams, $location, $route, $firebaseObject) {
        var ref = new Firebase('https://incandescent-fire-3940.firebaseio.com/');
        var authenticated = false;
        $scope.htsCode = "1011000";

        function queryAndRenderForHts(htsCode) {
            ref.orderByChild("HTS 8 (2010)").equalTo(htsCode).on("child_added", function(snapshot) {
                console.log(snapshot.val());
                $scope.data = snapshot.val();
                console.log($scope.data);
            }, function(cancel) {
                console.error(cancel);
            });
        }

        ref.authAnonymously(function(error, authData) {
            if (error) {
                console.log("Authentication Failed!", error);
            } else {
                console.log("Authenticated successfully with payload:", authData);
                authenticated = true;
                queryAndRenderForHts("1011000");
            }
        });

        $scope.submitOnEnter = function(keyEvent) {
            console.log(keyEvent);
            if (keyEvent.which === 13) {
                console.log($scope.htsCode);
                queryAndRenderForHts($scope.htsCode);
            }
        };

        var hts_codes;

        d3.json("static/HTS_codes.json", function(data) {
            hts_codes = data;
            console.log("got codes");
        });

        $scope.getMatches = function(text) {
            return (text ? hts_codes.filter(createFilterFor(text)) : hts_codes).slice(0, 5);
        };

        function createFilterFor(query) {
            var lowercaseQuery = angular.lowercase(query);

            return function filterFn(item) {
                return (item[1].indexOf(lowercaseQuery) === 0);
            };
        }
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

