var app = angular.module("app")
app.controller("mainController", ["$scope", "fileService", "Directory", "File", "FileSet", "$timeout",
 (scope, fs, Directory, File,FileSet, timeout) => {
    var dirPath="c:\\Users\\Én\\Downloads\\Music\\"; //process.cwd()    
    
    var walkDir = function (dir) {
        fs.contents(dir.fullPath()).then(contents => {
            fs.stats(contents = contents.map(e => fs.join(dir.fullPath(), e))).then(stats => {
                stats.forEach(function (stat, i) {
                    if (stat.isDirectory()) {
                        var sub = new Directory(contents[i], dir, [], []);
                        dir.folders.push(sub);
                    } else {
                        var file = new File(contents[i], stat.size, dir);
                        dir.files.push(file);
                    }
                }, this);
                dir.folders.forEach(function (f) {
                    walkDir(f);
                }, this);
                window.refresh = scope.refresh;
                scope.refresh();
            });
        });

    };

    var walkDir2 = function (path) {
        fs.contents(path).then(contents => {
            fs.stats(paths = contents.map(name => fs.join(path, name))).then(stats => {
                stats.forEach(function (stat, i) {
                    if (stat.isDirectory()) {
                        var sub = new Directory(paths[i], dir, [], []);
                        dir.folders.push(sub);
                    } else {
                        var file = new File(paths[i], stat.size, dir);
                        dir.files.push(file);
                    }
                }, this);
                dir.fileSet=new FileSet(dir.files, dir);
                dir.folders.forEach(function (f) {
                    walkDir(f);
                }, this);
                window.refresh = scope.refresh;
                scope.refresh();
            });
        });

    };

    var getHierarchy = function (path, depth) {
        var root = new Directory(path, null, [], []);
        var hierarchy = root;
        walkDir(root);
        return window.hierarchy = hierarchy;
    };

    scope.hierarchy = getHierarchy(dirPath);
    console.log(scope.hierarchy);
}])