// AI-Powered Content Moderation using Groq
import Groq from 'groq-sdk';

// Initialize Groq AI
const groq = new Groq({
  apiKey: process.env.REACT_APP_GROQ_API_KEY || '',
  dangerouslyAllowBrowser: true // Required for client-side usage
});

/**
 * Check if description length is appropriate (basic check before AI)
 * @param {string} text - Text to check
 * @returns {object} - { isValid: boolean, message: string }
 */
export const checkDescriptionLength = (text) => {
  if (!text || text.trim().length === 0) {
    return { isValid: false, message: 'Description is required' };
  }
  
  if (text.trim().length < 20) {
    return { isValid: false, message: 'Description is too short. Please provide more details (at least 20 characters)' };
  }
  
  if (text.length > 1000) {
    return { isValid: false, message: 'Description is too long. Please keep it under 1000 characters' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * AI-powered content validation using Groq
 * @param {string} subject - Selected subject
 * @param {string} description - Description text
 * @returns {Promise<object>} - { isValid: boolean, errors: array, warnings: array, language: string }
 */
export const validateContent = async (subject, description) => {
  const errors = [];
  const warnings = [];
  let language = 'unknown';
  
  // Quick length check first
  const lengthCheck = checkDescriptionLength(description);
  if (!lengthCheck.isValid) {
    return {
      isValid: false,
      errors: [lengthCheck.message],
      warnings: [],
      language: 'unknown'
    };
  }

  try {
    // Create a comprehensive prompt for the AI
    const prompt = `You are a content moderator for a school ticketing system. Analyze the following student request and provide a JSON response.

Subject: "${subject}"
Description: "${description}"

Analyze this content and respond ONLY with a valid JSON object (no markdown, no extra text) in this exact format:
{
  "hasProfanity": boolean,
  "profanityReason": "string (only if hasProfanity is true)",
  "isRelevant": boolean,
  "relevanceReason": "string (only if isRelevant is false)",
  "language": "english" | "tagalog" | "bisaya" | "mixed" | "unknown",
  "isSpam": boolean,
  "tone": "appropriate" | "inappropriate" | "aggressive" | "neutral"
}

Profanity Detection:
- Check for bad words in English, Tagalog, and Bisaya
- Examples: fuck, shit, puta, gago, tangina, yawa, buang, etc.
- Detect indirect profanity or offensive language
- Consider context (medical terms or legitimate words are OK)

Relevance Check:
- Does the description match the subject?
- Is it a legitimate school concern?
- Examples of MISMATCH:
  * Subject: "Tuition Payment Inquiry" but description talks about scholarships, books, or grades
  * Subject: "Library Book Return" but description talks about tuition or grades
  * Subject: "Transcript Request" but description talks about library books
- If there's a clear mismatch, set isRelevant to FALSE

Language Detection:
- Identify primary language(s) used
- English: uses words like "the", "is", "my", "please"
- Tagalog: uses words like "ang", "po", "ko", "gusto", "kailangan"
- Bisaya: uses words like "og", "ug", "palihug", "nako"

Spam Detection:
- Check for gibberish, random characters, or nonsensical text
- Examples: "asdfasdf", "12345", repeated characters
- Detect repetitive or meaningless content

Tone Analysis:
- Is the tone respectful and appropriate for school communication?
- Flag aggressive, rude, or demanding language

Remember: Respond ONLY with the JSON object, nothing else.`;

    // Call Groq AI (using Llama 3 model - fast and accurate)
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.1-8b-instant', // Fast and efficient model
      temperature: 0.1, // Low temperature for consistent analysis
      max_tokens: 500
    });

    const responseText = chatCompletion.choices[0]?.message?.content || '';
    
    // Parse AI response
    let aiAnalysis;
    try {
      // Remove markdown code blocks if present
      const cleanText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      aiAnalysis = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      // Fallback to basic validation
      return {
        isValid: true,
        errors: [],
        warnings: ['AI validation temporarily unavailable. Basic checks passed.'],
        language: 'unknown'
      };
    }

    // Process AI analysis results
    if (aiAnalysis.hasProfanity) {
      errors.push(aiAnalysis.profanityReason || 'Inappropriate language detected. Please use respectful communication.');
    }

    if (!aiAnalysis.isRelevant) {
      errors.push(aiAnalysis.relevanceReason || 'Your description does not match the selected subject. Please ensure your description is relevant to the subject you chose.');
    }

    if (aiAnalysis.isSpam) {
      errors.push('Your description appears to contain spam or gibberish. Please provide a clear, meaningful explanation.');
    }

    if (aiAnalysis.tone === 'inappropriate' || aiAnalysis.tone === 'aggressive') {
      warnings.push('Please maintain a respectful and professional tone in your request.');
    }

    language = aiAnalysis.language || 'unknown';

    return {
      isValid: errors.length === 0,
      errors: errors,
      warnings: warnings,
      language: language
    };

  } catch (error) {
    console.error('AI validation error:', error);
    
    // Fallback: return basic validation if AI fails
    return {
      isValid: true,
      errors: [],
      warnings: ['AI validation temporarily unavailable. Your request will be manually reviewed.'],
      language: 'unknown'
    };
  }
};
