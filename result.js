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
  const [prediction, setPrediction] = useState(null);

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
        totalFootprint: total,
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
        const response = await axios.post('http://127.0.0.1:5000/predict', { email: user.email });
        setPrediction(response.data.forecast);
      } catch (error) {
        console.error("Error fetching prediction:", error);
      }
    };

    fetchPrediction();
  }, [user.email]);

  const handleGoToRec = () => {
    if (prediction !== null) {
      navigate('/recom_main', { state: { prediction: parseFloat(prediction).toFixed(2) } });
    } else {
      alert("Prediction data is not available");
    }
  };

  const handleGoToRoom = () => {
    navigate('/room');
  };

  return (
    <div className="welcome-container">
      <h2 className='h2_comp'>Your Carbon Footprint:</h2>
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
      {prediction !== null && (
        <div className="footprint-prediction">
          <span>Predicted Total Footprint for Next Month:</span> <span>{prediction.toFixed(2)} metric tons of CO2e</span>
        </div>
      )}
      <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "30vh"}}>
        <button style={{width: "300px", color:"black"}} onClick={handleGoToRec}>
          Get Suggestions
        </button>
        <button style={{width: "300px", color:"black"}} onClick={handleGoToRoom}>
          Join room
        </button>
      </div>
    </div>
  );
};

export default Result;
