import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

export type ProctoringEventType =
  | 'camera_started'
  | 'camera_error'
  | 'face_detection_unavailable'
  | 'face_missing'
  | 'multiple_faces'
  | 'face_ok'
  | 'security_violation'
  | 'exam_submitted';

export interface ProctoringEvent {
  type: ProctoringEventType;
  message: string;
  at: string;
  faceCount?: number;
}

type FaceDetectorResult = {
  boundingBox: DOMRectReadOnly;
};

type FaceDetectorInstance = {
  detect: (source: CanvasImageSource) => Promise<FaceDetectorResult[]>;
};

type FaceDetectorConstructor = new (options?: {
  fastMode?: boolean;
  maxDetectedFaces?: number;
}) => FaceDetectorInstance;

declare global {
  interface Window {
    FaceDetector?: FaceDetectorConstructor;
  }
}

const CHECK_INTERVAL_MS = 2500;

function buildEvent(type: ProctoringEventType, message: string, faceCount?: number): ProctoringEvent {
  return {
    type,
    message,
    at: new Date().toISOString(),
    faceCount,
  };
}

export async function requestStrictFaceCheck(): Promise<{
  stream: MediaStream;
  event: ProctoringEvent;
}> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('Camera access is not available in this browser.');
  }

  if (!window.FaceDetector) {
    throw new Error('Face detection is not available in this browser. Please use a browser that supports the FaceDetector API.');
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: 'user',
      width: { ideal: 640 },
      height: { ideal: 480 },
    },
    audio: false,
  });

  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.srcObject = stream;
  await video.play();

  await new Promise((resolve) => {
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      resolve(undefined);
      return;
    }

    video.onloadeddata = () => resolve(undefined);
  });

  const detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 2 });
  const faces = await detector.detect(video);

  if (faces.length !== 1) {
    stream.getTracks().forEach((track) => track.stop());
    throw new Error(faces.length === 0 ? 'No face detected. Sit clearly in front of the camera.' : 'Multiple faces detected. Only one learner is allowed in the exam frame.');
  }

  return {
    stream,
    event: buildEvent('camera_started', 'Camera and face detection verified before exam start.', faces.length),
  };
}

export function useFaceProctoring({
  active,
  stream,
  videoRef,
  onEvent,
  onViolation,
}: {
  active: boolean;
  stream: MediaStream | null;
  videoRef: RefObject<HTMLVideoElement | null>;
  onEvent: (event: ProctoringEvent) => void;
  onViolation: (reason: string) => void;
}) {
  const onEventRef = useRef(onEvent);
  const onViolationRef = useRef(onViolation);
  const lastViolationRef = useRef('');

  useEffect(() => {
    onEventRef.current = onEvent;
    onViolationRef.current = onViolation;
  }, [onEvent, onViolation]);

  useEffect(() => {
    const video = videoRef.current;
    if (!active || !stream || !video) {
      return undefined;
    }

    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    void video.play().catch(() => undefined);

    if (!window.FaceDetector) {
      const event = buildEvent('face_detection_unavailable', 'Face detection became unavailable during the exam.');
      onEventRef.current(event);
      onViolationRef.current(event.message);
      return undefined;
    }

    const detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 2 });
    let cancelled = false;
    let checking = false;

    const checkFace = async () => {
      if (cancelled || checking || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        return;
      }

      checking = true;
      try {
        const faces = await detector.detect(video);
        if (faces.length === 1) {
          onEventRef.current(buildEvent('face_ok', 'Exactly one face is visible.', faces.length));
          lastViolationRef.current = '';
          return;
        }

        const event = faces.length === 0
          ? buildEvent('face_missing', 'No face detected. Keep your face visible to continue the exam.', faces.length)
          : buildEvent('multiple_faces', 'Multiple faces detected. Only one learner is allowed in frame.', faces.length);

        onEventRef.current(event);
        if (lastViolationRef.current !== event.type) {
          onViolationRef.current(event.message);
          lastViolationRef.current = event.type;
        }
      } catch {
        const event = buildEvent('face_detection_unavailable', 'Face detection failed during the exam.');
        onEventRef.current(event);
        onViolationRef.current(event.message);
      } finally {
        checking = false;
      }
    };

    void checkFace();
    const intervalId = window.setInterval(() => {
      void checkFace();
    }, CHECK_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      video.srcObject = null;
    };
  }, [active, stream, videoRef]);
}
