// Script to upload the Angus.json file to the server
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Path to the Angus.json file
const angusFilePath = 'C:\\Users\\mark\\Downloads\\Angus.json';

console.log('='.repeat(80));
console.log('ANGUS CHARACTER UPLOAD UTILITY');
console.log('='.repeat(80));

// Function to read the file and upload it
async function uploadAngusFile() {
  try {
    // Check if the file exists
    if (!fs.existsSync(angusFilePath)) {
      console.error(`Error: File not found at ${angusFilePath}`);
      console.log('Please make sure the file path is correct and the file exists.');
      return;
    }
    
    // Read the Angus.json file
    console.log(`Reading file from: ${angusFilePath}`);
    const fileContent = fs.readFileSync(angusFilePath, 'utf8');
    
    // Parse the JSON
    let characterData;
    try {
      characterData = JSON.parse(fileContent);
      console.log('Successfully parsed character data');
      
      // Log the character name for confirmation
      console.log(`Character name: ${characterData.name || 'Unknown'}`);
    } catch (parseError) {
      console.error('Error parsing JSON file:', parseError.message);
      console.log('Please make sure the file contains valid JSON.');
      return;
    }
    
    // Prepare the request options
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/upload-character',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    // Send the request
    console.log('Sending request to upload character...');
    console.log('Server URL: http://localhost:3000/api/upload-character');
    console.log('Using updated API that handles old format characters automatically');
    
    const req = http.request(options, (res) => {
      let data = '';
      
      // Log the response status
      console.log(`Response status: ${res.statusCode} ${res.statusMessage}`);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          // Try to parse the response as JSON
          const result = JSON.parse(data);
          
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('\n✅ Character upload successful!');
            console.log('Uploaded character ID:', result.id);
            console.log('Display name:', result.display_name);
            console.log('Agent name:', result.agent_name);
            console.log('Is active:', result.is_active ? 'Yes' : 'No');
            console.log('\nYou can now view the character in the dashboard at:');
            console.log(`http://localhost:3000/characters/${result.id}`);
          } else {
            console.error('\n❌ Character upload failed:', result.error);
            if (result.details) {
              console.error('Error details:', JSON.stringify(result.details, null, 2));
            }
            console.log('\nPlease check the server logs for more details.');
          }
        } catch (error) {
          console.error('Error parsing response:', error.message);
          console.log('Raw response:', data);
        }
      });
    });
    
    // Set a timeout for the request
    req.setTimeout(10000, () => {
      req.destroy();
      console.error('Request timed out after 10 seconds');
      console.log('Please make sure the server is running at http://localhost:3000');
    });
    
    req.on('error', (error) => {
      console.error('Error during request:', error);
    });
    
    // Send the character data
    req.write(JSON.stringify(characterData));
    req.end();
    
  } catch (error) {
    console.error('Error:', error.message);
    console.log('\nTroubleshooting tips:');
    console.log('1. Make sure the Next.js server is running (npm run dev)');
    console.log('2. Check that the file path is correct');
    console.log('3. Verify that the JSON file is valid');
    console.log('4. Check the server logs for any errors');
    console.log('5. Verify that the Supabase environment variables are set correctly');
  }
}

// Run the upload function
console.log('Starting Angus character upload...');
uploadAngusFile();
