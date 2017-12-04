// function Magic(x, y, r) {
//     this.x = x;
//     this.y = y;
//     this.r = r;
//     this.ri = 1 / r;
//     this.x_speed = Math.random() * 2 - 1;
//     this.y_speed = Math.random() * 2 - 1;
//     this.base_time = new Date().getTime();

//     this.move = function(width, height) {
//         let time_delta = (new Date().getTime() - this.base_time) / 10;

//         this.base_time += time_delta * 10;

//         if (this.x < 0 || this.x > width) {
//             this.x_speed *= -1;
//             this.x += this.y_speed;
//         }
//         if (this.y < 0 || this.y > height) {
//             this.y_speed *= -1;
//             this.y += this.y_speed;
//         }
//         this.x += this.x_speed * time_delta;
//         this.y += this.y_speed * time_delta;
//         return this;
//     };

//     return this
// }

// function render(queue, image, width, height, len, halo_limit) {

//     queue = queue.map(item => { return item.move(width, height); })

//     count = 0;
//     for (y = 0; y < height; y++) {
//         for (x = 0; x < width; x++) {
//             it = queue.reduce((sum, item) => {
//                 return sum + item.r / ((x - item.x) * (x - item.x) + (y - item.y) * (y - item.y));
//             }, 0);

//             if (it > halo_limit) {
//                 var e = (it - halo_limit) * 2550;
//                 image.data[count + 0] = 0;
//                 image.data[count + 1] = Math.min(e * 0.5, 150);
//                 image.data[count + 2] = Math.min(e * 0.5, 136);
//                 image.data[count + 3] = Math.min(e * 0.15, 255)
//             }
//             count = count + 4
//         }
//     }

//     return image
// }

// let canvas_element = document.getElementById("loading");
// let w = 320;
// let h = 200;
// ctx = canvas_element.getContext("2d");
// canvas_element.setAttribute("width", w);
// canvas_element.setAttribute("height", h);
// canvas_style = canvas_element.style;
// let queue = [
//     new Magic(Math.random() * w, Math.random() * h, w * 5),
//     new Magic(Math.random() * w, Math.random() * h, w * 5),
//     new Magic(Math.random() * w, Math.random() * h, w * 5),
//     new Magic(Math.random() * w, Math.random() * h, w * 5),
// ];

// let len = queue.length;
// let halo_limit = 0.24 * len;

// loading_holder = setInterval(function() {
//     ctx.putImageData(
//         render(queue, ctx.createImageData(w, h), w, h, len, halo_limit), 0, 0);
// }, 5);
;
(function () {
    const wrapperEl = document.querySelector('#loading-wrapper');
    console.log(wrapperEl);
    const numberOfEls = 24;
    const duration = 3000;
    const delay = duration / numberOfEls;
    const gap = 24;

    let tl = anime.timeline({
        duration: delay / 2,
        complete: function () { tl.restart(); }
    });

    function createEl(i) {
        let el = document.createElement('div');
        const rotate = (360 / numberOfEls) * i;
        const translateY = -(numberOfEls - i) * .5;
        const hue = Math.round(60 + 180 / numberOfEls * i);
        const diameter = gap + (i * gap);
        const scale = (diameter + gap) / diameter;
        el.classList.add('el');
        el.style.zIndex = numberOfEls - i + 60;
        el.style.width = diameter + 'px';
        el.style.height = diameter + 'px';
        el.style.marginTop = -(diameter / 2) + 'px';
        el.style.marginLeft = -(diameter / 2) + 'px';
        el.style.opacity = 0;
        // el.style.color = 'hsl(' + hue + ', 10%, 10%)';
        tl.add({
            begin: function () {
                anime({
                    targets: el,
                    opacity: [0, 1],
                    color: ['hsl(' + hue + ', 10%, 10%)', 'hsl(' + hue + ', 50%, 50%)'],
                    translateY: [0, translateY],
                    rotate: [0, 90],
                    borderRadius: {
                        value: ['30%', '50%'],
                        easing: 'easeInOutQuad'
                    },
                    easing: 'easeInOutSine',
                    direction: 'alternate',
                    duration: duration / 4
                });
            }
        });
        wrapperEl.appendChild(el);
    };

    for (let i = 0; i < numberOfEls; i++) createEl(i);
    window['loading_anime_handler'] = tl;
})();
