import {AudioManager} from "./audio_manager.js";
import {Messages} from "./messages.js";
import {AnswerStream} from "./answer_stream.js";
import { ChooseSubject } from "./choose_subject.js";
import {Answer} from "./answer.js";

export {whisper_api, chatgpt_api, audio_manager, answer_stream, messages, choose_subject, answer};

var audio_manager = new AudioManager();
var answer_stream = new AnswerStream();
var messages = new Messages();
var choose_subject = new ChooseSubject(document.querySelector("div.choose_subject"));
var answer = new Answer(document.querySelector("div.answer"));

async function whisper_api(file)
{
    var formData = new FormData();
    formData.append('model', 'whisper-1');
    formData.append('file', file);
    formData.append('language', 'en');

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("API_KEY")}`
        },
        body: formData
    });
    if (response.status === 400) return "";
    return await response.json();
}

async function chatgpt_api(messages, stream_mode=true, audio_mode=true)
{
    const api_url = "https://api.openai.com/v1/chat/completions";
    let param = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("API_KEY")}`
        }
    };
    let body_param = {model: "gpt-3.5-turbo", messages: messages};

    if (stream_mode) 
    {
        body_param.stream = true;
        param.body = JSON.stringify(body_param);
        const response = await fetch(api_url, param).then(async response => {
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
                         await answer_stream.add_answer(val.choices[0].delta.content, audio_mode);
                 }
              
              return await reader.read().then(processResult);
            });
        });
        if (audio_mode)
            audio_manager.push_text(response);
    }
    else
    {
        param.body = JSON.stringify(body_param);
        const response = await fetch(api_url, param);
        return await response.json();
    }
}
