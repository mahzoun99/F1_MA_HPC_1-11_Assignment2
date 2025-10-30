import './Scatterplot.css'
import {useEffect, useRef} from 'react';

import ScatterplotD3 from './Scatterplot-d3';

// TODO: import action methods from reducers

function ScatterplotContainer({scatterplotData, xAttribute, yAttribute, selectedItems, scatterplotControllerMethods, onOpenModal}){

    // every time the component re-render
    // if no dependencies, useEffect is called at each re-render

    const divContainerRef = useRef(null);
    const scatterplotD3Ref = useRef(null)

    const getChartSize = function(){
        // getting size from parent item
        let width;// = 800;
        let height;// = 100;
        if(divContainerRef.current!==undefined){
            width=divContainerRef.current.offsetWidth;
            height=divContainerRef.current.offsetHeight-4;
        }
        return {width:width,height:height};
    }

    // did mount called once the component did mount
    useEffect(()=>{
        const scatterplotD3 = new ScatterplotD3(divContainerRef.current);
        scatterplotD3.create({size:getChartSize()});
        scatterplotD3Ref.current = scatterplotD3;
        return ()=>{
            // did unmout, the return function is called once the component did unmount (removed for the screen)
            const scatterplotD3 = scatterplotD3Ref.current;
            scatterplotD3.clear()
        }
    },[]);// if empty array, useEffect is called after the component did mount (has been created)


    const scatterplotDataRef = useRef(scatterplotData);
    // did update, called each time dependencies change, dispatch remain stable over component cycles
    useEffect(()=>{
        const handleOnClick = function(itemData){
            scatterplotControllerMethods.updateSelectedItems([itemData])
        }
        const handleBrushSelection = function(items){
            scatterplotControllerMethods.updateSelectedItems(items)
        }
        const handleOnDoubleClick = function(itemData){
            onOpenModal(itemData);
        }

        const controllerMethods = {
            handleOnClick,
            handleBrushSelection,
            handleOnDoubleClick
        }

        if(scatterplotDataRef.current !== scatterplotData || scatterplotData.length > 0) {
            // get the current instance of scatterplotD3 from the Ref object
            const scatterplotD3 = scatterplotD3Ref.current
            // call renderScatterplot of ScatterplotD3
            scatterplotD3.renderScatterplot(scatterplotData, xAttribute, yAttribute, controllerMethods);
            scatterplotDataRef.current = scatterplotData;
        }
    },[scatterplotData, xAttribute, yAttribute, scatterplotControllerMethods, onOpenModal]);
    // if dependencies, useEffect is called after each data update, in our case only scatterplotData changes.


    useEffect(()=>{
        // get the current instance of scatterplotD3 from the Ref object...
        const scatterplotD3 = scatterplotD3Ref.current
        // call renderScatterplot of ScatterplotD3...;
        scatterplotD3.highlightSelectedItems(selectedItems)
    },[selectedItems])
    return(
        <div ref={divContainerRef} className="scatterplotDivContainer col2">
        </div>
    )
}

export default ScatterplotContainer;