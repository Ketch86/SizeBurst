var app = angular.module("app")
app.controller("mainController", ["$scope", "fileService", "Directory", "File", "$timeout", (scope, fs, Directory, File, timeout) => {
    var dirPath="c:\\Users\\Én\\Downloads\\Music\\"; //process.cwd()    
    scope.test = "(y)";
    scope.greeting = "Resize the page to see the re-rendering";
    scope.data = [
        { name: "Greg", score: 98 },
        { name: "Ari", score: 96 },
        { name: 'Q', score: 75 },
        { name: "Loser", score: 48 }
    ];

    var addData = function (params) {

    }
    var count = 0;
    var walkDir = function (dir) {
        //console.log(count++ + " " + dir.fullPath());
       // if (dir.fullPath().split("\\").length > 3) return;
        fs.contents(dir.fullPath()).then(contents => {
            fs.stats(contents = contents.map(e => fs.join(dir.fullPath(), e))).then(stats => {
                stats.forEach(function (stat, i) {
                    if (stat.isDirectory()) {
                        var sub = new Directory(contents[i], dir, [], []);
                        dir.folders.push(sub);
                    } else {
                        var file = new File(contents[i], stat.size, dir);
                        dir.addFile(file);
                    }
                }, this);
                dir.folders.forEach(function (f) {
                    walkDir(f);
                }, this);
                window.refresh = scope.refresh;
                scope.refresh();
                //timeout(() => scope.refresh(), 0);
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