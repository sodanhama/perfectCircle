const WORKER_URL = "https://perfectcircle-proxy.sodanhama.workers.dev";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const judgeBtn = document.getElementById("judgeBtn");
const clearBtn = document.getElementById("clearBtn");
const output = document.getElementById("output");
const score = document.getElementById("score");
const verdict = document.getElementById("verdict");
const feedback = document.getElementById("feedback");

ctx.fillStyle = "#000000"
ctx.fillRect(0, 0, canvas.width, canvas.height)
ctx.lineWidth = 4
ctx.lineCap = "round"
ctx.strokeStyle = "#fefefe"

let drawing = false

canvas.addEventListener("pointerdown", (e) => {
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener("pointermove", (e) => {
    if (!drawing) return;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
})

canvas.addEventListener("pointerup", () => drawing = false);

judgeBtn.addEventListener("click", async () => {
    const imageBase64 = canvas.toDataURL("image/png").split(",")[1];

    const response = await fetch(WORKER_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ image: imageBase64 })
    })

    const data = await response.json();

    output.style.display = "block";

    score.textContent = `Score: ${data.score}/100`;
    verdict.textContent = `Verdict: ${data.verdict}`;
    feedback.textContent = `Feedback: ${data.feedback}`;
})

clearBtn.addEventListener("click", () => {
    output.style.display = "none";

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    score.textContent = "";
    verdict.textContent = "";
    feedback.textContent = "";
});