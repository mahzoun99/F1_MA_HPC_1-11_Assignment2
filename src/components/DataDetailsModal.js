import './DataDetailsModal.css'
import { useEffect } from 'react';
import { formatAttributeName } from '../utils/helper';

function DataDetailsModal({ dataItem, isOpen, onClose }) {
    
    useEffect(() => {
        // Handle ESC key to close modal
        const handleEscKey = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleEscKey);
        }

        return () => {
            window.removeEventListener('keydown', handleEscKey);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !dataItem) {
        return null;
    }

    // Handle click outside modal to close
    const handleBackdropClick = (event) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    // Organize attributes by category
    const categorizeAttributes = (data) => {
        const categories = {
            'Property Details': ['price', 'area', 'bedrooms', 'bathrooms', 'stories', 'parking'],
            'Amenities': ['hotwaterheating', 'airconditioning', 'basement', 'guestroom'],
            'Location & Status': ['mainroad', 'prefarea', 'furnishingstatus']
        };

        return categories;
    };

    const formatValue = (key, value) => {
        if (value === 'yes' || value === 'no') {
            return value === 'yes' ? '✓' : '✗';
        }
        
        // Format numbers with commas
        if (key === 'price' && typeof value === 'number') {
            return `$${value.toLocaleString()}`;
        }
        
        if (typeof value === 'number') {
            return value.toLocaleString();
        }
        
        return value;
    };

    const categories = categorizeAttributes(dataItem);

    return (
        <div className="modalBackdrop" onClick={handleBackdropClick}>
            <div className="modalContent">
                <div className="modalHeader">
                    <h2>Property Details</h2>
                    <button className="closeButton" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="modalBody">
                    {Object.entries(categories).map(([category, keys]) => (
                        <div key={category} className="attributeCategory">
                            <h3 className="categoryTitle">{category}</h3>
                            <div className="attributeGrid">
                                {keys.map(key => (
                                    dataItem.hasOwnProperty(key) && (
                                        <div key={key} className="attributeRow">
                                            <span className="attributeLabel">{formatAttributeName(key)}</span>
                                            <span className="attributeValue">
                                                {formatValue(key, dataItem[key])}
                                            </span>
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="modalFooter">
                    <p className="hintText">Press <kbd>ESC</kbd> or click outside to close</p>
                    <button className="closeButtonFooter" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DataDetailsModal;
