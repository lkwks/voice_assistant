
if (localStorage.getItem("SYSTEM_MESSAGE"))
    document.querySelector("div.SYSTEM_MESSAGE > textarea").innerText = localStorage.getItem("SYSTEM_MESSAGE");

if (localStorage.getItem("TTS_API_KEY"))
    document.querySelector("div.TTS_API_KEY > input").value = localStorage.getItem("TTS_API_KEY");

if (localStorage.getItem("API_KEY"))
    document.querySelector("div.API_KEY > input").value = localStorage.getItem("API_KEY");

if (localStorage.getItem("SRC"))
    document.querySelector("div.SRC > input").value = localStorage.getItem("SRC");

document.body.addEventListener("click", e => {
    if (e.target.nodeName === "BUTTON")
    {
        const parentNode = e.target.parentNode.parentNode.parentNode;
        if (parentNode.classList.contains("TTS_API_KEY"))
            localStorage.setItem("TTS_API_KEY", parentNode.querySelector("input").value);
        if (parentNode.classList.contains("API_KEY"))
            localStorage.setItem("API_KEY", parentNode.querySelector("input").value);
        if (parentNode.classList.contains("SRC"))
            localStorage.setItem("SRC", parentNode.querySelector("input").value);
        if (parentNode.classList.contains("SYSTEM_MESSAGE"))
            localStorage.setItem("SYSTEM_MESSAGE", parentNode.querySelector("textarea").value);
    }
});
