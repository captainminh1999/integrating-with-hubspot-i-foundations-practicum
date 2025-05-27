require('dotenv').config(); // Make sure this line is UNCOMMENTED

const express = require('express');
const axios = require('axios');
const app = express();

// Set the port for the server. In cloud environments (like Theia/Gitpod),
// the port is often provided via an environment variable.
// We found that 3000 works with your proxy URL (minhnguyen1-3000), so setting it here.
const PORT = process.env.PORT || 3000;
// Listen on all available network interfaces, essential for cloud deployments.
const HOST = '0.0.0.0';

// Configure Pug as the templating engine
app.set('view engine', 'pug');
// Set the directory where Pug templates are located
app.set('views', './views');

// Serve static files (like CSS) from the 'public' directory
app.use(express.static(__dirname + '/public'));

// Middleware to parse URL-encoded bodies (from HTML forms)
app.use(express.urlencoded({ extended: true }));
// Middleware to parse JSON bodies (if you were receiving JSON)
app.use(express.json());

// **************************************************************************
// * IMPORTANT: Your PRIVATE_APP_ACCESS token is now loaded from .env.    *
// * Do NOT hardcode it here.                                             *
// **************************************************************************
const PRIVATE_APP_ACCESS = process.env.HUBSPOT_ACCESS_TOKEN; // Loaded from your .env file

// IMPORTANT: Replace 'YOUR_CUSTOM_OBJECT_API_NAME_HERE' with the actual
// internal name of your custom object from HubSpot (e.g., 'p12345678_book').
const CUSTOM_OBJECT_API_NAME = 'p441853140_book'; // <--- UPDATE THIS!

// Base URL for HubSpot CRM objects API
const HUBSPOT_CRM_API_BASE = 'https://api.hubspot.com/crm/v3/objects';


// ROUTE 1: Homepage - Display existing custom object records
app.get('/', async (req, res) => {
    // HubSpot API endpoint to retrieve custom objects
    // The `properties` parameter is crucial to specify which custom properties you want to retrieve.
    // Make sure these match the INTERNAL API NAMES of your custom object properties.
    // Example properties: 'name', 'author', 'genre', 'publication_date'
    const customObjectApiUrl = `${HUBSPOT_CRM_API_BASE}/${CUSTOM_OBJECT_API_NAME}?properties=name,author,genre,publication_date`; // <--- UPDATE WITH YOUR ACTUAL PROPERTY INTERNAL NAMES

    try {
        const response = await axios.get(customObjectApiUrl, {
            headers: {
                Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
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
            `${HUBSPOT_CRM_API_BASE}/${CUSTOM_OBJECT_API_NAME}`,
            { properties: newRecordProperties },
            {
                headers: {
                    Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log('Custom object record created:', response.data);
        res.redirect('/'); // Redirect to the homepage after successful creation
    } catch (error) {
        console.error('Error creating custom object record:', error.response ? error.response.data : error.message);
        // You might want to render an error page or send an an error message to the user
        res.status(500).send('Error creating custom object record.');
    }
});


/**
* * This is sample code to give you a reference for how you should structure your calls.

* * App.get sample
app.get('/contacts', async (req, res) => {
    const contacts = 'https://api.hubspot.com/crm/v3/objects/contacts';
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    }
    try {
        const resp = await axios.get(contacts, { headers });
        const data = resp.data.results;
        res.render('contacts', { title: 'Contacts | HubSpot APIs', data });
    } catch (error) {
        console.error(error);
    }
});

* * App.post sample
app.post('/update', async (req, res) => {
    const update = {
        properties: {
            "favorite_book": req.body.newVal
        }
    }

    const email = req.query.email;
    const updateContact = `https://api.hubspot.com/crm/v3/objects/contacts/${email}?idProperty=email`;
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    };

    try {
        await axios.patch(updateContact, update, { headers } );
        res.redirect('back');
    } catch(err) {
        console.error(err);
    }

});
*/

// Start the server
app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
    // For cloud environments, the actual access URL will be the proxy URL provided by the platform.
    console.log(`Access your app via the provided proxy URL: https://minhnguyen1-${PORT}.theiadockernext-0-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/`);
});