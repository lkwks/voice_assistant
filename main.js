import {sentences} from './lib/tokenizer.js';

let API_KEY = localStorage.getItem("API_KEY");
if (API_KEY && API_KEY !== "null") document.querySelector("div.API_KEY").classList.add("hide");

let TTS_API_KEY = localStorage.getItem("TTS_API_KEY");
if (TTS_API_KEY && TTS_API_KEY !== "null") document.querySelector("div.TTS_API_KEY").classList.add("hide");

let SYSTEM_MESSAGE = localStorage.getItem("SYSTEM_MESSAGE");
if (!SYSTEM_MESSAGE || SYSTEM_MESSAGE === "null") localStorage.setItem("SYSTEM_MESSAGE", "Don't write your answer too long. Write your answer only in 3 sentences.");

class Messages{
    constructor()
    {
        this.messages = [{role:"user", content:""}];
        this.messages_token = [0];
        document.querySelector("div.now_system_message").innerHTML = `System message: "${localStorage.getItem("SYSTEM_MESSAGE")}"`;
    }
    
    update_system_message(content)
    {
        document.querySelector("textarea").value = "";
        localStorage.setItem("SYSTEM_MESSAGE", content);
        document.querySelector("div.now_system_message").innerHTML = `System message: "${content}"`;
    }
    
    async send_chatgpt(content)
    {
        this.messages.push({role: "user", content: `${content} (${localStorage.getItem("SYSTEM_MESSAGE")})`});
        this.messages_token.push(content.split(" ").length * 5);
        this.flush_if_too_many_tokens();
        await chatgpt_api(this.messages);
        this.messages.push({role: "assistant", content: answer_stream.answer_set});
    }

    flush_if_too_many_tokens()
    {
        let cutIndex = 0, now_count = 0;
        const sum_of_tokens = arr => arr.reduce((acc, val) => acc + val, 0);
        const token_sum = sum_of_tokens(this.messages_token);
        const bucket_size = 3072;

        if (token_sum < bucket_size) return;

        for (var i=0; i<this.messages.length; i++)
        {
            if (this.messages_token.length >= i)
                now_count += this.messages_token;
            if (now_count > token_sum - bucket_size)
            {
                cutIndex = i;
                break;
            }
        }

        if (cutIndex === this.messages.length-1) cutIndex--;
        this.messages = this.messages.slice(cutIndex, this.messages.length);
        this.messages_token = this.messages_token.slice(cutIndex, this.messages_token.length);
    }

}

class AnswerStream{
    constructor()
    {
        this.now_streaming = false;
        this.now_answer = "";
        this.answer_set = "";
        this.signal = false;
    }
    
    start()
    {
        if (this.now_streaming === false)
        {
            this.answer_set = "";
            this.now_answer = "";
            this.now_streaming = true;
            this.signal = false;
        }
    }
    
    async add_answer(answer)
    {
        this.answer_set += answer;
        this.now_answer += answer;
        const sentences_arr = sentences(this.now_answer);
        if (sentences_arr.length > 1)
        {
            await audio_manager.push_text(sentences_arr[0]);
            this.now_answer = sentences_arr[1];
        }
    }
    
    end()
    {        
        this.signal = false;
        this.now_streaming = false;
    }
}

var messages = new Messages();
var answer_stream = new AnswerStream();

async function chatgpt_api(messages)
{
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("API_KEY")}`,
        },
        body: JSON.stringify({ model: "gpt-3.5-turbo", messages: messages, stream: true})
    }).then(async response => {
        const reader = response.body.getReader();
        let buffer = '';

        return await reader.read().then(async function processResult(result) {
          if (answer_stream.signal) return "";
          buffer += new TextDecoder('utf-8').decode(result.value || new Uint8Array());
            
          var messages = buffer.split('\n\n')
          buffer = messages.pop();
          if (messages.length === 0) 
          {
              answer_stream.end();
              return answer_stream.now_answer;
          }

          for (var message of messages)
             if (message.includes("data: ") && message.includes("[DONE]") === false)
             {
                 answer_stream.start();
                 const val = JSON.parse(message.replace("data: ", ""));
                 if (val.choices[0].delta.content)
                     await answer_stream.add_answer(val.choices[0].delta.content);
             }
          
          return await reader.read().then(processResult);
        });
    });
    audio_manager.push_text(response);
}

async function whisper_api(file)
{
    var formData = new FormData();
    formData.append('model', 'whisper-1');
    formData.append('file', file);
    formData.append('language', 'en');

    console.log(file);
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("API_KEY")}`
        },
        body: formData
    });
    console.log(response);
    if (response.status === 400) return "";
    return await response.json();
}

async function start_recording()
{
    document.querySelector("div.answer").innerHTML = "Recording...";
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    answer_stream.signal = true;
    
    audio_manager.audio.pause();
      
    mediaRecorder = new MediaRecorder(stream, {type: 'audio/webm'});
  
    mediaRecorder.ondataavailable = e => chunks.push(e.data);
  
    mediaRecorder.onstop = async e => {
          var blob = new Blob(chunks, { 'type' : 'audio/webm' });
          var file = new File([blob], "audio.webm", { type: "audio/webm;" });
          chunks = [];
          mediaRecorder = null;
          stream.getTracks().forEach(track => track.stop());
        
          document.querySelector("div.answer").innerHTML = `Generating...`; 
          var result = await whisper_api(file);
          if (result.text)
          {
            document.querySelector("div.answer").innerHTML = `You: "${result.text}"`; 

            if (result.text !== "") audio_manager.play_q = [];

            messages.send_chatgpt(result.text);
          }
          else
            document.querySelector("div.answer").innerHTML = `No messages.`;           
    };

    mediaRecorder.start();    
}

class AudioManager{
    constructor()
    {
        this.play_q = [];
        this.audio = new Audio();
        this.audio.addEventListener("ended", ()=>this.play());
        this.langname = get_langname();
    }
    
    play()
    {
        if (this.play_q.length > 0 && this.audio.paused)
        {
            this.audio.src = this.play_q.shift();
            this.audio.play();
        }
    }
    
    async push_text(text)
    {
        this.play_q.push(await get_tts(text));
        this.play();
    }
}

var audio_manager = new AudioManager();

function get_langname()
{
    const rand_num = Math.floor(Math.random()*10);
    const name_char = 'CEFGHACFAC';
    const lang_code = (rand_num < 5) ? 'US' : ( (rand_num < 8) ? 'GB' : 'AU' );      
    return `en-${lang_code}-Wavenet-${name_char[rand_num]}`;
}


async function get_tts(text)
{
    console.log(text);
      var langname = audio_manager.langname;
      const params = {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ input: { text:text }, voice: {languageCode: langname.substring(0,5), name: langname}, audioConfig: { audioEncoding: 'LINEAR16'}}),
        };
  
      const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${localStorage.getItem("TTS_API_KEY")}`, params);
  
      const blob = new Blob([Uint8Array.from(atob((await response.json()).audioContent), c => c.charCodeAt(0))], { type: 'audio/mp3' });
      return URL.createObjectURL(blob);
}

function stop_recording()
{
    mediaRecorder.stop();
}


var mediaRecorder = null, chunks = [];

document.addEventListener("keydown", e=>
{
    if (e.key === " " && (mediaRecorder === null || mediaRecorder && mediaRecorder.state !== "recording") && e.target.nodeName !== "TEXTAREA") start_recording();
});

document.addEventListener("keyup", e=>
{
    if (e.key === " " && mediaRecorder) stop_recording();
});

document.querySelector("button").addEventListener("touchstart", e=>
{
    if (mediaRecorder === null || mediaRecorder && mediaRecorder.state !== "recording") start_recording();
});

document.querySelector("button").addEventListener("touchend", e=>
{
    if (mediaRecorder) stop_recording();
});

document.querySelector("button").addEventListener("mousedown", e=>
{
    if (mediaRecorder === null || mediaRecorder && mediaRecorder.state !== "recording") start_recording();
});

document.querySelector("button").addEventListener("mouseup", e=>
{
    if (mediaRecorder) stop_recording();
});

document.body.addEventListener("click", e => {
    if (e.target.nodeName === "INPUT" && e.target.type === "SUBMIT")
    {
        if (e.target.parentNode.classList.contains("TTS_API_KEY"))
        {
            localStorage.setItem("TTS_API_KEY", e.target.value);
            document.querySelector("div.TTS_API_KEY").classList.add("hide");
        }
        if (e.target.parentNode.classList.contains("API_KEY"))
        {
            localStorage.setItem("API_KEY", e.target.value);
            document.querySelector("div.API_KEY").classList.add("hide");
        }
    }
    if (e.target.nodeName === "BUTTON" && e.target.parentNode.classList.contains("system_message"))
        messages.update_system_message(e.target.parentNode.querySelector("textarea").value);
});
