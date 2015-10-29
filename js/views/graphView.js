UI.graph = (function() {
    'use strict';

    // PRIVATE
    var _previousWords = false;

    // PUBLIC
    var View = {

        wordGraph: document.querySelector('#wordGraph'),
        nodeSizeCoefficient: 4,
        collision: 10,
        zoomMin: 0.25,
        zoomMax: 3,
        translate: [0, 0],

        //status
        created: false,

        style: function() {
            View.wordGraph.style.width = window.innerWidth;
            View.wordGraph.style.height = window.innerHeight;
        },

        // Gestion du drag du zoom
        activateZoomCursor: function() {
            var draggie = new Draggabilly(document.querySelector('#cursor'), {
                axis: 'y',
                containment: '#zoomBar'
            });


            draggie.on('dragMove', function(instance, event, pointer) {
                var zoombarHeight = document.getElementById("zoom").offsetHeight;
                if (instance.position.y < 0)
                    instance.position.y = 0;

                App.scale = -(((Math.floor(instance.position.y) * 100 / (zoombarHeight - 15) + ((100 * 7.5) / zoombarHeight) - 100) * (View.zoomMax - View.zoomMin) / 100 + View.zoomMin)) + 0.56;

                View.defineZoom(App.scale);
            });

            draggie.on("dragEnd", function() {
                View.svg.call(d3.behavior.zoom().scale(App.scale).translate(View.translate).scaleExtent([View.zoomMin, View.zoomMax]).on("zoom", function() {
                    View.redrawGraph();
                    View.defineCursor();
                }));
            });
        },

        createGraph: function(words) {
            var self = this;

            var width = window.innerWidth,
                height = window.innerHeight,
                charge = -4000,
                linkDistance = 15;

            //gere la gravité en fonction du nombre de mots presents
            var gravity = (words.nodes.length < 100) && (words.nodes.length >= 1) ? (1 / words.nodes.length) : .01;

            View.wordGraph.innerHTML = '';

            var color = d3.scale.category20();

            this.force = d3.layout.force()
                .gravity(gravity)
                .charge(charge)
                .linkDistance(linkDistance)
                .size([width, height]);

            // Création du SVG
            this.svg = d3.select("#wordGraph").attr("width", width)
                .attr("pointer-events", "all")
                .attr("height", height)
                .call(d3.behavior.drag().on("dragstart", function() {
                    self.svg.style("cursor", "-webkit-grabbing");
                }).on("dragend", function() {
                    self.svg.style("cursor", "default");
                }));

            this.g = this.svg.append('svg:g')
                .style("background-color", "transparent")
                .append('svg:g')
                .style("background-color", "transparent");

            this.force
                .nodes(words.nodes)
                .links(words.links)
                .start();

            // Création des liens entre les noeuds
            var link = this.g.append("g")
                .attr("class", "links")
                .selectAll("link")
                .data(words.links)
                .enter().append("line")
                .attr("class", "link")
                .style("stroke", "#b8b8b8")
                .style("stroke-width", function(d) {
                    return Math.sqrt(d.value);
                });

            // Création des noeuds
            var node = this.g.append("g").attr("class", "nodes")
                .selectAll("node")
                .data(words.nodes)
                .enter()
                .append("g").call(d3.behavior.drag().on("drag", function(d, i) {
                    self.force.drag;
                }).on("dragend", function(d) {
                    self.force.resume();
                }));

            // Ajout d'un cercle pour chaque noeud
            node.append("circle")
                .attr("class", "node")
                .attr("pointer-events", "drag")
                .style('fill', "#83adec")
                .attr("r", function(d) {
                    var nbLinks = Math.sqrt(d.nbLinks);
                    if (nbLinks <= 0)
                        nbLinks = 1;

                    if (nbLinks * (nbLinks * self.nodeSizeCoefficient) <= 60)
                        return nbLinks * (nbLinks * self.nodeSizeCoefficient);
                    else
                        return 60;
                })
                .call(self.force.drag);


            // Ajout d'un texte pour chaque noeud
            node.append("text")
                .attr("text-anchor", "middle")
                .style("font-size", function(d) {
                    var nbLinks = Math.sqrt(d.nbLinks);
                    if (nbLinks <= 0)
                        nbLinks = 1;
                    return nbLinks * 10 + "px";
                })
                .style("fill", "#4b4b4b")
                .attr("transform", function(d) {
                    var nbLinks = Math.sqrt(d.nbLinks);
                    if (nbLinks <= 0)
                        nbLinks = 1;
                    if (nbLinks * (nbLinks * self.nodeSizeCoefficient) <= 70)
                        return "translate(0," + -(nbLinks * (nbLinks * self.nodeSizeCoefficient + 2)) + ")";
                    else
                        return "translate(0, -70)";
                })
                .text(function(d) {
                    return d.name.charAt(0).toUpperCase() + d.name.substring(1).toLowerCase();
                });

            this.force.on("tick", function() {
                link.attr("x1", function(d) {
                        return d.source.x;
                    })
                    .attr("y1", function(d) {
                        return d.source.y;
                    })
                    .attr("x2", function(d) {
                        return d.target.x;
                    })
                    .attr("y2", function(d) {
                        return d.target.y;
                    });

                node.attr("cx", function(d) {
                        return d.x;
                    })
                    .attr("cy", function(d) {
                        return d.y;
                    })
                    .attr("transform", function(d) {
                        return "translate(" + d.x + "," + d.y + ")";
                    });
            });

            _previousWords = words;

            self.defineCursor();

            this.created = true;

            document.dispatchEvent(App.event.graphReady);
        },

        redrawGraph: function() {
            this.translate = d3.event.translate;
            this.svg.select("g").select("g").attr("transform",
                "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")"
            );
        },

        updateGraph: function(words) {
            if (_previousWords) {
                var self = this;

                // Si il y a eu ajout d'un nouveau noeud
                if (_previousWords.nodes.length < words.nodes.length && _previousWords.links.length < words.links.length) {

                    // Ajout du dernier Node et du dernier links
                    _previousWords.nodes.push(words.nodes[words.nodes.length - 1]);
                    _previousWords.links.push(words.links[words.links.length - 1]);
                }

                // Sinon il y a eu ajout d'un nouveau links seulement
                else if (_previousWords.links.length < words.links.length) {

                    // Ajout du dernier links
                    _previousWords.links.push(words.links[words.links.length - 1]);
                } else if (_previousWords.nodes.length < words.nodes.length) {
                    // Ajout du dernier Node
                    _previousWords.nodes.push(words.nodes[words.nodes.length - 1]);
                }

                var link = this.svg.select(".links").selectAll(".link")
                    .data(_previousWords.links);

                var newLink = link.enter().insert("line");

                newLink.attr("class", "link")
                    .style("stroke", "#3177df")
                    .style("stroke-width", function(d) {
                        return Math.sqrt(d.value);
                    });

                newLink.transition().duration(5000).style("stroke", "#b8b8b8");

                link.exit().remove();

                var node = this.svg.select(".nodes").selectAll("g")
                    .data(_previousWords.nodes);

                var nodeEnter = node.enter().append("g").call(d3.behavior.drag().on("drag", function(d, i) {
                    self.force.drag;
                }).on("dragend", function(d) {
                    self.force.resume();
                }));

                nodeEnter.append("circle")
                    .attr("class", "node")
                    .style('fill', "#3177df")
                    .attr("r", function(d) {
                        var nbLinks = Math.sqrt(d.nbLinks);

                        if (nbLinks <= 0)
                            nbLinks = 1;

                        if (nbLinks * (nbLinks * self.nodeSizeCoefficient) <= 60)
                            return nbLinks * (nbLinks * self.nodeSizeCoefficient);
                        else
                            return 60;
                    })
                    .call(self.force.drag);

                nodeEnter.append("text")
                    .attr("text-anchor", "middle")
                    .style("font-size", function(d) {
                        var nbLinks = Math.sqrt(d.nbLinks);

                        if (nbLinks <= 0)
                            nbLinks = 1;

                        return nbLinks * 10 + "px";
                    })
                    .style("fill", "#3177df")
                    .attr("transform", function(d) {
                        var nbLinks = Math.sqrt(d.nbLinks);
                        if (nbLinks <= 0)
                            nbLinks = 1;

                        return "translate(0," + -(nbLinks * (nbLinks * self.nodeSizeCoefficient + 2)) + ")";
                    })
                    .text(function(d) {
                        return d.name.charAt(0).toUpperCase() + d.name.substring(1).toLowerCase();
                    });

                nodeEnter.select("circle").transition().duration(5000).style("fill", "#b8b8b8");
                nodeEnter.select("text").transition().duration(5000).style("fill", "#4b4b4b");

                node.exit().remove();

                this.force.on("tick", function() {
                    link.attr("x1", function(d) {
                            return d.source.x;
                        })
                        .attr("y1", function(d) {
                            return d.source.y;
                        })
                        .attr("x2", function(d) {
                            return d.target.x;
                        })
                        .attr("y2", function(d) {
                            return d.target.y;
                        });

                    node.attr("cx", function(d) {
                            return d.x;
                        })
                        .attr("cy", function(d) {
                            return d.y;
                        })
                        .attr("transform", function(d) {
                            return "translate(" + d.x + "," + d.y + ")";
                        });
                });

                this.force.start();


            }
        },

        defineCursor: function() {
            var self = this;

            if (d3.event != null && d3.event.scale != undefined)
                var scale = d3.event.scale;
            else
                var scale = 1;

            var zoombarHeight = document.getElementById("zoom").offsetHeight;

            // Déplacement du cursor
            document.querySelector("#cursor").style.top = ((100 - ((scale - self.zoomMin) * 100 / (self.zoomMax - self.zoomMin)))) - ((100 * 7.5) / zoombarHeight) + "%";
        },

        defineZoom: function(scale) {
            var self = this;
            this.svg.select("g").select("g").attr("transform", "translate(" + self.translate + ")" + " scale(" + scale + ")");
        },

        searchNode: function(selectedVal) {
            var self = this;

            var node = this.svg.selectAll(".nodes>g");

            var unselected = node.filter(function(d, i) {
                return d.name != selectedVal;
            });

            var selected = node.filter(function(d, i) {
                return d.name == selectedVal;
            });


            // Si la recherche a donné quelque chose
            if (selected[0].length > 0) {

                // Obtenir position du g
                var rect = document.querySelector("svg>g>g").getBoundingClientRect();

                // On calcule le x et y du translate
                var x = ((window.innerWidth / 2) - (parseInt(selected.attr("cx")) + parseInt(rect.left))) + parseInt(rect.left);
                var y = ((window.innerHeight / 2) - (parseInt(selected.attr("cy")) + parseInt(rect.top))) + parseInt(rect.top);

                this.svg.select("g").select("g").transition().duration(1500).attr("transform",
                    "translate(" + x + " ," + y + ")"
                );

                // On redéfini le zoom avec ses nouvelles valeurs d'origines
                this.svg.call(d3.behavior.zoom().translate([x, y]).scaleExtent([self.zoomMin, self.zoomMax]).on("zoom", function() {
                    View.redrawGraph();
                    View.defineCursor();
                }));

                // On met notre node et ses liens en highlight
                View.highlightOn(selected);

            } else {
                console.log('UI le mot ne epeut pas être selectionné');
            }

            self.defineCursor();
        },

        selectNode: function(node) {
            var self = this;

            // On met liens et nodes en highlight
            self.highlightOn(node);

            var rect = document.querySelector("svg>g>g").getBoundingClientRect();

            var x = ((window.innerWidth / 2) - (parseInt(node.attr("cx")) + parseInt(rect.left))) + parseInt(rect.left);
            var y = ((window.innerHeight / 2) - (parseInt(node.attr("cy")) + parseInt(rect.top))) + parseInt(rect.top);

            // On fait un translate pour avoir le noeud choisi au centre
            this.svg.select("g").select("g").transition().duration(1500).attr("transform",
                "translate(" + x + " ," + y + ")"
            );

            self.defineCursor();

            // On redéfini le zoom avec ses nouvelles valeurs
            this.svg.call(d3.behavior.zoom().translate([x, y]).scaleExtent([self.zoomMin, self.zoomMax]).on("zoom", function() {
                View.redrawGraph();
                View.defineCursor();
            }));

            self.force.resume();
        },

        collide: function(node) {
            var r = node.radius + 16,
                nx1 = node.x - r,
                nx2 = node.x + r,
                ny1 = node.y - r,
                ny2 = node.y + r;
            return function(quad, x1, y1, x2, y2) {
                if (quad.point && (quad.point !== node)) {
                    var x = node.x - quad.point.x,
                        y = node.y - quad.point.y,
                        l = Math.sqrt(x * x + y * y),
                        r = node.radius + quad.point.radius;
                    if (l < r) {
                        l = (l - r) / l * .5;
                        node.x -= x *= l;
                        node.y -= y *= l;
                        quad.point.x += x;
                        quad.point.y += y;
                    }
                }
                return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            };
        },

        highlightOn: function(node) {
            var self = this;
            var nodes = d3.selectAll(".nodes>g");
            var links = d3.selectAll(".links>line");

            var linkedByIndex = {};
            for (var i = 0; i < _previousWords.length; i++) {
                linkedByIndex[i + "," + i] = 1;
            };

            _previousWords.links.forEach(function(d) {
                linkedByIndex[d.source.index + "," + d.target.index] = 1;
            });

            var d = node.node().__data__;

            // Changement de couleur des cercles des noeuds
            nodes.select("circle").transition().duration(1000).style("fill", function(o) {
                return linkedByIndex[d.index + "," + o.index] | linkedByIndex[o.index + "," + d.index] ? "#72a1e9" : "#b8b8b8";
            });

            // On remet les propriétés des noeuds à leur état d'origine
            nodes.select("text").transition().duration(1000).style("fill", "#4b4b4b").style("font-weight", "400");

            // Changement de couleur des liens et opacité
            links.transition().duration(1000).style("stroke", function(o) {
                return d.index == o.source.index | d.index == o.target.index ? "#72a1e9" : "#b8b8b8";
            }).style("opacity", function(o) {
                return d.index == o.source.index | d.index == o.target.index ? "1" : "0";
            });

            // On modifie l'apparence du noeud choisi
            node.select("circle").transition().duration(1000).style("fill", "#3177df");
            node.select("text").transition().duration(1000).style("fill", "#3177df").style("font-weight", "700");
        },

        highlightOff: function() {
            this.svg.selectAll("text").transition().duration(1000).style("fill", "#4b4b4b").style("font-weight", "400");
            this.svg.selectAll("circle").transition().duration(1000).style("fill", "#83adec");
            this.svg.selectAll("line").transition().duration(1000).style("stroke", "#b8b8b8").style("opacity", 1);
        }
    };

    //initialisation
    View.activateZoomCursor();
    View.style();
    window.addEventListener('resize', function() {
        View.style();
    }, false);

    return View;

})();
