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
 * @param {string} officeName - Selected office name (optional)
 * @param {string} officeDescription - Description of what the office handles (optional)
 * @returns {Promise<object>} - { isValid: boolean, errors: array, warnings: array, language: string }
 */
export const validateContent = async (subject, description, officeName = '', officeDescription = '') => {
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
    // Create a comprehensive prompt for the AI with office context
    const officeContext = officeName ? `\nOffice: "${officeName}"${officeDescription ? `\nOffice handles: "${officeDescription}"` : ''}` : '';
    const prompt = `You are a STRICT content moderator for a school ticketing system. You must CAREFULLY validate if the student's description is CLEAR, UNDERSTANDABLE, and appropriate.
${officeContext}
Subject: "${subject}"
Description: "${description}"

YOUR TASK:
Analyze the description WORD BY WORD and CHARACTER BY CHARACTER to check if it makes sense.

CRITICAL VALIDATION RULES:

1. PROFANITY CHECK:
   - Detect offensive, vulgar, or disrespectful language in any language (English, Tagalog, Bisaya)
   - Examples: fuck, shit, puta, gago, tangina, yawa, buang, or any aggressive tone

2. SPAM/GIBBERISH CHECK - THIS IS CRITICAL AND MUST BE STRICT:
   
   The description MUST be a CLEAR, COHERENT sentence that makes complete sense.
   
   CHECK CAREFULLY:
   - Are all words spelled correctly?
   - Does the sentence structure make sense?
   - Can you understand what the student is asking for?
   - Are there nonsense words like "yoyo", "ciance", "cance", etc?
   - Are there random letter combinations that aren't real words?
   
   MARK AS SPAM (isSpam = true) if:
   - Contains misspelled nonsense words (e.g., "yoyo ciance", "cance", "yoyo")
   - Contains broken/incomplete sentences that don't make grammatical sense
   - Contains random characters or letter combinations (e.g., "asdfgh", "jkl;")
   - The sentence is incomprehensible or unclear
   - You cannot understand what the student is actually requesting
   
   EXAMPLES OF SPAM/GIBBERISH (mark isSpam = true):
   - "I tn if yoyo ciance books" → SPAM (contains "tn", "yoyo", "ciance" which are nonsense)
   - "I to if yoyo cance books" → SPAM (contains "yoyo", "cance" which are nonsense)
   - "asdfgh jkl; books" → SPAM (random characters)
   - "I want to if books yes" → SPAM (broken grammar, doesn't make sense)
   
   EXAMPLES OF VALID (mark isSpam = false):
   - "I need to borrow books for my research project" → VALID
   - "Can I request books about science?" → VALID
   - "I want to borrow history books" → VALID

3. OFFICE-SUBJECT-DESCRIPTION ALIGNMENT:
   
   Read the office description carefully and understand what services it provides.
   Then analyze the student's description to understand their actual need.
   
   Ask yourself:
   - What is the student actually asking for?
   - Does this request align with what the office handles?
   - Does the description match the subject they selected?
   
   BE INTELLIGENT AND CONTEXTUAL:
   
   UNDERSTAND VAGUE LANGUAGE:
   - If a student says "struggling with school" → understand they need emotional/academic support
   - If they say "having problems" or "exhausted" or "stressed" → understand the context based on which office they selected
   - If they say "need help" → check if the help they need fits the office's services
   
   ONLY FLAG AS WRONG OFFICE when the description EXPLICITLY mentions a service from a DIFFERENT office:
   
   Examples of WRONG OFFICE (mark isRelevant = false):
   - Student selects "Guidance" but description mentions "pay tuition" → Finance handles payments, WRONG
   - Student selects "Guidance" but description mentions "borrow books" → Library handles books, WRONG
   - Student selects "Registrar" but description mentions "tuition balance" → Finance handles payments, WRONG
   - Student selects "Library" but description mentions "check grades" → Registrar handles grades, WRONG
   
   Examples of CORRECT OFFICE (mark isRelevant = true):
   - Student selects "Guidance" and description says "struggling", "exhausted", "stressed", "having problems" → Guidance provides support, CORRECT
   - Student selects "Guidance" and description says "need counseling" or "personal issues" → Guidance provides counseling, CORRECT
   - Student selects "Registrar" and description mentions "enrollment" → Registrar handles enrollment, CORRECT
   - Student selects "Finance" and description mentions "tuition" or "payment" → Finance handles payments, CORRECT
   - Student selects "Library" and description mentions "borrow" or "books" → Library handles books, CORRECT
   
   KEY PRINCIPLE:
   - Be FLEXIBLE with general support language like "struggling", "exhausted", "stressed", "having problems", "need help"
   - Be STRICT only when student explicitly mentions a service that belongs to a DIFFERENT office
   - UNDERSTAND the student's underlying concern, don't just match keywords
   - If the description could reasonably fit the office's services = VALID

4. SUBJECT-DESCRIPTION MATCH:
   - Check if the description content aligns with the subject they selected
   - Example: "Balance Verification" subject but description talks about books = mismatch

5. LANGUAGE DETECTION:
   - Identify the primary language used

6. TONE ANALYSIS:
   - Ensure respectful and appropriate communication

CRITICAL: Respond ONLY with valid JSON. Do not include markdown. Do not duplicate any keys.

IMPORTANT: Check for SPAM/GIBBERISH FIRST before checking anything else. If the description is incomprehensible, mark isSpam = true.

{
  "hasProfanity": boolean,
  "profanityReason": "string (only if hasProfanity is true, otherwise empty string)",
  "isRelevant": boolean,
  "relevanceReason": "string (only if isRelevant is false, explain: 'Your description mentions [X] which is handled by [Y office], but you selected [Z office].' OR 'Your description does not match the subject you selected.' Otherwise empty string)",
  "language": "english" | "tagalog" | "bisaya" | "mixed",
  "isSpam": boolean,
  "tone": "appropriate" | "inappropriate" | "aggressive" | "neutral"
}`;

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
      errors.push(aiAnalysis.relevanceReason || 'Your description does not match the selected subject or office. Please ensure your description is relevant to what you selected.');
    }

    if (aiAnalysis.isSpam) {
      errors.push('Your description appears to contain spam, gibberish, or is incomprehensible. Please provide a clear, meaningful explanation in proper English, Tagalog, or Bisaya.');
    }

    if (aiAnalysis.tone === 'inappropriate' || aiAnalysis.tone === 'aggressive') {
      errors.push('Please maintain a respectful and professional tone in your request.');
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
