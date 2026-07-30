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
    const prompt = `You are a STRICT content moderator for a school ticketing system. Analyze the following student request and provide a JSON response.

Subject: "${subject}"
Description: "${description}"

CRITICAL: The description MUST be directly related to the subject. Be VERY STRICT about relevance.

Analyze this content and respond ONLY with a valid JSON object (no markdown, no extra text) in this exact format:
{
  "hasProfanity": boolean,
  "profanityReason": "string (only if hasProfanity is true)",
  "isRelevant": boolean,
  "relevanceReason": "string (explain why it's not relevant if isRelevant is false)",
  "language": "english" | "tagalog" | "bisaya" | "mixed" | "unknown",
  "isSpam": boolean,
  "tone": "appropriate" | "inappropriate" | "aggressive" | "neutral"
}

Profanity Detection:
- Check for bad words in English, Tagalog, and Bisaya
- Examples: fuck, shit, puta, gago, tangina, yawa, buang, etc.
- Detect indirect profanity or offensive language
- Consider context (medical terms or legitimate words are OK)

Relevance Check - BE VERY STRICT BUT LANGUAGE-AWARE:
- The description MUST directly relate to the chosen subject
- **IMPORTANT**: If the text is in Tagalog or Bisaya (non-English), be MORE LENIENT with relevance checking
  * Focus on key words that might relate to the subject
  * Filipino languages may express topics differently than English
  * Only flag as irrelevant if you're CERTAIN it's completely unrelated
- If the subject contains "Refund" or "Refund Request":
  * Look for words: refund, return, money back, give back, reimburse, downpayment, deposit, payment
  * Tagalog/Bisaya: refund, ibalik, bumalik, kwarta, bayad
  * Accept if it mentions wanting money back for any school-related item (uniforms, books, fees, etc.)
  * **IMPORTANT**: Mentioning uniforms, books, downpayment, or tuition is RELEVANT for refund requests
- If the subject is "Receipt Request":
  * Description MUST be about requesting a receipt, proof of payment, official receipt, OR
  * Accept if asking for documentation of payment
  * **NOT VALID**: Asking for refund, money back = This should be "Refund Request" instead
  * Valid words: receipt, OR, official receipt, resibo, proof of payment, payment confirmation
- If the subject is "Balance Verification" or financial topics:
  * Look for words: balance, bayad, payment, tuition, utang, kwarta, pesos, bill, refund
  * Bisaya: balance, bayad, kwarta, utang
  * Accept if it mentions checking, asking, inquiring about financial matters
- If the subject is "Document Request":
  * Description MUST be about requesting school documents
  * Valid documents: Form 137, Form 138, transcript, diploma, certificate, good moral, clearance, TOR, grades sheet, enrollment form
  * Accept any mention of these forms or general document requests
  * "Form 137" or "Form 138" = VALID for Document Request
- If the subject is "Transcript Request":
  * Description MUST be about transcript, diploma, certifications, academic records, TOR (Transcript of Records)
  * Description about library, tuition, personal issues = NOT RELEVANT
- If the subject is "Certificate Request":
  * Description MUST be about certificates, clearance, good moral certificate, enrollment certificate
  * Description about library, tuition = NOT RELEVANT
- If the subject is "Tuition Payment Inquiry":
  * Description MUST be about tuition fees, payment methods, payment schedules, payment issues
  * Description about mental health, grades, books, library, etc. = NOT RELEVANT
- If the subject is "Library Book Return":
  * Description MUST be about returning books, book damage, lost books, renewal
  * Description about tuition, grades, scholarships = NOT RELEVANT
- If the subject is "Grade Inquiry":
  * Description MUST be about grades, scores, academic performance
  * Description about mental health, tuition, library = NOT RELEVANT
- If the subject is "Scholarship Application":
  * Description MUST be about scholarships, financial aid, grants
  * Description about grades alone, personal issues unrelated to finances = NOT RELEVANT

**SPECIAL RULE FOR BISAYA/TAGALOG**: If you detect the language is Bisaya or Tagalog, be MORE LENIENT with relevance. Only mark as irrelevant if you're absolutely certain it's talking about a completely different topic (like talking about library books when subject is about tuition payment).

**SPECIAL RULE FOR DOCUMENTS**: Form 137, Form 138, and similar school forms are valid for "Document Request", "Certificate Request", and "Transcript Request" subjects.

Examples of MISMATCHES (set isRelevant to FALSE):
- Subject: "Tuition Payment Inquiry" + Description: "problems with mental health" = NOT RELEVANT
- Subject: "Library Book Return" + Description: "I need to pay my tuition" = NOT RELEVANT  
- Subject: "Grade Inquiry" + Description: "How do I pay my fees" = NOT RELEVANT
- Subject: "Transcript Request" + Description: "I lost a library book" = NOT RELEVANT
- Subject: "Receipt Request" + Description: "I want a refund for my payment" = NOT RELEVANT (should be Refund Request)

Examples of VALID MATCHES (set isRelevant to TRUE):
- Subject: "Refund Request" + Description: "I want a refund for uniforms and books" = RELEVANT
- Subject: "Refund Request" + Description: "I want to ask for a refund in my downpayment" = RELEVANT
- Subject: "Receipt Request" + Description: "I need a receipt for my tuition payment" = RELEVANT
- Subject: "Receipt Request" + Description: "Can I get an official receipt" = RELEVANT
- Subject: "Balance Verification" + Description: "How much do I owe for tuition" = RELEVANT
- Subject: "Document Request" + Description: "I need Form 137" = RELEVANT

ONLY accept descriptions that directly address the selected subject topic!

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
