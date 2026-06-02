// =========================
// VIEW NAVIGATION
// =========================

function showView(viewId){

    document
    .querySelectorAll(".view")
    .forEach(view => {

        view.classList.remove("active");

    });

    const target =
    document.getElementById(viewId);

    if(target){

        target.classList.add("active");

    }

    window.scrollTo({
        top:0,
        behavior:"smooth"
    });
}
