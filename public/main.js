$(document).ready(function () {
    var socket = io();
    // Toggle show/hide icons box
    $(".icons-box").hide();
    $("#emoticons").on("click", () => {
        $(".icons-box").toggle();
    });

    // handle send MY message 
    let uname = window.username;
    socket.emit("newuser", uname);

    $("#buzz").on("click", () => {
        const message = "BUZZ!!";
        socket.emit("buzz", message);
        renderMessage("buzz", message);
        // the whole app will shake
        $(".app").addClass("shake");
        // then remove the animation
        var delay = setTimeout(() => {
            $(".shake").removeClass("shake");
        }, 300);
        var buzzSound = new Audio('https://qanguyen.net/yahooAssets/assets/messenger_buzz.mp3');
        buzzSound.play();
    })

    // trigger click event when pressing enter
    $("#message-input").keydown((e) => {
        if (e.which === 13) {
            e.preventDefault();
            $("#send-message").click();
        }
    });
    $("#send-message").on("click", (e) => {
        e.preventDefault();
        $(".icons-box").hide();

        // check if there's any emoji on message
        fetch("./emoticon-list.json").then((res) => {
            return res.json();
        }).then((resJson) => {
            const emoticons = resJson["emoticons"];
            let message = $("#message-input").html();
            if (message.length == 0) {
                return;
            }
            Object.keys(emoticons).forEach((key) => {
                if (message.includes(key)) {
                    message = message.replace(key, `<img class="${emoticons[key]}" src="${emoticons[key]}" alt="${emoticons[key]}" style="height:23px;" >`);
                }
            });
            // this callback func is used for rendering message to client screen
            renderMessage("my", {
                username: uname,
                text: message
            });
            // send infor to server for "chat" type (socket.on("chat",...) in server.js)
            socket.emit("chat", {
                username: uname,
                text: message
            });
            $("#message-input").empty();
        });        
    });

    // user exit
    $("#exit-chat").on("click", (e) => {
        e.preventDefault();
        socket.emit("exituser", uname);
        fetch("https://qanguyen.net/auth/logout", {
            method: "GET",
            credentials: 'same-origin'
        }).then(res => {
            localStorage.removeItem('registeredUser');
            window.location.href = '/login';
        }).catch(error => {
            console.error('Logout error:', error);
        });
    })

    // listen message of new user or user exits for "update" type... then call back func render message with "update" type
    socket.on("update", (update) => {
        renderMessage("update", update);
    });

    // listen OTHER's message for "chat" type (server)... then render message with "other" type (client)
    socket.on("chat", (message) => {
        renderMessage("other", message);
    });

    socket.on("buzz", (message) => {
        renderMessage("buzz", message);
        // the whole app will shake
        $(".app").addClass("shake");
        // then remove the animation
        var delay = setTimeout(() => {
            $(".shake").removeClass("shake");
        }, 300);
        var buzzSound = new Audio('https://qanguyen.net/yahooAssets/assets/messenger_buzz.mp3');
        buzzSound.play();
    })

    const renderMessage = (type, message) => {
        if (type == "my") {
            $(".messages").append(`
                <div class="message my-message">
                    <div class="name">${message.username}: </div>
                    <div class="text">${message.text}</div>
                </div>
            `);
        } else if (type == "other") {
            $(".messages").append(`
                <div class="message others-message">
                    <div class="name">${message.username}: </div>
                    <div class="text">${message.text}</div>
                </div>
            `);
        } else if (type == "update") {
            $(".messages").append(`
                <div class="update">${message}</div>
            `);
        } else if (type == "buzz") {
            $(".messages").append(`
                <div id="BUZZ">${message}</div>
            `);
        }
        // scroll to the latest message
        $(".messages").scrollTop($(".messages")[0].scrollHeight - $(".messages")[0].clientHeight);
    }
    // get data for icons box
    fetch("./emoticon-list.json").then((res) => {
        return res.json();
    }).then((resJson) => {
        const emoticons = resJson["emoticons"];
        for (const [key, value] of Object.entries(emoticons)) {
            $(".icons-box").append(`
                <div class="col-1 p-0 mt-1 mb-1 text-center">
                    <img class="emoji" src="${value}" alt="${value}" style="height:23px;" >
                </div>
            `);
        }
        // when click on emoji => add emoji to input field
        $(".emoji").on("click", (e) => {
            let selectedEmo = $(e.target).attr("src");
            $("#message-input").append(`
                <img class="emoji" src="` + selectedEmo + `" alt="` + selectedEmo + `" style="height:23px;" >
            `);
        });
    });
});