import { DAWEvents } from '@/lib/events';
import { signalLog } from '@/lib/logger';
import { Track } from '@/lib/Track';
import OSC from 'osc-js';

interface IBank {
    tracksCount: number;
    client: OSC
}

export class Bank {
    public tracksCount: number;
    private tracks: Track[] = [];
    private client: OSC

    public defaultBank: number = 0;
    public activeBank: number = this.defaultBank;

    /**
     * Constructs a Bank object with the given number of tracks and OSC client.
     *
     * @param {Object} opts - An object with the following properties:
     *   tracksCount {number} - The number of tracks in the bank.
     *   client {OSC} - The OSC client to use for communicating with the DAW.
     * @memberof Bank
     */
    constructor({
        tracksCount,
        client
    }: IBank) {
        this.tracksCount = tracksCount;
        this.client = client

        for (let id = 1; id < this.tracksCount + 1; id++) {
            const track = new Track({ id, client });
            this.tracks.push(track);
        }

        console.log(`➡️ Bank created with ${this.tracksCount} tracks`);
    }

    /**
     * Listen for messages from the DAW related to all tracks in the bank.
     *
     * When any of these messages are received, the corresponding property of the Track object is updated.
     */
    public listen(): void {
        this.select(this.defaultBank);
        this.sendTrackCount();

        this.tracks.forEach((track) => {
            track.listen();
        });

        console.log('✅ All tracks in bank listening for events from DAW');
    }

    /**
     * Send a message to the DAW to report the number of tracks in the bank.
     *
     * @memberof Bank
     */
    public sendTrackCount() {
        this.client.send(new OSC.Message(DAWEvents.TrackCount, this.tracksCount));
        signalLog(`TRACK_COUNT_${this.tracksCount}`);
    }


    /**
     * Get the array of tracks in the bank.
     * 
     * @returns {Track[]} - The array of tracks in the bank.
     */
    public getTracks(): Track[] {
        return this.tracks;
    }

    /**
     * Send a message to the DAW to select the next track bank.
     *
     * @memberof Bank
     */
    public next() {
        this.client.send(new OSC.Message(DAWEvents.TrackBankNext));
        signalLog('NEXT_BANK');
    }

    /**
     * Send a message to the DAW to select the previous track bank.
     *
     * @memberof Bank
     */
    public prev() {
        this.client.send(new OSC.Message(DAWEvents.TrackBankPrev));
        signalLog('PREVIOUS_BANK');
    }

    /**
     * Send a message to the DAW to select the track bank with the given number.
     *
     * @param {number} bank - The number of the bank to select.
     *
     * @memberof Bank
     */
    public select(bank: number) {
        this.activeBank = bank;
        this.client.send(new OSC.Message(DAWEvents.TrackBankSelect, bank));
        signalLog(`SELECT_BANK_${bank}`);
    }
}
