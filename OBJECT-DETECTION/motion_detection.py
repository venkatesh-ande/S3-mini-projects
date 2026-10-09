import cv2


def main():
    # Open the default webcam.
    camera = cv2.VideoCapture(0)

    if not camera.isOpened():
        raise RuntimeError("Could not open the webcam.")

    try:
        # Use the first frame as the reference background.
        success, reference_frame = camera.read()
        if not success:
            raise RuntimeError("Could not read a frame from the webcam.")

        reference_gray = cv2.cvtColor(reference_frame, cv2.COLOR_BGR2GRAY)
        reference_gray = cv2.GaussianBlur(reference_gray, (21, 21), 0)

        while True:
            success, frame = camera.read()
            if not success:
                raise RuntimeError("Could not read a frame from the webcam.")

            # Compare the current frame to the original reference frame.
            current_gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            current_gray = cv2.GaussianBlur(current_gray, (21, 21), 0)
            difference = cv2.absdiff(reference_gray, current_gray)

            # Convert meaningful pixel changes into a binary image.
            _, thresholded = cv2.threshold(difference, 25, 255, cv2.THRESH_BINARY)
            thresholded = cv2.dilate(thresholded, None, iterations=2)

            # Find changed regions and draw a red box around each large enough one.
            contours = cv2.findContours(
                thresholded, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
            )[-2]
            for contour in contours:
                if cv2.contourArea(contour) < 500:
                    continue

                x, y, width, height = cv2.boundingRect(contour)
                cv2.rectangle(
                    frame, (x, y), (x + width, y + height), (0, 0, 255), 2
                )

            cv2.imshow("Motion Detection", frame)

            # Press q or Esc to quit.
            key = cv2.waitKey(1) & 0xFF
            if key == ord("q") or key == 27:
                break
    finally:
        camera.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    main()

    
#pip install opencv-python
#python motion_detection.py