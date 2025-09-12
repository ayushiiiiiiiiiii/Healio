const API_URL = "/api/chat/chatbot";


const chatbody = document.querySelector(".body");
const msginput = document.querySelector(".input");
const sendmsg = document.querySelector("#send");
const chatbottoggler = document.querySelector("#chatbot-toggler");
const closechat = document.querySelector("#close");

const userdata = {
    message: null,
    file: {
        data: null,
        mime_type: null
    }
}

const chatHistory=[];
const ini_ht=msginput.scrollHeight


// msg element with dynamic class and returning it
const createmsg = (content, ...classes) => {
    const div = document.createElement("div")
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}
// bot response using api
const generatebotmsg = async (incomingmsgdiv) => {
    const msgele = incomingmsgdiv.querySelector(".text")
    // adding user msg to chat histroy
    chatHistory.push({
                role:"user",
                parts: [
                    { text: userdata.message }
                ]
            })

    // From Gemini
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: chatHistory.map(msg => ({
            role: msg.role,
            parts: msg.parts
        }))
        })
    }
    try {
       
        const response = await fetch( "/api/chat/chatbot", requestOptions);

        
        let data;
        try {
            data = await response.json();
        } catch(parseErr) {
            console.error("Failed to parse JSON:", parseErr);
            throw new Error("Invalid JSON from server");
        }
    
        console.log("Bot API response:", data);
        
        if (!response.ok) throw new Error(data.error?.message || JSON.stringify(data));


        // displaying bot response text
        const apirespnse = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
        console.log("Bot text:", apirespnse);
        
        msgele.innerText = apirespnse;
    //    adding bot response to chat history
        chatHistory.push({
                role:"model",
                parts: [
                    { text: apirespnse }
                ]
            })


    } catch (error) {
        console.log(error);
        msgele.innerText = error.message
        msgele.style.color = "red"

    } finally {
        incomingmsgdiv.classList.remove("thinking")
        chatbody.scrollTo({ top: chatbody.scrollHeight, behavior: "smooth" })

    }
}



// outgoing user msg
const handlemsg = (e) => {
    e.preventDefault();//preventing msg form submitting

    // create and display usermsg 
    userdata.message = msginput.value.trim();//
    msginput.value = "";
    msginput.dispatchEvent(new Event ("input"));
   

    const msgcnt = `<div class="usermsg msg">
                <div class="text">${userdata.file.data ? `<img src="data:${userdata.file.mime_type}; base64,${userdata.file.data}"/class="attachment">` : ""}</div>
            </div>`;
    const outgoingmsgdiv = createmsg(msgcnt, "usermsg")
    outgoingmsgdiv.querySelector(".text").textContent = userdata.message
    chatbody.appendChild(outgoingmsgdiv)
    chatbody.scrollTo({ top: chatbody.scrollHeight, behavior: "smooth" })

    // bot response with thinking after delay
    setTimeout(() => {
        const msgcnt = `<svg xmlns="http://www.w3.org/2000/svg" class="avatar" width="50" height="50" viewBox="0 0 1024 1024">
    <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"></path>
</svg>
                <div class="text">
                    <div class="think">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>
                </div>`;
        const incomingmsgdiv = createmsg(msgcnt, "botmsg", "thinking")

        chatbody.appendChild(incomingmsgdiv)
        chatbody.scrollTo({ top: chatbody.scrollHeight, behavior: "smooth" })
        generatebotmsg(incomingmsgdiv);

    }, 500);
}
// handle enter key press for sending msg
msginput.addEventListener("keydown", (e) => {
    const usermsg = e.target.value.trim();
    if (e.key === "Enter" && usermsg && !e.shiftKey && window.innerWidth>768) {
        // console.log(usermsg)
        handlemsg(e);
    }
})

// adjusting input space height
msginput.addEventListener("input",()=>{
    msginput.style.height=`${ini_ht}px`
    msginput.style.height=`${msginput.scrollHeight}px`
    document.querySelector(".chat").style.borderRadius=msginput.scrollHeight>ini_ht?"15px":"32px";
})


sendmsg.addEventListener("click", (e) => { handlemsg(e) })


// Initialize Emoji picker and handleemoji selection
const picker = new EmojiMart.Picker({
    theme: "light",
    skinTonePosition: "none",
    previewPosition: "none",
    onEmojiSelect:(emoji)=>{
        const {selectionStart: start, selectionEnd: end}=msginput;
        msginput.setRangeText(emoji.native,start,end,"end")
        msginput.focus()

    },
    onClickOutside:(e)=>{
        if(e.target.id==="emoji-picker"){
            document.body.classList.toggle("show-emoji-picker")
        }else{
             document.body.classList.remove("show-emoji-picker")
        }
    }
}

)

document.querySelector(".chat").appendChild(picker)
closechat.addEventListener("click",()=>document.body.classList.toggle("show-chatbot"))


chatbottoggler.addEventListener("click",()=>
    document.body.classList.toggle("show-chatbot")
)



















