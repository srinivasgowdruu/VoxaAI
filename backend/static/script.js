/* =========================================================
   VOXAAI
   FRONTEND CONTROLLER
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // ELEMENTS
    // =====================================================

    const recordButton =
        document.getElementById("recordButton");

    const recordTitle =
        document.getElementById("recordTitle");

    const recordSubtitle =
        document.getElementById("recordSubtitle");

    const recordingStatus =
        document.getElementById("recordingStatus");

    const detectedLanguage =
        document.getElementById("detectedLanguage");

    const confidence =
        document.getElementById("confidence");

    const translationText =
        document.getElementById("translationText");

    const processingTime =
        document.getElementById("processingTime");

    const clearButton =
        document.getElementById("clearButton");

    const copyButton =
        document.getElementById("copyButton");


    // =====================================================
    // STATE
    // =====================================================

    let mediaRecorder = null;
    let audioChunks = [];
    let isRecording = false;
    let stream = null;


    // =====================================================
    // MICROPHONE BUTTON
    // =====================================================

    recordButton.addEventListener("click", async () => {

        if (!isRecording) {

            await startRecording();

        } else {

            stopRecording();

        }

    });


    // =====================================================
    // START RECORDING
    // =====================================================

    async function startRecording() {

        try {

            stream =
                await navigator.mediaDevices.getUserMedia({
                    audio: true
                });


            audioChunks = [];


            /*
             * Use browser-supported audio format.
             */

            let options = {};

            if (
                MediaRecorder.isTypeSupported(
                    "audio/webm;codecs=opus"
                )
            ) {

                options.mimeType =
                    "audio/webm;codecs=opus";

            }


            mediaRecorder =
                new MediaRecorder(
                    stream,
                    options
                );


            mediaRecorder.ondataavailable =
                (event) => {

                    if (event.data.size > 0) {

                        audioChunks.push(
                            event.data
                        );

                    }

                };


            mediaRecorder.onstop =
                async () => {

                    await processRecording();

                };


            mediaRecorder.start();

            isRecording = true;

            updateRecordingUI(true);


        } catch (error) {

            console.error(
                "Microphone error:",
                error
            );

            showError(
                "Microphone access was denied or is unavailable."
            );

        }

    }


    // =====================================================
    // STOP RECORDING
    // =====================================================

    function stopRecording() {

        if (
            !mediaRecorder ||
            mediaRecorder.state === "inactive"
        ) {

            return;

        }


        mediaRecorder.stop();

        isRecording = false;

        updateRecordingUI(false);


        if (stream) {

            stream
                .getTracks()
                .forEach(track => track.stop());

        }

    }


    // =====================================================
    // RECORDING UI
    // =====================================================

    function updateRecordingUI(recording) {

        if (recording) {

            recordTitle.textContent =
                "Listening...";

            recordSubtitle.textContent =
                "Speak clearly in any language";

            recordingStatus.classList.remove(
                "hidden"
            );

            recordButton.classList.add(
                "recording"
            );

        } else {

            recordTitle.textContent =
                "Processing...";

            recordSubtitle.textContent =
                "VoxaAI is understanding your speech";

            recordingStatus.classList.add(
                "hidden"
            );

            recordButton.classList.remove(
                "recording"
            );

        }

    }


    // =====================================================
    // PROCESS RECORDING
    // =====================================================

    async function processRecording() {

        try {

            showProcessingState();


            const mimeType =
                audioChunks[0]?.type ||
                "audio/webm";


            const audioBlob =
                new Blob(
                    audioChunks,
                    {
                        type: mimeType
                    }
                );


            /*
             * Flask will receive this file
             * through request.files["audio"].
             */

            const formData =
                new FormData();


            /*
             * WAV is not guaranteed to be produced
             * by the browser.
             *
             * Flask accepts the recorded format
             * and Whisper handles it.
             */

            formData.append(
                "audio",
                audioBlob,
                "voxa_recording.webm"
            );


            // =================================================
            // SEND TO FLASK
            // =================================================

            const response =
                await fetch(
                    "/process",
                    {
                        method: "POST",
                        body: formData
                    }
                );


            const data =
                await response.json();


            if (!response.ok || !data.success) {

                throw new Error(
                    data.error ||
                    "Audio processing failed."
                );

            }


            // =================================================
            // DISPLAY RESULT
            // =================================================

            displayResults(data);


        } catch (error) {

            console.error(
                "Translation error:",
                error
            );

            showError(
                error.message ||
                "Unable to translate the recording."
            );


        } finally {

            resetRecordingUI();

        }

    }


    // =====================================================
    // DISPLAY RESULTS
    // =====================================================

    function displayResults(data) {

    // =========================================
    // DETECTED LANGUAGE
    // =========================================

    detectedLanguage.textContent =
        data.language || "Unknown";


    // =========================================
    // LANGUAGE CONFIDENCE
    // =========================================

    if (
        typeof data.confidence === "number"
    ) {

        confidence.textContent =
            `${(
                data.confidence * 100
            ).toFixed(1)}%`;

    } else {

        confidence.textContent = "--";

    }


    // =========================================
    // ENGLISH TRANSLATION
    // =========================================

    translationText.textContent =
        data.translation ||
        "No English translation available.";


    // =========================================
    // PROCESSING TIME
    // =========================================

    if (
        typeof data.processing_time === "number"
    ) {

        processingTime.textContent =
            `${data.processing_time.toFixed(2)}s`;

    } else {

        processingTime.textContent = "--";

    }

}


    // =====================================================
    // PROCESSING STATE
    // =====================================================

    function showProcessingState() {

        recordTitle.textContent =
            "Processing...";

        recordSubtitle.textContent =
            "Translating your speech into English";

        detectedLanguage.textContent =
            "Detecting...";

        confidence.textContent =
            "--";

        processingTime.textContent =
            "--";

        translationText.textContent =
            "Generating English translation...";

    }


    // =====================================================
    // RESET RECORDING UI
    // =====================================================

    function resetRecordingUI() {

        recordTitle.textContent =
            "Start Speaking";

        recordSubtitle.textContent =
            "Click the microphone and speak naturally";

        recordingStatus.classList.add(
            "hidden"
        );

        recordButton.classList.remove(
            "recording"
        );

        isRecording = false;

    }


    // =====================================================
    // CLEAR
    // =====================================================

    clearButton.addEventListener(
        "click",
        () => {

            detectedLanguage.textContent =
                "Waiting for speech";

            confidence.textContent =
                "--";
                

            translationText.textContent =
                "Your English translation will appear here...";

            processingTime.textContent =
                "--";

            clearError();

        }
    );


    // =====================================================
    // COPY TRANSLATION
    // =====================================================

    copyButton.addEventListener(
        "click",
        async () => {

            const text =
                translationText.textContent.trim();


            if (
                !text ||
                text ===
                "Your English translation will appear here..."
            ) {

                return;

            }


            try {

                await navigator.clipboard.writeText(
                    text
                );


                const oldText =
                    copyButton.innerHTML;


                copyButton.innerHTML =
                    "✓ Copied";


                setTimeout(() => {

                    copyButton.innerHTML =
                        oldText;

                }, 1500);


            } catch (error) {

                console.error(
                    "Copy failed:",
                    error
                );

            }

        }
    );


    // =====================================================
    // ERROR MESSAGE
    // =====================================================

    function showError(message) {

        let errorBox =
            document.getElementById(
                "errorMessage"
            );


        /*
         * Create error element if it
         * doesn't already exist.
         */

        if (!errorBox) {

            errorBox =
                document.createElement(
                    "div"
                );

            errorBox.id =
                "errorMessage";

            errorBox.style.margin =
                "15px 25px";

            errorBox.style.padding =
                "12px 15px";

            errorBox.style.borderRadius =
                "10px";

            errorBox.style.background =
                "rgba(255, 97, 124, 0.08)";

            errorBox.style.border =
                "1px solid rgba(255, 97, 124, 0.2)";

            errorBox.style.color =
                "#ff8da0";

            errorBox.style.fontSize =
                "12px";


            const translatorCard =
                document.querySelector(
                    ".translator-card"
                );


            translatorCard.appendChild(
                errorBox
            );

        }


        errorBox.textContent =
            message;

        errorBox.style.display =
            "block";

    }


    // =====================================================
    // CLEAR ERROR
    // =====================================================

    function clearError() {

        const errorBox =
            document.getElementById(
                "errorMessage"
            );


        if (errorBox) {

            errorBox.style.display =
                "none";

            errorBox.textContent =
                "";

        }

    }

});