const WORKER_URL = "https://perfectcircle-proxy.sodanhama.workers.dev";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const judgeBtn = document.getElementById("judgeBtn");
const output = document.getElementById("output");
const score = document.getElementById("score");
const verdict = document.getElementById("verdict");
const feedback = document.getElementById("feedback");

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

    const score = data.score;
    const verdict = data.verdict;
    const feedback = data.feedback;

    score.textContent = `Score: ${score}`;
    verdict.textContent = `Verdict: ${verdict}`;
    feedback.textContent = `Feedback: ${feedback}`;

    output.textContent = JSON.stringify(data, null, 2);
})