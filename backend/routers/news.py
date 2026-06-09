from fastapi import APIRouter
from models import NewsItem
from typing import List
import random
from datetime import datetime, timedelta

router = APIRouter()

DUMMY_NEWS = [
    {
        "id": "1",
        "headline": "Global Markets Rally Amid Tech Sector Growth",
        "summary": "Major indices hit record highs today as technology stocks continue to outperform expectations in the latest earnings season.",
        "source": "Financial Times",
        "sentiment": "Positive"
    },
    {
        "id": "2",
        "headline": "Central Bank Announces Unexpected Rate Hike",
        "summary": "In a surprise move, the central bank raised interest rates by 25 basis points to combat lingering inflation concerns.",
        "source": "Bloomberg",
        "sentiment": "Negative"
    },
    {
        "id": "3",
        "headline": "New Regulatory Framework Proposed for Fintech Startups",
        "summary": "Lawmakers have introduced a comprehensive bill aimed at standardizing regulations for emerging financial technology companies.",
        "source": "Reuters",
        "sentiment": "Neutral"
    },
    {
        "id": "4",
        "headline": "Housing Market Shows Signs of Cooling",
        "summary": "Recent data indicates a slowdown in home sales and a slight dip in average prices across major metropolitan areas.",
        "source": "Wall Street Journal",
        "sentiment": "Negative"
    },
    {
        "id": "5",
        "headline": "Green Energy Investments Reach All-Time High",
        "summary": "Venture capital funding for renewable energy projects has surpassed previous records, signaling a strong shift towards sustainability.",
        "source": "CNBC",
        "sentiment": "Positive"
    }
]

@router.get("/news", response_model=List[NewsItem])
async def get_news():
    # Return 3 random news items
    selected = random.sample(DUMMY_NEWS, 3)
    
    # Add generated dates
    for item in selected:
        item["date"] = (datetime.now() - timedelta(hours=random.randint(1, 48))).strftime("%Y-%m-%d %H:%M:%S")
        
    return selected
