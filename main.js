let API_KEY = localStorage.getItem("API_KEY");
if (API_KEY && API_KEY !== "null") document.querySelector("div.API_KEY").classList.add("hide");


async function chatgpt_api(messages)
{
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("API_KEY")}`,
        },
        body: JSON.stringify({ model: "gpt-3.5-turbo", messages: messages, stream: true})
    });
    return await response.json();
}

async function whisper_api(audioBlob)
{
    var formData = new FormData();
    formData.append('model', 'whisper-1');
    formData.append('file', audioBlob, 'audio.wav');

    const response = await fetch("https://api.openai.com/v1/audio/translations", {
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${localStorage.getItem("API_KEY")}`,
        },
        body: formData
    });
    return await response.json();
}

var mediaRecorder;

function start_recording()
{
    navigator.mediaDevices.getUserMedia({ audio: true })
    .then(function(stream) {
      mediaRecorder = new MediaRecorder(stream);
      var chunks = [];
  
      mediaRecorder.start();
  
      mediaRecorder.ondataavailable = function(e) {
        chunks.push(e.data);
      }
  
      mediaRecorder.onstop = async function(e) {
        var blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
        var result = await whisper_api(blob);
        console.log(result);
      }
    });    
}

document.addEventListener("keydown", e=>
{
    if (e.key === " ") start_recording();
});

document.addEventListener("keyup", e=>
{
    if (e.key === " ") mediaRecorder.stop();
});