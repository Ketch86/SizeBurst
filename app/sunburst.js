angular.module("app").directive('sunburst', function () {
    return {
        scope: {
            data: '=data',
            refresh: '=',
            id: "@",
            name: "@",
            value: "@",
            config: "="
        },
        restrict: 'E',
        controller: ["$scope", "$element", "Directory", function (scope, $element, Directory) {
            scope.name = scope.name || "name";
            scope.id = scope.id || "id";
            scope.value = scope.value || "value";

            const log = (...args) => { };//console.log(...args);
            var scaleSize = function (size, iteration = 0) {
                if (size < 1024) {
                    var units = ["byte", "kB", "MB", "GB", "PB"];
                    var unit = units[iteration];
                    return size.toFixed(1) + " " + unit;
                }
                return scaleSize(size / 1024, ++iteration);
            };

            var width = 700,
                height = 700,
                radius = Math.min(width, height) / 2,
                color = d3.scaleOrdinal(d3.schemeCategory20c)
            rootPath = "";

            var x = d3.scaleLinear()
                .range([0, 2 * Math.PI]);

            var y = d3.scaleSqrt()
                .range([0, radius]);

            var svg = d3.select($element[0]).append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + width / 2 + "," + height * .5 + ")");

            var centerText = d3.select("svg").append("g")
                .attr("transform", "translate(" + width / 2 + "," + height * .5 + ")").append("text")
                //.attr("transform", "translate(" + width / 2 + "," + height * .5 + ")")
                .attr("font-size", "20px")
                .attr("text-anchor", "middle")
                .classed("center", true);

            var setCenterText = lines => {
                centerText.html("");
                _.forEach(lines, (line, i) => {
                    centerText.append("tspan")
                        .attr("x", 0)
                        .attr("dy", () => i == 0 ? 0 : 20)
                        .text(line)
                        .classed("center", true);
                });
            }
            window.setCenterText = setCenterText;

            var partition = d3.partition()
                .size([2 * Math.PI, radius * radius])

            var arc = d3.arc()
                .startAngle(function (d) { return d.x0; })
                .endAngle(function (d) { return d.x1; })
                .innerRadius(function (d) { return Math.sqrt(d.y0); })
                .outerRadius(function (d) { return Math.sqrt(d.y1); });
            // .innerRadius(function (d) { return d.y0; })
            // .outerRadius(function (d) { return d.y1; });

            // root = d3.hierarchy(scope.data, function (d) {
            //     return d.children();
            // }).sum(d => 1);
            // var data = partition(root);
            // var path = svg.datum(root).selectAll("path");
            window.refreshCount = 0;
            var store = window.store = {};
            var refreshRate = 3000;
            var refresh = () => {
                // console.log(path);
                // console.log(selEnter);
                // console.log(selExit);
                // console.log(path.size());
                // console.log(selEnter.size());
                // console.log(selExit.size());
                var dummy = {
                    name: "Gyökééér",
                    children: [
                        { name: "kölök1", children: [{}, {}, {}] },
                        { name: "kölök2", children: [{}, {}] },
                        { name: "kölök3", children: [{}] },
                    ]
                };

                dummy.children.forEach(function (element, i) {
                    element.children.forEach(function (element, ii) {
                        element.name = "unoka" + i + "_" + ii;
                    }, this);
                }, this);

                console.log(window.refreshCount++);

                var selectPath = (root, path) => {
                    var path = rootPath.split("\\");
                    _.forEach(path, p => {
                        if (p.length > 0) {
                            root = _.find(root.children, child => child.path == root.path + "\\" + p);
                        }
                    });

                    return root;
                };

                var data = selectPath(scope.data, rootPath);

                root = d3.hierarchy(data, d => d.children || [])
                    .sum(d => d[scope.value] || 0)
                    .sort(function (a, b) { return b.value - a.value; });
                log(root);

                //root = d3.hierarchy(dummy).sum(d => 1);

                var limitLevel = function (d, limit) {
                    d.data.size2 = d.value;
                    d.height = Math.min(d.height, limit);
                    if (_.isUndefined(d.children)) {
                        return;
                    }
                    if (limit === 0) {
                        d.children.length = 0;
                    }
                    else {
                        d.children.forEach(function (child) {
                            limitLevel(child, limit - 1);
                        }, this);
                    }
                };

                limitLevel(root, scope.config.level);

                var groupUndersizedItems = function (root, limit) {
                    root.each(n => {
                        if (n.value < limit) {
                            _.remove(n.parent.children, n);
                            var aggr = _.find(n.parent.children, child => child.data.path.endsWith("#aggregate"));
                            if (_.isUndefined(aggr)) {
                                var data = {
                                    name: "aggr",
                                    path: n.parent.data.path + "#aggregate"
                                };
                                aggr = n.copy();
                                aggr.data = data;
                                aggr.value = 0;
                                aggr.children = null;
                                aggr.parent = n.parent;
                                n.parent.children.push(aggr);
                            }
                            aggr.value += n.value;
                            if (_.isArray(n.children)) {
                                if (!_.isArray(aggr.children)) {
                                    aggr.children = [];
                                }
                                _.forEach(n.children, child => {
                                    child.parent = aggr;
                                    aggr.children.push(child);
                                });
                            }
                        }
                    });
                };

                if (scope.config.ratio != 0) {
                    groupUndersizedItems(root, root.value * scope.config.ratio);
                }

                data = partition(root);

                path = svg.selectAll("path").each(stash());
                var selUpdate = path.data(data.descendants(), d => d.data[scope.id]);

                var selEnter = selUpdate.enter();
                var selExit = selUpdate.exit();

                //selUpdate.each(stash());
                selEnter.each(stash(0));
                var count = 0;
                var paths = selEnter.append("path")
                    //.attr("file-path", d => d.data[scope.id]
                    //.attr("display", function (d) { return d.depth ? null : "none"; }) // hide inner ring
                    .attr("id", d => d.data[scope.id])
                    .on("click", click)
                    .on("mouseover", onmouseover)
                    .on("mouseout", onmouseout)
                    .merge(selUpdate)
                    .style("stroke", "#fff")
                    .style("fill", function (d) { return color((d.children ? d : d.parent).data[scope.name]); })
                    .style("fill-rule", "evenodd")
                    .transition()
                    .duration((d, i) => Math.pow(scope.config.durationCoefficient, (d.height + 1)) * scope.config.duration)
                    .attrTween("d", d => arcTween(d));

                paths.on("end", () => {
                    if (++count == paths.size()) {
                        var spans = document.querySelectorAll("tspan:not(.center)");
                        _.forEach(spans, span => {
                            span.style.display = "block";
                            var length = span.getComputedTextLength();
                            var id = _.trimStart(span.parentElement.getAttribute("href"), "#");
                            var path = document.getElementById(id);
                            var pathSeg = path.getPathSegAtLength(length);
                            if (pathSeg != 1 || span.__data__.value == 0) {
                                span.style.display = "none";
                            }
                            else {
                            }
                        });
                    }
                });

                if (!_.isUndefined(scope.config.delay) && scope.config.delay != 0) {
                    paths.size();
                    paths.delay((d, i) => {
                        var offset = 0;
                        if (!_.isNull(d.parent)) {
                            offset = d.parent.children.indexOf(d) - i;
                        }
                        return scope.config.delay * i + offset + d.height * scope.config.delay //((d.height % 2 * path.size()) + (d.height % 2 * -2 + 1) * i
                    });
                }

                selExit.remove();

                var textUpdate = svg.selectAll("text.arc-text")
                    .data(data.descendants(), d => d.data[scope.id]);

                textUpdate.exit().remove();

                var textEnter = textUpdate.enter();

                var textEntered = textEnter.append("text")
                    .attr("x", 5) //Move the text from the start angle of the arc
                    .attr("dy", 18)
                    .classed("arc-text", true); //Move the text down

                var textPathUpdate = textUpdate.selectAll("textPath")
                    .datum(function (d, i) { return this.parentNode.__data__; });

                var tspanUpdate = textPathUpdate
                    .selectAll("tspan")
                    .datum(function (d, i) { return this.parentNode.__data__; });


                // .text(d => d.data[scope.name] + " " + (d.value / 1024).toFixed(0) + " MB");

                var textPathEntered = textEntered.append("textPath")
                    .attr("xlink:href", d => "#" + d.data[scope.id]);
                //.text(d => d.data[scope.name] + " " + (d.value / 1024).toFixed(0) + " MB");
                // .style("text-anchor", "middle")
                // .attr("startOffset", "25%");

                //textEnter.exit().remove();

                textPathEntered.append("tspan")
                    .attr("x", 5) //Move the text from the start angle of the arc
                    .attr("dy", 18) //Move the text down
                    .style("display", "none")
                    .classed("name", true)
                    .text(function (d) {
                        return d.data[scope.name];
                    });

                tspanUpdate.filter(".size").text(d => scaleSize(d.value));

                textPathEntered.append("tspan")
                    .attr("x", 5) //Move the text from the start angle of the arc
                    .attr("dy", 18) //Move the text down
                    .style("display", "none")
                    .classed("size", true)
                    .text(d => scaleSize(d.value));
            };

            scope.refresh = _.throttle(refresh, refreshRate);

            // Stash the old values for transition.
            function stash(value) {
                return function (d) {
                    var props = ["x0", "x1", "y0", "y1"];
                    if (_.isUndefined(value)) {
                        store[d.data[scope.id]] = _.pick(d, props);
                    }
                    else {
                        store[d.data[scope.id]] = _.zipObject(props, _.fill(new Array(props.length), value));
                        // store[d.data[scope.id]].x0 = _.isUndefined(value) ? d.x0 : value;
                        // store[d.data[scope.id]].x1 = _.isUndefined(value) ? d.x1 : value;
                        // store[d.data[scope.id]].y0 = _.isUndefined(value) ? d.y0 : value;
                        // store[d.data[scope.id]].y1 = _.isUndefined(value) ? d.y1 : value;
                    }

                };
            }

            function revert(d) {
                _.assign(d, store[d.data[scope.id]]);

                return d;
            }

            function arcTween(d) {

                // To interpolate between the two angles, we use the default d3.interpolate.
                // (Internally, this maps to d3.interpolateNumber, since both of the
                // arguments to d3.interpolate are numbers.) The returned function takes a
                // single argument t and returns a number between the starting angle and the
                // ending angle. When t = 0, it returns d.endAngle; when t = 1, it returns
                // newAngle; and for 0 < t < 1 it returns an angle in-between.
                var props = ["x0", "x1", "y0", "y1"];
                const curr = d;
                const orig = revert(_.clone(curr));
                var interpolate = d3.interpolate(_.pick(orig, props), _.pick(curr, props));

                // The return value of the attrTween is also a function: the function that
                // we want to run for each tick of the transition. Because we used
                // attrTween("d"), the return value of this last function will be set to the
                // "d" attribute at every tick. (It’s also possible to use transition.tween
                // to run arbitrary code for every tick, say if you want to set multiple
                // attributes from a single function.) The argument t ranges from 0, at the
                // start of the transition, to 1, at the end.
                return function (t) {

                    // Calculate the current arc angle based on the transition time, t. Since
                    // the t for the transition and the t for the interpolate both range from
                    // 0 to 1, we can pass t directly to the interpolator.
                    //
                    // Note that the interpolated angle is written into the element’s bound
                    // data object! This is important: it means that if the transition were
                    // interrupted, the data bound to the element would still be consistent
                    // with its appearance. Whenever we start a new arc transition, the
                    // correct starting angle can be inferred from the data.
                    const iData = interpolate(t);
                    //console.log(t)
                    // Lastly, compute the arc path given the updated data! In effect, this
                    // transition uses data-space interpolation: the data is interpolated
                    // (that is, the end angle) rather than the path string itself.
                    // Interpolating the angles in polar coordinates, rather than the raw path
                    // string, produces valid intermediate arcs during the transition.
                    return arc(iData);
                };
            }

            // Interpolate the arcs in data space.
            // function arcTween(a) {
            //     var i = d3.interpolate({ x: a.x0, dx: a.dx0 }, a);
            //     return function (t) {
            //         var b = i(t);
            //         a.x0 = b.x;
            //         a.dx0 = b.dx;
            //         return arc(b);
            //     };
            // }

            d3.select(self.frameElement).style("height", height + "px");
            function click(d) {
                if (d.depth == 0) {
                    rootPath = rootPath.slice(0, rootPath.lastIndexOf("\\"));
                }
                else {
                    rootPath = d.data.path.slice(scope.data.path.length);
                }
                scope.refresh();
            }

            function onmouseover(d) {
                setCenterText([d.data.name, scaleSize(d.value)]);
            }

            function onmouseout(d) {
                setCenterText([]);
            }

        }]
    }
});
