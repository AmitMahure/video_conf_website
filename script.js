
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const startCallButton = document.getElementById('startCall');
const endCallButton = document.getElementById('endCall');
const startRecordingButton = document.getElementById('startRecording');
const stopRecordingButton = document.getElementById('stopRecording');
const chatBox = document.getElementById('chatBox');
const chatInput = document.getElementById('chatInput');
const sendChatButton = document.getElementById('sendChat');
const recordingMessage = document.getElementById('recordingMessage');
const stopRecordingMessage = document.getElementById('stopRecordingMessage');

let isCallActive = false;
let isRecording = false;
let mediaRecorder = null;
let recordedChunks = [];


async function startCall() {
    try {
        const constraints = { video: true, audio: true };
        localStream = await navigator.mediaDevices.getUserMedia(constraints);

        localVideo.srcObject = localStream;
        peerConnection = new RTCPeerConnection();
        peerConnection.addStream(localStream);
        peerConnection.onaddstream = (event) => {
            remoteStream = event.stream;
            remoteVideo.srcObject = remoteStream;
        };

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        isCallActive = true;
    } catch (error) {
        console.error("Error starting the call:", error);
    }
}

endCallButton.addEventListener('click', () => {
    if (isCallActive) {

        if (peerConnection) {
            peerConnection.close();
            peerConnection = null;
        }

        if (localStream) {
            const tracks = localStream.getTracks();
            tracks.forEach((track) => track.stop());
        }


        if (remoteStream) {
            const tracks = remoteStream.getTracks();
            tracks.forEach((track) => track.stop());
        }

        localVideo.srcObject = null;
        remoteVideo.srcObject = null;
        isCallActive = false;
    }
});



startRecordingButton.addEventListener('click', () => {
    if (isCallActive && !isRecording) {

        alert('Recording started.');
        recordingMessage.style.display = 'block';
        stopRecordingMessage.style.display = 'none';


        const combinedStream = new MediaStream([
            ...localVideo.srcObject.getTracks(),
            ...remoteVideo.srcObject.getTracks(),
        ]);

        mediaRecorder = new MediaRecorder(combinedStream);

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };


        mediaRecorder.onstop = () => {

            const recordedBlob = new Blob(recordedChunks, { type: 'video/webm' });

            const recordedURL = URL.createObjectURL(recordedBlob);
            localStorage.setItem('recordedVideo', recordedURL);

            isRecording = false;
            recordedChunks = [];
            recordingMessage.style.display = 'none';
            stopRecordingMessage.style.display = 'block';
        };


        mediaRecorder.start();
        isRecording = true;
    }
});

stopRecordingButton.addEventListener('click', () => {
    if (isRecording) {

        if (mediaRecorder) {
            mediaRecorder.stop();
        }
        isRecording = false;


        alert('Recording stopped.');
    }
});

sendChatButton.addEventListener('click', () => {
    const message = chatInput.value;
    if (message.trim() !== '') {

        chatBox.innerHTML += `<div class="chat-message">You: ${message}</div>`;
        chatInput.value = ''; // Clear the input field
    }
});

startCallButton.addEventListener('click', () => {
    if (!isCallActive) {
        startCall();
    }
});