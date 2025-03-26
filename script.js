const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");

// API setup
const API_KEY = "YOUR_API_KEY"; // Replace with your actual API key
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

const userData = {
    message: null
}


// Create message element with dynamic classes and return it
const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}


// Generate bot response using API
const generateBotResponse = async () => {
    // API request options
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: userData.message }]
            }]

        })
    }

    try  {
        // Fetch bot response from API
        const response = await fetch(API_URL, requestOptions);
        const data = await response.json();

        if(!response.ok) {
            const errorData = await response.json();  // Read the response body for more details
            console.error("API Error:", response.status, errorData); // Log status and error
            throw new Error(`API request failed with status ${response.status}: ${errorData.error.message || "Unknown error"}`);
        }


        // Remove the thinking indicator
        const thinkingDiv = document.querySelector(".bot-message.thinking");
        if (thinkingDiv) {
            thinkingDiv.remove();
        }

        // Display bot response
        let botMessage = data.candidates[0].content.parts[0].text;

        // Remove asterisks (or other unwanted characters)
        botMessage = botMessage.replace(/\*/g, "");  // Remove all asterisks
        // botMessage = botMessage.replace(/_/g, ""); //Remove all underscores (for italics)
        // botMessage = botMessage.replace(/`/g, ""); //Remove all backticks (for code)


        const messageContent = `<div class="message-text">${botMessage}</div>`;
        const botResponseDiv = createMessageElement(messageContent, "bot-message");
        chatBody.appendChild(botResponseDiv);
        chatBody.scrollTop = chatBody.scrollHeight;



    }   catch (error) {
        console.error("Error fetching bot response:", error);
        // Handle the error, perhaps display a message to the user
        const thinkingDiv = document.querySelector(".bot-message.thinking");
        if (thinkingDiv) {
            thinkingDiv.remove();
        }
        const errorMessageContent = `<div class="message-text">Sorry, I encountered an error. Please try again.</div>`;
        const errorResponseDiv = createMessageElement(errorMessageContent, "bot-message", "error");
        chatBody.appendChild(errorResponseDiv);
        chatBody.scrollTop = chatBody.scrollHeight;

    }

}

// Handle outgoing user messages
const handleOutgoingMessage = (e) => {
    e.preventDefault();

    userData.message = messageInput.value.trim();
    userData.message = userData.message.replace(/\*/g, ""); //ADDITION: Remove all asterisks from user message
    messageInput.value = "";
    if (!userData.message) return; // Prevent sending empty messages

    // Create and display user message
    const messageContent = `<div class="message-text"></div>`;  // Use backticks for template literals

    const outgoingMessageDiv = createMessageElement(messageContent, "user-message"); // Use messageContent, not userMessage
    outgoingMessageDiv.querySelector(".message-text").textContent = userData.message;
    chatBody.appendChild(outgoingMessageDiv);

    messageInput.value = ""; // Clear the input field after sending
    chatBody.scrollTop = chatBody.scrollHeight;

    // Simulate bot response with thinking indicator after a delay
    setTimeout(() => {
        const messageContent = `
            <div class="bot-message-container">
                <svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
                    <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4 .7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5z"></path>
                </svg>

                <div class="message-text">
                    <div class = "thinking-indicator">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>
                </div>
            </div>
            `;

        const incomingMessageDiv = createMessageElement(messageContent, "bot-message", "thinking");

        chatBody.appendChild(incomingMessageDiv);

        chatBody.scrollTop = chatBody.scrollHeight;
        generateBotResponse();

    }, 600);
}

//Handle Enter key press for sending message
messageInput.addEventListener("keydown", (e) => {
    if(e.key === "Enter") {
        handleOutgoingMessage(e);
    }
});

sendMessageButton.addEventListener("click", (e) => handleOutgoingMessage(e)); //Corrected addEventListener typo