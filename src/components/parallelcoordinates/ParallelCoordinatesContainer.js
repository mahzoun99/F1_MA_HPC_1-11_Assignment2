import './ParallelCoordinates.css'
import {useEffect, useRef} from 'react';

import ParallelCoordinatesD3 from './ParallelCoordinates-d3';

function ParallelCoordinatesContainer({parallelCoordinatesData, attributes, selectedItems, parallelCoordinatesControllerMethods}){

    useEffect(()=>{
    });

    const divContainerRef = useRef(null);
    const parallelCoordinatesD3Ref = useRef(null)

    const getChartSize = function(){
        let width;
        let height;
        if(divContainerRef.current !== undefined){
            width = divContainerRef.current.offsetWidth;
            height = divContainerRef.current.offsetHeight - 4;
        }
        return {width: width, height: height};
    }

    useEffect(()=>{
        const parallelCoordinatesD3 = new ParallelCoordinatesD3(divContainerRef.current);
        parallelCoordinatesD3.create({size: getChartSize()});
        parallelCoordinatesD3Ref.current = parallelCoordinatesD3;
        return ()=>{
            const parallelCoordinatesD3 = parallelCoordinatesD3Ref.current;
            parallelCoordinatesD3.clear()
        }
    },[]);

    const parallelCoordinatesDataRef = useRef(parallelCoordinatesData);
    
    useEffect(()=>{
        const handleOnClick = function(itemData){
            parallelCoordinatesControllerMethods.updateSelectedItems([itemData])
        }
        
        const handleBrushSelection = function(items){
            parallelCoordinatesControllerMethods.updateSelectedItems(items)
        }

        const controllerMethods = {
            handleOnClick,
            handleBrushSelection
        }

        if(parallelCoordinatesDataRef.current !== parallelCoordinatesData || parallelCoordinatesData.length > 0) {
            const parallelCoordinatesD3 = parallelCoordinatesD3Ref.current
            parallelCoordinatesD3.renderParallelCoordinates(parallelCoordinatesData, attributes, controllerMethods);
            parallelCoordinatesDataRef.current = parallelCoordinatesData;
        }
    },[parallelCoordinatesData, attributes, parallelCoordinatesControllerMethods]);

    useEffect(()=>{
        const parallelCoordinatesD3 = parallelCoordinatesD3Ref.current
        parallelCoordinatesD3.highlightSelectedItems(selectedItems)
    },[selectedItems])
    
    return(
        <div ref={divContainerRef} className="parallelCoordinatesDivContainer col2">
        </div>
    )
}

export default ParallelCoordinatesContainer;
