let nome;

function uniq() {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return timestamp + randomStr;
}

function criar_camera(nome, id) {
    const div = document.createElement("div")
    div.id = 'camera'
    div.classList.add(id)
    div.innerHTML = `<img id="${id}"><h1>${nome}</h1>`
    document.querySelector("#center").appendChild(div)
    return div.querySelector("img")
}
function take_imagem(id) {
    return document.querySelector("#" + id)
}
function remover_camera(id) {
    document.querySelector("#center").removeChild(document.querySelector(`#${id}`))
}
async function wait(ms) {
    return new Promise(result => setTimeout(result))
}
while (true) {
    if (nome == null) {
        nome = prompt("Digite seu Nome")
        if (nome == null || nome == '') {
            nome = null
            continue
        }
        break
    } else {
        break
    }
}

let meu_id = uniq()

const ws = new WebSocket('wss://camerasamuel.squareweb.app') //new WebSocket('ws://localhost:80/')

ws.onopen = async () => {

    ws.onmessage = async (message) => {
        const parse = JSON.parse(message.data)
        if (parse.type == 'update_image') {
            const { nome, id, url } = parse

            if (take_imagem(id) !== null) {
                take_imagem(id).src = url
            } else {
                criar_camera(nome, id).src = url
            }
        } else if (parse.type == 'saiu') {
            console.log(parse.nome)
            console.log(document.querySelector(`.${parse.id}`))
        }
    }
    let pegar_imagem = () => {

    }

    async function carregar_tudo() {
        return new Promise(async result => {
            async function requestCameraPermission() {
                try {

                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    console.log('Acesso à câmera permitido');

                    const videoElement = document.querySelector('#elementoVideo');
                    videoElement.srcObject = stream;
                } catch (error) {
                    console.error('Erro ao acessar a câmera:', error);
                }
            }

            await requestCameraPermission()

            const video = document.getElementById('elementoVideo');
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');

            function base64_imagem(base64Data) {
                document.querySelector("#minhaImagem").src = base64Data
            }

            async function startCapture() {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    video.srcObject = stream;
                } catch (err) {
                    console.error('Erro ao acessar dispositivos de mídia: ', err);
                }
            }

            function stopCapture() {
                let stream = video.srcObject;
                let tracks = stream.getTracks();

                tracks.forEach(function (track) {
                    track.stop();
                });

                video.srcObject = null;
            }

            async function captureFrame() {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                const base64Data = canvas.toDataURL('image/jpeg');

                return base64Data
            }

            document.addEventListener("DOMContentLoaded", function () {
                startCapture();
            });

            pegar_imagem = captureFrame
            result(true)
        })
    }

    await carregar_tudo()

    setInterval(async () => {
        const imagem = await pegar_imagem()
        ws.send(JSON.stringify({
            type: "update_image",
            id: meu_id,
            nome: nome,
            url: imagem
        }))
    }, 50)
}

ws.onclose = async () => {
    alert("WebSocket Desconectado!")
    window.close()
}

;(async () => {
    while (true) {
        document.querySelectorAll("#camera").forEach(async v => {
            const img = v.querySelector("img")
            let old = img.src 
            setTimeout(() => {
                document.querySelector("#center").removeChild(v)
            }, 10000)
        })
        await wait(10)
    }
})();
