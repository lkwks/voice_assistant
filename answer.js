export class Answer {
    constructor($target) {
        this.$target = $target;
        // 언젠가 모든 대화 내역을 저장하는 단계로 앱을 발전시키게 되겠지만,
        // 일단 현재 단계에서는 대화 내역을 저장하는 기능 구현은 보류하고,
        // 당장 UI를 최대한 쓸만한 수준으로 구현하는 것에 집중하자.
        // 이 앱이 정말로 내가 쓰고 싶을 정도 수준이 될 수 있는지를 확인할 수 있을 정도 단계까지
        // 앱을 얼른 발전시켜보는 게 더 중요하다.
        // 내가 중요한 우선순위가 있다고 보는 건
        // 1. 프롬프트 엔지니어링.
        // 2. UI 엔지니어링. 
        //   (1) 보기 좋고 사용하기 쉬운 수준이 돼야 한다. 오렌지색 버블링 메시지. 봇의 리턴을 가렸다가 클릭했을 때 보이게 하는 기능.
        //   (2) 핵심 기능이라고 생각하는 건 내가 전송했던 메시지를 문법 관점에서 polish를 한 결과 및 그에 대한 설명을 보여주는 것.
        //       그리고 그 polish 결과를 바탕으로 내가 전송했던 메시지를 수정할 수 있게 하는 기능. 거기서부터 다시 대화를 하는 기능.
        //       그리고 그 polish 결과를 내가 소리내 읽기를 10번 하고, 그 표현을 따로 저장해뒀다가
        //       나중에 그 표현을 사용해서 대화를 시작할 수 있게 하는 기능.
        //       지금 단계에서는 이게 이 앱 구현의 최우선순위가 돼야 한다.
    }

    push(role, message) {
        const new_element = document.createElement("div");
        new_element.classList.add(role);
        new_element.innerText = message;
        this.$target.appendChild(new_element);
    }
}