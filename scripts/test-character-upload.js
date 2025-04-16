// Test script for character upload transformation
const fs = require('fs');
const path = require('path');

// Create a test character in the old format
const testCharacter = {
  "name": "TestCharacter",
  "clients": ["twitter"],
  "modelProvider": "anthropic",
  "settings": {
    "secrets": {},
    "voice": {
      "model": ""
    }
  },
  "plugins": [],
  "bio": [
    "This is a test character.",
    "Created to test the automatic format transformation."
  ],
  "lore": [
    "Has a rich backstory.",
    "Loves testing new features."
  ],
  "knowledge": [],
  "messageExamples": [],
  "postExamples": [],
  "topics": [
    "Testing, debugging, and software development."
  ],
  "style": {
    "all": [
      "Speaks clearly and precisely.",
      "Uses technical language when appropriate."
    ],
    "chat": [
      "Responds helpfully to questions.",
      "Provides detailed explanations."
    ],
    "post": [
      "Writes concise and informative posts.",
      "Uses bullet points for clarity."
    ]
  },
  "adjectives": [
    "helpful",
    "precise",
    "technical"
  ],
  "people": []
};

// Save the test character to a file
const testFilePath = path.join(__dirname, 'test-character.json');
fs.writeFileSync(testFilePath, JSON.stringify(testCharacter, null, 2));
console.log(`Test character saved to ${testFilePath}`);

// Function to upload the character using global fetch
async function uploadCharacter() {
  try {
    // Read the test character file
    const characterData = JSON.parse(fs.readFileSync(testFilePath, 'utf8'));
    
    // Send a POST request to the upload-character endpoint
    const response = await fetch('http://localhost:3000/api/upload-character', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(characterData),
    });
    
    // Parse the response
    const result = await response.json();
    
    // Check if the upload was successful
    if (response.ok) {
      console.log('Character upload successful!');
      console.log('Uploaded character:', result);
    } else {
      console.error('Character upload failed:', result.error);
    }
  } catch (error) {
    console.error('Error during character upload test:', error);
  }
}

// Run the test
console.log('Starting character upload test...');
uploadCharacter();
