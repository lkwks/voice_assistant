import { messages, audio_manager } from "./common.js";

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
        this.$target.addEventListener("click", e => {
            if (e.target.classList.contains("subject_to_choose")) this.choose_subject(e.target.innerText);
        });
        this.render_target();
    }

    init_subject_list() {
        this.subject_list = [];
        this.subject_list.push({ subject: "How was your day?", questions: [
            "Hey there, {{USER_NAME}}! How did your day go today? Anything noteworthy to share? Was the weather today good? Whether good or bad, I'm curious to hear about any interesting experiences or events you had. Tell me all about it!",
            "Greetings, {{USER_NAME}}! I hope you're doing well. Did anything exciting or unusual happen? I'm all ears and would love to hear more about what you've been up to.",
            "Hi, {{USER_NAME}}! I hope you had a good day today! Anything special or out of the ordinary happen? Feel free to share any highlights or challenges with me - I'm here to listen."
        ]});
        this.subject_list.push({subject: "What are you studying?", questions: [
            "Hey there, {{USER_NAME}}! What are you studying today? I'm curious to hear about what you're learning. Feel free to share any interesting facts or insights you've gained.",
            "What have you been up to, {{USER_NAME}}? Have you been studying anything interesting lately? I'd love to hear about any new knowledge or skills you've acquired in your studies. Is there anything specific you're hoping to achieve in your field of study?",
            "Hey, {{USER_NAME}}! What have you been learning lately? Are there any topics or subjects that you find particularly fascinating? I'd love to hear about your interests and what you've been exploring in your free time."
            ]});
        this.subject_list.push({subject: "Interests recently?", questions: [
            "Hey there, {{USER_NAME}}! What have you been interested in lately? I'm curious to hear about what you've been exploring. Feel free to share any interesting facts or insights you've gained.",
            "Hello there, {{USER_NAME}}! Have you been pursuing any new hobbies or interests recently? What's something new that you've learned or discovered in those areas? I'm always curious to learn about new things and hear different perspectives!",
        ]});
        this.subject_list.push({subject: "Activities recently?", questions: [
            "Hey, {{USER_NAME}}! What have you been up to lately? Have you had the chance to hang out with friends or family? If so, did anything fun or exciting happen during those activities? Or, if you've been spending time alone, have you had any new experiences or challenges to share?",
            "Hi there, {{USER_NAME}}! Have you done anything interesting or engaging lately, either with others or on your own? Was there anything that really stood out to you from those experiences, whether good or bad? I'm interested to hear about your recent adventures!",
            "Hey {{USER_NAME}}, hope you're doing well. Have you been keeping busy lately? Whether it's been with friends, family, or alone, I'm curious to hear about any unique or memorable experiences you've had. Was there anything that was particularly challenging, or any moments that really made you happy?"
        ]});
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
        // subject_list에 새 주제를 추가하는 기능도 구현할 계획.
    }

    choose_subject(subject) {
        // $target을 hidden으로 만들고, div.chosen_subject에서 hidden을 제거.
        this.$target.parentNode.classList.add("hidden");
        document.querySelector("div.chosen_subject").classList.remove("hidden");
        // div.chosen_subject의 내용을 바꿈.
        document.querySelector("div.chosen_subject").innerText = subject;

        // question을 tts로 전달하고, message 큐에 질문을 넣음.
        const found_questions = this.subject_list.find(element => element.subject === subject);

        // 이렇게 하지 말고, subject_list의 각 원소를 잘 정리해서 이걸 예시로 해서 '이거랑 유사한 내용의 질문을 만들어서 리턴해줘'라고
        // 챗지피티한테 요청해서 그렇게 얻은 결과를 tts로 전달하는 게 더 좋을 것 같다. 이것도 맨날 정해진 걸 쓰면 하는 사람이 재미가 없단 말이지.
        // 일단 found_questions.questions의 원소들을 잘 조합해 챗지피티에 넣을 프롬프트를 만들어야겠다.

        const question = found_questions.questions[Math.floor(Math.random() * found_questions.questions.length)].replace("{{USER_NAME}}", localStorage.getItem("USER_NAME"));
        messages.messages.push({role: "assistant", content: question});
        messages.messages_token.push(question.split(" ").length * 5);
        audio_manager.push_text(question);

    }
}