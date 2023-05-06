import { messages, audio_manager, chatgpt_api } from "./common.js";

export class ChooseSubject {
    constructor($target) {
        this.$target = $target;
        // SUBJECT_LIST의 구조
        // 1. SUBJECT_LIST는 배열.
        // 2. SUBJECT_LIST의 각 요소는 {subject: "주제명", question: "assistant가 처음 묻는 질"}의 구조를 가짐.
        if (!localStorage.getItem("SUBJECT_LIST")) 
          this.init_subject_list();
        else
          this.subject_list = JSON.parse(localStorage.getItem("SUBJECT_LIST"));
        this.$target.addEventListener("click", async e => {
            if (e.target.classList.contains("subject_to_choose")) await this.choose_subject(e.target.innerText);
        });
        this.render_target();
    }

    init_subject_list() {
        this.subject_list = [{subject: "How was your day?", latest_result: "Hello, {{USER_NAME}}! How was your day?"},
        {subject: "What are you studying?", latest_result: "Hello, {{USER_NAME}}! What are you studying?"}, 
        {subject: "Interests recently?", latest_result: "Hello, {{USER_NAME}}! Interests recently?"},
        {subject: "Activities recently?", latest_result: "Hello, {{USER_NAME}}! Activities recently?"}];
        localStorage.setItem("SUBJECT_LIST", JSON.stringify(this.subject_list));
    }

    render_target() {
        this.subject_list.forEach(element => {
            const $subject = document.createElement("div");
            $subject.className = "subject_to_choose";
            $subject.innerText = element.subject;
            this.$target.appendChild($subject);
        });
        // subject_list에 새 주제를 추가하는 기능(+ 버튼)도 구현할 계획.
    }

    async choose_subject(subject) {
        // $target을 hidden으로 만들고, div.chosen_subject에서 hidden을 제거.
        this.$target.parentNode.classList.add("hidden");
        document.querySelector("div.chosen_subject").classList.remove("hidden");
        // div.chosen_subject의 내용을 바꿈.
        document.querySelector("div.chosen_subject").innerText = subject;

        const question = this.subject_list.find(element => element.subject === subject).latest_result.replace("{{USER_NAME}}", localStorage.getItem("USER_NAME"));
        messages.messages.push({role: "assistant", content: question});
        messages.messages_token.push(question.split(" ").length * 5);
        document.querySelector("div.api_status").innerText = "Generating audio...";
        audio_manager.push_text(question);
        document.querySelector("div.api_status").innerText = "Audio generated.";

        const code_block = "\n```yaml\nquestion: [greeting][a question with context or stories with a minimum length of 100 words]\n```";
        const messages_generate_question = [{role: "user", content: ""}, 
{role: "user", content: `Can you provide me with an example of a question that a chatbot can use to initiate a conversation with a user? \
The example should include a greeting with '{{USER_NAME}}' and a question that conveys the intent of '${subject}', with a minimum length of 100 words. You may add any additional context or stories to the question itself that make it engaging. Please provide it in the following YAML file format.${code_block}`}];
        const generated_question = await chatgpt_api(messages_generate_question, false, false);

        if (generated_question.choices && generated_question.choices.length > 0) {
            this.subject_list.forEach( (element, index) => {
                if (element.subject === subject) {
                    this.subject_list[index].latest_result = generated_question.choices[0].message.content.split("```")[1].split("question:")[1];
                }
            });
            localStorage.setItem("SUBJECT_LIST", JSON.stringify(this.subject_list));
        }
 
    }
}