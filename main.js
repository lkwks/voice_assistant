let API_KEY = localStorage.getItem("API_KEY");
if (API_KEY && API_KEY !== "null") document.querySelector("div.API_KEY").classList.add("hide");

class Messages{
    constructor()
    {
        this.messages = [{role: "user", content: ""}];
        this.messages_token = [0];
        this.system_message = {role: "system", content: ""};
    }
    
    update_system_message(content)
    {
        this.system_message.content = content;
    }
    
    async send_chatgpt(content)
    {
        this.messages.push({role: "user", content: content});
        this.messages_token.push(content.split(" ").length * 5);
        this.flush_if_too_many_tokens();
        var answer = await chatgpt_api([this.system_message, ...this.messages]);
        console.log(answer);
        this.messages.push({role: "assistant", content: answer});
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
    }
    
    start()
    {
        if (this.now_streaming === false)
        {
            this.now_answer = "";
            this.now_streaming = true;
        }
    }
    
    add_answer(answer)
    {
        this.now_answer += answer;
    }
    
    end()
    {
        this.now_streaming = false;
    }
}

var messages = new Messages();
var answer_stream = new AnswerStream();

setInterval(()=>{document.querySelector("div.answer").innerHTML = answer_stream.now_answer;}, 100);
// 중간중간에 answer_stream.now_answer의 문장이 끝났는지를 정규식으로 확인한 후 끝났다면 구글 TTS API에 전송하는 setInterval 코드를 추가할 수 있을 듯함.

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
  
        const reader = response.body.getReader();
        let buffer = '';

        return await reader.read().then(async function processResult(result) {

          buffer += new TextDecoder('utf-8').decode(result.value || new Uint8Array());
            
          var messages = buffer.split('\n\n')
          buffer = messages.pop();
          if (messages.length === 0) 
          {
              answer_stream.end();
              return answer_stream.now_answer;
          }

          messages.forEach(message => {
             if (message.includes("data: ") && message.includes("[DONE]") === false)
             {
                 answer_stream.start();
                 const val = JSON.parse(message.replace("data: ", ""));
                 if (val.choices[0].delta.content)
                     answer_stream.add_answer(val.choices[0].delta.content);
             }
          });
          
          return await reader.read().then(processResult);
        });
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

async function start_recording()
{
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
    mediaRecorder = new MediaRecorder(stream, {type: 'audio/webm'});
  
    mediaRecorder.ondataavailable = e => chunks.push(e.data);
  
    mediaRecorder.onstop = async e => {
          var blob = new Blob(chunks, { 'type' : 'audio/webm' });
          var file = new File([blob], "audio.webm", { type: "audio/webm;" });
          var result = await whisper_api(file);
          console.log(result);
          messages.send_chatgpt(result.text);
          chunks = [];
          mediaRecorder = null;
          stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorder.start();    
}

var mediaRecorder = null, chunks = [];

document.addEventListener("keydown", e=>
{
    if (e.key === " " && (mediaRecorder === null || mediaRecorder && mediaRecorder.state !== "recording")) start_recording();
});

document.addEventListener("keyup", e=>
{
    if (e.key === " " && mediaRecorder) mediaRecorder.stop();
});

document.querySelector("button").addEventListener("touchstart", e=>
{
    if (mediaRecorder === null || mediaRecorder && mediaRecorder.state !== "recording") start_recording();
});

document.querySelector("button").addEventListener("touchend", e=>
{
    if (mediaRecorder) mediaRecorder.stop();
});

document.querySelector("button").addEventListener("mousedown", e=>
{
    if (mediaRecorder === null || mediaRecorder && mediaRecorder.state !== "recording") start_recording();
});

document.querySelector("button").addEventListener("mouseup", e=>
{
    if (mediaRecorder) mediaRecorder.stop();
});

document.querySelector("input.system_message").addEventListener("change", e => messages.update_system_message(e.target.value));
