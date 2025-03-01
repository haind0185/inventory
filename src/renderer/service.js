import axios from 'axios';

const webhookURL = "https://discord.com/api/webhooks/1345277617296904253/B_o_pVFfsqc2HMhNw42wnT8Y_cjcM4XmJvWDZdNf8mTsp-LYldVBgPHtdWToMIfyG-aj"

const serviceSendMessage = (content = '', username = "Inventory Bot") => {
    const message = {
        content: content,
        username: username,
    };
    axios.post(webhookURL, message)
        .then(response => console.log("Message sent!", response.data))
        .catch(error => console.error("Error sending message:", error));
}

export {
    serviceSendMessage
}