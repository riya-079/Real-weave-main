import httpx
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("OPENWEATHER_API_KEY")
BASE_URL = "https://api.openweathermap.org/data/2.5"

class WeatherService:
    async def get_weather(self, lat: float, lon: float):
        if not API_KEY:
            return {"error": "Weather API key not configured"}
            
        async with httpx.AsyncClient() as client:
            try:
                # Current Weather
                response = await client.get(
                    f"{BASE_URL}/weather",
                    params={
                        "lat": lat,
                        "lon": lon,
                        "appid": API_KEY,
                        "units": "metric"
                    }
                )
                response.raise_for_status()
                data = response.json()
                
                return {
                    "temp": data["main"]["temp"],
                    "condition": data["weather"][0]["main"],
                    "description": data["weather"][0]["description"],
                    "wind_speed": data["wind"]["speed"],
                    "humidity": data["main"]["humidity"],
                    "city": data.get("name", "Unknown Region")
                }
            except Exception as e:
                print(f"Weather Fetch Error: {e}")
                return {"error": str(e)}

weather_service = WeatherService()
