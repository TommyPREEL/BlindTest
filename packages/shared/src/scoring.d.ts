export interface GuessScore {
    artistScore: number;
    titleScore: number;
    points: number;
}
export declare function scoreGuess(guess: string, correctTitle: string, correctArtist: string, timeRemaining: number, totalTime: number, animeName?: string): GuessScore;
