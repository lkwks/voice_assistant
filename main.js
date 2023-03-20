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

async function whisper_api(filepath)
{
    var formData = new FormData();
    formData.append('model', 'whisper-1');
    formData.append('file', file);

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
navigator.mediaDevices.getUserMedia({ audio: true })
    .then( stream => {
      var chunks=[];
      mediaRecorder = new MediaRecorder(stream, {type: 'audio/webm'});
      mediaRecorder.ondataavailable = e => chunks.push(e.data);
  
      mediaRecorder.onstop = async e => {
        var blob = new Blob(chunks, { 'type' : 'audio/webm' });
        var file = new File([blob], "audio.webm", { type: "audio/webm;" });
        console.log(URL.createObjectURL(file));
        var result = await whisper_api(URL.createObjectURL(file));
        console.log(result);
      };
    });

document.addEventListener("keydown", e=>
{
    if (e.key === " " && mediaRecorder.state !== "recording") mediaRecorder.start();
});

document.addEventListener("keyup", e=>
{
    if (e.key === " ") mediaRecorder.stop();
});



const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', (event) => {
  whisper_api(event.target.files[0]));
});
