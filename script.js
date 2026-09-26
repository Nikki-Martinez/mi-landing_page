const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxpK_KgIRtl4RGcjdP0pD19IMmqH-xCeDHM1k9J6cMoDKAZS3Ld6dfdzGlw1MluszBL/exec";

const room = document.getElementById("room");
const pullArea = document.getElementById("pullArea");
const rope = document.getElementById("rope");
const handle = document.getElementById("handle");
const flash = document.getElementById("flash");
const clock = document.getElementById("clock");
const rain = document.getElementById("rain");

const commentForm = document.getElementById("commentForm");
const nameInput = document.getElementById("name");
const commentInput = document.getElementById("comment");
const commentCounter = document.getElementById("commentCounter");
const formStatus = document.getElementById("formStatus");
const submitButton = document.getElementById("submitButton");

const carousel = document.getElementById("carousel");
const carouselTrack = document.getElementById("carouselTrack");
const carouselStatus = document.getElementById("carouselStatus");
const commentsCount = document.getElementById("commentsCount");

const commentModal = document.getElementById("commentModal");
const modalClose = document.getElementById("modalClose");
const modalName = document.getElementById("modalName");
const modalMessage = document.getElementById("modalMessage");
const modalDate = document.getElementById("modalDate");
const modalAvatar = document.getElementById("modalAvatar");
const modalNumber = document.getElementById("modalNumber");

let lightOn = false;
let dragging = false;
let startY = 0;
let currentPull = 0;
let switchedDuringDrag = false;

let comments = [];
let carouselPosition = 0;
let carouselPaused = false;
let carouselAnimationId = null;
let lastCarouselTime = 0;

const MAX_PULL = 75;
const SWITCH_DISTANCE = 55;
const CAROUSEL_SPEED = 28;

const demoComments = [];

pullArea.addEventListener("pointerdown", (event) => {
    dragging = true;
    switchedDuringDrag = false;
    startY = event.clientY;

    pullArea.setPointerCapture(event.pointerId);
});

pullArea.addEventListener("pointermove", (event) => {
    if (!dragging) {
        return;
    }

    const distance = event.clientY - startY;

    currentPull = Math.max(
        0,
        Math.min(distance, MAX_PULL)
    );

    updateRope();

    if (
        currentPull >= SWITCH_DISTANCE &&
        !switchedDuringDrag
    ) {
        switchedDuringDrag = true;
        toggleLight();
    }
});

pullArea.addEventListener(
    "pointerup",
    releaseRope
);

pullArea.addEventListener(
    "pointercancel",
    releaseRope
);

pullArea.addEventListener(
    "keydown",
    (event) => {
        if (
            event.key === "Enter" ||
            event.key === " "
        ) {
            event.preventDefault();

            toggleLight();

            currentPull = 50;

            updateRope();

            setTimeout(
                animateRopeBack,
                100
            );
        }
    }
);

function releaseRope() {
    if (!dragging) {
        return;
    }

    dragging = false;

    animateRopeBack();
}

function updateRope() {
    rope.style.height =
        125 + currentPull + "px";

    handle.style.top =
        118 + currentPull + "px";
}

function animateRopeBack() {
    let velocity = 0;

    function spring() {
        const force =
            -currentPull * .16;

        velocity += force;
        velocity *= .68;

        currentPull += velocity;

        if (
            Math.abs(currentPull) < .3 &&
            Math.abs(velocity) < .3
        ) {
            currentPull = 0;

            updateRope();

            return;
        }

        currentPull = Math.max(
            -5,
            currentPull
        );

        rope.style.height =
            125 +
            Math.max(
                0,
                currentPull
            ) +
            "px";

        handle.style.top =
            118 +
            currentPull +
            "px";

        requestAnimationFrame(spring);
    }

    spring();
}

function toggleLight() {
    lightOn = !lightOn;

    room.classList.add("switching");

    setTimeout(() => {
        room.classList.remove("switching");
    }, 200);

    if (lightOn) {
        room.classList.add("light-on");

        flash.classList.remove("active");

        void flash.offsetWidth;

        flash.classList.add("active");

        setTimeout(() => {
            room.classList.remove("light-on");
        }, 70);

        setTimeout(() => {
            room.classList.add("light-on");
        }, 140);

        setTimeout(() => {
            room.classList.remove("light-on");
        }, 205);

        setTimeout(() => {
            room.classList.add("light-on");
        }, 280);

        return;
    }

    room.classList.remove("light-on");
}

function createRain() {
    const totalDrops = 75;

    for (
        let i = 0;
        i < totalDrops;
        i++
    ) {
        const drop =
            document.createElement("div");

        drop.className = "drop";

        drop.style.left =
            Math.random() * 110 + "%";

        drop.style.top =
            Math.random() * -350 + "px";

        drop.style.animationDuration =
            (
                .55 +
                Math.random() * .75
            ) + "s";

        drop.style.animationDelay =
            Math.random() * 2 + "s";

        rain.appendChild(drop);
    }
}

function createCityWindows() {
    document
        .querySelectorAll(".building")
        .forEach((building) => {
            const width =
                building.offsetWidth;

            const height =
                building.offsetHeight;

            for (
                let y = 15;
                y < height - 10;
                y += 22
            ) {
                for (
                    let x = 10;
                    x < width - 8;
                    x += 19
                ) {
                    if (Math.random() > .35) {
                        const cityWindow =
                            document.createElement(
                                "div"
                            );

                        cityWindow.className =
                            "city-window";

                        cityWindow.style.left =
                            x + "px";

                        cityWindow.style.bottom =
                            y + "px";

                        cityWindow.style.animationDelay =
                            Math.random() *
                            8 +
                            "s";

                        building.appendChild(
                            cityWindow
                        );
                    }
                }
            }
        });
}

function updateClock() {
    const date = new Date();

    const hours =
        String(
            date.getHours()
        ).padStart(2, "0");

    const minutes =
        String(
            date.getMinutes()
        ).padStart(2, "0");

    clock.textContent =
        `${hours}:${minutes}`;
}

function randomizeCode() {
    const lines =
        document.querySelectorAll(
            ".line"
        );

    lines.forEach((line) => {
        const width =
            30 +
            Math.random() * 55;

        line.style.width =
            width + "%";
    });
}

function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatNumber(number) {
    return String(number).padStart(
        3,
        "0"
    );
}

function formatDate(date) {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return String(date ?? "");
    }

    return new Intl.DateTimeFormat(
        "es-GT",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        }
    ).format(parsedDate);
}

function normalizeComment(item, index) {
    return {
        id:
            item.id ??
            index + 1,

        name:
            String(
                item.name ??
                item.nombre ??
                "Visitante"
            ).trim(),

        comment:
            String(
                item.comment ??
                item.comentario ??
                ""
            ).trim(),

        date: formatDate(
            item.date ??
            item.fecha ??
            new Date()
        )
    };
}

function createCommentCard(
    comment,
    index
) {
    const card =
        document.createElement(
            "article"
        );

    card.className =
        "comment-card";

    card.tabIndex = 0;

    card.dataset.index =
        index;

    const initial =
        comment.name
            .charAt(0)
            .toUpperCase();

    card.innerHTML = `
        <div class="card-number">
            MENSAJE / ${formatNumber(index + 1)}
        </div>

        <p class="card-message">
            ${escapeHTML(comment.comment)}
        </p>

        <div class="card-bottom">

            <div class="card-author">

                <div class="card-avatar">
                    ${escapeHTML(initial)}
                </div>

                <div class="card-author-info">

                    <span class="card-name">
                        ${escapeHTML(comment.name)}
                    </span>

                    <span class="card-date">
                        ${escapeHTML(comment.date)}
                    </span>

                </div>

            </div>

            <span class="card-open">
                →
            </span>

        </div>
    `;

    card.addEventListener(
        "click",
        () => {
            openModal(
                comment,
                index
            );
        }
    );

    card.addEventListener(
        "keydown",
        (event) => {
            if (
                event.key === "Enter" ||
                event.key === " "
            ) {
                event.preventDefault();

                openModal(
                    comment,
                    index
                );
            }
        }
    );

    return card;
}

function renderComments() {
    carouselTrack.innerHTML = "";

    if (!comments.length) {
        commentsCount.textContent =
            "000";

        return;
    }

    const minimumCards = 8;

    let displayComments = [];

    while (
        displayComments.length <
        minimumCards
    ) {
        displayComments =
            displayComments.concat(
                comments
            );
    }

    const loopComments =
        displayComments.concat(
            displayComments
        );

    loopComments.forEach(
        (comment, index) => {
            const originalIndex =
                index %
                displayComments.length;

            carouselTrack.appendChild(
                createCommentCard(
                    comment,
                    originalIndex
                )
            );
        }
    );

    commentsCount.textContent =
        formatNumber(
            comments.length
        );

    carouselPosition = 0;
}

function animateCarousel(timestamp) {
    if (!lastCarouselTime) {
        lastCarouselTime =
            timestamp;
    }

    const delta =
        Math.min(
            (
                timestamp -
                lastCarouselTime
            ) / 1000,
            .05
        );

    lastCarouselTime =
        timestamp;

    if (
        !carouselPaused &&
        carouselTrack.children.length
    ) {
        carouselPosition +=
            CAROUSEL_SPEED *
            delta;

        const halfWidth =
            carouselTrack.scrollWidth /
            2;

        if (
            carouselPosition >=
            halfWidth
        ) {
            carouselPosition -=
                halfWidth;
        }

        carouselTrack.style.transform =
            `translateX(-${carouselPosition}px)`;
    }

    carouselAnimationId =
        requestAnimationFrame(
            animateCarousel
        );
}

function pauseCarousel() {
    carouselPaused = true;

    carousel.classList.add(
        "paused"
    );

    carouselStatus.textContent =
        "EN PAUSA";
}

function resumeCarousel() {
    if (
        commentModal.classList.contains(
            "open"
        )
    ) {
        return;
    }

    carouselPaused = false;

    carousel.classList.remove(
        "paused"
    );

    carouselStatus.textContent =
        "MOVIÉNDOSE";
}

carousel.addEventListener(
    "mouseenter",
    pauseCarousel
);

carousel.addEventListener(
    "mouseleave",
    resumeCarousel
);

carousel.addEventListener(
    "focusin",
    pauseCarousel
);

carousel.addEventListener(
    "focusout",
    () => {
        setTimeout(() => {
            if (
                !carousel.contains(
                    document.activeElement
                )
            ) {
                resumeCarousel();
            }
        }, 0);
    }
);

function openModal(
    comment,
    index
) {
    pauseCarousel();

    modalName.textContent =
        comment.name;

    modalMessage.textContent =
        comment.comment;

    modalDate.textContent =
        comment.date;

    modalAvatar.textContent =
        comment.name
            .charAt(0)
            .toUpperCase();

    modalNumber.textContent =
        formatNumber(
            index + 1
        );

    commentModal.classList.add(
        "open"
    );

    commentModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "modal-open"
    );

    setTimeout(() => {
        modalClose.focus();
    }, 250);
}

function closeModal() {
    commentModal.classList.remove(
        "open"
    );

    commentModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "modal-open"
    );

    resumeCarousel();
}

modalClose.addEventListener(
    "click",
    closeModal
);

commentModal
    .querySelector(".modal-backdrop")
    .addEventListener(
        "click",
        closeModal
    );

document.addEventListener(
    "keydown",
    (event) => {
        if (
            event.key === "Escape" &&
            commentModal.classList.contains(
                "open"
            )
        ) {
            closeModal();
        }
    }
);

commentInput.addEventListener(
    "input",
    () => {
        const length =
            commentInput.value.length;

        commentCounter.textContent =
            `${length} / 500`;
    }
);

function showFormStatus(
    message,
    type = ""
) {
    formStatus.textContent =
        message;

    formStatus.className =
        "form-status";

    if (type) {
        formStatus.classList.add(
            type
        );
    }
}

async function loadComments() {
    if (!GOOGLE_SCRIPT_URL) {
        comments =
            demoComments.map(
                normalizeComment
            );

        renderComments();

        return;
    }

    try {
        const response =
            await fetch(
                GOOGLE_SCRIPT_URL
            );

        if (!response.ok) {
            throw new Error(
                "No se pudieron cargar los comentarios."
            );
        }

        const data =
            await response.json();

        const source =
            Array.isArray(data)
                ? data
                : data.comments;

        if (!Array.isArray(source)) {
            throw new Error(
                "Respuesta inválida."
            );
        }

        comments =
            source.map(
                normalizeComment
            );

        renderComments();
    } catch (error) {
        comments =
            demoComments.map(
                normalizeComment
            );

        renderComments();

        console.error(error);
    }
}

async function publishComment(
    name,
    comment
) {
    if (!GOOGLE_SCRIPT_URL) {
        const newComment = {
            id:
                Date.now(),

            name,

            comment,

            date:
                formatDate(
                    new Date()
                )
        };

        comments.unshift(
            newComment
        );

        renderComments();

        return newComment;
    }

    const response =
        await fetch(
            GOOGLE_SCRIPT_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "text/plain;charset=utf-8"
                },

                body:
                    JSON.stringify({
                        name,
                        comment
                    })
            }
        );

    if (!response.ok) {
        throw new Error(
            "No se pudo publicar el comentario."
        );
    }

    const data =
        await response.json();

    if (
        data.success === false
    ) {
        throw new Error(
            data.message ||
            "No se pudo publicar el comentario."
        );
    }

    return data;
}

commentForm.addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();

        const name =
            nameInput.value.trim();

        const comment =
            commentInput.value.trim();

        if (
            name.length < 2
        ) {
            showFormStatus(
                "Ingresa un nombre válido.",
                "error"
            );

            nameInput.focus();

            return;
        }

        if (
            comment.length < 3
        ) {
            showFormStatus(
                "Escribe un comentario.",
                "error"
            );

            commentInput.focus();

            return;
        }

        submitButton.disabled =
            true;

        showFormStatus(
            "PUBLICANDO..."
        );

        try {
            await publishComment(
                name,
                comment
            );

            setTimeout(() => {
                recargarPagina();
            }, 1500);

            if (GOOGLE_SCRIPT_URL) {
                await loadComments();
            }

            commentForm.reset();

            commentCounter.textContent =
                "0 / 500";

            showFormStatus(
                "COMENTARIO PUBLICADO",
                "success"
            );

            setTimeout(() => {
                showFormStatus("");
            }, 3500);

        } catch (error) {
            showFormStatus(
                "NO SE PUDO PUBLICAR",
                "error"
            );

            console.error(error);

        } finally {
            submitButton.disabled =
                false;
        }
    }
 
);

createRain();
createCityWindows();

updateClock();

setInterval(
    updateClock,
    1000
);

setInterval(
    randomizeCode,
    2400
);

loadComments();

carouselAnimationId =
    requestAnimationFrame(
        animateCarousel
    );

function recargarPagina() {
  location.reload();
}