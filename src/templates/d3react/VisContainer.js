import './Vis.css'
import { useEffect, useRef} from 'react';

import VisD3 from './Vis-d3';

// TODO: import action methods from reducers

function VisContainer({visData, visControllerMethods}){

    // every time the component re-render
    useEffect(()=>{
        console.log("VisContainer useEffect (called each time matrix re-renders)");
    }); // if no dependencies, useEffect is called at each re-render

    const divContainerRef=useRef(null);
    const visD3Ref = useRef(null)

    const getChartSize = function(){
        // fixed size
        // return {width:900, height:900};
        // getting size from parent item
        let width;// = 800;
        let height;// = 100;
        if(divContainerRef.current!==undefined){
            width=divContainerRef.current.offsetWidth;
            // width = '100%';
            height=divContainerRef.current.offsetHeight-4;
            // height = '100%';
        }
        return {width:width,height:height};
    }

    // did mount called once the component did mount
    useEffect(()=>{
        console.log("VisContainer useEffect [] called once the component did mount");
        const visD3 = new VisD3(divContainerRef.current);
        visD3.create({size:getChartSize()});
        visD3Ref.current = visD3;
        return ()=>{
            // did unmout, the return function is called once the component did unmount (removed for the screen)
            console.log("VisContainer useEffect [] return function, called when the component did unmount...");
            const visD3 = visD3Ref.current;
            visD3.clear()
        }
    },[]);// if empty array, useEffect is called after the component did mount (has been created)

    // did update, called each time dependencies change
    // while visControllerMethods remain stable over component cycles, the object reference change
    const visDataRef = useRef(visData);
    useEffect(()=>{
        console.log("VisContainer useEffect with dependency [visData,dispatch], called each time visData changes...");
        const visD3 = visD3Ref.current;

        const handleOnEvent1 = function(payload){
            // do something
            // call visControllerMethods.action1(payload));
        }
        const handleOnEvent2 = function(payload){
            // do something
            // call visControllerMethods.action2(payload);
        }
        const controllerMethods={
            handleOnEvent1: handleOnEvent1,
            handleOnEvent2: handleOnEvent2,
        }
        // visDataRef is used avoid calling renderVis each cycle 
        // because the object reference of visControllerMethods changes
        if(visData !== visDataRef.current){
            visD3.renderVis(visData, controllerMethods);
            visDataRef.current = visData;
        }
    },[visData, visControllerMethods]);// if dependencies, useEffect is called after each dependency update, in our case only visData changes.

    return(
        <div ref={divContainerRef} className="visDivContainer">

        </div>
    )
}

export default VisContainer;