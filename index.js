const BeaconScanner = require('node-beacon-scanner');
const scanner = new BeaconScanner();
const PER_BEACON_SAMPLES = 30;

let values_per_uuid = {}

function append(ad) {
    let uuid = ad['iBeacon']['uuid'];
    let tx_power = ad['iBeacon']['txPower']
    let values = values_per_uuid[uuid] ?? {
        'txPower': tx_power,
        'count': 0,
        'values': new Array(PER_BEACON_SAMPLES)
    };
    values['count'] += 1;
    let idx = values['count'] % PER_BEACON_SAMPLES;
    let rssi = ad['rssi']
    values['values'][idx] = rssi;
    values_per_uuid[uuid] = values;

    let mean = values['values'].reduce((a, b) => a + b, 0) / values['values'].length

    return {
        'uuid': uuid,
        'txPower': tx_power,
        'min': Math.min(...values['values']),
        'max': Math.max(...values['values']),
        'mean': mean,
        'count': values['count'],
        'values': values['values'],
    }
}

// Set an Event handler for becons
scanner.onadvertisement = (ad) => {
    let appended = append(ad);
    if ((appended['count'] % PER_BEACON_SAMPLES) == 0) {
        console.log((
            appended['uuid'] + '('
            + appended['txPower'] + ', '
            + appended['count'] + ', '
            + appended['mean'] + '): ' + appended['values']));
    }
};

// Start scanning
scanner.startScan().then(() => {
    console.log('Started to scan.');
}).catch((error) => {
    console.error(error);
});

console.log('Hello');