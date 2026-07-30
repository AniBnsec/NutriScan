const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

function getDemoFoods() {
  const demos = [
    [
      { name: 'basmati rice', portion_g: 150, confidence: 0.94, category: 'carb', description: 'Fluffy white basmati rice' },
      { name: 'dal tadka', portion_g: 180, confidence: 0.91, category: 'protein', description: 'Yellow lentil curry with tempering' },
      { name: 'roti', portion_g: 60, confidence: 0.95, category: 'carb', description: 'Two pieces of whole wheat roti' },
      { name: 'mixed salad', portion_g: 80, confidence: 0.88, category: 'vegetable', description: 'Fresh cucumber, tomato, onion salad' },
    ],
    [
      { name: 'grilled chicken breast', portion_g: 150, confidence: 0.93, category: 'protein', description: 'Grilled chicken breast with herbs' },
      { name: 'brown rice', portion_g: 120, confidence: 0.90, category: 'carb', description: 'Steamed brown rice' },
      { name: 'steamed broccoli', portion_g: 100, confidence: 0.92, category: 'vegetable', description: 'Steamed broccoli florets' },
    ],
    [
      { name: 'butter chicken', portion_g: 200, confidence: 0.92, category: 'protein', description: 'Creamy tomato-based chicken curry' },
      { name: 'naan bread', portion_g: 90, confidence: 0.96, category: 'carb', description: 'Two pieces of butter naan' },
      { name: 'raita', portion_g: 80, confidence: 0.87, category: 'dairy', description: 'Yogurt with cucumber and cumin' },
    ],
  ];
  return demos[Math.floor(Math.random() * demos.length)];
}

async function analyzeFoodImage(imagePath) {
  const startTime = Date.now();
  
  const token = process.env.LOGMEAL_API_TOKEN || process.env.LOGMEAL_COMPANY_TOKEN;
  if (!token) {
    console.warn('⚠️ LogMeal API token is not set. Using demo fallback.');
    return { foods: getDemoFoods(), duration: Date.now() - startTime };
  }

  try {
    console.log('🤖 Sending image to LogMeal API...');
    
    const formData = new FormData();
    // In Windows, FormData sometimes fails to extract the filename from the path, so we explicitly provide it
    formData.append('image', fs.createReadStream(imagePath), { filename: path.basename(imagePath) });

    const headers = {
      'Authorization': `Bearer ${token.trim()}`,
      ...formData.getHeaders()
    };

    // 1. Image Segmentation (Food Recognition)
    let segmentationResponse;
    try {
        segmentationResponse = await axios.post('https://api.logmeal.com/v2/image/segmentation/complete', formData, { headers });
    } catch (segErr) {
        // If segmentation fails (e.g. not allowed on free tier), fallback to basic dish recognition
        console.warn('Segmentation failed, trying basic recognition...', segErr.response ? segErr.response.data : segErr.message);
        
        // We have to recreate the read stream because it was consumed
        const fallbackFormData = new FormData();
        fallbackFormData.append('image', fs.createReadStream(imagePath), { filename: path.basename(imagePath) });
        
        segmentationResponse = await axios.post('https://api.logmeal.com/v2/image/recognition/dish', fallbackFormData, { 
            headers: {
                'Authorization': `Bearer ${token.trim()}`,
                ...fallbackFormData.getHeaders()
            }
        });
    }
    
    const data = segmentationResponse.data;
    let foods = [];

    // Parse segmentation results or direct recognition results
    if (data.segmentation_results) {
        for (const item of data.segmentation_results) {
           if (item.foodFamily === 'non_food' || item.foodFamily === 'non-food') continue;
           if (item.recognition_results && item.recognition_results.length > 0) {
               const topResult = item.recognition_results[0];
               if (topResult.prob && topResult.prob < 0.25) continue;
               foods.push({
                   name: topResult.name,
                   portion_g: 150,
                   category: 'other', 
                   confidence: topResult.prob || 0.95
               });
           }
        }
    } else if (data.recognition_results && data.recognition_results.length > 0) {
        for (const topResult of data.recognition_results) {
           if (topResult.prob && topResult.prob < 0.25) continue;
           foods.push({
              name: topResult.name,
              portion_g: 150,
              category: 'other', 
              confidence: topResult.prob || 0.95
           });
           break; // take top result
        }
    }

    if (foods.length === 0) {
      throw new Error('No valid food detected in the image. Please upload a clear photo of food.');
    }

    // Try to get nutritional info for the image ID
    if (data.imageId) {
       try {
           let nutReq;
           try {
              nutReq = await axios.post('https://api.logmeal.com/v2/nutrition/recipe/nutritionalInfo', {
                  imageId: data.imageId
              }, { headers: { 'Authorization': `Bearer ${token.trim()}`, 'Content-Type': 'application/json' } });
           } catch(e) {
              nutReq = await axios.post('https://api.logmeal.com/v2/recipe/nutritionalInfo', {
                  imageId: data.imageId
              }, { headers: { 'Authorization': `Bearer ${token.trim()}`, 'Content-Type': 'application/json' } });
           }
           
           const nutData = nutReq.data?.nutritional_info || nutReq.data;
           if (nutData) {
               const nut = nutData;
               const totalNut = nut.totalNutrients || nut.macronutrients || {};
               if (foods.length > 0) {
                  foods[0].logmealNutrition = {
                     calories: nut.calories || nut.energy || totalNut.ENERC_KCAL?.quantity || 0,
                     protein: totalNut.proteins || totalNut.PROCNT?.quantity || 0,
                     carbs: totalNut.carbohydrates || totalNut.CHOCDF?.quantity || 0,
                     fat: totalNut.fat || totalNut.FAT?.quantity || 0,
                     fiber: totalNut.fiber || totalNut.FIBTG?.quantity || 0,
                     sugar: totalNut.sugar || totalNut.SUGAR?.quantity || 0,
                     sodium: totalNut.sodium || totalNut.NA?.quantity || 0
                  };
               }
           }
       } catch (nutErr) {
           console.log('LogMeal nutrition info fetch failed, falling back to local enrichment:', nutErr.message);
       }
    }

    console.log('✅ LogMeal successfully analyzed the food!');

    return {
      foods: foods,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    const errorMsg = error.response && error.response.data 
        ? JSON.stringify(error.response.data)
        : error.message;
    console.error('❌ LogMeal API error:', errorMsg);
    throw new Error(`LogMeal failed: ${errorMsg}`);
  }
}

module.exports = { analyzeFoodImage };

