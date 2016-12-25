angular.module("app").directive('sunburst', function () {
    return {
        scope: {
            data: '=data',
            refresh: '='
        },
        restrict: 'E',
        controller: ["$scope", "$element", "Directory", function (scope, $element, Directory) {
            const log = (...args) => console.log(...args);
            var width = 650,
                height = 650,
                radius = Math.min(width, height) / 2,
                color = d3.scaleOrdinal(d3.schemeCategory20c);

            var x = d3.scaleLinear()
                .range([0, 2 * Math.PI]);

            var y = d3.scaleSqrt()
                .range([0, radius]);

            var svg = d3.select($element[0]).append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + width / 2 + "," + height * .5 + ")");

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



                var data = scope.data;

                root = d3.hierarchy(data, function (d) {
                    return d.children();
                }).sum(d => d.size);
                log(root);

                //root = d3.hierarchy(dummy).sum(d => 1);

                var limitLevel = function (d, limit) {
                    //d.data.size = d.value;
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

                limitLevel(root, 2);

                 data = partition(root);

                path = svg.selectAll("path");
                path = path.data(data.descendants(), d => d.data.fullPath());

                var selEnter = path.enter();
                var selExit = path.exit();


                selEnter.append("path")
                    //.attr("file-path", d => d.data.fullPath()
                    //.attr("display", function (d) { return d.depth ? null : "none"; }) // hide inner ring
                    .attr("id", d => d.data.fullPath())
                    .on("click", click)
                    .merge(path)
                    .attr("d", arc)
                    .style("stroke", "#fff")
                    .style("fill", function (d) { return color((d.children ? d : d.parent).data.name); })
                    .style("fill-rule", "evenodd")
                    .each(stash);

                selExit.remove();
                var text = svg.selectAll("text")
                    .data(data.descendants(), d => d.data.fullPath());
                var textEnter = text.enter();
                // .data(data.descendants().filter(d => d.data instanceof Directory), d => d.data.fullPath())
                var textPath = textEnter.append("text")
                    .attr("x", 5) //Move the text from the start angle of the arc
                    .attr("dy", 18) //Move the text down
                    .append("textPath")
                    .attr("xlink:href", d => "#" + d.data.fullPath())
                    .style("text-anchor", "middle")
                    .attr("startOffset", "25%");

                //textEnter.exit().remove();

                textPath.append("tspan")
                    .attr("x", 5) //Move the text from the start angle of the arc
                    .attr("dy", 18) //Move the text down
                    //.merge(text)
                    .text(function (d) { return d.data.name; });


                textPath.append("tspan")
                    .attr("x", 5) //Move the text from the start angle of the arc
                    .attr("dy", 18) //Move the text down
                    //.merge(text)
                    .text(function (d) { return d.value; });
            };

            scope.refresh = _.throttle(refresh, 200);

            // Stash the old values for transition.
            function stash(d) {
                d.x0_orig = d.x0;
                d.x1_orig = d.x1;
                d.y0_orig = d.y0;
                d.y1_orig = d.y1;
            }

            function revert(d) {
                d.x0 = d.x0_orig;
                d.x1 = d.x1_orig;
                d.y0 = d.y0_orig;
                d.y1 = d.y1_orig;

                return d;
            }

            function arcTween(a) {

                // The function passed to attrTween is invoked for each selected element when
                // the transition starts, and for each element returns the interpolator to use
                // over the course of transition. This function is thus responsible for
                // determining the starting angle of the transition (which is pulled from the
                // element’s bound datum, d.endAngle), and the ending angle (simply the
                // newAngle argument to the enclosing function).
                return function (d) {

                    // To interpolate between the two angles, we use the default d3.interpolate.
                    // (Internally, this maps to d3.interpolateNumber, since both of the
                    // arguments to d3.interpolate are numbers.) The returned function takes a
                    // single argument t and returns a number between the starting angle and the
                    // ending angle. When t = 0, it returns d.endAngle; when t = 1, it returns
                    // newAngle; and for 0 < t < 1 it returns an angle in-between.
                    if (a == d) {
                        log("d.x1", d.x1, "a.x1", a.x1);
                    }
                    const curr = _.pick(d, ["x0", "x1", "y0", "y1", "x0_orig", "x1_orig", "y0_orig", "y1_orig"]);
                    const orig = revert(_.clone(curr));
                    var interpolate = d3.interpolate(orig, d);

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
                        if (a == d) {
                            log("t:", t, "i:", _.pick(iData, ["x0", "x1", "y0", "y1"]));
                        }

                        // Lastly, compute the arc path given the updated data! In effect, this
                        // transition uses data-space interpolation: the data is interpolated
                        // (that is, the end angle) rather than the path string itself.
                        // Interpolating the angles in polar coordinates, rather than the raw path
                        // string, produces valid intermediate arcs during the transition.
                        return arc(iData);
                    };
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
                log(d.x1);
                d.x1 *= .8;
                log(d.x1);

                svg.transition()
                    .duration(2000)
                    .selectAll("path")
                    .attrTween("d", arcTween(d));
            }

        }]
    }
});
