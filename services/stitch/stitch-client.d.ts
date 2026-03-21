/// <reference types="node" />
export declare class StitchClient {
    private readonly apiKey;
    private readonly baseUrl;
    constructor(apiKey: string);
    /**
     * Generates a design prototype from a text prompt.
     */
    generatePrototype(prompt: string): Promise<string>;
    /**
     * Downloads a design prototype (HTML content).
     */
    downloadDesign(screenName: string): Promise<string>;
}
