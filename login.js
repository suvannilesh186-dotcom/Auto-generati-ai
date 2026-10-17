const loginBtn = document.getElementById('loginBtn');
if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            if (credential && credential.accessToken) {
                localStorage.setItem('agc_access_token', credential.accessToken);
                // थोड़ा सा डिले देकर रीडायरेक्ट करें ताकि ब्लैक स्क्रीन न आए
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 300);
            }
        } catch (error) {
            console.error("Popup Error:", error);
            try {
                await signInWithRedirect(auth, googleProvider);
            } catch (redirectError) {
                console.error("Redirect Error:", redirectError);
            }
        }
    });
}
