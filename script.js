const obj = {
    elButton: null,
    elWrapper: null,
    scoreProgress: null,
    energyScore: null
}

const ram = {
    energyInterval: null,
    energyValue: 1,
    energyClickValue: -3
}

$.fn.shake = function (interval, distance, times) {
    interval = typeof interval == "undefined" ? 100 : interval;
    distance = typeof distance == "undefined" ? 10 : distance;
    times = typeof times == "undefined" ? 3 : times;
    var jTarget = $(this);
    jTarget.css('position', 'relative');
    for (var iter = 0; iter < (times + 1); iter++) {
        jTarget.animate({ left: ((iter % 2 == 0 ? distance : distance * -1)) }, interval);
    }
    return jTarget.animate({ left: 0 }, interval);
}

$.fn.flyTo = function (target, source, callback) {
    $(source).animate({
        left: $(target).offset().left,
        top: $(target).offset().top
    }, 1000,
        function () {
            $(source).stop();
            $(source).remove();
            if (callback) callback();
        });
}

function startIntervalEnergy() {
    ram.energyInterval = setInterval(function () {
        const value = parseInt(obj.energyScore.getAttribute('value')) + ram.energyValue;
        if (value >= 0 && value <= parseInt(obj.energyScore.getAttribute('max'))) {
            if (value == 0) {
                ram.energyValue = 1;
            }
            obj.energyScore.setAttribute('value', value);
            obj.energyScore.parentElement.getElementsByTagName('span')[0].innerText = value + '/' + obj.energyScore.getAttribute('max');
        }
    }, 100);
}

function clearIntervalEnergy() {
    if (ram.energyInterval) {
        clearInterval(ram.energyInterval);
        ram.energyInterval = null;
    }
}

function changeScoreValue(value, flagFn = () => { }) {
    const currValue = parseInt(obj.scoreProgress.getAttribute('value'));
    if (currValue + value >= 0 && currValue + value <= parseInt(obj.scoreProgress.getAttribute('max'))) {
        obj.scoreProgress.setAttribute('value', currValue + value);
        obj.scoreProgress.parentElement.getElementsByTagName('span')[0].innerText = currValue + value + '/' + obj.scoreProgress.getAttribute('max');
        flagFn(true);
    }
    else if (currValue + value <= 0) {
        obj.scoreProgress.setAttribute('value', '0');
        obj.scoreProgress.parentElement.getElementsByTagName('span')[0].innerText = '0/' + obj.scoreProgress.getAttribute('max');
        flagFn(false);
    }
    else if (currValue + value >= parseInt(obj.energyScore.getAttribute('max'))) {
        obj.scoreProgress.setAttribute('value', obj.scoreProgress.getAttribute('max'));
        obj.scoreProgress.parentElement.getElementsByTagName('span')[0].innerText = obj.scoreProgress.getAttribute('max') + '/' + obj.scoreProgress.getAttribute('max');
        flagFn(false);
    }
}

function changeEnergyValue(value, flagFn = () => { }) {
    try {
        const currValue = parseInt(obj.energyScore.getAttribute('value'));
        if (currValue + value >= 0 && currValue + value <= parseInt(obj.energyScore.getAttribute('max'))) {
            obj.energyScore.setAttribute('value', currValue + value);
            obj.energyScore.parentElement.getElementsByTagName('span')[0].innerText = currValue + value + '/' + obj.energyScore.getAttribute('max');
            flagFn(true);
        }
        else if (currValue + value <= 0) {
            obj.energyScore.setAttribute('value', '0');
            obj.energyScore.parentElement.getElementsByTagName('span')[0].innerText = '0/' + obj.energyScore.getAttribute('max');
            flagFn(false);
        }
        else if (currValue + value >= parseInt(obj.energyScore.getAttribute('max'))) {
            obj.energyScore.setAttribute('value', obj.energyScore.getAttribute('max'));
            obj.energyScore.parentElement.getElementsByTagName('span')[0].innerText = obj.energyScore.getAttribute('max') + '/' + obj.energyScore.getAttribute('max');
            flagFn(false);
        }
    }
    catch { }
}

document.addEventListener("DOMContentLoaded", function () {
    Telegram.WebApp.expand();
    obj.elButton = document.querySelector(".treat-button");
    obj.elWrapper = document.querySelector(".treat-wrapper");
    obj.elButton.addEventListener("click", addTreats);
    obj.elButton.click();

    obj.scoreProgress = document.querySelector(".scoreProgress");
    obj.energyScore = document.querySelector(".energyScore");

    window.addEventListener("resize", () => {
        width = window.innerWidth;
        height = window.innerHeight;
    });
    startIntervalEnergy();
});


let width = window.innerWidth;
let height = window.innerHeight;
const body = document.body;


function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const treatmojis = [
    {
        "v": { "score": -3 },
        "i": "💩",
        "n": "d"
    },
    {
        "v": { "score": +1 },
        "i": "🤑",
        "n": "s"
    },
    {
        "v": { "score": +1 },
        "i": "🚀",
        "n": "e"
    }
];

const treats = [];
function createTreat() {

    const frameRate = 1 / 60;
    const radius = 11;
    const Cd = 0.47;
    const rho = 1.22;
    const A = Math.PI * radius * radius / 10000;
    const ag = 9.81;

    function setParam(item) {
        switch (item.n) {
            case 'd':
                {

                } break;
            case 's':
                {

                } break;
            case 'e':
                {

                } break;
        }
    }

    const vx = getRandomArbitrary(-10, 10);
    const vy = getRandomArbitrary(-10, 1);

    const item = treatmojis[getRandomInt(0, treatmojis.length - 1)];
    setParam(item);
    const el = document.createElement("div");
    el.className = "treat";
    const inner = document.createElement("span");
    inner.className = "inner";
    inner.innerText = item.i;
    el.setAttribute('score', item.v.score);
    el.setAttribute('name', item.n);
    el.appendChild(inner);


    obj.elWrapper.appendChild(el);

    const rect = el.getBoundingClientRect();

    const lifetime = ram.energyClickValue * 1000 * -1; //getRandomArbitrary(2000, 3000);

    el.style.setProperty("--lifetime", lifetime);

    $(obj.elButton).shake(2, 3, 2);

    const treat = {
        el,
        absolutePosition: { x: rect.left, y: rect.top },
        position: { x: rect.left, y: rect.top + 20 },
        velocity: { x: vx, y: vy },
        mass: 0.1, //kg
        radius: el.offsetWidth, // 1px = 1cm
        restitution: -.9,

        lifetime,
        direction: vx > 0 ? 1 : -1,

        animating: true,

        remove() {
            this.animating = false;
            this.el.parentNode.removeChild(this.el);
        },

        animate() {
            const treat = this;
            let Fx =
                -0.5 *
                Cd *
                A *
                rho *
                treat.velocity.x *
                treat.velocity.x *
                treat.velocity.x /
                Math.abs(treat.velocity.x);
            let Fy =
                -0.5 *
                Cd *
                A *
                rho *
                treat.velocity.y *
                treat.velocity.y *
                treat.velocity.y /
                Math.abs(treat.velocity.y);

            Fx = isNaN(Fx) ? 0 : Fx;
            Fy = isNaN(Fy) ? 0 : Fy;

            // Calculate acceleration ( F = ma )
            var ax = Fx / treat.mass;
            var ay = ag + Fy / treat.mass;
            // Integrate to get velocity
            treat.velocity.x += ax * frameRate;
            treat.velocity.y += ay * frameRate;

            // Integrate to get position
            treat.position.x += treat.velocity.x * frameRate * 100;
            treat.position.y += treat.velocity.y * frameRate * 100;

            treat.checkBounds();
            treat.update();
        },

        checkBounds() {

            if (treat.position.y > height - treat.radius) {
                treat.velocity.y *= treat.restitution;
                treat.position.y = height - treat.radius;
            }
            if (treat.position.x > width - treat.radius) {
                treat.velocity.x *= treat.restitution;
                treat.position.x = width - treat.radius;
                treat.direction = -1;
            }
            if (treat.position.x < treat.radius) {
                treat.velocity.x *= treat.restitution;
                treat.position.x = treat.radius;
                treat.direction = 1;
            }

        },

        update() {
            const relX = this.position.x - this.absolutePosition.x;
            const relY = this.position.y - this.absolutePosition.y;

            this.el.style.setProperty("--x", relX);
            this.el.style.setProperty("--y", relY);
            this.el.style.setProperty("--direction", this.direction);
        }
    };

    setTimeout(() => {

        function scoreFn(score) {
            switch (score.getAttribute('name')) {
                case "d": {
                    // console.log('d', score);
                    // score.style.fontSize = "7vmin"
                    // score.style.color = "#F44336";
                    // changeScoreValue(parseInt(score.innerText));
                    // $(score).flyTo(obj.elButton, $(score), function () {
                    //     $(this).remove();
                    // });
                } break;
                case "e":
                    {
                        console.log('e', score);
                        score.style.color = "var(--progress3-color)";
                        score.style.fontSize = "10vmin";
                        changeEnergyValue(parseInt(score.innerText));
                        $(score).flyTo(obj.energyScore, $(score), function () {
                            $(this).remove();
                        });
                    } break;
                case "s":
                    {
                        score.style.color = "var(--progress2-color)";
                        score.style.fontSize = "20vmin";
                        score.style.fontWeight = 'bold';
                        changeScoreValue(parseInt(score.innerText));
                        $(score).flyTo($('.treat-button'), $(score), function () {
                            $(this).remove();
                        });
                    } break;
                default: {
                    score.style.fontSize = "15vmin";
                    score.style.color = "#feca57";
                    $(score).flyTo(obj.elButton, $(score), function () {
                        $(this).remove();
                    });
                } break;
            }
        }


        if (treat.el.getAttribute('name') != 'd') {
            const score = document.createElement('span');
            score.setAttribute('name', treat.el.getAttribute('name'));
            score.style.position = 'fixed';
            score.style.top = treat.position.y;
            score.style.left = treat.position.x;
            score.innerText = treat.el.getAttribute('score');
            scoreFn(score);
            obj.elWrapper.appendChild(score);
        }
        treat.remove();

    }, lifetime);
    return treat;
}


function animationLoop() {
    var i = treats.length;
    while (i--) {
        treats[i].animate();

        if (!treats[i].animating) {
            treats.splice(i, 1);
        }

        const treatsArr = document.getElementsByClassName('treat-wrapper')[0].getElementsByClassName('treat');
        if (treatsArr.length > 0) {
            clearIntervalEnergy();
        }
        else {
            if (ram.energyInterval == null) {
                startIntervalEnergy();
            }
        }
    }
    requestAnimationFrame(animationLoop);
}

animationLoop();

function addTreats() {
    changeEnergyValue(ram.energyClickValue, function (flag) {
        if (flag) {
            if (treats.length > 40) {
                return;
            }
            for (let i = 0; i < 3; i++) {
                treats.push(createTreat());
            }
        }
    });
    //cancelAnimationFrame(frame);

}