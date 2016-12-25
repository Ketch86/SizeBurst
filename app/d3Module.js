angular.module('d3', [])
    .factory('d3Service', ['$document', '$window', '$q', '$rootScope',
        function ($document, $window, $q, $rootScope) {
            var d = $q.defer(),
                d3service = {
                    d3: function () { return d.promise; }
                };
            if (!angular.isObject($window.d3)) {
                $window.d3 = require('../bower_components/d3/d3.js')
            }
            d.resolve($window.d3);

            return d3service;
        }]);