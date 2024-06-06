import React, { useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import './componentscss.css';

const House = ({ setCalculatedData, documentId }) => {
  const { user, addDocument } = useAuth();
  const [people, setPeople] = useState(1);
  const [electricity, setElectricity] = useState('');
  const [naturalGas, setNaturalGas] = useState('');
  const [heatingOil, setHeatingOil] = useState('');
  const [propane, setPropane] = useState('');
  const [calculatedFootprint, setCalculatedFootprint] = useState(null);

  const handleSubmit = async () => {
    const peopleValue = parseFloat(people) || 0;
    const electricityValue = parseFloat(electricity) || 0;
    const naturalGasValue = parseFloat(naturalGas) || 0;
    const heatingOilValue = parseFloat(heatingOil) || 0;
    const propaneValue = parseFloat(propane) || 0;

    const electricityCO2 = (electricityValue * 0.404 / 1000);  // Convert kWh to tons CO2
    const naturalGasCO2 = (naturalGasValue * 0.0053);  // No conversion needed
    const heatingOilCO2 = (heatingOilValue * 22.38 / 2000);  // Convert gallons to tons CO2
    const propaneCO2 = (propaneValue * 12.68 / 2000);  // Convert gallons to tons CO2
    const calculatedFootprintValue = (electricityCO2 + naturalGasCO2 + propaneCO2 + heatingOilCO2).toFixed(2);
    
    setCalculatedData(prev => ({ ...prev, houseFootprint: calculatedFootprintValue }));
    setCalculatedFootprint(calculatedFootprintValue);

    const documentData = {
      email: user.email,
      numberofpeople: peopleValue,
      Electricity: electricityValue,
      Natural_gas: naturalGasValue,
      Heating_oil: heatingOilValue,
      Propane: propaneValue
    };

    try {
      await addDocument(documentData, documentId);
      
    } catch (error) {
      console.error("Error adding House data:", error);
      if (error.response && error.response.data) {
        console.error("Appwrite error response:", error.response.data);
      }
      alert("Failed to add House data");
    }
  };

  return (
    <div className="welcome-container">
      <h2>Household carbon footprint calculator</h2>
      <div className="form-container">
        <div className="input-group">
          <label>How many people are in your household?</label>
          <input 
            type="number" 
            value={people} 
            onChange={(e) => setPeople(e.target.value)} 
          />
        </div>
        <div className="input-group">
          <label>Electricity (kWh):</label>
          <input 
            type="number" 
            value={electricity} 
            onChange={(e) => setElectricity(e.target.value)} 
          />
        </div>
        <div className="input-group">
          <label>Natural gas (cubic feet):</label>
          <input 
            type="number" 
            value={naturalGas} 
            onChange={(e) => setNaturalGas(e.target.value)} 
          />
        </div>
        <div className="input-group">
          <label>Heating oil (US gallons):</label>
          <input 
            type="number" 
            value={heatingOil} 
            onChange={(e) => setHeatingOil(e.target.value)} 
          />
        </div>
        <div className="input-group">
          <label>Propane (US gallons):</label>
          <input 
            type="number" 
            value={propane} 
            onChange={(e) => setPropane(e.target.value)} 
          />
        </div>
        <button onClick={handleSubmit}>Calculate Carbon Footprint</button>
        {calculatedFootprint !== null && (
          <p>Your House's carbon footprint is {calculatedFootprint} metric tons of CO2.</p>
        )}
      </div>
    </div>
  );
};

export default House;
