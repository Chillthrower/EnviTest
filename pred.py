import requests
import pandas as pd
from statsmodels.tsa.statespace.sarimax import SARIMAX
import matplotlib.pyplot as plt

# Set the endpoint and project ID
endpoint = 'https://cloud.appwrite.io/v1'
project_id = '666180200031ac8b7ec7'

# Set your Appwrite secret key
secret_key = 'cd422c511d40a783aa96f5792cc218ac45999fba8960423a5caf69e35c49cb42df3dd03391af28da3e69bc2986f1ca608134daf14c1927102c272a8d50721019f09048c1b0ba1a536472966c3629648293ee0125e7dbc37dd81bb9df628bb610be039dfd6bbbcab6153a4bfcf59f066f54928b66e716791eee5e40bafaed3a2b'

# Fetch data from the database endpoint using Appwrite API
url = f"{endpoint}/databases/6661805000085a8939ed/collections/6661805600092392b424/documents"
headers = {
    'Content-Type': 'application/json',
    'X-Appwrite-Project': project_id,
    'X-Appwrite-Key': secret_key,
}

response = requests.get(url, headers=headers)
data = response.json()["documents"]

# Convert fetched data to DataFrame
df = pd.DataFrame(data)

# Filter data for emails 1 and 10
filtered_data = df[df['email'].isin(['test1@gmail.com', 'test10@gmail.com'])]

# Avoid SettingWithCopyWarning
filtered_data = filtered_data.copy()

# Convert 'Date' column to datetime
filtered_data['Date'] = pd.to_datetime(filtered_data['Date'])

# Set 'Date' column as index
filtered_data.set_index('Date', inplace=True)

# Select relevant columns for prediction
prediction_data = filtered_data[['email', 'totalFootprint']]

# Pivot the DataFrame to have emails as columns and totalFootprint as values
prediction_data = prediction_data.pivot(columns='email', values='totalFootprint')

# Define train data
train_data = prediction_data.iloc[:-1]

# Define test data (predict for the end of August)
test_data = train_data.index[-1] + pd.DateOffset(months=1)

# Define SARIMA model for each email separately
models = {}
forecasts = {}

for email in train_data.columns:
    # Define SARIMA model
    model = SARIMAX(train_data[email], order=(1, 1, 1), seasonal_order=(1, 1, 1, 12))
    
    # Fit the model
    model_fit = model.fit()
    
    # Forecast for the end of August
    forecast = model_fit.forecast(steps=1)
    
    # Save the model and forecast
    models[email] = model_fit
    forecasts[email] = forecast

# Print the forecasted totalFootprint value for each email
for email, forecast in forecasts.items():
    print(f"Forecasted totalFootprint for {email} at the end of August:", forecast.values[0])

# Plot the actual data and forecast
plt.figure(figsize=(10, 6))

for email in train_data.columns:
    plt.plot(train_data.index, train_data[email], label=f'{email} - Actual Data')

for email, forecast in forecasts.items():
    plt.plot(test_data, forecast, 'o', label=f'{email} - Forecast for end of August')

plt.xlabel('Date')
plt.ylabel('Total Footprint')
plt.title('Forecast for Total Footprint at the End of August')
plt.legend()
plt.grid(True)
plt.show()
