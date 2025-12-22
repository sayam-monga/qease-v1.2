(function() {
    const SCRIPT_TAG = document.currentScript;
    const PROJECT_ID = SCRIPT_TAG ? SCRIPT_TAG.getAttribute('data-project-id') : null;
    const API_URL = "http://localhost:3001";
    const WAITING_ROOM_URL = "http://localhost:3000/waiting-room"; // Next.js frontend

    if (!PROJECT_ID) {
        console.error("Qease Integration: Missing data-project-id attribute");
        return;
    }

    // 1. Get or Create User ID
    let userId = localStorage.getItem('qease_user_id');
    if (!userId) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('qease_user_id', userId);
    }

    // 2. Check Status
    fetch(`${API_URL}/api/queue/status?projectId=${PROJECT_ID}&userId=${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'active') {
                console.log("Qease: Access Granted");
                // Allow user to stay on page
            } else {
                console.log("Qease: Redirecting to Waiting Room...");
                window.location.href = `${WAITING_ROOM_URL}/${PROJECT_ID}`;
            }
        })
        .catch(err => {
            console.error("Qease Error:", err);
            // Fail open or closed? Usually fail open (let them in) if our servers are down
        });

})();
