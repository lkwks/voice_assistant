
if (localStorage.getItem("SYSTEM_MESSAGE"))
    document.querySelector("div.SYSTEM_MESSAGE  textarea").innerText = localStorage.getItem("SYSTEM_MESSAGE");

if (localStorage.getItem("USER_NAME"))
    document.querySelector("div.USER_NAME  input").value = localStorage.getItem("USER_NAME");

if (localStorage.getItem("TTS_API_KEY"))
    document.querySelector("div.TTS_API_KEY  input").value = localStorage.getItem("TTS_API_KEY");


if (localStorage.getItem("API_SERVICE_PROVIDER"))
    document.querySelector("div.API_SERVICE_PROVIDER  input").value = localStorage.getItem("API_SERVICE_PROVIDER");

if (localStorage.getItem("TTS_API_KEY_ELEVENLABS"))
    document.querySelector("div.TTS_API_KEY_ELEVENLABS  input").value = localStorage.getItem("TTS_API_KEY_ELEVENLABS");

if (localStorage.getItem("VOICE_ID_ELEVENLABS"))
    document.querySelector("div.VOICE_ID_ELEVENLABS  input").value = localStorage.getItem("VOICE_ID_ELEVENLABS");

if (localStorage.getItem("API_KEY"))
    document.querySelector("div.API_KEY  input").value = localStorage.getItem("API_KEY");

if (localStorage.getItem("SRC"))
    document.querySelector("div.SRC  input").value = localStorage.getItem("SRC");

document.body.addEventListener("click", e => {
    if (e.target.nodeName === "BUTTON")
    {
        const parentNode = e.target.parentNode.parentNode.parentNode;
        if (parentNode.classList.contains("USER_NAME"))
            localStorage.setItem("USER_NAME", parentNode.querySelector("input").value);
        if (parentNode.classList.contains("TTS_API_KEY"))
            localStorage.setItem("TTS_API_KEY", parentNode.querySelector("input").value);
        if (parentNode.classList.contains("API_KEY"))
            localStorage.setItem("API_KEY", parentNode.querySelector("input").value);
        if (parentNode.classList.contains("SRC"))
            localStorage.setItem("SRC", parentNode.querySelector("input").value);
        if (parentNode.classList.contains("SYSTEM_MESSAGE"))
            localStorage.setItem("SYSTEM_MESSAGE", parentNode.querySelector("textarea").value);
        if (parentNode.classList.contains("API_SERVICE_PROVIDER"))
            localStorage.setItem("API_SERVICE_PROVIDER", parentNode.querySelector("input").value);
        if (parentNode.classList.contains("TTS_API_KEY_ELEVENLABS"))
            localStorage.setItem("TTS_API_KEY_ELEVENLABS", parentNode.querySelector("input").value);
        if (parentNode.classList.contains("VOICE_ID_ELEVENLABS"))
            localStorage.setItem("VOICE_ID_ELEVENLABS", parentNode.querySelector("input").value);
    }
});
