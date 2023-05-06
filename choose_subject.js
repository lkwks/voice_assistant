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
        this.subject_list = ["How was your day?", "What are you studying?", "Interests recently?", "Activities recently?"];
        localStorage.setItem("SUBJECT_LIST", JSON.stringify(this.subject_list));

        // 이렇게 하지 말고, subject_list의 각 원소를 잘 정리해서 이걸 예시로 해서 '이거랑 유사한 내용의 질문을 만들어서 리턴해줘'라고
        // 챗지피티한테 요청해서 그렇게 얻은 결과를 tts로 전달하는 게 더 좋을 것 같다. 이것도 맨날 정해진 걸 쓰면 하는 사람이 재미가 없단 말이지.
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

        // question을 tts로 전달하고, message 큐에 질문을 넣음.

        const code_block = "\n```yaml\nquestion: [greeting][a question with context or stories with a minimum length of 100 words]\n```";
        const messages_generate_question = [{role: "user", content: ""}, 
{role: "user", content: `Can you provide me with an example of a question that a chatbot can use to initiate a conversation with a user? \
The example should include a greeting with '{{USER_NAME}}' and a question that conveys the intent of '${subject}', with a minimum length of 100 words. You may add any additional context or stories to the question itself that make it engaging. Please provide it in the following YAML file format.${code_block}`}];
        document.querySelector("div.api_status").innerText = "Generating a question...";
        const generated_question = await chatgpt_api(messages_generate_question, false, false);

        const found_question = generated_question.choices[0].message.content.split("```")[1].split("question:")[1];
        messages.messages.push({role: "assistant", content: found_question});
        messages.messages_token.push(found_question.split(" ").length * 5);

        document.querySelector("div.api_status").innerText = "Generating audio...";
        audio_manager.push_text(found_question);
        document.querySelector("div.api_status").innerText = "Ready";
    }
}