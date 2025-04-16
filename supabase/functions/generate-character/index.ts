// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.com/manual/getting_started/setup_your_environment

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";

interface RequestBody {
  action: string;
  [key: string]: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json() as RequestBody;

    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get the user from the request
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let result;

    switch (action) {
      case "generateBasic":
        result = await generateBasicCharacter(params.name, params.role, params.description);
        break;
      case "enhanceBackground":
        result = await enhanceCharacterBackground(
          params.character,
          params.background,
          params.personality,
          params.interests
        );
        break;
      case "addInteractions":
        result = await addInteractionExamples(
          params.character,
          params.communicationStyle,
          params.exampleScenarios
        );
        break;
      case "refineCharacter":
        result = await refineCharacter(
          params.character,
          params.refinementPrompt
        );
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Generate initial character from basic info
async function generateBasicCharacter(name: string, role: string, description: string) {
  const prompt = `
    Create a character profile for an AI agent named "${name}" who is a ${role}.
    
    Description: ${description}
    
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
  
  return await callOpenAI(prompt);
}

// Enhance character with background and personality
async function enhanceCharacterBackground(
  character: any,
  background: string,
  personality: string,
  interests: string
) {
  const prompt = `
    Enhance this character profile with additional background and personality details:
    
    Current character: ${JSON.stringify(character)}
    
    Additional background information: ${background}
    Personality traits: ${personality}
    Interests and expertise: ${interests}
    
    Update the character JSON to incorporate these details, particularly enhancing the bio, lore, adjectives, and topics sections.
    Return the complete updated character JSON.
  `;
  
  return await callOpenAI(prompt);
}

// Add interaction examples
async function addInteractionExamples(
  character: any,
  communicationStyle: string,
  exampleScenarios: string
) {
  const prompt = `
    Generate interaction examples for this character:
    
    Character: ${JSON.stringify(character)}
    
    Communication style notes: ${communicationStyle}
    Example scenarios: ${exampleScenarios}
    
    Add realistic messageExamples (3-5 conversation snippets) and postExamples (3-5 social media posts) that reflect how this character would communicate.
    
    For messageExamples, use this format:
    [
      {
        "user": "{{user1}}",
        "content": {
          "text": "example question"
        }
      },
      {
        "user": "${character.name}",
        "content": {
          "text": "example response in character"
        }
      }
    ]
    
    Return the complete updated character JSON with new messageExamples and postExamples.
  `;
  
  return await callOpenAI(prompt);
}

// Refine character based on specific instructions
async function refineCharacter(character: any, refinementPrompt: string) {
  const prompt = `
    Refine this character based on the following instructions:
    
    Character: ${JSON.stringify(character)}
    
    Refinement instructions: ${refinementPrompt}
    
    Return the complete updated character JSON with the requested changes.
  `;
  
  return await callOpenAI(prompt);
}

// Helper function to call OpenAI API
async function callOpenAI(prompt: string) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
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
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to parse OpenAI response: ${error.message}`);
  }
}
