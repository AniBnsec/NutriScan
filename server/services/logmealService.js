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
          const bestMatch = segment.recognition_results[0];
          foods.push({
            name: bestMatch.name,
            portion_g: 150,
            confidence: bestMatch.prob,
            category: 'other',
            description: `Detected by LogMeal AI`
          });
        }
      }
    }

    return {
      foods: foods,
      duration: Date.now() - startTime,
    };

  } catch (error) {
    const errorDetails = error.response?.data ? JSON.stringify(error.response.data) : error.message;
    console.error('❌ LogMeal API error:', errorDetails);
    
    // Check for specific token errors to give a helpful message
    if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error(`LogMeal Unauthorized: Please make sure you are using the 'APIUserToken' from your LogMeal dashboard, NOT the 'APICompanyToken'. (Raw error: ${errorDetails})`);
    }
    
    throw new Error(`LogMeal API Error: ${errorDetails}`);
  }
}

module.exports = { analyzeFoodImage };
