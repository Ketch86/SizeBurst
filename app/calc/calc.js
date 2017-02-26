const fs = require("fs");
window._ = require('../../bower_components/lodash/dist/lodash.js')
const config = {
    sendData: false
};

function addNewElement(tag) {
    return (text) => {
        var element = document.createElement(tag);
        element.innerHTML = text;
        document.body.appendChild(element);
        return element;
    };
};

var addDiv = addNewElement("div");
addDiv("Továbbra is minden ok");

var size = 0;
var elementCount = 0;
var readDirCount = 0;
var statCount = 0;
var id = 1;

function calcDirSize(path, parent) {
    var current = { id: id++, path: path, children: [] };

    if (parent) {
        parent.children.push(current);
    }

    //mainWindow.webContents.send('elementCount', elementCount);

    readDirCount++;
    fs.readdir(path, (err, files) => {
        readDirCount--;
        if (readDirCount == 0) { console.log("readDirCount 0" + performance.now()); }

        files.forEach(f => {
            var fullPath = path + "\\" + f;
            statCount++;
            fs.stat(fullPath, (err, stats) => {
                statCount--;
                if (statCount == 0) { console.log("statCount 0" + performance.now()) }

                elementCount++;
                size += stats.size;

                if (stats.isDirectory()) {
                    calcDirSize(fullPath, current);
                } else {
                    var file = { path: fullPath, size: stats.size };
                    current.children.push(file);
                }
            })
        })
    });

    return current;
}

var {ipcRenderer, remote} = require('electron');
var tree = remote.getGlobal("tree");
addDiv(tree.test);

var pathDiv = addDiv();
var sizeDiv = addDiv();
var elementCountDiv = addDiv();
var readDirCountDiv = addDiv();
var statCountDiv = addDiv();

ipcRenderer.on("path", (event, arg) => {
    pathDiv.innerHTML = arg;
    size = 0;
    elementCount = 0;
    tree.root = calcDirSize(arg);
});

window.sendData = function () {
    ipcRenderer.send('data', tree.root);
};

window.setInterval(() => {
    sizeDiv.innerHTML = size;
    elementCountDiv.innerHTML = elementCount;
    readDirCountDiv.innerHTML = readDirCount;
    statCountDiv.innerHTML = statCount;
    tree.f = 1;
    if (config.sendData && _.isObject(tree.root)) {
        ipcRenderer.send('data', tree.root);
    }
}, 200);