// This controller handles AI-based features like waste classification.
// It is designed to work with an external API (like OpenAI or Google Vision), but currently uses a local heuristic simulation for demonstration.

const classifyWaste = async (req, res) => {
  try {
    const { description, imageBase64 } = req.body;

    // TODO: Integrate OpenAI/Gemini API here
    // Example:
    // const response = await openai.createCompletion({...})
    
    // Heuristic/Mock Logic for now:
    let category = 'General Waste';
    let confidence = 0.5;
    let tips = 'Please ensure waste is bagged.';

    const lowerDesc = description ? description.toLowerCase() : '';

    if (lowerDesc.includes('plastic') || lowerDesc.includes('bottle') || lowerDesc.includes('can')) {
      category = 'Recyclable';
      confidence = 0.95;
      tips = 'Wash and dry before binning.';
    } else if (lowerDesc.includes('food') || lowerDesc.includes('vegetable') || lowerDesc.includes('fruit')) {
      category = 'Organic';
      confidence = 0.98;
      tips = 'Use for composting if possible.';
    } else if (lowerDesc.includes('battery') || lowerDesc.includes('electronic') || lowerDesc.includes('wire')) {
      category = 'Hazardous';
      confidence = 0.99;
      tips = 'Do NOT put in regular bin. Schedule special pickup.';
    }

    // Simulate AI delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    res.json({
      category,
      confidence,
      tips,
      analysis: `AI Analysis detected key identifiers for ${category}.`
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error in AI classification' });
  }
};

module.exports = { classifyWaste };
