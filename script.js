const app = document.querySelector('.app'),
    mode = document.querySelector('#mode');

chats = document.querySelector('.chats'),
    add_chat = document.querySelector('#add-chat'),

    clear = document.querySelector('#delete'),

    qna = document.querySelector('.qna'),

    input = document.querySelector('.request input'),
    send = document.querySelector('#send'),

    OPENAI_API_KEY = "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",
    url = "https://api.openai.com/v1/chat/completions";

const chatArray = [];
let id = 0;
let currentChatId = 0;


chatArray.forEach((el) => {
    const elementId = el.chatId;
    if (elementId == currentChatId) {
        const getid = generateid();
        const question = el.question;
        qna.innerHTML += createStaticChat(question, getid, el.answer);
        qna.scrollTop = qna.scrollHeight;
        let msg = el.answer;
        appendAnsweredChat(question);
    }
})


mode.addEventListener('click', toggleMode);
add_chat.addEventListener('click', addnewchat);
send.addEventListener('click', getanswer);
input.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        getanswer();
    }
});
clear.addEventListener('click', () => {
    chats.innerHTML = '';
    qna.innerHTML = '';
    chatArray.length = 0;
    id = 0;
    currentChatId = 0;
});
clear.addEventListener('click', addnewchat);

function toggleMode() {
    console.log('slicked');
    const light_mode = app.classList.contains('light');
    app.classList.toggle('light', !light_mode);
    mode.innerHTML = `<iconify-icon icon="bi:${light_mode ? 'brightness-high' : 'moon'}" class="icon"></iconify-icon>${light_mode ? 'light mode' : 'dark mode'}`
}

function addnewchat() {
    id++;
    chats.innerHTML += `
    <li class="newchat" id="${id}">
        <div>
            <iconify-icon icon="bi:chat-left" class="icon"></iconify-icon>
            <span class="chat-title">New Chat</span>
        </div>
        <div>
            <iconify-icon icon="bi:trash3" class="icon" onclick="removechat(this)"></iconify-icon></iconify-icon>
            <iconify-icon icon="bi:pen" class="icon" onclick="updatechatTitle(this)"></iconify-icon>
        </div>
    </li>
    `;
}

document.addEventListener("click", (el) => {
    const idOfElement = el.target.id;
    if (idOfElement) {
        const num = Number(idOfElement);
        for (let i = 0; i <= id; i++) {
            if (num == i) {
                currentChatId = idOfElement;
                const deleteElements = document.querySelectorAll(".result");
                for (let element of deleteElements) {
                    element.remove();
                }
                chatArray.forEach((el) => {
                    const elementId = el.chatId;
                    if (elementId == currentChatId) {
                        const getid = generateid();
                        const question = el.question;
                        qna.innerHTML += createStaticChat(question, getid, el.answer);
                        qna.scrollTop = qna.scrollHeight;
                        let msg = el.answer;
                        appendAnsweredChat(question);
                    }
                })
            }
        }
    }
})

const removechat = (el) => {
    const idOfTheSelectedItem = Number(el.parentElement.parentElement.id);

    let indexToDelete = [];
    chatArray.forEach((idx, el) => {
        if (el.chatId == idOfTheSelectedItem) {
            indexToDelete.push(idx);
        }
    })

    indexToDelete.forEach((el) => {
        chatArray.splice(el, 1);
    })

    const deleteElements = document.querySelectorAll(".result");
    for (let element of deleteElements) {
        element.remove();
    }

    el.parentElement.parentElement.remove();
    addnewchat();
    currentChatId = id;
}

const updatechatTitle = (el) => {

    const idOfTheSelectedItem = Number(el.parentElement.parentElement.id);
    const chatItem = document.getElementById(`${idOfTheSelectedItem}`);
    const chatTitles = chatItem.querySelectorAll(".chat-title");
    chatTitles[0].contentEditable = true;
    el.parentElement.previousElementSibling.lastElementChild.focus();
}

async function getanswer() {
    const options = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: input.value }],
            temperature: 0
        })
    }
    try {
        if (input.value.length >= 1) {
            const id = generateid();
            const question = input.value;
            let sampleAns = "";
            qna.innerHTML += createchat(question, id, sampleAns);
            qna.scrollTop = qna.scrollHeight;
            const p = document.getElementById(id);
            input.setAttribute('readonly', true);
            send.setAttribute('disabled', true);
            const res = await fetch(url, options);

            if (res.ok) {
                p.innerHTML = "";
                input.value = "";
                input.removeAttribute('readonly');
                send.removeAttribute('disabled');
                const data = await res.json();
                const msg = data.choices[0].message.content;
                let element = {
                    "question": question,
                    "answer": msg,
                    "chatId": currentChatId
                };
                chatArray.push(element);
                typewriter(p, msg);
                appendAnsweredChat(question, msg);
            }
        }
    }
    catch (err) {
        console.error(err);
    }
}

function printArray() {
    chatArray.forEach((el) => {
        console.log("The answer is ", el.answer);
        console.log("The question is ", el.question);
        console.log("The currentChatId is ", el.chatId);
    });
}

function appendAnsweredChat(question, answer) {

    const summary = question.split(' ').slice(0, 10).join(' ');
    const chatItem = document.getElementById(`${currentChatId}`);
    const chatTitles = chatItem.querySelectorAll(".chat-title");
    if (chatTitles.length > 0) {
        chatTitles[0].textContent = `${summary}`;
    }
}

function createchat(question, id, answer) {
    return (
        `
        <div class="result" data-id="${id}">
            <div class="question">
                <iconify-icon icon="bi:person-fill-gear" class="icon blue"></iconify-icon>
                <h3>${question}</h3>
            </div>
            <div class="answer">
                <iconify-icon icon="bi:robot" class="icon green"></iconify-icon>
                <p id="${id}"><iconify-icon icon="svg-spinners:3-dots-bounce" height = "40" width = "40"></iconify-icon>${answer}</p>
            </div>
        </div>
        `
    );
}

function createStaticChat(question, id, answer) {
    return (
        `
        <div class="result" data-id="${id}">
            <div class="question">
                <iconify-icon icon="bi:person-fill-gear" class="icon blue"></iconify-icon>
                <h3>${question}</h3>
            </div>
            <div class="answer">
                <iconify-icon icon="bi:robot" class="icon green"></iconify-icon>
                <p id="${id}">${answer}</p>
            </div>
        </div>
        `
    );
}



function generateid() {
    const id = Math.random().toString(16) + Date.now();
    return id.substring(2, id.length - 2);
}

function typewriter(el, ans) {
    let i = 0,
        interval = setInterval(() => {
            qna.scrollTop = qna.scrollHeight;
            if (i < ans.length) {
                el.innerHTML += ans.charAt(i);
                i++;
            } else {
                clearInterval(interval)
            }
        }, 13);
}