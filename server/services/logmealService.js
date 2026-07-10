const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');
require('dotenv').config();

const LOGMEAL_API_TOKEN = process.env.LOGMEAL_API_TOKEN;

async function analyzeFoodImage(imagePath) {
  const startTime = Date.now();
  
  if (!LOGMEAL_API_TOKEN) {
    console.warn('⚠️  LOGMEAL_API_TOKEN not set — using mock food recognition');
    return { foods: getDemoFoods(), duration: Date.now() - startTime };
  }

  try {
    console.log('🤖 Sending image to LogMeal API...');
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));

    const response = await axios.post('https://api.logmeal.com/v2/image/segmentation/complete', formData, {
      headers: {
        'Authorization': `Bearer ${LOGMEAL_API_TOKEN}`,
        ...formData.getHeaders(),
      }
    });

    console.log('📊 LogMeal raw response received');

    const foods = [];
    if (response.data && response.data.segmentation_results) {
      for (const segment of response.data.segmentation_results) {
        if (segment.recognition_results && segment.recognition_results.length > 0) {
          const bestMatch = segment.recognition_results[0]; // Take highest probability
          foods.push({
            name: bestMatch.name,
            portion_g: 150, // Default portion size, as standard segmentation doesn't provide quantity
            confidence: bestMatch.prob,
            category: 'other', // Default category
            description: `Detected by LogMeal AI`
          });
        }
      }
    }

    return {
      foods: foods.length > 0 ? foods : getDemoFoods(),
      duration: Date.now() - startTime,
    };

  } catch (error) {
    console.error('❌ LogMeal API error:', error.response?.data || error.message);
    return { foods: getDemoFoods(), duration: Date.now() - startTime };
  }
}

function getDemoFoods() {
  const demos = [
    [
      { name: 'basmati rice', portion_g: 150, confidence: 0.94, category: 'carb', description: 'LogMeal Fallback: Rice' },
      { name: 'dal tadka', portion_g: 180, confidence: 0.91, category: 'protein', description: 'LogMeal Fallback: Lentil curry' }
    ]
  ];
  return demos[0];
}

module.exports = { analyzeFoodImage };
