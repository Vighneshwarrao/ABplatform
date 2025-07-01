let exp_id = 0;

document.getElementById("uploadBtn").addEventListener("click", uploadFile);
document.getElementById("showBtn").addEventListener("click", showPlots);
document.getElementById("summaryBtn").addEventListener("click", showSummary);


function showLoader() {
    document.getElementById("loader").style.display = "flex";
}

function hideLoader() {
    document.getElementById("loader").style.display = "none";
}

function showSuccessToast() {
    const toast = document.getElementById("success-toast");
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 2000);
}
function clearUI() {
    document.getElementById("status").innerText = "";
    document.getElementById("exp").innerHTML = "";
    document.getElementById("barplot").src = "";
    document.getElementById("kdeplot").src = "";
    document.getElementById("diff_mean").src = "";
    document.getElementById("pplot").src = "";
    document.querySelector(".plot-container").style.display = "none";
}


async function uploadFile() {
    clearUI();
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

    showLoader();

    try {
        const res = await fetch("https://abtestingplatform-api.onrender.com/upload/", {
            method: "POST",
            body: formData
        });

        const data = await res.json();

        if (!res.ok) {
            // Extract the actual error detail from FastAPI's HTTPException
            throw new Error(data.detail || "Upload failed");
        }

        status.innerText = data.message;
        exp_id = data.exp_id;
        showSuccessToast();
    } catch (error) {
        console.error("Error:", error);
        document.getElementById("uploadBtn").classList.add("shake");
        setTimeout(() => {
            document.getElementById("uploadBtn").classList.remove("shake");
        }, 600);

        status.innerText = "❌ " + error.message;
    } finally {
        hideLoader();
    }
}


async function showPlots() {
    showLoader()
    try {
        const res = await fetch(`https://abtestingplatform-api.onrender.com/get_plots?exp_id=${exp_id}`);
        const data = await res.json();

        document.getElementById("barplot").src = "data:image/png;base64," + data.plot1;
        document.getElementById("kdeplot").src = "data:image/png;base64," + data.plot2;
        document.getElementById("diff_mean").src = "data:image/png;base64," + data.plot3;
        document.getElementById("pplot").src = "data:image/png;base64," + data.plot4;

        document.querySelector(".plot-container").style.display = "block";
    } catch (err) {
        console.error("Plot fetch error:", err);
    }finally {
        hideLoader();
    }
}

async function showSummary() {

    showLoader()
    const exp = document.getElementById("exp");
    try {
        const res = await fetch(`https://abtestingplatform-api.onrender.com/Summary?exp_id=${exp_id}`);
        const data = await res.json();
        exp.innerHTML = data.summary.replace(/\n/g, "<br>");
    } catch (err) {
        console.error("Summary fetch error:", err);
    }finally {
        hideLoader();
    }
}
