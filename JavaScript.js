// ==========================================
// AGC.AI Dashboard & Chat JavaScript Logic (Popup Fix)
// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { CONFIG } from './config.js';

let auth;

// YouTube Channel Data Fetching Function
async function fetchYouTubeChannelData(accessToken) {
    try {
        const response = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            const channel = data.items[0];
            const channelName = channel.snippet.title;
            const channelLogo = channel.snippet.thumbnails.default.url;
            const subscriberCount = channel.statistics.subscriberCount;

            const nameElem = document.getElementById('channel-name');
            const logoElem = document.getElementById('channel-logo');

            if (nameElem) nameElem.innerText = channelName;
            if (logoElem) logoElem.src = channelLogo;

            const profileInfo = document.querySelector('.profile-info');
            if (profileInfo) {
                let subSpan = document.getElementById('subCount');
                if (!subSpan) {
                    subSpan = document.createElement('span');
                    subSpan.id = 'subCount';
                    subSpan.style.display = 'block';
                    subSpan.style.fontSize = '11px';
                    subSpan.style.color = '#58a6ff';
                    subSpan.style.marginTop = '2px';
                    profileInfo.appendChild(subSpan);
                }
                subSpan.innerText = `Subscribers: ${subscriberCount}`;
            }
        }
    } catch (error) {
        console.error("YouTube API Error:", error);
    }
}

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

            const token = localStorage.getItem('agc_access_token');
            if (token) {
                fetchYouTubeChannelData(token);
            }
        } else {
            if (!window.location.href.includes('index.html')) {
                window.location.href = 'index.html';
            }
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

// डायरेक्ट पॉपअप लॉगिन फंक्शन (जो क्लिक करते ही तुरंत टोकन और डेटा कैप्चर करेगा)
const handleYouTubePopupLogin = async () => {
    try {
        const provider = new GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/youtube.readonly');
        provider.setCustomParameters({ prompt: 'select_account' });
        
        const result = await signInWithPopup(auth, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        
        if (credential && credential.accessToken) {
            localStorage.setItem('agc_access_token', credential.accessToken);
            fetchYouTubeChannelData(credential.accessToken);
            window.location.reload(); // पेज रिफ्रेश होकर सब लोड कर देगा
        }
    } catch (error) {
        console.error("Popup Login Error:", error);
    }
};

const switchBtn = document.getElementById('switchChannelBtn');
if (switchBtn) {
    switchBtn.addEventListener('click', handleYouTubePopupLogin);
}

const loginBtn = document.getElementById('loginBtn');
if (loginBtn) {
    loginBtn.addEventListener('click', handleYouTubePopupLogin);
}

// AI Chat Box Logic
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendChatBtn = document.getElementById('sendChatBtn');

if (sendChatBtn && chatInput && chatMessages) {
    const handleSendMessage = () => {
        const text = chatInput.value.trim();
        if (!text) return;

        const userMsg = document.createElement('div');
        userMsg.className = 'message user-message';
        userMsg.innerText = text;
        chatMessages.appendChild(userMsg);

        chatInput.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;

        setTimeout(() => {
            const aiMsg = document.createElement('div');
            aiMsg.className = 'message ai-message';
            aiMsg.innerText = "मैंने आपका सवाल सुन लिया है। जल्द ही इसे AI API से कनेक्ट किया जाएगा!";
            chatMessages.appendChild(aiMsg);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1000);
    };

    sendChatBtn.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });
}
