let exp_id = 0;

document.getElementById("uploadBtn").addEventListener("click", uploadFile);
document.getElementById("showBtn").addEventListener("click", showPlots);
document.getElementById("summaryBtn").addEventListener("click", showSummary);

async function uploadFile() {
    const fileInput = document.getElementById("fileInput");
    const variant = document.getElementById("variant").value;
    const metric = document.getElementById("metric").value;
    const testType = document.getElementById("Testtype").value;
    const status = document.getElementById("status");

    if (!fileInput.files.length) {
        status.innerText = "⚠️ Please upload a CSV file.";
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);
    formData.append("variant", variant);
    formData.append("metric", metric);
    formData.append("test_type", testType);

    try {
        const res = await fetch("https://abtestingplatform-api.onrender.com/upload/", {
            method: "POST",
            body: formData
        });

        if (!res.ok) throw new Error("Upload failed with status: " + res.status);

        const data = await res.json();
        status.innerText = data.message;
        exp_id = data.exp_id;
    } catch (error) {
        console.error("Error:", error);
        status.innerText = "❌ Upload failed: " + error.message;
    }
}

async function showPlots() {
    try {
        const res = await fetch(`https://abtestingplatform-api.onrender.com/get_plots/?exp_id=${exp_id}`);
        const data = await res.json();

        document.getElementById("barplot").src = "data:image/png;base64," + data.plot1;
        document.getElementById("kdeplot").src = "data:image/png;base64," + data.plot2;
        document.getElementById("diff_mean").src = "data:image/png;base64," + data.plot3;
        document.getElementById("pplot").src = "data:image/png;base64," + data.plot4;
    } catch (err) {
        console.error("Plot fetch error:", err);
    }
}

async function showSummary() {
    const exp = document.getElementById("exp");
    try {
        const res = await fetch(`https://abtestingplatform-api.onrender.com/Summary/?exp_id=${exp_id}`);
        const data = await res.json();
        exp.innerHTML = data.summary.replace(/\n/g, "<br>");
    } catch (err) {
        console.error("Summary fetch error:", err);
    }
}
