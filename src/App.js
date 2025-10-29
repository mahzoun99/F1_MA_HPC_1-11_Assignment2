import './App.css';
import {useState, useEffect} from 'react'
import {fetchCSV} from "./utils/helper";
import Menu from "./components/Menu";
import ScatterplotContainer from "./components/scatterplot/ScatterplotContainer";
import ParallelCoordinatesContainer from "./components/parallelcoordinates/ParallelCoordinatesContainer";

function App() {
    const [data,setData] = useState([])
    const [activeVisualization, setActiveVisualization] = useState('scatterplot')
    
    // every time the component re-render
    // if no dependencies, useEffect is called at each re-render
    useEffect(()=>{
        fetchCSV("data/Housing.csv",(response)=>{
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

    const parallelCoordinatesControllerMethods= {
        updateSelectedItems: (items) =>{
            setSelectedItems(items.map((item) => {return {...item,selected:true}} ));
        }
    };

    const handleVisualizationChange = (visualization) => {
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
                    <ParallelCoordinatesContainer parallelCoordinatesData={data} attributes={["price", "area", "bedrooms", "bathrooms", "stories", "parking"]} selectedItems={selectedItems} parallelCoordinatesControllerMethods={parallelCoordinatesControllerMethods}/>
                )}
            </div>
        </div>
    );
}

export default App;
