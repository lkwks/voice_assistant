import {whisper_api, audio_manager, answer_stream, messages} from './common.js';

let SYSTEM_MESSAGE = localStorage.getItem("SYSTEM_MESSAGE");
if (!SYSTEM_MESSAGE || SYSTEM_MESSAGE === "null") localStorage.setItem("SYSTEM_MESSAGE", "Don't write your answer too long. Write your answer only in 3 sentences.");

let SRC = localStorage.getItem("SRC");
if (SRC && SRC !== "null")
{
    document.querySelector("div.button > button").innerHTML = "";
    document.querySelector("div.button > button").style.backgroundImage = `url(${SRC})`; 
}

async function start_recording()
{
    document.querySelector("div.answer").innerHTML = "Recording...";
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    answer_stream.signal = true;
    
    audio_manager.audio.pause();
      
    mediaRecorder = new MediaRecorder(stream, {type: 'audio/webm'});
  
    mediaRecorder.ondataavailable = e => chunks.push(e.data);
  
    mediaRecorder.onstop = async () => {
          var blob = new Blob(chunks, { 'type' : 'audio/webm' });
          var file = new File([blob], "audio.webm", { type: "audio/webm;" });
          chunks = [];
          mediaRecorder = null;
          stream.getTracks().forEach(track => track.stop());
        
          document.querySelector("div.answer").innerHTML = `Generating...`;
          var time_before_whisper_api = new Date().getTime();
          setTimeout(()=>{if (document.querySelector("div.answer").innerHTML === `Generating...`) document.querySelector("div.answer").innerHTML = `Timeout! Try it again.`;}, 8000);
          var result = await whisper_api(file);
          if (new Date().getTime() - time_before_whisper_api < 8000)
          {
            if (result.text)
            {
                document.querySelector("div.answer").innerHTML = `You: "${result.text}"`; 

                if (result.text !== "") audio_manager.play_q = [];

                answer_stream.signal = false;
                messages.send_chatgpt(result.text);
            }
            else
                document.querySelector("div.answer").innerHTML = `No messages. Check mic setup.`;           
         } 
    };

    mediaRecorder.start();    
}

function stop_recording()
{
    mediaRecorder.stop();
}



var mediaRecorder = null, chunks = [];

document.querySelector("div.button > button").addEventListener("touchstart", e=>
{
    if (mediaRecorder === null || mediaRecorder && mediaRecorder.state !== "recording") start_recording();
});

document.querySelector("div.button > button").addEventListener("touchend", e=>
{
    if (mediaRecorder) stop_recording();
});

document.querySelector("div.button > button").addEventListener("mousedown", e=>
{
    if (mediaRecorder === null || mediaRecorder && mediaRecorder.state !== "recording") start_recording();
});

document.querySelector("div.button > button").addEventListener("mouseup", e=>
{
    if (mediaRecorder) stop_recording();
});

document.querySelector("div.check_grammar > button").addEventListener("click", e=>{
    messages.check_grammar();
});
