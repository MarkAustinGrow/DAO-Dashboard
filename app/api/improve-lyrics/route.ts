import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Log the API key status (without revealing the key)
console.log('OpenAI API Key status:', process.env.OPENAI_API_KEY ? 'Configured' : 'Missing');

export async function POST(request: NextRequest) {
  console.log('Received request to improve lyrics');
  
  try {
    const { currentLyrics, userGuidance } = await request.json();
    console.log('Request data received:', { 
      lyricsLength: currentLyrics?.length || 0,
      guidanceLength: userGuidance?.length || 0 
    });

    // Validate input
    if (!currentLyrics) {
      console.log('Error: Current lyrics are required');
      return NextResponse.json(
        { error: 'Current lyrics are required' },
        { status: 400 }
      );
    }

    // Construct the prompt for OpenAI
    const prompt = constructPrompt(currentLyrics, userGuidance);
    console.log('Prompt constructed, length:', prompt.length);

    // Call OpenAI API
    console.log('Calling OpenAI API...');
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Using a more widely available model
      messages: [
        {
          role: 'system',
          content: 'You are a professional lyricist and songwriter with expertise in various musical genres. Your task is to improve song lyrics based on user guidance while maintaining the original structure and theme.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });
    console.log('OpenAI API response received');

    // Extract the improved lyrics from the response
    const improvedLyrics = response.choices[0]?.message?.content || '';
    console.log('Improved lyrics generated, length:', improvedLyrics.length);

    return NextResponse.json({ improvedLyrics });
  } catch (error: any) {
    console.error('Error improving lyrics:', error);
    
    // More detailed error logging
    if (error.response) {
      console.error('OpenAI API error details:', error.response.data);
      return NextResponse.json(
        { error: `OpenAI API error: ${error.response.data?.error?.message || 'Unknown API error'}` },
        { status: error.response.status || 500 }
      );
    }
    
    // Check for network errors
    if (error.message) {
      console.error('Error message:', error.message);
      return NextResponse.json(
        { error: `Error: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to improve lyrics' },
      { status: 500 }
    );
  }
}

// Helper function to construct the prompt
function constructPrompt(currentLyrics: string, userGuidance: string): string {
  return `
I have the following song lyrics that I'd like you to improve:

"""
${currentLyrics}
"""

Here's my guidance on how I'd like you to improve these lyrics:
${userGuidance || 'Make the lyrics more engaging and polished while maintaining the original theme and structure.'}

Please provide the improved version of the lyrics. Maintain the same structure (verses, chorus, etc.) and overall theme, but enhance the lyrics based on the guidance. Return ONLY the improved lyrics without any additional explanation.
`;
}
