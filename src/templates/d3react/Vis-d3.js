import * as d3 from 'd3'
import { getDefaultFontSize } from '../../utils/helper';

class VisD3 {
    margin = {top: 100, right: 5, bottom: 5, left: 100};
    size;
    height;
    width;
    matSvg;
    // add specific class properties used for the vis render/updates
    // markerSize= 34;
    // radius = this.markerSize / 2;
    // colorScheme = d3.schemeYlGnBu[9];
    // markerColorScale = d3.scaleQuantile(this.colorScheme);
    // markerSizeScale = d3.scaleLinear()
    //     .range([2, this.radius-1])
    // ;


    // the constructor takes the element to add the SVG within it
    constructor(el){
        this.el=el;
    };

    create = function (config) {
        this.size = {width: config.size.width, height: config.size.height};

        // adapt the size locally if necessary
        // e.g. to create a square svg
        // if (this.size.width > this.size.height) {
        //     this.size.width = this.size.height;
        // } else {
        //     this.size.height = this.size.width;
        // }

        // get the effect size of the view by subtracting the margin
        this.width = this.size.width - this.margin.left - this.margin.right;
        this.height = this.size.height - this.margin.top - this.margin.bottom;

        // initialize the svg and keep it in a class property to reuse it in renderMatrix()
        this.matSvg=d3.select(this.el).append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("class","matSvgG")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
        ;


    }

    updateFunction1(selection){
        // transform selection
        // selection.attr("transform", (itemData)=>{
        //      // use scales to return shape position from data values
        // })

        // change sub-element
        // selection.select(".classname")
        //    .attr("fill",(itemData)=>{
        //          // use scale to return visual attribute from data values
        //    })
    }

    updateFunction2(selectedItems){
        // this.matSvg.selectAll(".itemG")
        //     .data(selectedItems,(itemData)=>itemData.index)
        //     .join(
        //         enter=>enter,
        //         update=>{
        //             this.changeSomething(update);
        //         },
        //         exit => {
        //             this.changeOtherThings(exit);
        //         }
        //     )
        // ;
    }

    renderVis = function (visData, controllerMethods){
        // build the size scale from the data
        // const minVal =
        // const maxValo =
        // this.scale1.domain([minVal, maxVal])

        this.matSvg.selectAll(".itemG")
            // all elements with the class .itemG (empty the first time)
            .data(visData,(itemData)=>itemData.index)
            .join(
                enter=>{
                    // all data items to add:
                    // doesn’exist in the select but exist in the new array
                    const itemG=enter.append("g")
                        .attr("class","itemG")
                        .on("event1", (event,itemData)=>{
                            controllerMethods.handleOnEvent1(itemData);
                        })
                        .on("event2",(event,itemData)=>{
                            controllerMethods.handleOnEvent2(itemData);
                        })
                    ;
                    // render element as child of each element "g"
                    itemG.append("shape")
                    // ...
                    ;
                    this.updateFunction1(itemG);
                },
                update=>{this.updateFunction1(update)},
                exit =>{
                    exit.remove()
                    ;
                }

            )
    }

    clear = function(){
        d3.select(this.el).selectAll("*").remove();
    }
}
export default VisD3;