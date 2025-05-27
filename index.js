require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;
// Note: HOST = '0.0.0.0' is removed as per your request to use localhost in console log.
// In cloud environments, the proxy usually handles internal routing from 'localhost' anyway.

// Access your HubSpot API key
const PRIVATE_APP_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

// Make sure to add this line to parse incoming request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // For parsing application/json

// Setup your Pug templating engine
app.set('view engine', 'pug');
app.set('views', './views');

// Serve static files from the 'public' directory
// Using __dirname + '/public' for explicit pathing, similar to previous working version
app.use(express.static(__dirname + '/public'));

// Define the base URL for HubSpot API calls (important for custom objects)
const HUBSPOT_API_BASE_URL = 'https://api.hubspot.com/crm/v3/objects';
const CUSTOM_OBJECT_SCHEMA_API_URL = 'https://api.hubspot.com/crm/v3/schemas'; // Added as per your new structure

// Define the name of your custom object in HubSpot. This is the API name!
// IMPORTANT: You need to replace 'your_custom_object_api_name' with the actual
// internal name (usually `p{your_portal_id}_{your_object_name_lowercase}`)
// You can find this in HubSpot by going to Settings > Objects > Custom Objects,
// clicking on your object, and looking at the "Internal name" in the details.
const CUSTOM_OBJECT_API_NAME = 'p441853140_books'; // Updated with your specific custom object API name

// Error handling middleware (optional but good practice)
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.render('error', {
        title: 'Error',
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error : {}
    });
});


// ROUTE 1: Homepage - Display existing custom object records
app.get('/', async (req, res) => {
    // HubSpot API endpoint to retrieve custom objects
    // The `properties` parameter is crucial to specify which custom properties you want to retrieve.
    // Make sure these match the INTERNAL API NAMES of your custom object properties.
    const customObjectApiUrl = `${HUBSPOT_API_BASE_URL}/${CUSTOM_OBJECT_API_NAME}?properties=name,author,genre,publication_date`;

    try {
        const response = await axios.get(customObjectApiUrl, {
            headers: {
                Authorization: `Bearer ${PRIVATE_APP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        const customObjects = response.data.results;
        res.render('homepage', {
            title: 'Custom Objects | Integrating With HubSpot I Practicum',
            data: customObjects
        });
    } catch (error) {
        console.error('Error fetching custom objects:', error.response ? error.response.data : error.message);
        res.status(500).send('Error fetching custom object data.');
    }
});


// ROUTE 2: Form to create or update custom object data
app.get('/update-cobj', (req, res) => {
    res.render('updates', {
        title: 'Update Custom Object Form | Integrating With HubSpot I Practicum'
    });
});


// ROUTE 3: Handle form submission to create a new custom object record
app.post('/update-cobj', async (req, res) => {
    // Collect form data from req.body.
    // The keys (e.g., req.body.name, req.body.author) must match the 'name' attributes in your updates.pug form.
    // The values should be the INTERNAL API NAMES of your HubSpot custom object properties.
    const newRecordProperties = {
        name: req.body.name, // Make sure 'name' matches your custom object's internal property name for "Name"
        author: req.body.author, // Match your 'author' internal property name
        genre: req.body.genre,   // Match your 'genre' internal property name
        publication_date: req.body.publication_date // Example: Match your 'publication_date' internal property name
        // Add all other custom properties from your form here, matching their internal HubSpot names
    };

    try {
        const response = await axios.post(
            `${HUBSPOT_API_BASE_URL}/${CUSTOM_OBJECT_API_NAME}`,
            { properties: newRecordProperties },
            {
                headers: {
                    Authorization: `Bearer ${PRIVATE_APP_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log('Custom object record created:', response.data); // Keep this log as it's useful for confirmation
        res.redirect('/'); // Redirect to the homepage after successful creation
    } catch (error) {
        console.error('Error creating custom object record:', error.response ? error.response.data : error.message);
        // You might want to render an error page or send an error message to the user
        res.status(500).send('Error creating custom object record.');
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
