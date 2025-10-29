import './Menu.css'

function Menu({activeVisualization, onVisualizationChange}){
    
    return(
        <div className="menuContainer">
            <nav className="menuNav">
                <ul className="menuList">
                    <li className="menuItem">
                        <button 
                            className={`menuButton ${activeVisualization === 'scatterplot' ? 'active' : ''}`}
                            onClick={() => onVisualizationChange('scatterplot')}
                        >
                            Scatterplot
                        </button>
                    </li>
                    <li className="menuItem">
                        <button 
                            className={`menuButton ${activeVisualization === 'visualization2' ? 'active' : ''}`}
                            onClick={() => onVisualizationChange('visualization2')}
                        >
                            Parallel Coordinates
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    )
}

export default Menu;
