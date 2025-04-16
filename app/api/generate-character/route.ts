import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, ...params } = body;
    
    let prompt = '';
    
    switch (action) {
      case 'generateBasic':
        prompt = `
          Create a character profile for an AI agent named "${params.name}" who is a ${params.role}.
          
          Description: ${params.description}
          
          Generate a JSON object with the following structure:
          {
            "bio": [
              "3-5 short biographical facts"
            ],
            "lore": [
              "3-5 background story elements"
            ],
            "adjectives": [
              "5 adjectives that describe the character"
            ],
            "topics": [
              "5 topics the character is knowledgeable about"
            ],
            "style": {
              "all": [
                "3 general communication style traits"
              ],
              "chat": [
                "3 chat-specific communication style traits"
              ],
              "post": [
                "3 social media post style traits"
              ]
            }
          }
        `;
        break;
      
      case 'enhanceBackground':
        prompt = `
          Enhance this character profile with additional background and personality details:
          
          Current character: ${JSON.stringify(params.character)}
          
          Additional background information: ${params.background}
          Personality traits: ${params.personality}
          Interests and expertise: ${params.interests}
          
          Update the character JSON to incorporate these details, particularly enhancing the bio, lore, adjectives, and topics sections.
          Return the complete updated character JSON.
        `;
        break;
      
      case 'addInteractions':
        prompt = `
          Generate interaction examples for this character:
          
          Character: ${JSON.stringify(params.character)}
          
          Communication style notes: ${params.communicationStyle}
          Example scenarios: ${params.exampleScenarios}
          
          Add realistic messageExamples (3-5 conversation snippets) and postExamples (3-5 social media posts) that reflect how this character would communicate.
          
          Return the complete updated character JSON with new messageExamples and postExamples.
        `;
        break;
      
      case 'refineCharacter':
        prompt = `
          Refine this character based on the following instructions:
          
          Character: ${JSON.stringify(params.character)}
          
          Refinement instructions: ${params.refinementPrompt}
          
          Return the complete updated character JSON with the requested changes.
        `;
        break;
      
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
    
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates character profiles for AI agents. Return only valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });
    
    const content = response.choices[0].message.content;
    if (!content) {
      return NextResponse.json({ error: 'No content returned from OpenAI API' }, { status: 500 });
    }
    
    // Parse and return the content
    try {
      const parsedContent = JSON.parse(content);
      return NextResponse.json(parsedContent);
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      return NextResponse.json({ error: 'Failed to parse character data' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to generate character' }, { status: 500 });
  }
}
