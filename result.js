import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './componentscss.css'; 
import { useAuth } from '../utils/AuthContext';
import axios from 'axios';

const Result = ({ documentId, calculatedData }) => {
  const { user, addDocument } = useAuth();
  const navigate = useNavigate();
  const { houseFootprint, waterFootprint, vehicleFootprint } = calculatedData;
  const totalFootprint = (parseFloat(houseFootprint || 0) + parseFloat(waterFootprint || 0) + parseFloat(vehicleFootprint || 0)).toFixed(2);

  const [predictedFootprint, setPredictedFootprint] = useState(null);
  const [category, setCategory] = useState(null);

  useEffect(() => {
    const handleSubmit = async () => {
      const house = parseFloat(houseFootprint) || 0;
      const water = parseFloat(waterFootprint) || 0;
      const vehicle = parseFloat(vehicleFootprint) || 0;
      const total = parseFloat(totalFootprint) || 0;

      const documentData = {
        email: user.email,
        houseFootprint: house,
        waterFootprint: water,
        vehicleFootprint: vehicle,
        totalFootprint: total
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

    handleSubmit();
  }, [addDocument, documentId, houseFootprint, totalFootprint, user.email, vehicleFootprint, waterFootprint]);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const response = await axios.post('http://localhost:5000/predict', {
          numberofpeople: 1, // replace with actual number of people
          Total_footprint: totalFootprint
        });
        setPredictedFootprint(response.data.predicted_carbon_footprint);
        setCategory(response.data.category);
      } catch (error) {
        console.error("Error fetching prediction:", error);
      }
    };

    fetchPrediction();
  }, [totalFootprint]);

  const handleGoToDashboard = () => {
    navigate('/userdashboard');
  };
  
  const handleGoToRoom= () => {
    navigate('/room', { state: { totalFootprint: totalFootprint } });
  };
  

  return (
    <div className="result-container">
      <h2>Your Carbon Footprint:</h2>
      <div className="footprint-item">
        <span>House:</span> <span>{houseFootprint || 0} metric tons of CO2e</span>
      </div>
      <div className="footprint-item">
        <span>Vehicle:</span> <span>{vehicleFootprint || 0} metric tons of CO2e</span>
      </div>
      <div className="footprint-item">
        <span>Water:</span> <span>{waterFootprint || 0} metric tons of CO2e</span>
      </div>
      <div className="footprint-total">
        <span>Total:</span> <span>{totalFootprint} metric tons of CO2e</span>
      </div>
      {predictedFootprint !== null && (
        <div className="prediction">
          <span>Predicted Carbon Footprint:</span> <span>{predictedFootprint.toFixed(2)} metric tons of CO2e</span>
          <span>Category:</span> <span>{category}</span>
        </div>
      )}
      <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "30vh"}}>
        <button style={{width: "300px", color:"black"}} onClick={handleGoToDashboard}>
          Go to Dashboard
        </button>
        <button style={{width: "300px", color:"black"}} onClick={handleGoToRoom}>
          Join room
        </button>
      </div>
    </div>
  );
};

export default Result;
