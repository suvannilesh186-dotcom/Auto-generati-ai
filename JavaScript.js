import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { CONFIG } from './config.js';

const firebaseConfig = {
    apiKey: CONFIG.firebaseApiKey,
    authDomain: CONFIG.authDomain,
    projectId: CONFIG.projectId,
    storageBucket: CONFIG.storageBucket,
    messagingSenderId: CONFIG.messagingSenderId,
    appId: CONFIG.appId
};

let app, auth, googleProvider;
try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.addScope('https://www.googleapis.com/auth/youtube.readonly');
} catch (e) {
    console.error("Firebase Init Error:", e);
}

function showError(message) {
    const errDiv = document.getElementById('error-display');
    if (errDiv) {
        errDiv.textContent = "Error: " + message;
    }
}

async function fetchYouTubeChannel(accessToken) {
    try {
        const response = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const data = await response.json();
        if (data.items && data.items.length > 0) {
            console.log("Connected YouTube Channel:", data.items[0].snippet.title);
        }
    } catch (error) {
        console.error("Error fetching YouTube channel:", error);
    }
}

// डायरेक्ट क्लिक फंक्शन जो HTML बटन से कॉल होगा
window.handleLoginDirect = async function() {
    alert("Direct click working!");
    try {
        await signInWithRedirect(auth, googleProvider);
    } catch (error) {
        console.error("Login Error:", error);
        showError(error.message);
    }
};

window.addEventListener('DOMContentLoaded', async () => {
    const savedToken = localStorage.getItem('agc_access_token');
    if (savedToken) {
        fetchYouTubeChannel(savedToken);
    }

    try {
        const result = await getRedirectResult(auth);
        if (result) {
            const credential = GoogleAuthProvider.credentialFromResult(result);
            if (credential) {
                const accessToken = credential.accessToken;
                localStorage.setItem('agc_access_token', accessToken);
                await fetchYouTubeChannel(accessToken);
                window.location.href = 'dashboard.html';
            }
        }
    } catch (error) {
        console.error("Redirect Login Error:", error);
        showError(error.message);
    }
});
