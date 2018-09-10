
const ofLoads = [];
const mapLoads = [];

for (let i = 0; i < 100000; i++) {

    ofLoads.push(function () {
        return new Promise(function (resolve) {
            setTimeout(resolve, 900);
        });
    });

    mapLoads.push(function () {
        return new Promise(function (resolve) {
            setTimeout(resolve, 900);
        })
    });

}

// of
console.time('of');

const promises = [];

for (const load of ofLoads) {
    promises.push(load());
}

Promise.all(promises).then(function () {
	console.timeEnd('of');
}).catch(console.error);


// map
console.time('map');

Promise.all(mapLoads.map(function (load) {
    return load();
})).then(function () {
	console.timeEnd('map');
}).catch(console.error);


