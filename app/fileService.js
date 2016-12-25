angular.module('app')
    .factory('fileService', ['$document', '$window', '$q', '$rootScope',
        function ($document, $window, $q, $rootScope) {
            const fs = require("fs");
            const pUtil = require("path");

            var api = {

                contents: function (path) {
                    var ret = new Promise((resolve, reject) => {
                        fs.readdir(path, (err, files) => {
                            resolve(files);
                        });
                    });

                    return ret;
                },
                stats: function (paths) {
                    var promises = [];
                    paths.forEach(function (path) {
                        var p = new Promise((resolve, reject) => {
                            fs.stat(path, (err, stat) => {
                                resolve(stat);
                            });
                        });
                        promises.push(p);
                    }, this);
                    return Promise.all(promises);
                },
                files: function (path) {
                    var ret = new Promise(resolve, reject => {
                        this.contents(path).then(contents => {
                            var returnedCount = 0;
                            var files = [];

                            contents.forEach(element => {
                                fs.stat(pUtil.join(path, element), (err, stats) => {
                                    if (stats.isFile()) {
                                        files.push(element);
                                    }
                                    if (++returnedCount == contents.length) {
                                        resolve(files);
                                    }
                                });
                            });
                        });
                    });
                    return ret;
                },
                dirs: function (path) {
                    var ret = new Promise(resolve, reject => {
                        this.contents(path).then(contents => {
                            var returnedCount = 0;
                            var dirs = [];

                            contents.forEach(element => {
                                fs.stat(pUtil.join(path, element), (err, stats) => {
                                    if (stats.isDirectory()) {
                                        dirs.push(element);
                                    }
                                    if (++returnedCount == contents.length) {
                                        resolve(dirs);
                                    }
                                })
                            });
                        });
                    });

                    return ret;
                },
                join: pUtil.join,
                pUtil: pUtil
            };

            return api;
        }]);