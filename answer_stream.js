import { audio_manager } from "./common";
import {sentences} from './lib/tokenizer.js';

export class AnswerStream{
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
    
    async add_answer(answer, audio_mode)
    {
        this.answer_set += answer;
        if (audio_mode === false)
            document.querySelector("div.grammar_explanation").innerText = this.answer_set;
        this.now_answer += answer;
        const sentences_arr = sentences(this.now_answer);
        if (sentences_arr.length > 1 && audio_mode)
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
