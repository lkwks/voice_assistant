let API_KEY = localStorage.getItem("API_KEY");
if (API_KEY && API_KEY !== "null") document.querySelector("div.API_KEY").classList.add("hide");

class Messages{
    constructor()
    {
        this.messages = [{role: "user", content: ""}];
    }
    
    async send_chatgpt(content)
    {
        this.messages.push({role: "user", content: content});
        alert(this.messages);
        var result = await chatgpt_api(this.messages);
        alert(result.choices[0].message.content);
        this.messages.push(result.choices[0].message);
    }
}

var messages = new Messages();

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
    alert(response.headers.get('content-type'));
    return response;
}

async function whisper_api(file)
{
    console.log(file);
    var formData = new FormData();
    formData.append('model', 'whisper-1');
    formData.append('file', file);

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("API_KEY")}`
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
        var result = await whisper_api(file);
        console.log(result);
        messages.send_chatgpt(result.text);
        chunks = [];
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

document.querySelector("button").addEventListener("touchstart", e=>
{
    if (mediaRecorder.state !== "recording") mediaRecorder.start();
});

document.querySelector("button").addEventListener("touchend", e=>
{
    mediaRecorder.stop();
});

