// 1. सबसे पहले यह चेक करने के लिए कि जावास्क्रिप्ट फाइल लोड हो रही है या नहीं
alert("JS File Loaded Successfully!");

// 2. Firebase और कॉन्फ़िगरेशन इम्पोर्ट करना
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { CONFIG } from './config.js';

// 3. Firebase सेटिंग्स सेट करना
const firebaseConfig = {
    apiKey: CONFIG.firebaseApiKey,
    authDomain: CONFIG.authDomain,
    projectId: CONFIG.projectId,
    storageBucket: CONFIG.storageBucket,
    messagingSenderId: CONFIG.messagingSenderId,
    appId: CONFIG.appId,
    measurementId: CONFIG.measurementId
};

let app, auth, googleProvider;

// 4. Firebase को सुरक्षित रूप से शुरू करना
try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    console.log("Firebase initialized successfully");
} catch (e) {
    console.error("Firebase Init Error:", e);
    alert("Firebase Init Error: " + e.message);
}

// 5. जब यूजर 'Sign in with Google' बटन पर क्लिक करेगा, तब यह फंक्शन चलेगा
window.handleLoginDirect = async function() {
    alert("Button Clicked & Working!");
    try {
        // पहले पॉप-अप से लॉगिन की कोशिश करेगा
        const result = await signInWithPopup(auth, googleProvider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential) {
            const accessToken = credential.accessToken;
            localStorage.setItem('agc_access_token', accessToken);
            window.location.href = 'dashboard.html';
        }
    } catch (error) {
        console.warn("Popup failed, trying redirect...", error);
        try {
            // अगर पॉप-अप ब्लॉक हुआ, तो ऑटोमैटिक रीडायरेक्ट मेथड चल जाएगा
            await signInWithRedirect(auth, googleProvider);
        } catch (redirectError) {
            console.error("Redirect Login Error:", redirectError);
            alert("Login Failed: " + redirectError.message);
        }
    }
};
