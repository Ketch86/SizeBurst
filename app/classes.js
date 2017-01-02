angular.module('app')
    .factory('Directory', ["fileService", "FileSet",
        function (fs, FileSet) {
            var id = 0;
            var Directory = function (path, parent, files = [], folders = []) {
                this.id = id++;
                this.name = fs.pUtil.basename(path);
                this.path = fs.pUtil.dirname(path);
                this.parent = parent;
                this.files = files;
                this.fileSet = files.length > 0 ? new FileSet(files) : undefined;
                this.folders = folders;
            };

            Directory.prototype.fullPath = function () {
                return fs.pUtil.join(this.path, this.name);
            };

            Directory.prototype.children2 = function () {
                var concat = _.isUndefined(this.fileSet) ? [] : [this.fileSet];
                //  concat=this.files;
                return this.folders.concat(concat);
            };

            Directory.prototype.children = function () {
                var fileSet = new FileSet(this.files, this);
                return this.folders.concat([fileSet]);
            };

            Directory.prototype.addFile = function (file) {
                this.files.push(file);
                this.fileSet = new FileSet(this.files);
            };


            return Directory;
        }]);

angular.module('app')
    .factory('File', ["fileService",
        function (fs) {
            var id = 0;
            var File = function (path, size, parent) {
                this.id = id++;
                this.name = fs.pUtil.basename(path);
                this.path = fs.pUtil.dirname(path);
                this.size = size;
                this.parent = parent;
            };

            File.prototype.fullPath = function () {
                return fs.pUtil.join(this.path, this.name);
            };

            File.prototype.children = function () {
                return [];
            };

            return File;

        }]);

angular.module('app')
    .factory('FileSet', ["fileService",
        function (fs) {
            var id = 0;
            var FileSet = function (files, parent) {
                this.id = id++;
                this.path = parent.fullPath();
                this.name = files.length + " files";
                this.parent = parent;
                this.files = files;
                this.size = files.reduce((accum, file) => file.size + accum, 0);
            };

            FileSet.prototype.fullPath = function () {
                return fs.pUtil.join(this.path, this.id + "");
            };

            FileSet.prototype.children = function () {
                return [];
            };

            return FileSet;
        }]);

