/* d3.chart.common.js - D3 Chart Common Library.
 	writ by yi seung-yong(dragonslam@nate.com)
 	date, 2014/10/04
*/
if (typeof com == 'undefined') var com = {};
if (typeof com.mad == 'undefined') com.mad = {};
if (typeof com.mad.chart == 'undefined') com.mad.chart = {};

/** ****************************************************************************
	Chart API 
**/
com.mad.chart.handler = function(obj, option) {
	if (!d3)	{
		$debug("Not Found D3 Library.");
		throw new Error("D3 Object Exception");
	}
	this.oContaner	= obj;
	this.oOption	= (option instanceof Array) ? option[0] : option;
	this.oOptions	= (option instanceof Array) ? option : null;
};
com.mad.chart.handler.prototype = {
	logging : function(msg) {
		$debug("com.mad.chart : "+ msg);
	},
	empty : function() {
		$(this.oContaner).hide('slow').empty().show();
		return this;
	},
	message : function(t) {
		$(this.oContaner).empty().append(t);
		return this;
	},
	draw : function(data, addonOption) {
		var This = this;
		var D3_Center = function(w, h) {
			return d3.select(This.oContaner).append("svg")
					.attr("width", (typeof w == 'number') ? w : This.oOption.width)
					.attr("height", (typeof h == 'number') ? h : This.oOption.height)
					.append("g")
					.attr("transform", "translate(" + ((typeof w == 'number') ? w : This.oOption.width) / 2 + "," + ((typeof h == 'number') ? h : This.oOption.height) / 2 + ")");
		};
		var D3_Axis = function() {
			return d3.select(This.oContaner).append("svg")
					.attr("width", This.oOption.width)
					.attr("height", This.oOption.height)
					.append("g")
					.attr("transform", "translate(" + This.oOption.margin.left + "," + This.oOption.margin.top + ")");
		};

		var drawLineGraph = function(data, addOption) {
		};

		var drawMultiLineGraph = function(data, addOption) {
			
			if (typeof This.oOption.format == 'function') {
				data.forEach(function(d) {
					d.date = This.oOption.format(d.date);
				});
			}
			
			var margin = This.oOption.margin;
			var width = This.oOption.width - margin.left - margin.right;
			var height = This.oOption.height - margin.top - margin.bottom;

			var x = d3.time.scale().range([0, width]);
			var y = d3.scale.linear().range([height, 0]);
			var color	 = d3.scale.ordinal().range(This.oOption.colors);
			var xAxis	 = d3.svg.axis().scale(x).orient("bottom");
			var yAxis = d3.svg.axis().scale(y).orient("left");
			var line	 = d3.svg.line()
				 //.interpolate("basis")
				 .x(function(d) { return x(d.date); })
				 .y(function(d) { return y(d.value); });

			if (addOption.xAxis) {				
				if (addOption.xAxis.format)
					xAxis.ticks(addOption.xAxis.ticks).tickFormat(d3.time.format(addOption.xAxis.format));
				else 
					xAxis.ticks(addOption.xAxis.ticks);
			}
			if (addOption.yAxis) {
				if (addOption.yAxis.format)
					yAxis.ticks(addOption.yAxis.ticks).tickFormat(d3.time.format(addOption.yAxis.format));
				else 
					yAxis.ticks(addOption.yAxis.ticks);
			}
			color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }))
			var lineData = color.domain().map(function(name) {
				return {
					name: name,
					values: data.map(function(d) {
						return {date: d.date, value: +d[name]};
					})
				};
			});

			x.domain(d3.extent(data, function(d) { return d.date; }));
			y.domain([
				d3.min(lineData, function(c) { return d3.min(c.values, function(v) { return v.value; }); }),
				d3.max(lineData, function(c) { return d3.max(c.values, function(v) { return v.value; }); })
			]);

			var svg	 = D3_Axis();
				svg.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + height + ")")
					.call(xAxis);
				svg.append("g")
					.attr("class", "y axis")
					.call(yAxis);	

			var graph= svg.selectAll(".LineGraph")
				.data(lineData)
				.enter().append("g")
				.attr("class", This.oOption.styleCalss);

			graph.append("path")
				.attr("class", This.oOption.styleCalss)
				.attr("d", function(d) { return line(d.values); })
				.style("stroke", function(d) { return color(d.name); });

			if (This.oOption.showLabels) {			
				graph.append("text")
					.datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
					.attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.value) + ")"; })
					.attr("x", 8)
					.attr("dy", ".35em")
					//.attr("class", "lable")
					.attr("font-size", "12px")
					.attr("fill", function(d) { return color(d.name); })
					.text(function(d) { return d.name; });
					
					//
			}
			
			lineData.forEach(function(item) {				
				var point_type = "circle",
					 point_size = 6,
					 point_fill = "#fff";
				if (addOption && addOption.point) {
					point_type	= addOption.point.type;
					point_size	= addOption.point.size;
					point_fill		= addOption.point.fill ? color(item.name) : point_fill;
				}
				if (point_type == "circle") {				
					graph.selectAll(".point_"+ item.name)
						.data(item.values)
						.enter()
						.append(point_type)				
							.style("fill", point_fill)
							.style("stroke", color(item.name))
							.style("stroke-width", "2px")
							.style('opacity', function(d, i) { return (String(d.value).isEmpty() || d.value == '0') ? 0 : 1 })
							.attr("class", "point")
							.attr("r", point_size)
							.attr("cx", function(d, i) { return x(d.date);  })
							.attr("cy", function(d, i) { return y(d.value); })
							.on("mouseover", function(d) { 
								if (!String(d.value).isEmpty() && d.value != '0') {
									d3.select(this).attr('r', point_size + 2);									
									var tX = x(d.date) - 3, 
										 tY = y(d.value) + 3;
									if (tY < (22 - margin.top)) {
										tX = tX + 3;
										tY = 20;										
									}
//									tooltip(true, tX, tY, color(item.name), String(d.value).money());									
								}
							})
							.on("mouseout", function(d){ 
								if (!String(d.value).isEmpty() && d.value != '0') {
									d3.select(this).attr('r', point_size);
//									tooltip(false);
								}
							})
					 ;
				} 
				
				else {
					graph.selectAll(".point_"+ item.name)
						.data(item.values)
						.enter()
						.append(point_type)				
							.style("fill", point_fill)
							.style("stroke", color(item.name))
							.style("stroke-width", "2px")
							.style('opacity', function(d, i) { return (String(d.value).isEmpty() || d.value == '0') ? 0 : 1 })
							.attr("class", "point")
							.attr("width", point_size)
							.attr("height", point_size)
							.attr("x", function(d, i) { return x(d.date) - (point_size/2);  })
							.attr("y", function(d, i) { return y(d.value) - (point_size/2); })
							.on("mouseover", function(d) {
								if (!String(d.value).isEmpty() && d.value != '0') {
									d3.select(this)
										.attr("width", point_size + 2).attr("height", point_size + 2)
										.attr("x", function(d, i) { return x(d.date) - ((point_size+2)/2);  })
										.attr("y", function(d, i) { return y(d.value) - ((point_size+2)/2); })
									;
									var tX = x(d.date), 
										 tY = y(d.value);
									if (tY < (22 - margin.top)) {
										tX = tX + 5;
										tY = 10;										
									}
//									tooltip(true, tX, tY, color(item.name), String(d.value).money());
								}
							})
							.on("mouseout", function(d){ 
								if (!String(d.value).isEmpty() && d.value != '0') {
									d3.select(this)
										.attr("width", point_size).attr("height", point_size)
										.attr("x", function(d, i) { return x(d.date) - (point_size/2);  })
										.attr("y", function(d, i) { return y(d.value) - (point_size/2); })
									;
//									tooltip(false);
								}
							})
					 ;
				}
			});
/*
			var tooltipBox = svg.append("rect").style('opacity', 1).attr('rx', '5').attr('ry', '5');
			var tooltipText = svg.append('text').style('opacity', 0);			
			var tooltip = function(isView, x, y, fill, text) {
				if (isView) {
					tooltipBox
						.style("fill", "#fff")
						.style("stroke", fill).style("stroke-width", 1).style("shape-rendering", "crispEdges").style("stroke-opacity", .8)
						.attr("x", x+8).attr("y", y-25).attr("width", "55").attr("height", "20")
						.transition(100).style("opacity", .7);
					tooltipText
						.style("fill", fill)
						.attr('x', x+12).attr('y', y-10)						
						.transition(200).style('opacity', 1)
						.text(text);
				}
				else {
					tooltipBox.style("opacity", 0).attr("width", "0").attr("height", "0");
					tooltipText.transition(200).text('').style("opacity", 0);
				}
			}
*/			
			$('svg .point').tipsy({ 
				gravity: 's', 
				html: true,
		        fade: true,
		        opacity: 0.95,
				title: function() {
					var d = this.__data__;
					return String(d.value).money(); 
				}
			});
		// multi line.
		};

		var drawBarGraph = function(data, addOption) {
		
			if (typeof This.oOption.format == 'function') {
				data.forEach(function(d) {
					d.key = This.oOption.format(d.key);
				});
			}
			var option	= This.oOption;
			var margin	= option.margin;
			var width	= option.width - margin.left - margin.right;
			var height	= option.height - margin.top - margin.bottom;

			var c	= d3.scale.ordinal().range(option.colors);
			var x	= d3.scale.ordinal().rangeRoundBands([0, width], .1);
			var y	= d3.scale.linear().range([height, 0]);
			var xAxis = d3.svg.axis().scale(x).orient("bottom");
			var yAxis = d3.svg.axis().scale(y).orient("left");

			if (addOption.xAxis) {				
				if (addOption.xAxis.format)
					xAxis.ticks(addOption.xAxis.ticks).tickFormat(d3.time.format(addOption.xAxis.format));
				else 
					xAxis.ticks(addOption.xAxis.ticks);
			}
			if (addOption.yAxis) {
				if (addOption.yAxis.format)
					yAxis.ticks(addOption.yAxis.ticks, '%').tickFormat(d3.time.format(addOption.yAxis.format));
				else 
					yAxis.ticks(addOption.yAxis.ticks, '%');
			}

			c.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }))
			x.domain(data.map(function(d) { return d.key; }));
			y.domain([0, (d3.max(data, function(d) { return d.value; }) < .1 ? .1 : d3.max(data, function(d) { return d.value; }) )]);
			var blank= x.rangeBand() * .3;
			var svg = D3_Axis();
				svg.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + height + ")")
					.call(xAxis);
				
				svg.append("g")
					.attr("class", "y axis")
					.call(yAxis)/*
					.append("text")
						.attr("transform", "rotate(-90)")
						.attr("y", 6)
						.attr("dy", ".71em")
						.style("text-anchor", "end")
						.text("Traffic")
				*/
				;
								
				svg.selectAll(".bar")
					.data(data).enter().append("rect")
					.style("fill", "#b7b7b7")
					.attr("x", function(d) { return x(d.key) + (blank*.5); })
					.attr("y", 0)
					.attr("width", x.rangeBand() - blank)
					.attr("height", height);

				svg.selectAll(".bar")
					.data(data).enter().append("rect")
					.attr("class", "bar2")
					.style("fill", function(d) { return c(d.key); })
					.attr("x", function(d) { return x(d.key) + (blank*.5); })
					.attr("y", function(d) { return y(d.value); })
					.attr("width", x.rangeBand() - blank)
					.attr("height", function(d) { return height - y(d.value); })
					.on("mouseover", function(d) {
						if (!String(d.value).isEmpty() && d.value != '0') {
							d3.select(this).style("stroke", "#fff").style("stroke-width", "5px").style("stroke-opacity", ".4");
							var tX = x(d.key)-blank;
							var tY = y(d.value)+5;
//							tooltip(true, ((tX > width + margin.right - 110) ? width - 110 : tX), ((tY < (20 - margin.top)) ? 20 : tY), c(d.key), d.text);
						}
					})
					.on("mouseout", function(d){ 
						if (!String(d.value).isEmpty() && d.value != '0') {
							d3.select(this).style("stroke-width", "0px");
//							tooltip(false);
						}
					});
				
				$('svg .bar2').tipsy({ 
					gravity: 's', 
					html: true,
			        fade: true,
			        opacity: 0.95,
					title: function() {
						var d = this.__data__;
						return d.text; 
					}
				});
			if (option.showLabels) {
				svg.selectAll(".bar")
					.data(data).enter().append("text")
					.attr("x", function(d) { return x(d.key); })
					.attr("y", function(d) { 
						var v = y(d.value);
						return (v < 15) ? 15 : (v > height-10 ? height-10 : v); 
					})
					.style("fill", "#000")
					.style("font-size", "12")
					.style("font-weight", "700")
					.style("text-anchor", "left")
					.text(function(d) { return (d.value == 0) ? '' : d.text; });
			}
/*
			var tooltipBox = svg.append("rect").style('opacity', 1).attr('rx', '3').attr('ry', '3');
			var tooltipText = svg.append('text').style('opacity', 0);			
			var tooltip = function(isView, x, y, fill, text) {
				if (isView) {
					tooltipBox
						.style("fill", "#fff")
						.style("stroke", fill).style("stroke-width", 1).style("shape-rendering", "crispEdges").style("stroke-opacity", .8)
						.attr("x", x+8).attr("y", y-25).attr("width", "110").attr("height", "20")
						.transition(100).style("opacity", .7);
					tooltipText
						.style("fill", fill)
						.attr('x', x+12).attr('y', y-10)						
						.transition(200).style('opacity', 1)
						.text(text);
				}
				else {
					tooltipBox.style("opacity", 0).attr("width", "0").attr("height", "0");
					tooltipText.transition(200).text('').style("opacity", 0);
				}
			}
*/
		};

		var drawPieGraph = function(data, addOption) 
		{
			var radius = Math.min(This.oOption.width, This.oOption.height) / 2;
			var color = d3.scale.ordinal().range(This.oOption.colors);
			var arc = d3.svg.arc()
				.outerRadius(radius - This.oOption.arcOuter)
				.innerRadius(radius - This.oOption.arcInner);

			var pie = d3.layout.pie().sort(null)
				.value(function(d) { return d.value; });

			var svg = D3_Center();
			if (typeof This.oOption.background == 'object' 
				&& This.oOption.background != null && This.oOption.background.length > 0) 
			{
				drawImages(svg.selectAll("image").data([0]), This.oOption.background);
			}

			var g = svg.selectAll(".arc")
				.data(pie(data))
				.enter().append("g")
				.attr("class", This.oOption.styleCalss);

			g.append("path")
				.attr("d", arc)
				.style("fill", function(d) { return color(d.data.name); });

			if (typeof This.oOption.lines == 'object' && This.oOption.lines instanceof Array) {
				for (var i = This.oOption.lines.length-1; i >= 0; i--) {
					var s = This.oOption.lines[i];
					g.append("line")
					  .attr("x1", s.x1)
					  .attr("x2", s.x2)
					  .attr("y1", s.y1)
					  .attr("y2", s.y2);
				}
			}
			if (typeof addOption == 'object' && addOption.lines instanceof Array) {
				for (var i = addOption.lines.length-1; i >= 0; i--) {
					var s = addOption.lines[i];
					g.append("line")
					  .attr("x1", s.x1)
					  .attr("x2", s.x2)
					  .attr("y1", s.y1)
					  .attr("y2", s.y2);
				}
			}

			if (typeof This.oOption.lables == 'object' && This.oOption.lables instanceof Array) {
				for (var i = This.oOption.lables.length-1; i >= 0; i--) {
					var s = This.oOption.lables[i];
					g.append("text")
						.attr("x", s.x)
						.attr("y", s.y)
						.attr("class", s.styleCalss)
						.style("fill", s.fill)
						.text(""+s.text);
				}
			}
			if (typeof addOption == 'object' && addOption.lables instanceof Array) {
				for (var i = addOption.lables.length-1; i >= 0; i--) {
					var s = addOption.lables[i];
					g.append("text")
						.attr("x", s.x)
						.attr("y", s.y)
						.attr("class", s.styleCalss)
						.style("fill", s.fill)
						.text(""+s.text);
				}
			}

			if (This.oOption.showLabels) {
				g.append("text")
					.attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
					.attr("dy", ".35em")
					.style("text-anchor", "middle")
					.text(function(d) { return d.data.name; });
			}
		};

		var drawPiePartitionGraph = function(data, addOption) 
		{
			if (This.oOptions.length > 0)
			{
				var svg = D3_Center();

				for (var i = This.oOptions.length-1; i >= 0; i--)
				{
					var option = This.oOptions[i];
					var radius = Math.min(option.width, option.height) / 2;
					var color = d3.scale.ordinal().range(option.colors);
					var arc = d3.svg.arc()
						.outerRadius(radius - option.arcOuter)
						.innerRadius(radius - option.arcInner);

					var pie = d3.layout.pie().sort(null)
						.value(function(d) { return (d.depth == i) ? d.value : null; });

					
					if (typeof option.background == 'object' && option.background != null && option.background.length > 0) {
						drawImages(svg.selectAll("image").data([0]), option.background);
					}

					var g = svg.selectAll(".arc ._"+ i +"")
						.data(pie(data))
						.enter().append("g")
						.attr("class", option.styleCalss);

					g.append("path")
						.attr("d", arc)
						.style("fill", function(d) { 
							return (d.data.depth == i) ? color(d.data.name) : '#fff'; 
						});
						
					if (option.showLabels) {
						g.append("text")
							.attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
							.attr("dy", ".35em")
							.style("text-anchor", "middle")
							.text(function(d) { return (d.data.value > 0) ? d.data.name : ''; });
					}
				}// for
			}
		};

		var drawBandGraph = function(data, addOption) {
			var option = This.oOption;
			var width = option.width, height = option.height;
			var color	 = d3.scale.ordinal().range(option.colors);
			var x	= d3.scale.linear().range([0, width])
			var y	= d3.scale.ordinal().rangeRoundBands([0, height], .4);
			var xAxis	 = d3.svg.axis().scale(x).orient("top");

			x.domain(d3.extent(data, function(d) { return d.value; })).nice();
			y.domain(data.map(function(d) { return d.name; }));

			var svg = D3_Axis();
			var g  = svg.selectAll(".axis")
				.data(data)
				.enter()
				.append("g").attr("class", "axis");
						
			g.append("rect")
				.style("fill", "#b7b7b7")
				.attr("x", 0)
				.attr("y", function(d) { return y(d.name)-20; })
				.attr("width", width)
				.attr("height", y.rangeBand());

			g.append("rect")
				.style("fill", function(d) { return color(d.name); })
				.attr("x", function(d) { return x(Math.min(0, d.value)); })
				.attr("y", function(d) { return y(d.name)-20; })
				.attr("width", function(d) { return Math.abs(x(d.value) - x(0)); })
				.attr("height", y.rangeBand());

			g.append("text")
				.attr("x", function(d) { return 5; })
				.attr("y", function(d) { return y(d.name) + 35; })
				.style("fill", "#335")
				.style("font-size", "13")
				.style("font-weight", "900")
				.style("text-anchor", "left")
				.text(function(d) { return d.text; });

			g.append("text")
				.attr("x", function(d) { return 10; })
				.attr("y", function(d) { return y(d.name) + 5; })
				.style("fill", "#fefefe")
				.style("font-size", "13")
				.style("font-weight", "700")
				.style("text-anchor", "left")
				.text(function(d) { return d.value + d.prepix; });
			
			// g.call(xAxis);
			g.append("line")
			  .attr("x1", x(0))
			  .attr("x2", x(0))
			  .attr("y2", height);

			if (option && typeof option.image == 'object' && option.image != null && option.image.length > 0) {
				drawImages(g.selectAll("image").data([0]), option.image);
			}
			if (addOption && typeof addOption.image == 'object' && addOption.image != null && addOption.image.length > 0) {
				drawImages(g.selectAll("image").data([0]), addOption.image);
			}
			
		};

		var drawBandGraph2 = function(data, addOption) {
			var option = This.oOption;
			var width = option.width, height = option.height;
			var color	 = d3.scale.ordinal().range(option.colors);
			var x	= d3.scale.linear().range([0, width - option.margin.right])
			var y	= d3.scale.ordinal().rangeRoundBands([0, height], .4);
			var xAxis	 = d3.svg.axis().scale(x).orient("top");

			x.domain(d3.extent(data, function(d) { return d.value; })).nice();
			y.domain(data.map(function(d) { return d.name; }));

			var svg = D3_Axis();
			var g  = svg.selectAll(".axis")
				.data(data)
				.enter()
				.append("g").attr("class", "axis");
						
			g.append("rect")
				.style("fill", "#b7b7b7")
				.attr("x", 0)
				.attr("y", function(d) { return y(d.name); })
				.attr("width", width-option.margin.right)
				.attr("height", y.rangeBand());

			g.append("rect")
				.style("fill", function(d) { return color(d.name); })
				.attr("x", function(d) { return x(Math.min(0, d.value)); })
				.attr("y", function(d) { return y(d.name); })
				.attr("width", function(d) { return Math.abs(x(d.value) - x(0)); })
				.attr("height", y.rangeBand());

			g.append("text")
				.attr("x", function(d) { return width - option.margin.right + 5; })
				.attr("y", function(d) { return y(d.name)+(y.rangeBand()/2)+2; })
				.style("fill", "#666")
				.style("font-size", "12")
				.style("font-weight", "700")
				.style("text-anchor", "left")
				.text(function(d) { return d.text; });

			if (option.showLabels) {
				g.append("text")
					.attr("x", function(d) { 
						var v = Math.abs(x(d.value) - x(0));						
						return  (v < 55) ? v + 5 : v - 50;
					})
					.attr("y", function(d) { return y(d.name)+(y.rangeBand()/2)+3; })
					.style("fill", "#fff")
					.style("font-size", "12")
					.style("font-weight", "700")
					.style("text-anchor", "left")
					.text(function(d) { 
						var v = d.value * 100; 
						return (v % 10 == 0 ? v : (v).toFixed(2)) + "%"; 
					});
			}
			
			// g.call(xAxis);
			g.append("line")
			  .attr("x1", x(0))
			  .attr("x2", x(0))
			  .attr("y2", height);

			if (option && typeof option.image == 'object' && option.image != null && option.image.length > 0) {
				drawImages(g.selectAll("image").data([0]), option.image);
			}
			if (addOption && typeof addOption.image == 'object' && addOption.image != null && addOption.image.length > 0) {
				drawImages(g.selectAll("image").data([0]), addOption.image);
			}
		};
		
		var drawRadarGraph = function(data, addOption) {
			var w = This.oOption.width,
				h = This.oOption.height;

			//Options for the Radar chart, other than default
			var mycfg = {
				w: w-130,
				h: h-50,
				maxValue: 1,
				levels: 5,
				TranslateX: 45,
				TranslateY: 32,
				ExtraWidthX: 140,
				ExtraWidthY: 50,
				color : d3.scale.ordinal().range(This.oOption.colors),
				viewLevel : This.oOption.showLabels,
				viewLable : This.oOption.showLabels
			};

			//Call function to draw the Radar chart
			//Will expect that data is in %'s
			RadarChart.draw(This.oContaner, data, mycfg);

			var svg = d3.select(This.oContaner)
				.selectAll('svg')
				.append('svg')
				.attr("width", w)
				.attr("height", h)
			
			if (typeof This.oOption.background == 'object' 
				&& This.oOption.background != null && This.oOption.background.length > 0) 
			{
				drawImages(svg.selectAll("image").data([0]), This.oOption.background);
			}
		};

		var drawImages = function(obj, imgs) {
			for (var i =0; i < imgs.length ; i++)
			{
				obj.enter()
					.append("svg:image")
					.attr("xlink:href", imgs[i].href)
					.attr("x", imgs[i].x)
					.attr("y", imgs[i].y)
					.attr("width", imgs[i].width)
					.attr("height", imgs[i].height);
			}
		};


		// Rander Graph...
		$(This.oContaner).hide().empty();
		switch (this.oOption.type) {
			case 'line' :
				drawLineGraph(data, addonOption);
				break;

			case 'multiLine' :
				drawMultiLineGraph(data, addonOption);
				break;
			
			case 'bar' :
				drawBarGraph(data, addonOption);
				break;
			
			case 'pie' :
				drawPieGraph(data, addonOption);
				break;

			case 'piePartition' :
				drawPiePartitionGraph(data, addonOption);
				break;

			case 'band' :
				drawBandGraph(data, addonOption);
				break;

			case 'band2' :
				drawBandGraph2(data, addonOption);
				break;
			
			case 'radarChart' : 
				drawRadarGraph(data, addonOption);
				break;
		}
		$(This.oContaner).show('fast');

	}
};