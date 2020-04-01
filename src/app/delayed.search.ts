export class DelayedSearch {

    private modifications = 0;

    private delayMs: number;
    private callback: (term: string) => void;

    constructor(delayMs: number, callback: (term: string) => void) {
        this.delayMs = delayMs;
        this.callback = callback;
    }

    set(term: string) {
        const localModifications = ++this.modifications;
        setTimeout(args => this.invokeCallback(term, localModifications), this.delayMs);
    }

    private invokeCallback(term: string, modifications: number) {
        if (this.modifications === modifications) {
            this.callback(term);
        }
    }
}
