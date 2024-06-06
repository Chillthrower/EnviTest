import React, { useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import './componentscss.css';

const Vehicle = ({ setCalculatedData, documentId }) => {
  const { user, addDocument } = useAuth();
  const [mileage, setMileage] = useState('');
  const [efficiency, setEfficiency] = useState('');
  const [fuelType, setFuelType] = useState('petrol');
  const [calculatedFootprint, setCalculatedFootprint] = useState(null);

  const handleSubmit = async () => {
    const mileageValue = parseFloat(mileage) || 0;
    const efficiencyValue = parseFloat(efficiency) || 0;
    const fuelTypeConversionFactor = {
      petrol: 10.15 / 2000,  // Conversion factor for petrol
      diesel: 19.6 / 2000,   // Conversion factor for diesel
      electric: 0,           // No CO2 emissions for electric vehicles
      hybrid: 0              // No CO2 emissions for hybrid vehicles
    };
    const conversionFactor = fuelTypeConversionFactor[fuelType];
    const calculatedFootprintValue = ((mileageValue / efficiencyValue) * conversionFactor).toFixed(2);
    
    setCalculatedData(prev => ({ ...prev, vehicleFootprint: calculatedFootprintValue }));
    setCalculatedFootprint(calculatedFootprintValue);
  
    const documentData = {
      email: user.email,
      Mileage: mileageValue,
      efficiency: efficiencyValue,
      Fuel_type: fuelType
    };
  
    try {
      await addDocument(documentData, documentId);
    } catch (error) {
      console.error("Error adding vehicle data:", error);
      if (error.response && error.response.data) {
        console.error("Appwrite error response:", error.response.data);
      }
      alert("Failed to add vehicle data");
    }
  };
  

  return (
    <div className="car-container">
      <h2>Vehicle carbon footprint calculator</h2>
      <div className="form-container">
        <div className="input-group">
          <label>Mileage (miles):</label>
          <input 
            type="number" 
            value={mileage} 
            onChange={(e) => setMileage(e.target.value)} 
          />
        </div>
        <div className="input-group">
          <label>Enter efficiency (mpg US):</label>
          <input 
            type="number" 
            value={efficiency} 
            onChange={(e) => setEfficiency(e.target.value)} 
          />
        </div>
        <div className="input-group">
          <label>Fuel type:</label>
          <select 
            value={fuelType} 
            onChange={(e) => setFuelType(e.target.value)}
          >
            <option value="petrol">Petrol</option>
            <option value="diesel">Diesel</option>
            <option value="electric">Electric</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
        <button onClick={handleSubmit}>Calculate Car Footprint</button>
        {calculatedFootprint !== null && (
          <p>Your vehicle's carbon footprint is {calculatedFootprint} metric tons of CO2.</p>
        )}
      </div>
    </div>
  );
};

export default Vehicle;
