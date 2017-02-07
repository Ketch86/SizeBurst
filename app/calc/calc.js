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
var asyncCount = 0;

function calcDirSize2(path, parent) {
    var current = { path: path, children: [] };

    if (parent) {
        parent.children.push(current);
    }

    //mainWindow.webContents.send('elementCount', elementCount);

    asyncCount++;
    fs.readdir(path, (err, files) => {
        asyncCount--;
        if (asyncCount == 0) { console.log("asyncCount 0" + performance.now()); }

        files.forEach(f => {
            var fullPath = path + "\\" + f;
            asyncCount++;
            fs.stat(fullPath, (err, stats) => {
                asyncCount--;
                if (asyncCount == 0) { console.log("asyncCount 0") }

                elementCount++;
                size += stats.size;

                if (stats.isDirectory()) {
                    calcDirSize2(fullPath, current);
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
var asyncCountDiv = addDiv();

ipcRenderer.on("path", (event, arg) => {
    pathDiv.innerHTML = arg;
    size = 0;
    elementCount = 0;
    tree.root = calcDirSize2(arg);
});

window.sendData = function () {
    ipcRenderer.send('data', tree.root);
};

window.setInterval(() => {
    sizeDiv.innerHTML = size;
    elementCountDiv.innerHTML = elementCount;
    asyncCountDiv.innerHTML = asyncCount;
    tree.f = 1;
    if (config.sendData && _.isObject(tree.root)) {
        ipcRenderer.send('data', tree.root);
    }
}, 200);