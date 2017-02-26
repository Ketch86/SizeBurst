var app = angular.module("app")
app.controller("mainController", ["$scope", "fileService", "Directory", "File", "FileSet", "$timeout", "$interval",
    (scope, fs, Directory, File, FileSet, timeout, interval) => {
        var separator = ",";
        var prefix = "path";
        var idKeyPostfix = "IDs"
        window.config = scope.config = { level: 2, ratio: 0.05, delay: 30, duration: 800, durationCoefficient: 1 };

        var storePath = path => {
            if (scope.paths.includes(path)) return;
            var ids = localStorage.getItem(prefix + idKeyPostfix);
            ids = ids || "";

            var maxId = _.max(ids.split(separator).slice(1).map(id => parseInt(id)));
            var nextId = (maxId || 0) + 1;
            localStorage.setItem(prefix + nextId, path);
            ids += "," + nextId;
            localStorage.setItem(prefix + idKeyPostfix, ids);
            scope.paths.push(path);
        };
        var loadPaths = () => {
            var ids = localStorage.getItem(prefix + idKeyPostfix);
            ids = ids || "";
            idList = ids.split(separator).slice(1).map(id => parseInt(id));

            scope.paths = idList.map(id => localStorage.getItem(prefix + id));
        };
        loadPaths();

        var setProperty = target => {
            var target = target;
            return prop => {
                var prop = prop;
                return value => { target[prop] = value.toLocaleString(); scope.$apply(); };
            };
        };

        var setElementCount = setProperty(scope)("elementCount");

        var {ipcRenderer, remote} = require('electron');
        const dialog = remote.require('electron').dialog;
        var main = remote.require("./main.js");
        var tree = remote.getGlobal("tree");

        var countLeafs = (root) => {
            var ret = 0;
            if (_.isArray(root.children)) {
                children.forEach(function (child) {
                    ret += countLeafs(child);
                }, this);;
            }
            else {
                ret = 1;
            }
            return ret;
        };

        ipcRenderer.on('data', (event, arg) => {
            window.tree = arg;
            scope.root = arg;
            reduceFiles(arg);
            scope.$apply();
            scope.refresh();
        });

        function reduceFiles(dir) {
            var dirs = [];
            var files = [];
            dir.name = fs.pUtil.basename(dir.path);
            _.forEach(dir.children, child => {
                if (_.isArray(child.children)) {
                    dirs.push(child);
                }
                else {
                    files.push(child);
                }
            });

            if (files.length > 0) {
                var fileSet = _.reduce(files, (set, file) => {
                    set.count++;
                    set.size += file.size;
                    set.name = set.count + " files";
                    return set;
                }, { count: 0, size: 0, path: dir.path + "#files", name: "0 files" });

                dir.children = dirs.concat([fileSet]);
            }

            _.forEach(dirs, reduceFiles);
        };
        window.scope = scope;

        scope.walkDir = () => {
            scope.path = _.trim(scope.path, "\\");
            if (!_.includes(scope.paths, scope.path)) {
                storePath(scope.path);
            }
            ipcRenderer.send('walk', scope.path);
        };

        scope.selectDirectory = function () {
            scope.path = dialog.showOpenDialog({
                properties: ['openDirectory']
            })[0];
        }

        scope.queryPaths = function (search) {
            return _.filter(scope.paths, p => p.toLowerCase().includes(search.toLowerCase()));
        }
    }]);

     // var setProperty = target => {
        //     var target = target;
        //     return prop => {
        //         var prop = prop;
        //         return value => { target[prop] = value.toLocaleString(); scope.$apply(); };
        //     };
        // };

        // var setElementCount = setProperty(scope)("elementCount");
        // var setDuration = setProperty(scope)("duration");
        // var setAsyncCount = setProperty(scope)("asyncCount");