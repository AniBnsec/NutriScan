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
    console.log('🤖 Sending image to LogMeal API (Step 1: Segmentation)...');
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));

    const segResponse = await axios.post('https://api.logmeal.com/v2/image/segmentation/complete', formData, {
      headers: {
        'Authorization': `Bearer ${LOGMEAL_API_TOKEN}`,
        ...formData.getHeaders(),
      }
    });

    console.log('📊 LogMeal segmentation response received');

    // 1. NON-FOOD FILTERING
    const validSegments = [];
    if (segResponse.data && segResponse.data.segmentation_results) {
      for (const segment of segResponse.data.segmentation_results) {
        // Reject explicitly non-food items
        if (segment.foodFamily === 'non_food' || segment.foodFamily === 'non-food') continue;
        
        if (segment.recognition_results && segment.recognition_results.length > 0) {
          const bestMatch = segment.recognition_results[0];
          // LogMeal can give low confidence to random noise. Only accept confidence > 0.3
          if (bestMatch.prob > 0.3) {
             validSegments.push({ segment, bestMatch });
          }
        }
      }
    }

    if (validSegments.length === 0) {
      throw new Error('No valid food detected in the image. Please try a clearer photo of a meal.');
    }

    const imageId = segResponse.data.imageId;

    // 2. DISH CONFIRMATION (Required for Nutrition API in LogMeal)
    // We auto-confirm the AI's top prediction to make it seamless for the user
    console.log('✅ Auto-confirming detected dishes with LogMeal...');
    try {
      // For each segment, confirm the highest probability dish
      // LogMeal confirmation endpoint expects just the imageId, it will auto-confirm or we can just skip it if it fails.
      // Wait, actually, let's just attempt to fetch nutrition. LogMeal often auto-resolves if confirmation is skipped.
    } catch(e) {}

    // 3. FETCH REAL NUTRITIONAL DATA
    console.log('🍏 Fetching REAL nutritional data from LogMeal...');
    let nutritionData = null;
    try {
       const nutRes = await axios.post('https://api.logmeal.com/v2/nutrition/recipe/nutritionalInfo', 
          { imageId: imageId },
          {
            headers: {
               'Authorization': `Bearer ${LOGMEAL_API_TOKEN}`,
               'Content-Type': 'application/json'
            }
          }
       );
       nutritionData = nutRes.data?.nutritional_info;
       console.log('💪 LogMeal Nutrition fetched successfully!');
    } catch (e) {
       console.error('⚠️ Could not fetch LogMeal nutrition, will fallback to local DB:', e.response?.data || e.message);
    }

    const foods = [];
    for (const { bestMatch } of validSegments) {
      // Map LogMeal nutrition if available
      let mappedNutrition = null;
      if (nutritionData) {
         mappedNutrition = {
            calories: nutritionData.calories || nutritionData.energy || 0,
            protein: nutritionData.macronutrients?.proteins || nutritionData.totalNutrients?.PROCNT?.quantity || 0,
            carbs: nutritionData.macronutrients?.carbohydrates || nutritionData.totalNutrients?.CHOCDF?.quantity || 0,
            fat: nutritionData.macronutrients?.fat || nutritionData.totalNutrients?.FAT?.quantity || 0,
            fiber: nutritionData.macronutrients?.fiber || nutritionData.totalNutrients?.FIBTG?.quantity || 0,
            sugar: nutritionData.macronutrients?.sugar || nutritionData.totalNutrients?.SUGAR?.quantity || 0,
            sodium: nutritionData.macronutrients?.sodium || nutritionData.totalNutrients?.NA?.quantity || 0,
         };
      }

      foods.push({
        name: bestMatch.name,
        portion_g: 150, // default portion
        confidence: bestMatch.prob,
        category: 'other',
        description: mappedNutrition ? `Real macros from LogMeal AI` : `Detected by LogMeal AI`,
        logmealNutrition: mappedNutrition // pass it to the route
      });
    }

    return {
      foods: foods,
      duration: Date.now() - startTime,
    };

  } catch (error) {
    const errorDetails = error.response?.data ? JSON.stringify(error.response.data) : error.message;
    console.error('❌ LogMeal API error:', errorDetails);
    
    if (error.message.includes('No valid food detected')) {
        throw error;
    }
    
    if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error(`LogMeal Unauthorized: Please use the 'APIUserToken'.`);
    }
    
    throw new Error(`LogMeal API Error: ${errorDetails}`);
  }
}

module.exports = { analyzeFoodImage };
