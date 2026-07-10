const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
require('dotenv').config();

async function analyzeFoodImage(imagePath) {
  const startTime = Date.now();
  
  if (!process.env.LOGMEAL_API_TOKEN) {
    throw new Error('LOGMEAL_API_TOKEN is not set. Please add it to your environment variables.');
  }

  try {
    console.log('🤖 Sending image to LogMeal API...');
    
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));

    const headers = {
      'Authorization': `Bearer ${process.env.LOGMEAL_API_TOKEN}`,
      ...formData.getHeaders()
    };

    // 1. Image Segmentation (Food Recognition)
    const response = await axios.post('https://api.logmeal.com/v2/image/segmentation/complete', formData, { headers });
    
    if (!response.data || !response.data.segmentation_results) {
       throw new Error('Invalid response from LogMeal API');
    }

    const results = response.data.segmentation_results;
    let foods = [];
    
    for (const item of results) {
       if (item.recognition_results && item.recognition_results.length > 0) {
           const topResult = item.recognition_results[0];
           foods.push({
               name: topResult.name,
               portion_g: 150, // Default portion size as LogMeal doesn't return portion
               category: 'other', 
               confidence: topResult.prob || 0.95
           });
       }
    }

    if (foods.length === 0) {
      throw new Error('No valid food detected in the image.');
    }

    // Try to get nutritional info for the image ID
    if (response.data.imageId) {
       try {
           const nutReq = await axios.post('https://api.logmeal.com/v2/recipe/nutritionalInfo', {
               imageId: response.data.imageId
           }, { headers: { 'Authorization': `Bearer ${process.env.LOGMEAL_API_TOKEN}` } });
           
           if (nutReq.data && nutReq.data.nutritional_info) {
               const nut = nutReq.data.nutritional_info;
               // Map LogMeal nutrition format if available
               if (foods.length > 0) {
                  foods[0].logmealNutrition = {
                     calories: nut.calories || 0,
                     protein: nut.totalNutrients?.PROCNT?.quantity || 0,
                     carbs: nut.totalNutrients?.CHOCDF?.quantity || 0,
                     fat: nut.totalNutrients?.FAT?.quantity || 0,
                     fiber: nut.totalNutrients?.FIBTG?.quantity || 0,
                     sugar: nut.totalNutrients?.SUGAR?.quantity || 0,
                     sodium: nut.totalNutrients?.NA?.quantity || 0
                  };
               }
           }
       } catch (nutErr) {
           console.log('LogMeal nutrition info failed, falling back to local enrichment:', nutErr.message);
       }
    }

    console.log('✅ LogMeal successfully analyzed the food!');

    return {
      foods: foods,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    console.error('❌ LogMeal API error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    throw new Error(`AI Scan Failed: ${error.message}`);
  }
}

module.exports = { analyzeFoodImage };
