How to Create a Firebase Project for Phone Auth:

1. Go to the Firebase Console: https://console.firebase.google.com/
2. Click "Add project" and give it a name like "Ward Connect". Follow the prompts to create it.
3. Once the project is created, click on the **Web** icon (`</>`) on the project overview page to add Firebase to your web app.
4. Give the app a nickname (e.g., "Ward Connect Angular") and click **Register app**.
5. Firebase will generate a configuration object that looks something like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "your-project-id.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project-id.appspot.com",
     messagingSenderId: "1234567890",
     appId: "1:1234:web:5678"
   };
   ```
   **Copy this object**—we will need it!
6. Click **Go to console**.
7. In the left menu, select **Authentication** under the "Build" section.
8. Click **Get Started**.
9. Go to the **Sign-in method** tab.
10. Click on **Phone** under the "Native providers" section.
11. Toggle the **Enable** switch.
12. Click **Save**.

Once you have completed these steps, please paste your `firebaseConfig` block here, and I'll jump into the code to finish the integration.
