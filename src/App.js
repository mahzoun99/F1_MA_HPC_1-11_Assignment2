import './App.css';
import {useState, useEffect, useCallback, useMemo} from 'react'
import {fetchCSV} from "./utils/helper";
import Menu from "./components/Menu";
import ScatterplotContainer from "./components/scatterplot/ScatterplotContainer";
import ParallelCoordinatesContainer from "./components/parallelcoordinates/ParallelCoordinatesContainer";
import DataDetailsModal from "./components/DataDetailsModal";

function App() {
    const [data,setData] = useState([])
    const [activeVisualization, setActiveVisualization] = useState('scatterplot')
    const [selectedDataPoint, setSelectedDataPoint] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    
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

    const updateSelectedItems = useCallback((items) => {
        setSelectedItems(items.map((item) => {return {...item,selected:true}} ));
    }, []);

    const scatterplotControllerMethods = useMemo(() => ({
        updateSelectedItems
    }), [updateSelectedItems]);

    const parallelCoordinatesControllerMethods = useMemo(() => ({
        updateSelectedItems
    }), [updateSelectedItems]);

    const parallelCoordinatesAttributes = useMemo(() => 
        ["price", "area", "bedrooms", "bathrooms", "stories", "parking"]
    , []);

    const handleVisualizationChange = (visualization) => {
        setActiveVisualization(visualization);
    }

    const handleOpenModal = (dataPoint) => {
        setSelectedDataPoint(dataPoint);
        setIsModalOpen(true);
    }

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedDataPoint(null);
    }

    return (
        <div className="App">
            <Menu activeVisualization={activeVisualization} onVisualizationChange={handleVisualizationChange} />
            <div id={"MultiviewContainer"} className={"row"}>
                {activeVisualization === 'scatterplot' && (
                    <ScatterplotContainer scatterplotData={data} xAttribute={"area"} yAttribute={"price"} selectedItems={selectedItems} scatterplotControllerMethods={scatterplotControllerMethods} onOpenModal={handleOpenModal}/>
                )}
                {activeVisualization === 'visualization2' && (
                    <ParallelCoordinatesContainer parallelCoordinatesData={data} attributes={parallelCoordinatesAttributes} selectedItems={selectedItems} parallelCoordinatesControllerMethods={parallelCoordinatesControllerMethods} onOpenModal={handleOpenModal}/>
                )}
            </div>
            <DataDetailsModal dataItem={selectedDataPoint} isOpen={isModalOpen} onClose={handleCloseModal} />
        </div>
    );
}

export default App;
