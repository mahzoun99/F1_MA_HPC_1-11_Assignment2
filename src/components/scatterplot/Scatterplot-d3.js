import * as d3 from 'd3'
import { formatAttributeName } from '../../utils/helper';

class ScatterplotD3 {
    margin = {top: 100, right: 10, bottom: 50, left: 100};
    size;
    height;
    width;
    matSvg;
    // add specific class properties used for the vis render/updates
    defaultOpacity=0.3;
    transitionDuration=1000;
    circleRadius = 3;
    xScale;
    yScale;
    brush;
    brushGroup;
    allData=[];


    constructor(el){
        this.el = el;
    }

    create = function (config) {
        this.size = {width: config.size.width, height: config.size.height};

        // get the effect size of the view by subtracting the margin
        this.width = this.size.width - this.margin.left - this.margin.right;
        this.height = this.size.height - this.margin.top - this.margin.bottom;
        // initialize the svg and keep it in a class property to reuse it in renderScatterplot()
        this.matSvg = d3.select(this.el).append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("class", "matSvgG")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        this.xScale = d3.scaleLinear().range([0, this.width]);
        this.yScale = d3.scaleLinear().range([this.height, 0]);

        // initialize brush
        this.brush = d3.brush()
            .on("brush", (event) => this.handleBrush(event))
            .on("end", (event) => this.handleBrushEnd(event));

        // build xAxisG
        this.matSvg.append("g")
            .attr("class", "xAxisG")
            .attr("transform", "translate(0," + this.height + ")")

        this.matSvg.append("g")
            .attr("class", "yAxisG")

        // add brush group after axes
        this.brushGroup = this.matSvg.append("g")
            .attr("class", "brushGroup")
            .call(this.brush);
    }

    changeBorderAndOpacity(selection, selected){
        selection.style("opacity", selected ? 1 : this.defaultOpacity)

        selection.select(".markerCircle")
            .attr("stroke-width", selected ? 2 : 0)
            .attr("stroke", "red")
    }

    updateMarkers(selection, xAttribute, yAttribute){
        // transform selection
        selection
            .transition().duration(this.transitionDuration)
            .attr("transform", (item) => {
                // use scales to return shape position from data values
                const xPos = this.xScale(item[xAttribute]);
                const yPos = this.yScale(item[yAttribute]);
                return "translate(" + xPos + "," + yPos + ")";
            })
        this.changeBorderAndOpacity(selection, false)
    }

    highlightSelectedItems(selectedItems){
        // use pattern update to change the border and opacity of the markers:
        //      - call this.changeBorderAndOpacity(selection,true) for markers that match selectedItems
        //      - this.changeBorderAndOpacity(selection,false) for markers the do not match selectedItems
        this.matSvg.selectAll(".markerG")
            // all elements with the class .markerG (empty the first time)
            .data(selectedItems, (itemData) => itemData.index)
            .join(
                enter => enter,
                update => {
                    this.changeBorderAndOpacity(update, true);
                },
                exit => {
                    this.changeBorderAndOpacity(exit, false);
                }
            )
    }

    updateAxis = function(visData, xAttribute, yAttribute){
        // compute min max using d3.min/max(visData.map(item=>item.attribute))
        const minXAxis = d3.min(visData.map((item) => {return item[xAttribute]}));
        const maxXAxis = d3.max(visData.map((item) => {return item[xAttribute]}));
        const minYAxis = d3.min(visData.map((item) => {return item[yAttribute]}));
        const maxYAxis = d3.max(visData.map((item) => {return item[yAttribute]}));

        this.xScale.domain([minXAxis, maxXAxis]);
        this.yScale.domain([minYAxis, maxYAxis]);

        // create axis with computed scales
        this.matSvg.select(".xAxisG")
            .transition().duration(500)
            .call(d3.axisBottom(this.xScale))

        this.matSvg.select(".yAxisG")
            .transition().duration(500)
            .call(d3.axisLeft(this.yScale))

        // Add or update X-axis label
        this.matSvg.selectAll(".xAxisLabel").remove();
        this.matSvg.append("text")
            .attr("class", "xAxisLabel")
            .attr("x", this.width / 2)
            .attr("y", this.height + 40)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .attr("font-weight", "500")
            .attr("fill", "#333")
            .text(formatAttributeName(xAttribute));

        // Add or update Y-axis label
        this.matSvg.selectAll(".yAxisLabel").remove();
        this.matSvg.append("text")
            .attr("class", "yAxisLabel")
            .attr("transform", "rotate(-90)")
            .attr("x", -this.height / 2)
            .attr("y", -60)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .attr("font-weight", "500")
            .attr("fill", "#333")
            .text(formatAttributeName(yAttribute));
    }


    renderScatterplot = function (visData, xAttribute, yAttribute, controllerMethods){
        // Store data, attributes, and controller methods for brush interaction
        this.allData = visData;
        this.currentXAttribute = xAttribute;
        this.currentYAttribute = yAttribute;
        this.controllerMethods = controllerMethods;
        
        // build the size scales and x,y axis
        this.updateAxis(visData, xAttribute, yAttribute);

        this.matSvg.selectAll(".markerG")
            // all elements with the class .markerG (empty the first time)
            .data(visData,(itemData)=>itemData.index)
            .join(
                enter=>{
                    // all data items to add:
                    // doesn’exist in the select but exist in the new array
                    const itemG=enter.append("g")
                        .attr("class", "markerG")
                        .style("opacity", this.defaultOpacity)
                        .on("click", (event, itemData) => {
                            controllerMethods.handleOnClick(itemData);
                        })
                        .on("dblclick", (event, itemData) => {
                            if (controllerMethods.handleOnDoubleClick) {
                                controllerMethods.handleOnDoubleClick(itemData);
                            }
                        })

                    // render element as child of each element "g"
                    itemG.append("circle")
                        .attr("class", "markerCircle")
                        .attr("r", this.circleRadius)
                        .attr("stroke", "red")

                    this.updateMarkers(itemG, xAttribute, yAttribute);
                },
                update => {
                    this.updateMarkers(update, xAttribute, yAttribute)
                },
                exit => {
                    exit.remove()
                }

            )
    }

    handleBrush = (event) => {
        if (!event.selection) return;
        
        const [[x0, y0], [x1, y1]] = event.selection;
        
        // Find all points within the brush area
        const brushedItems = this.allData.filter(item => {
            const xPos = this.xScale(item[this.currentXAttribute]);
            const yPos = this.yScale(item[this.currentYAttribute]);
            return xPos >= x0 && xPos <= x1 && yPos >= y0 && yPos <= y1;
        });
        
        // Update markers to highlight brushed items
        this.matSvg.selectAll(".markerG").each(function(d) {
            const isSelected = brushedItems.some(item => item.index === d.index);
            d3.select(this).style("opacity", isSelected ? 1 : 0.1);
            d3.select(this).select(".markerCircle")
                .attr("stroke-width", isSelected ? 2 : 0);
        });
    }

    handleBrushEnd = (event) => {
        if (!event.selection) return;
        
        const [[x0, y0], [x1, y1]] = event.selection;
        
        // Find all points within the brush area
        const brushedItems = this.allData.filter(item => {
            const xPos = this.xScale(item[this.currentXAttribute]);
            const yPos = this.yScale(item[this.currentYAttribute]);
            return xPos >= x0 && xPos <= x1 && yPos >= y0 && yPos <= y1;
        });
        
        // Clear the brush selection
        this.brushGroup.call(this.brush.move, null);
        
        // Call the controller method to update selected items in React state
        if (this.controllerMethods && this.controllerMethods.handleBrushSelection) {
            this.controllerMethods.handleBrushSelection(brushedItems);
        }
    }

    clear = function() {
        // Remove all SVG elements to ensure clean state on remount
        d3.select(this.el).selectAll("*").remove();
        // Reset internal state
        this.allData = [];
        this.currentXAttribute = null;
        this.currentYAttribute = null;
        this.controllerMethods = null;
        this.matSvg = null;
    }
}
export default ScatterplotD3;