document.querySelector("body").onselectstart = function() { return false; };
document.querySelector("body").onload = function(){genuser();}

var notyf = new Notyf({duration:1000});
var JsonData = [];
var dbnfo = [];

function checkArr (array){
    return array.join("").length === 0;
}

function dbid() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

function createcookie(id) {
    var expiration = new Date(new Date().setMonth(new Date().getMonth() + 1));
    document.cookie = `uuid=${id};expires=${expiration.toUTCString()};path=/`
}

function genuser() {
    var uuid = document.cookie;
    const regex = new RegExp('^uuid=.{36}$', '')
    if (regex.test(uuid)) {
        const uid = uuid.match('^uuid=(.{36}$)');
        $.ajax({
            contentType: 'application/json',
            data: JSON.stringify({ uuid: uid[1] }),
            success: function(data) { history(data) },
            error: function() {},
            processData: false,
            type: 'POST',
            url: '/validate'
        });
        return;
    } else {
        createcookie(dbid());
    };
};

function history(data) {
    if (data['available'] == true) {
        dbnfo.push(data);
        $('.history').append(`<button type="submit" id="histor" class="hbuton">History&nbsp;<i class="fa-solid fa-clock-rotate-left"></i></button>
      <script>document.querySelector("#histor").onclick = function (){redirect(dbnfo[0]['dbid'])};</script>`);
    };
};

function redirect(path) {
    window.location.href = `/listen/${path}`
};

$(".item").on("click", "i.fa-headphones", (e) => {
    const handPoint = e.target
    const completedItem = e.target.parentElement
    const text = completedItem.getElementsByTagName('p')

    gsap.to(handPoint, .3, { rotate: -30, transformOrigin: "center", ease: Back.easeOut })
    gsap.to(handPoint, .3, { delay: .15, rotate: 0, transformOrigin: "center", ease: Back.easeOut })
})

/* Remove item */
$(".item").on("click", "button.removeItemBtn", (e) => {
    const removeItem = e.target;
    const itemInner = removeItem.parentElement;
    var rmi = $(itemInner).children("p").attr("id");
    delete JsonData[rmi];
    $(itemInner).remove();

    gsap.to(".itemsWrapper, .item", 0, { paddingBottom: 52 })
    gsap.to(".itemsWrapper, .item", .3, { paddingBottom: 8, ease: Back.easeOut })
})


$(function() {
    $("form").submit(function() { return false; });
});

const submit = document.querySelector("#Form_Go");
submit.onclick = async function() {
    var playlist = document.getElementById("inpt").value
    $.ajax({
        contentType: 'application/json',
        data: JSON.stringify({ playlist: encodeURIComponent(playlist) }),
        success: function(a) {
            notyf.success('Success')
            pstbtn();
            $(".item").empty();
            JsonData = [];
            var index = 0;
            for (const i in a.contents) {
                $(".item").append(
                    `<div class="itemInner">
        <button class="removeItemBtn"><i class="fa fa-trash-alt"></i></button>
        <i class="fa-solid fa-headphones"></i>
        <p class="songname" id="${index}">&nbsp;&nbsp;${a.contents[i].title}</p>
        </div>`);
                index++;
                JsonData.push(a.contents[i]);
            };
        },
        error: function() {notyf.error('Operation Fail')},
        processData: false,
        type: 'POST',
        url: '/get'
    });
};

function pstbtn() {
    if ($('*').hasClass('goobutton')) {
        return;
    } else {
        $(".postbutton").append(`
        <button class="goobutton" id="gooey-button">
        <i class="fa-solid fa-play"></i></i>&nbspListen Now
        <span class="bubbles">
            <span class="bubble"></span>
            <span class="bubble"></span>
            <span class="bubble"></span>
            <span class="bubble"></span>
            <span class="bubble"></span>
            <span class="bubble"></span>
            <span class="bubble"></span>
            <span class="bubble"></span>
            <span class="bubble"></span>
            <span class="bubble"></span>
        </span>
        </button>
        <script>document.querySelector("#gooey-button").onclick = function(){func()};</script>`);
    };
};

function func() {
    if (!checkArr(JsonData)) {
        var reqdata = { userdata: JsonData, uuid: document.cookie }
        $.ajax({
            contentType: 'application/json',
            data: JSON.stringify(reqdata),
            success: function(data) { notyf.success('Playlist Saved');
                redirect(data.dbid) },
            error: function() {},
            processData: false,
            type: 'POST',
            url: '/process'
        });
    } else {
      notyf.error('Playlist is Empty!')
    };
};
