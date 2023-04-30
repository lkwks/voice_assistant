export class ChooseSubject {
    constructor($target) {
        this.$target = $target;
        // SUBJECT_LIST의 구조
        // 1. SUBJECT_LIST는 배열.
        // 2. SUBJECT_LIST의 각 요소는 {subject: "주제명", question: "assistant가 처음 묻는 질"}의 구조를 가짐.
        this.subject_list = localStorage.getItem("SUBJECT_LIST") ? JSON.parse(localStorage.getItem("SUBJECT_LIST")) : [];
        this.$target.addEventListener("click", e => {
            if (e.target.classList.contains("subject_to_choose")) this.choose_subject(e.target.innerText);
        });
        this.render_target();
    }

    render_target() {
        this.subject_list.forEach(element => {
            const $subject = document.createElement("div");
            $subject.className = "subject_to_choose";
            $subject.innerText = element.subject;
            this.$target.appendChild($subject);
        });
    }

    choose_subject(subject) {
        // $target을 hidden으로 만들고, div.chosen_subject에서 hidden을 제거.
        this.$target.classList.add("hidden");
        document.querySelector("div.chosen_subject").classList.remove("hidden");
        // div.chosen_subject의 내용을 바꿈.
        document.querySelector("div.chosen_subject").innerText = subject;
        // question을 tts로 전달하고, message 큐에 질문을 넣음.
        const question = this.subject_list.find(element => element.subject === subject).question;
        window.tts_manager.push_text(question);
        window.message_queue.push(question);
    }
}