import * as d3 from 'd3'

class ParallelCoordinatesD3 {
    margin = {top: 50, right: 50, bottom: 50, left: 50};
    size;
    height;
    width;
    matSvg;
    
    defaultOpacity = 0.3;
    transitionDuration = 1000;
    lineStrokeWidth = 1.5;
    
    scales = {};
    axes = [];
    allData = [];
    currentAttributes = [];
    controllerMethods = null;
    
    brush;
    brushGroup;
    activeBrushes = {};

    constructor(el) {
        this.el = el;
    }

    create = function (config) {
        this.size = {width: config.size.width, height: config.size.height};

        this.width = this.size.width - this.margin.left - this.margin.right;
        this.height = this.size.height - this.margin.top - this.margin.bottom;
                
        this.matSvg = d3.select(this.el).append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("class", "parallelCoordinatesG")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    }

    renderParallelCoordinates = function (visData, attributes, controllerMethods) {        
        this.allData = visData;
        this.currentAttributes = attributes;
        this.controllerMethods = controllerMethods;
        
        if (!visData || visData.length === 0 || !attributes || attributes.length === 0) {
            return;
        }

        // Setup scales and axes
        this.setupScalesAndAxes(visData, attributes);
        
        // Draw axes and labels
        this.drawAxes();
        
        // Draw polylines (one per data point)
        this.drawPolylines();
    }

    setupScalesAndAxes = function (visData, attributes) {
        this.scales = {};
        this.axes = [];
        
        const xScale = d3.scalePoint()
            .domain(attributes)
            .range([0, this.width]);

        attributes.forEach(attr => {
            const values = visData.map(d => d[attr]);
            
            // Check if attribute is quantitative or categorical
            const isNumeric = values.every(v => !isNaN(v) && v !== null);
            
            if (isNumeric) {
                // Quantitative scale
                const min = d3.min(values);
                const max = d3.max(values);
                this.scales[attr] = d3.scaleLinear()
                    .domain([min, max])
                    .range([this.height, 0]);
            } else {
                // Categorical scale (for yes/no, furnished/semi-furnished, etc.)
                const uniqueValues = [...new Set(values)];
                this.scales[attr] = d3.scalePoint()
                    .domain(uniqueValues)
                    .range([this.height, 0]);
            }
            
            this.axes.push({
                name: attr,
                xPosition: xScale(attr),
                scale: this.scales[attr],
                isNumeric: isNumeric
            });
        });
    }

    drawAxes = function () {
        // Remove existing axes
        this.matSvg.selectAll(".axis-group").remove();
        this.matSvg.selectAll(".axis-label").remove();
        
        const self = this;
        
        this.axes.forEach((axis, i) => {
            const axisGroup = this.matSvg.append("g")
                .attr("class", "axis-group")
                .attr("transform", `translate(${axis.xPosition},0)`);
            
            // Draw axis line
            axisGroup.append("line")
                .attr("class", "axis-line")
                .attr("y1", 0)
                .attr("y2", this.height)
                .attr("stroke", "#999")
                .attr("stroke-width", 1);
            
            // Draw tick marks and labels
            if (axis.isNumeric) {
                // For quantitative axes
                axisGroup.selectAll(".tick-group").remove();
                const ticks = axis.scale.ticks(5);
                
                ticks.forEach(tick => {
                    const tickGroup = axisGroup.append("g")
                        .attr("class", "tick-group");
                    
                    tickGroup.append("line")
                        .attr("x1", 0)
                        .attr("x2", -5)
                        .attr("y1", axis.scale(tick))
                        .attr("y2", axis.scale(tick))
                        .attr("stroke", "#999")
                        .attr("stroke-width", 1);
                    
                    tickGroup.append("text")
                        .attr("x", -10)
                        .attr("y", axis.scale(tick))
                        .attr("text-anchor", "end")
                        .attr("dy", "0.32em")
                        .attr("font-size", "11px")
                        .attr("fill", "#666")
                        .text(d3.format(".0f")(tick));
                });
            } else {
                // For categorical axes
                const domain = axis.scale.domain();
                domain.forEach(value => {
                    const tickGroup = axisGroup.append("g")
                        .attr("class", "tick-group");
                    
                    tickGroup.append("line")
                        .attr("x1", 0)
                        .attr("x2", -5)
                        .attr("y1", axis.scale(value))
                        .attr("y2", axis.scale(value))
                        .attr("stroke", "#999")
                        .attr("stroke-width", 1);
                    
                    tickGroup.append("text")
                        .attr("x", -10)
                        .attr("y", axis.scale(value))
                        .attr("text-anchor", "end")
                        .attr("dy", "0.32em")
                        .attr("font-size", "11px")
                        .attr("fill", "#666")
                        .text(value);
                });
            }
            
            // Add axis label at top
            axisGroup.append("text")
                .attr("class", "axis-label")
                .attr("y", -20)
                .attr("text-anchor", "middle")
                .attr("font-weight", "bold")
                .attr("font-size", "12px")
                .attr("fill", "#000")
                .text(axis.name);
            
            // Add brush on axis
            const brush = d3.brushY()
                .extent([[-8, 0], [8, this.height]])
                .on("brush", (event) => this.handleBrush(event, axis.name))
                .on("end", (event) => this.handleBrushEnd(event, axis.name));
            
            const brushGroup = axisGroup.append("g")
                .attr("class", "brush")
                .call(brush);
            
            // Style brush overlay
            brushGroup.selectAll(".overlay")
                .attr("cursor", "crosshair");
        });
    }

    drawPolylines = function () {
        const self = this;
        
        // Remove existing polylines
        this.matSvg.selectAll(".polyline-group").remove();
        
        const lineGenerator = d3.line();
        
        this.matSvg.selectAll(".polyline-group")
            .data(this.allData, (d, i) => d.index || i)
            .join(
                enter => {
                    const group = enter.append("g")
                        .attr("class", "polyline-group")
                        .style("opacity", this.defaultOpacity);
                    
                    group.append("path")
                        .attr("class", "polyline")
                        .attr("fill", "none")
                        .attr("stroke", "#1f77b4")
                        .attr("stroke-width", this.lineStrokeWidth)
                        .attr("stroke-linecap", "round")
                        .attr("stroke-linejoin", "round")
                        .attr("d", (d) => this.getPolylinePath(d));
                    
                    group.on("click", (event, d) => {
                        if (this.controllerMethods && this.controllerMethods.handleOnClick) {
                            this.controllerMethods.handleOnClick(d);
                        }
                    })
                    .on("dblclick", (event, d) => {
                        if (this.controllerMethods && this.controllerMethods.handleOnDoubleClick) {
                            this.controllerMethods.handleOnDoubleClick(d);
                        }
                    })
                    .on("mouseenter", (event, d) => {
                        d3.select(event.currentTarget).style("opacity", 1);
                        d3.select(event.currentTarget).select(".polyline")
                            .attr("stroke-width", this.lineStrokeWidth * 2);
                    })
                    .on("mouseleave", (event, d) => {
                        d3.select(event.currentTarget).style("opacity", this.defaultOpacity);
                        d3.select(event.currentTarget).select(".polyline")
                            .attr("stroke-width", this.lineStrokeWidth);
                    });
                    
                    return group;
                },
                update => update,
                exit => exit.remove()
            );
    }

    getPolylinePath = function (dataPoint) {
        const points = this.axes.map(axis => {
            const x = axis.xPosition;
            const y = axis.scale(dataPoint[axis.name]);
            return [x, y];
        });
        
        return d3.line()(points);
    }

    handleBrush = function (event, attributeName) {
        if (!event.selection) return;
        
        const [y0, y1] = event.selection;
        const axis = this.axes.find(a => a.name === attributeName);
        
        if (!axis) return;
        
        // Get the range of values selected in data space
        let selectedRange;
        if (axis.isNumeric) {
            // For numeric scales, use invert
            selectedRange = [axis.scale.invert(Math.max(y0, y1)), axis.scale.invert(Math.min(y0, y1))];
        } else {
            // For categorical scales, find which domain values fall within the selection
            const domain = axis.scale.domain();
            const yMin = Math.min(y0, y1);
            const yMax = Math.max(y0, y1);
            
            const domainValuesInRange = domain.filter(val => {
                const y = axis.scale(val);
                return y >= yMin && y <= yMax;
            });
            
            selectedRange = domainValuesInRange.length > 0 ? domainValuesInRange : [domain[0]];
        }
        
        // Update active brushes
        this.activeBrushes[attributeName] = {
            range: selectedRange,
            isNumeric: axis.isNumeric
        };
        
        // Filter data based on all active brushes
        const filteredData = this.allData.filter(d => {
            for (let attr in this.activeBrushes) {
                const brushInfo = this.activeBrushes[attr];
                const value = d[attr];
                
                if (brushInfo.isNumeric) {
                    const [min, max] = brushInfo.range;
                    if (value < min || value > max) return false;
                } else {
                    // For categorical, check if value is in the selected domain values
                    if (!brushInfo.range.includes(value)) return false;
                }
            }
            return true;
        });
        
        // Highlight polylines
        this.matSvg.selectAll(".polyline-group").each(function (d) {
            const isSelected = filteredData.some(item => item.index === d.index);
            d3.select(this).style("opacity", isSelected ? 1 : 0.05);
            d3.select(this).select(".polyline")
                .attr("stroke-width", isSelected ? this.lineStrokeWidth * 1.5 : this.lineStrokeWidth);
        });
    }

    handleBrushEnd = function (event, attributeName) {
        if (!event.selection) {
            // Clear brush for this axis
            delete this.activeBrushes[attributeName];
        } else {
            const [y0, y1] = event.selection;
            const axis = this.axes.find(a => a.name === attributeName);
            
            if (!axis) return;
            
            let selectedRange;
            if (axis.isNumeric) {
                // For numeric scales, use invert
                selectedRange = [axis.scale.invert(Math.max(y0, y1)), axis.scale.invert(Math.min(y0, y1))];
            } else {
                // For categorical scales, find which domain values fall within the selection
                const domain = axis.scale.domain();
                const yMin = Math.min(y0, y1);
                const yMax = Math.max(y0, y1);
                
                const domainValuesInRange = domain.filter(val => {
                    const y = axis.scale(val);
                    return y >= yMin && y <= yMax;
                });
                
                selectedRange = domainValuesInRange.length > 0 ? domainValuesInRange : [domain[0]];
            }
            
            this.activeBrushes[attributeName] = {
                range: selectedRange,
                isNumeric: axis.isNumeric
            };
        }
        
        // Filter data based on all active brushes
        const filteredData = this.allData.filter(d => {
            for (let attr in this.activeBrushes) {
                const brushInfo = this.activeBrushes[attr];
                const value = d[attr];
                
                if (brushInfo.isNumeric) {
                    const [min, max] = brushInfo.range;
                    if (value < min || value > max) return false;
                } else {
                    // For categorical, check if value is in the selected domain values
                    if (!brushInfo.range.includes(value)) return false;
                }
            }
            return true;
        });
        
        // Call controller method to update selected items in React state
        if (this.controllerMethods && this.controllerMethods.handleBrushSelection) {
            this.controllerMethods.handleBrushSelection(filteredData);
        }
    }

    highlightSelectedItems = function (selectedItems) {
        const self = this;
        this.matSvg.selectAll(".polyline-group").each(function (d) {
            const isSelected = selectedItems.some(item => item.index === d.index);
            const opacity = isSelected ? 1 : 0.1;
            const strokeWidth = isSelected ? self.lineStrokeWidth * 2 : self.lineStrokeWidth;
            
            d3.select(this).style("opacity", opacity);
            d3.select(this).select(".polyline")
                .attr("stroke-width", strokeWidth)
                .attr("stroke", isSelected ? "#ff0000" : "#1f77b4");
        });
    }

    clear = function () {
        d3.select(this.el).selectAll("*").remove();
        this.allData = [];
        this.currentAttributes = [];
        this.controllerMethods = null;
        this.scales = {};
        this.axes = [];
        this.activeBrushes = {};
        this.matSvg = null;
    }
}

export default ParallelCoordinatesD3;
