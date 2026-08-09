const axios = require('axios');

async function testGroq() {
  try {
    const response = await axios.get('https://api.groq.com/openai/v1/models', {
      headers: {
        'Authorization': `Bearer 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`
      }
    });
    console.log("Success:", response.data);
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error.message);
  }
}

testGroq();
