import { answer_stream, chatgpt_api } from "./common.js";

export class Messages{
    constructor()
    {
        this.messages = [{role:"user", content:""}];
        this.messages_token = [0];
    }
    
    async send_chatgpt(content)
    {
        this.messages.push({role: "user", content: localStorage.getItem("SYSTEM_MESSAGE")}, {role: "user", content: content});
        this.messages_token.push(content.split(" ").length * 5);
        this.flush_if_too_many_tokens();
        document.querySelector("div.check_grammar > button").disabled = true;
        await chatgpt_api(this.messages);
        document.querySelector("div.check_grammar > button").disabled = false;
        this.messages.splice(-2, 1);
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

    async check_grammar()
    {
        let last_message = this.messages[this.messages.length-1];
        if (last_message.role === "assistant") last_message = this.messages[this.messages.length-2];
        let messages = [{role: "user", content: ""}, {role: "user", content: `Check grammar of this message, and recommend more naturally re-written message of it if it's unnatural with explanations: "${last_message.content}"`}];
        document.querySelector("div.check_grammar > button").disabled = true;
        await chatgpt_api(messages, true, false);
        document.querySelector("div.check_grammar > button").disabled = false;
    }

}
