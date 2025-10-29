import './App.css';
import {useState, useEffect} from 'react'
import {fetchCSV} from "./utils/helper";
import Menu from "./components/Menu";
import ScatterplotContainer from "./components/scatterplot/ScatterplotContainer";

function App() {
    console.log("App component function call...")
    const [data,setData] = useState([])
    const [activeVisualization, setActiveVisualization] = useState('scatterplot')
    
    // every time the component re-render
    useEffect(()=>{
        console.log("App useEffect (called each time App re-renders)");
    }); // if no dependencies, useEffect is called at each re-render

    useEffect(()=>{
        console.log("App did mount");
        fetchCSV("data/Housing.csv",(response)=>{
            console.log("initial setData() ...")
            setData(response.data);
        })
        return ()=>{
            console.log("App did unmount");
        }
    },[])

    const [selectedItems, setSelectedItems] = useState([])

    const scatterplotControllerMethods= {
        updateSelectedItems: (items) =>{
            setSelectedItems(items.map((item) => {return {...item,selected:true}} ));
        }
    };

    const handleVisualizationChange = (visualization) => {
        console.log("Switching to visualization:", visualization)
        setActiveVisualization(visualization);
    }

    return (
        <div className="App">
            <Menu activeVisualization={activeVisualization} onVisualizationChange={handleVisualizationChange} />
            <div id={"MultiviewContainer"} className={"row"}>
                {activeVisualization === 'scatterplot' && (
                    <ScatterplotContainer scatterplotData={data} xAttribute={"area"} yAttribute={"price"} selectedItems={selectedItems} scatterplotControllerMethods={scatterplotControllerMethods}/>
                )}
                {activeVisualization === 'visualization2' && (
                    <div className="visualizationPlaceholder">
                        <p>Visualization 2 - Coming soon</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
