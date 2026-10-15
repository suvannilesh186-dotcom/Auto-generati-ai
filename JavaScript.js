// Firebase & Dashboard Logic Script (Pure JavaScript)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInWithRedirect } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { CONFIG } from './config.js';

let auth;

try {
    const firebaseConfig = {
        apiKey: CONFIG.firebaseApiKey,
        authDomain: CONFIG.authDomain,
        projectId: CONFIG.projectId,
        storageBucket: CONFIG.storageBucket,
        messagingSenderId: CONFIG.messagingSenderId,
        appId: CONFIG.appId,
        measurementId: CONFIG.measurementId
    };

    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);

    // यूजर लॉगिन स्टेट चेक करना
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const emailElem = document.getElementById('user-email');
            const nameElem = document.getElementById('channel-name');
            const logoElem = document.getElementById('channel-logo');

            if (emailElem) emailElem.innerText = user.email || "Connected User";
            if (nameElem && user.displayName) nameElem.innerText = user.displayName;
            if (logoElem && user.photoURL) logoElem.src = user.photoURL;
        } else {
            window.location.href = 'index.html';
        }
    });

    // लॉगआउट फंक्शनैलिटी
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            signOut(auth).then(() => {
                localStorage.removeItem('agc_access_token');
                window.location.href = 'index.html';
            }).catch((error) => {
                console.error("Logout Error:", error);
            });
        });
    }

} catch (err) {
    console.error("Firebase Setup Error:", err);
}

// साइडबार टॉगल लॉजिक
const menuToggleBtn = document.getElementById('menuToggleBtn');
const sidebar = document.getElementById('sidebar');

if (menuToggleBtn && sidebar) {
    menuToggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
}

// स्विच चैनल लॉजिक (अकाउंट/चैनल सेलेक्टर प्रॉम्प्ट के साथ)
const switchBtn = document.getElementById('switchChannelBtn');
if (switchBtn) {
    switchBtn.addEventListener('click', async () => {
        try {
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });
            
            const result = await signInWithPopup(auth, provider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            if (credential && credential.accessToken) {
                localStorage.setItem('agc_access_token', credential.accessToken);
                window.location.reload();
            }
        } catch (error) {
            console.warn("Popup failed, trying redirect...", error);
            try {
                const provider = new GoogleAuthProvider();
                provider.setCustomParameters({ prompt: 'select_account' });
                await signInWithRedirect(auth, provider);
            } catch (redirectError) {
                console.error("Switch Channel Redirect Error:", redirectError);
            }
        }
    });
}
