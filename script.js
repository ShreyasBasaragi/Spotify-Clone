console.log("starting js")
let currentsong = new Audio()
let songs
let currfolder
// var audio = new Audio(songs[0]);
// // audio.play();

// audio.addEventListener("loadeddata", () => {
//     let duration = audio.duration;
//     console.log(duration)
//     // The duration variable now holds the duration (in seconds) of the audio clip
// });
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    const regex = new RegExp(`${`/${folder}/`}|${".m4a"}`);
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".m4a")) {
            songs.push(element.href.split(regex, 3)[1])
        }
    }

    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        // songUL.innerHTML = songUL.innerHTML + `<li> ${song.replaceAll("%20"," ")} </li>`;
        songUL.innerHTML = songUL.innerHTML + `<li>
                                <div class="songformat">
                                    <img src="img/music.svg" alt="" class="invert">
                                    <div class="info">
                                        <div>${song.replaceAll("%20", " ")}</div>
                                    </div>
                                    <div class="playnow">
                                        <div>Play Now</div>
                                        <img src="img/play.svg" alt="" height="30px" class="invert">
                                    </div>
                                </div>
                            </li>`;
    }

    //Adding event listener to the play button of songlist on left side of website
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.firstElementChild.firstElementChild.nextElementSibling.nextElementSibling.addEventListener("click", element => {
            playmusic(e.querySelector(".info").firstElementChild.innerHTML)
        })
        console.log(e.querySelector(".info").firstElementChild.innerHTML.replaceAll("%20", " ").trim())
        // console.log(e)
    });

    return songs;
}

const playmusic = (track, pause = false) => {

    if (track.endsWith(".m4a")) {
        currentsong.src = `/songs/${currfolder}/` + track;
    } else {
        currentsong.src = `/songs/${currfolder}/` + track + ".m4a";
    }

    if (!pause) {
        currentsong.play()
        play.src = "img/pause.svg";
    }
    document.querySelector(".songname").innerHTML = track

}

async function displayalbums() {
    let a = await fetch(`http://127.0.0.1:3000/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let content = document.querySelector(".content")
    let array = Array.from(anchors)
        for (let index = 0; index < array.length; index++) {
            const e = array[index];
            
            if (e.href.includes("/songs")) {
                let folder = e.href.split("/").slice(-2)[0]
    
                //Adding folder dynamically on the website
                let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)
                let response = await a.json();
                console.log(response)
                content.innerHTML = content.innerHTML + `<div class="card" data-folder="${folder}">
                                <div class="playsur">
                                    <img src="img/play.svg" alt="" height="30px" width="30px" class="playsurimg">
                                </div>
                                <img src="/songs/${folder}/cover.jpg" height="160px"
                                    width="165px" class="cardimg">
                                <p class="song">${response.title}</p>
                                <p class="singer">${response.description}</p>
                            </div>`
            }
        }

        //Loading songs from the selected folder when clicked
        Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getsongs(`${item.currentTarget.dataset.folder}`)
            playmusic(songs[0])
        })
    })
    }
    // console.log(anchors)


async function main() {
    await getsongs("part1");
    // console.log(songs)
    // let songname = []
    // for (let index = 0; index < songs.length; index++) {
    //     const element = as[index];
    //     if (element.href.endsWith(".m4a")) {
    //         songname.push(element.split("/songs/")[1])
    //     }
    // } 
    // let {name,artist} = songs.split("-");

    displayalbums()
    playmusic(songs[0], true)
    //Adding event listener to play button of the playbar at the bottom of the website
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "img/pause.svg"
        } else {
            currentsong.pause()
            play.src = "img/play.svg"
        }
    })

    //getting the current time of song and its totla duration
    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songduration").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)}/${secondsToMinutesSeconds(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%"
    })

    //jumping to different timeline in the currentsong using seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = currentsong.duration * (percent / 100);
    })

    //bringing left bar from leftside on clicking hamburger icon
    document.querySelector(".hamburg").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0vw"
        document.querySelector(".close").style.display = "block"

    })

    //closing the left sidebar
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100vw"
        document.querySelector(".close").style.display = "none"
    })

    previous.addEventListener("click", () => {
        currentsong.pause()
        console.log(currentsong.src.split("/").slice(-1)[0].split(".m4a")[0])
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0] + ".m4a")
        console.log(index)
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1])
        }
    })

    next.addEventListener("click", () => {
        currentsong.pause()
        let index = songs.indexOf(currentsong.src)
        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1])
        }
    })

    //change volume of currentsong
    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentsong.volume = parseInt(e.target.value) / 100;
        if (currentsong.volume > 0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replaceAll("mute.svg","volume.svg");
        }
    })

    document.querySelector(".volume>img").addEventListener("click",e=>{
        // console.log(e.target)
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replaceAll("volume.svg","mute.svg");
            currentsong.volume = 0;
            document.querySelector(".volume").getElementsByTagName("input")[0].value=0;
        }else{
            e.target.src = e.target.src.replaceAll("mute.svg","volume.svg");
            currentsong.volume = 0.1;
            document.querySelector(".volume").getElementsByTagName("input")[0].value=10;
        }
    })

}

main()