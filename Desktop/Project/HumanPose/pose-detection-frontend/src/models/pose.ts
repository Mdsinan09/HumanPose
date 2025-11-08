export interface Landmark {
    x: number;
    y: number;
    z: number;
    visibility: number;
}

export interface Pose {
    landmarks: Landmark[];
    score: number;
    feedback: string;
}

export interface ExercisePose {
    type: string; // e.g., "squat", "push-up"
    pose: Pose;
}