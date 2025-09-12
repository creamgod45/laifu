async function shutdown(ct, target) {
    ct.addEventListener('click', async () => {
        await fetch(target, {
            method: 'GET'
        }).then(async (res)=>{
            let a = document.querySelector("#error_log");
            if(a !== null) {
                document.querySelector("#error_log").innerHTML = await res.text();
            }
        }).catch(error => {
            let a = document.querySelector("#error_log");
            if(a !== null) {
                document.querySelector("#error_log").innerHTML = error.message;
            }
        });
    });
}

async function customTrigger() {
    var cts = document.querySelectorAll('.ct:not(.ct-rendered)');
    for (let ct of cts) {
        //console.log(ct)
        if (ct.dataset.fn !== null && ct.dataset.target !== null) {
            let target = ct.dataset.target;
            //console.log(target)
            ct.classList.add("ct-rendered")
            switch (ct.dataset.fn) {
                case "shutdown":
                    await shutdown(ct, target);
                    break;
                default:
                    ct.classList.remove("ct-rendered");
                    break;
            }
        }
    }
}

document.addEventListener("CGCT::init", customTrigger);
document.addEventListener('DOMContentLoaded', customTrigger);